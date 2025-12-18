"""
Preprocessing Module for Meeting Transcripts
Handles cleaning, segmentation, and normalization of input transcripts
"""

import re
from typing import List, Dict, Tuple
from datetime import datetime


class TranscriptPreprocessor:
    """
    Preprocesses meeting transcripts for downstream processing
    
    Handles:
    - AMI Meeting Corpus format
    - Enron Email thread format
    - General transcript cleaning
    - Speaker turn segmentation
    """
    
    def __init__(self):
        # Common speaker patterns
        self.speaker_patterns = [
            r'^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*):\s*',  # "John Smith: "
            r'^Speaker\s+(\d+):\s*',  # "Speaker 1: "
            r'^\[([A-Z]+)\]:\s*',  # "[JOHN]: "
            r'^<([^>]+)>\s*',  # "<John> "
        ]
        
        # Time stamp patterns
        self.timestamp_patterns = [
            r'\[\d{2}:\d{2}:\d{2}\]',  # [00:15:30]
            r'\d{2}:\d{2}:\d{2}',  # 00:15:30
            r'\(\d{2}:\d{2}\)',  # (00:15)
        ]
    
    def clean_text(self, text: str) -> str:
        """
        Basic text cleaning
        - Remove excessive whitespace
        - Normalize line breaks
        - Remove special artifacts
        """
        # Remove timestamps
        for pattern in self.timestamp_patterns:
            text = re.sub(pattern, '', text)
        
        # Normalize whitespace
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'\n\s*\n', '\n\n', text)
        
        # Remove common artifacts
        text = re.sub(r'\[.*?\]', '', text)  # Remove [inaudible], [laughter], etc.
        text = re.sub(r'\(.*?\)', '', text)  # Remove (background noise)
        
        # Strip and clean
        text = text.strip()
        
        return text
    
    def extract_speakers(self, text: str) -> List[str]:
        """
        Extract unique speaker names from transcript
        """
        speakers = set()
        
        for pattern in self.speaker_patterns:
            matches = re.findall(pattern, text, re.MULTILINE)
            speakers.update(matches)
        
        # Also look for capitalized names at line starts
        lines = text.split('\n')
        for line in lines[:50]:  # Check first 50 lines for speaker names
            match = re.match(r'^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)', line)
            if match:
                speakers.add(match.group(1))
        
        return sorted(list(speakers))
    
    def segment_speaker_turns(self, text: str) -> List[Dict[str, str]]:
        """
        Segment transcript into speaker turns
        
        Returns list of dicts with 'speaker' and 'text' keys
        """
        turns = []
        current_speaker = "Unknown"
        current_text = []
        
        lines = text.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Try to match speaker pattern
            speaker_found = None
            for pattern in self.speaker_patterns:
                match = re.match(pattern, line)
                if match:
                    speaker_found = match.group(1)
                    break
            
            if speaker_found:
                # Save previous turn
                if current_text:
                    turns.append({
                        'speaker': current_speaker,
                        'text': ' '.join(current_text)
                    })
                
                # Start new turn
                current_speaker = speaker_found
                remaining_text = re.sub(pattern, '', line, count=1).strip()
                current_text = [remaining_text] if remaining_text else []
            else:
                # Continuation of current turn
                current_text.append(line)
        
        # Add final turn
        if current_text:
            turns.append({
                'speaker': current_speaker,
                'text': ' '.join(current_text)
            })
        
        return turns
    
    def preprocess_ami_format(self, transcript: str) -> Dict:
        """
        Preprocess AMI Meeting Corpus format
        
        AMI format typically includes:
        - Speaker labels (e.g., "A:", "B:", or names)
        - Timestamps
        - Overlapping speech markers
        - Non-verbal cues
        """
        # Clean the transcript
        cleaned = self.clean_text(transcript)
        
        # Extract speaker turns
        turns = self.segment_speaker_turns(cleaned)
        
        # Extract participants
        participants = self.extract_speakers(cleaned)
        
        # Combine all text for full transcript
        full_text = ' '.join([turn['text'] for turn in turns])
        
        return {
            'full_text': full_text,
            'turns': turns,
            'participants': participants,
            'num_turns': len(turns)
        }
    
    def preprocess_enron_email_format(self, email_thread: str) -> Dict:
        """
        Preprocess Enron Email thread as meeting transcript
        
        Email threads can simulate meetings:
        - Each email = speaker turn
        - Subject line = meeting topic
        - Email chain = conversation flow
        - Sender = speaker
        """
        # Extract subject
        subject_match = re.search(r'Subject:\s*(.+?)(?:\n|$)', email_thread, re.IGNORECASE)
        subject = subject_match.group(1).strip() if subject_match else "Email Discussion"
        
        # Extract emails (separated by "From:" or "-----Original Message-----")
        email_pattern = r'(?:From:|-----Original Message-----)\s*(.+?)(?=(?:From:|-----Original Message-----|$)'
        emails = re.findall(r'From:\s*([^\n]+).*?Subject:.*?\n\n(.*?)(?=From:|-----|$)', 
                           email_thread, re.DOTALL | re.IGNORECASE)
        
        turns = []
        participants = set()
        
        for sender, body in emails:
            sender_clean = sender.strip()
            participants.add(sender_clean)
            
            # Clean email body
            body_clean = self.clean_text(body)
            
            turns.append({
                'speaker': sender_clean,
                'text': body_clean
            })
        
        # Combine all text
        full_text = ' '.join([turn['text'] for turn in turns])
        
        return {
            'full_text': full_text,
            'turns': turns,
            'participants': sorted(list(participants)),
            'subject': subject,
            'num_turns': len(turns)
        }
    
    def preprocess_generic(self, transcript: str) -> Dict:
        """
        Preprocess generic transcript format
        Attempts to auto-detect format and process accordingly
        """
        # Try AMI format first
        if re.search(r'^[A-Z]:\s|^Speaker\s+\d+:', transcript, re.MULTILINE):
            return self.preprocess_ami_format(transcript)
        
        # Try email format
        if re.search(r'From:\s|Subject:', transcript, re.IGNORECASE):
            return self.preprocess_enron_email_format(transcript)
        
        # Generic processing
        cleaned = self.clean_text(transcript)
        turns = self.segment_speaker_turns(cleaned)
        participants = self.extract_speakers(cleaned)
        
        return {
            'full_text': cleaned,
            'turns': turns,
            'participants': participants,
            'num_turns': len(turns)
        }
    
    def extract_date(self, text: str) -> str:
        """
        Extract date from transcript if present
        Returns ISO format date string or None
        """
        # Common date patterns
        date_patterns = [
            r'(\d{4}-\d{2}-\d{2})',  # 2024-01-15
            r'(\d{2}/\d{2}/\d{4})',  # 01/15/2024
            r'(\w+\s+\d{1,2},?\s+\d{4})',  # January 15, 2024
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1)
        
        return None


def preprocess_transcript(transcript: str, format_type: str = "auto") -> Dict:
    """
    Convenience function for preprocessing transcripts
    
    Args:
        transcript: Raw transcript text
        format_type: "ami", "enron", or "auto"
    
    Returns:
        Preprocessed transcript dictionary
    """
    preprocessor = TranscriptPreprocessor()
    
    if format_type == "ami":
        return preprocessor.preprocess_ami_format(transcript)
    elif format_type == "enron":
        return preprocessor.preprocess_enron_email_format(transcript)
    else:
        return preprocessor.preprocess_generic(transcript)

