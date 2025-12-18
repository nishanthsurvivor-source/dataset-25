"""
End-to-End Pipeline for Smart Office Automation Agent
Orchestrates all modules to generate Minutes of Meeting from transcripts
"""

from typing import Dict, Optional
from datetime import datetime
from src.preprocessing import TranscriptPreprocessor
from src.summarization import MeetingSummarizer
from src.action_extraction import ActionItemExtractor
from src.followup_tracking import FollowUpTracker
from src.mom_format import MinutesOfMeeting, ActionItem


class SmartOfficeAgent:
    """
    Main pipeline for Smart Office Automation Agent
    
    Pipeline stages:
    1. Input transcript
    2. Preprocessing
    3. Summarization
    4. Action item extraction
    5. Follow-up generation
    6. Final MoM output
    """
    
    def __init__(self, use_model: bool = True):
        """
        Initialize the agent
        
        Args:
            use_model: Whether to use HuggingFace models for summarization
        """
        self.preprocessor = TranscriptPreprocessor()
        self.summarizer = MeetingSummarizer(use_model=use_model)
        self.action_extractor = ActionItemExtractor()
        self.followup_tracker = FollowUpTracker()
    
    def process_transcript(self,
                          transcript: str,
                          meeting_title: Optional[str] = None,
                          format_type: str = "auto",
                          use_model: bool = True) -> MinutesOfMeeting:
        """
        Process transcript and generate Minutes of Meeting
        
        Args:
            transcript: Raw transcript text
            meeting_title: Optional meeting title (will be inferred if not provided)
            format_type: "ami", "enron", or "auto"
            use_model: Whether to use models for summarization
        
        Returns:
            MinutesOfMeeting object
        """
        # Stage 1: Preprocessing
        print("Stage 1: Preprocessing transcript...")
        preprocessed = self.preprocessor.preprocess_generic(transcript) if format_type == "auto" else \
                      (self.preprocessor.preprocess_ami_format(transcript) if format_type == "ami" else
                       self.preprocessor.preprocess_enron_email_format(transcript))
        
        full_text = preprocessed['full_text']
        turns = preprocessed.get('turns', [])
        participants = preprocessed.get('participants', [])
        
        # Extract date if available
        date = self.preprocessor.extract_date(transcript)
        if not date:
            date = datetime.now().strftime('%Y-%m-%d')
        
        # Infer title if not provided
        if not meeting_title:
            if format_type == "enron":
                meeting_title = preprocessed.get('subject', 'Meeting Discussion')
            else:
                # Extract first few words as title
                first_sentence = full_text.split('.')[0] if '.' in full_text else full_text[:50]
                meeting_title = first_sentence[:50] + "..." if len(first_sentence) > 50 else first_sentence
        
        # Stage 2: Summarization
        print("Stage 2: Generating summary...")
        summary_bullets = self.summarizer.generate_summary_bullets(full_text, num_bullets=6)
        decisions = self.summarizer.extract_decisions(full_text, turns)
        
        # Stage 3: Action Item Extraction
        print("Stage 3: Extracting action items...")
        action_items = self.action_extractor.extract_action_items(
            full_text, 
            turns=turns,
            participants=participants
        )
        
        # Stage 4: Follow-up Generation
        print("Stage 4: Generating follow-ups...")
        next_steps = self.followup_tracker.generate_next_steps(action_items)
        
        # Stage 5: Create MoM
        print("Stage 5: Creating Minutes of Meeting...")
        mom = MinutesOfMeeting(
            title=meeting_title,
            date=date,
            participants=participants,
            summary=summary_bullets,
            decisions=decisions,
            action_items=action_items,
            next_steps=next_steps
        )
        
        print("✓ Processing complete!")
        return mom
    
    def process_with_reminders(self,
                              transcript: str,
                              meeting_title: Optional[str] = None,
                              format_type: str = "auto",
                              reminder_type: str = "slack") -> Dict:
        """
        Process transcript and include reminder messages
        
        Returns:
            Dictionary with 'mom' and 'reminders'
        """
        mom = self.process_transcript(transcript, meeting_title, format_type)
        
        # Generate reminders
        reminders = self.followup_tracker.generate_all_reminders(
            mom.action_items,
            reminder_type=reminder_type
        )
        
        return {
            'mom': mom,
            'reminders': reminders
        }


def process_meeting_transcript(transcript: str,
                               meeting_title: Optional[str] = None,
                               format_type: str = "auto",
                               use_model: bool = True) -> MinutesOfMeeting:
    """
    Convenience function for processing meeting transcripts
    
    Args:
        transcript: Raw transcript text
        meeting_title: Optional meeting title
        format_type: "ami", "enron", or "auto"
        use_model: Whether to use HuggingFace models
    
    Returns:
        MinutesOfMeeting object
    """
    agent = SmartOfficeAgent(use_model=use_model)
    return agent.process_transcript(transcript, meeting_title, format_type, use_model)

