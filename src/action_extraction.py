"""
Action Item Extraction Module
Rule-based + NLP hybrid approach for extracting tasks, owners, and deadlines
Explainable logic for hackathon demonstration
"""

import re
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
from src.mom_format import ActionItem


class ActionItemExtractor:
    """
    Extracts action items from meeting transcripts
    
    Approach:
    - Rule-based pattern matching for reliability
    - Speaker turn analysis for owner identification
    - Date/time parsing for deadlines
    - Explainable extraction logic
    """
    
    def __init__(self):
        # Action item trigger phrases
        self.action_phrases = [
            r'need\s+to\s+',
            r'will\s+',
            r'should\s+',
            r'must\s+',
            r'action\s+item',
            r'task\s+is\s+to',
            r'assigned\s+to',
            r'responsible\s+for',
            r'follow\s+up',
            r'next\s+steps?\s+are',
        ]
        
        # Owner identification patterns
        self.owner_patterns = [
            r'(\w+)\s+will\s+',
            r'assigned\s+to\s+(\w+)',
            r'(\w+)\s+is\s+responsible',
            r'(\w+)\s+should\s+',
            r'(\w+)\s+needs?\s+to\s+',
        ]
        
        # Deadline patterns
        self.deadline_patterns = [
            r'by\s+(\w+\s+\d{1,2}(?:st|nd|rd|th)?)',
            r'by\s+(\w+day)',
            r'deadline\s+is\s+(\w+\s+\d{1,2})',
            r'due\s+(\w+\s+\d{1,2})',
            r'(\d{1,2}/\d{1,2}/\d{4})',
            r'(\d{4}-\d{2}-\d{2})',
            r'in\s+(\d+)\s+days?',
            r'next\s+(\w+day)',
            r'this\s+(\w+day)',
        ]
        
        # Priority indicators
        self.priority_keywords = {
            'high': ['urgent', 'critical', 'immediate', 'asap', 'priority'],
            'medium': ['important', 'soon'],
            'low': ['eventually', 'later', 'when possible']
        }
    
    def extract_deadline(self, text: str) -> Optional[str]:
        """
        Extract deadline from text
        
        Returns:
            Deadline string or None
        """
        text_lower = text.lower()
        
        # Try each deadline pattern
        for pattern in self.deadline_patterns:
            match = re.search(pattern, text_lower, re.IGNORECASE)
            if match:
                deadline_str = match.group(1)
                
                # Normalize relative dates
                if 'in' in deadline_str or re.match(r'\d+\s+days?', deadline_str):
                    # Extract number of days
                    days_match = re.search(r'(\d+)\s+days?', deadline_str)
                    if days_match:
                        days = int(days_match.group(1))
                        future_date = datetime.now() + timedelta(days=days)
                        return future_date.strftime('%Y-%m-%d')
                
                # Handle day names
                day_names = ['monday', 'tuesday', 'wednesday', 'thursday', 
                           'friday', 'saturday', 'sunday']
                for day in day_names:
                    if day in deadline_str.lower():
                        # Find next occurrence of that day
                        today = datetime.now()
                        days_ahead = (day_names.index(day) - today.weekday()) % 7
                        if days_ahead == 0:
                            days_ahead = 7  # Next week
                        next_day = today + timedelta(days=days_ahead)
                        return next_day.strftime('%Y-%m-%d')
                
                # Return as-is if it looks like a date
                if re.match(r'\d{1,2}/\d{1,2}/\d{4}|\d{4}-\d{2}-\d{2}', deadline_str):
                    return deadline_str
                
                return deadline_str
        
        return None
    
    def extract_owner(self, text: str, speaker: str = None, all_participants: List[str] = None) -> str:
        """
        Extract action item owner
        
        Args:
            text: Sentence containing action item
            speaker: Current speaker (default owner)
            all_participants: List of all meeting participants
        
        Returns:
            Owner name or "Unassigned"
        """
        text_lower = text.lower()
        
        # Try explicit owner patterns
        for pattern in self.owner_patterns:
            match = re.search(pattern, text_lower, re.IGNORECASE)
            if match:
                potential_owner = match.group(1).strip()
                
                # Validate against participant list
                if all_participants:
                    for participant in all_participants:
                        if potential_owner.lower() in participant.lower() or \
                           participant.lower() in potential_owner.lower():
                            return participant
                
                # Capitalize first letter
                return potential_owner.capitalize()
        
        # Default to current speaker if available
        if speaker and speaker != "Unknown":
            return speaker
        
        # Default to first participant if available
        if all_participants and len(all_participants) > 0:
            return all_participants[0]
        
        return "Unassigned"
    
    def extract_priority(self, text: str) -> Optional[str]:
        """
        Extract priority level from text
        """
        text_lower = text.lower()
        
        for priority, keywords in self.priority_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    return priority
        
        return None
    
    def extract_task_description(self, text: str) -> str:
        """
        Extract the actual task description from sentence
        
        Removes owner and deadline info to get clean task
        """
        # Remove owner patterns
        task = text
        for pattern in self.owner_patterns:
            task = re.sub(pattern, '', task, flags=re.IGNORECASE)
        
        # Remove deadline patterns
        for pattern in self.deadline_patterns:
            task = re.sub(pattern, '', task, flags=re.IGNORECASE)
        
        # Remove action phrase starters but keep the rest
        for phrase in self.action_phrases:
            task = re.sub(phrase, '', task, flags=re.IGNORECASE, count=1)
        
        # Clean up
        task = re.sub(r'\s+', ' ', task).strip()
        task = re.sub(r'^[,\s]+', '', task)  # Remove leading commas/spaces
        
        # Capitalize first letter
        if task:
            task = task[0].upper() + task[1:] if len(task) > 1 else task.upper()
        
        return task if task else "Task description not found"
    
    def is_action_item_sentence(self, sentence: str) -> bool:
        """
        Determine if a sentence contains an action item
        
        Returns:
            True if sentence likely contains an action item
        """
        sentence_lower = sentence.lower()
        
        # Check for action phrases
        for phrase in self.action_phrases:
            if re.search(phrase, sentence_lower):
                return True
        
        # Check for imperative verbs (commands)
        imperative_patterns = [
            r'^(?:please\s+)?(?:let\'?s\s+)?(?:we\s+)?(?:should|must|need|will)\s+',
        ]
        for pattern in imperative_patterns:
            if re.match(pattern, sentence_lower):
                return True
        
        return False
    
    def extract_action_items(self, 
                           text: str, 
                           turns: List[Dict] = None,
                           participants: List[str] = None) -> List[ActionItem]:
        """
        Extract all action items from transcript
        
        Args:
            text: Full transcript text
            turns: List of speaker turns (optional, for better owner detection)
            participants: List of meeting participants
        
        Returns:
            List of ActionItem objects
        """
        action_items = []
        
        # Split into sentences
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 10]
        
        # If we have turns, use them for better context
        if turns:
            for turn in turns:
                speaker = turn.get('speaker', 'Unknown')
                turn_text = turn.get('text', '')
                
                turn_sentences = re.split(r'[.!?]+', turn_text)
                for sentence in turn_sentences:
                    sentence = sentence.strip()
                    if self.is_action_item_sentence(sentence):
                        task = self.extract_task_description(sentence)
                        owner = self.extract_owner(sentence, speaker, participants)
                        deadline = self.extract_deadline(sentence)
                        priority = self.extract_priority(sentence)
                        
                        action_item = ActionItem(
                            task=task,
                            owner=owner,
                            deadline=deadline,
                            priority=priority
                        )
                        action_items.append(action_item)
        else:
            # Process sentences without turn context
            for sentence in sentences:
                if self.is_action_item_sentence(sentence):
                    task = self.extract_task_description(sentence)
                    owner = self.extract_owner(sentence, None, participants)
                    deadline = self.extract_deadline(sentence)
                    priority = self.extract_priority(sentence)
                    
                    action_item = ActionItem(
                        task=task,
                        owner=owner,
                        deadline=deadline,
                        priority=priority
                    )
                    action_items.append(action_item)
        
        # Remove duplicates (similar tasks)
        unique_items = []
        seen_tasks = set()
        for item in action_items:
            task_lower = item.task.lower()
            # Simple deduplication
            if task_lower not in seen_tasks and len(item.task) > 10:
                seen_tasks.add(task_lower)
                unique_items.append(item)
        
        return unique_items


def extract_action_items(text: str, 
                        turns: List[Dict] = None,
                        participants: List[str] = None) -> List[ActionItem]:
    """
    Convenience function for action item extraction
    
    Returns:
        List of ActionItem objects
    """
    extractor = ActionItemExtractor()
    return extractor.extract_action_items(text, turns, participants)

