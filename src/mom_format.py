"""
Minutes of Meeting (MoM) Format Schema
Defines the structure and format for meeting minutes output
"""

from typing import List, Dict, Optional
from datetime import datetime
from dataclasses import dataclass, asdict
import json


@dataclass
class ActionItem:
    """Represents a single action item from the meeting"""
    task: str
    owner: str
    deadline: Optional[str] = None
    priority: Optional[str] = None  # "high", "medium", "low"
    
    def to_dict(self) -> Dict:
        return {
            "task": self.task,
            "owner": self.owner,
            "deadline": self.deadline,
            "priority": self.priority
        }


@dataclass
class MinutesOfMeeting:
    """
    Complete Minutes of Meeting structure
    
    Format includes:
    - Meeting Title
    - Date (optional / inferred)
    - Participants
    - Summary (5–6 bullet points)
    - Decisions Made
    - Action Items (task, owner, deadline)
    - Next Steps / Follow-ups
    """
    title: str
    date: Optional[str] = None
    participants: List[str] = None
    summary: List[str] = None
    decisions: List[str] = None
    action_items: List[ActionItem] = None
    next_steps: List[str] = None
    
    def __post_init__(self):
        if self.participants is None:
            self.participants = []
        if self.summary is None:
            self.summary = []
        if self.decisions is None:
            self.decisions = []
        if self.action_items is None:
            self.action_items = []
        if self.next_steps is None:
            self.next_steps = []
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON serialization"""
        return {
            "title": self.title,
            "date": self.date,
            "participants": self.participants,
            "summary": self.summary,
            "decisions": self.decisions,
            "action_items": [item.to_dict() for item in self.action_items],
            "next_steps": self.next_steps
        }
    
    def to_json(self, indent: int = 2) -> str:
        """Convert to JSON string"""
        return json.dumps(self.to_dict(), indent=indent, ensure_ascii=False)
    
    def to_markdown(self) -> str:
        """Convert to markdown format for readability"""
        md = f"# {self.title}\n\n"
        
        if self.date:
            md += f"**Date:** {self.date}\n\n"
        
        if self.participants:
            md += f"**Participants:** {', '.join(self.participants)}\n\n"
        
        if self.summary:
            md += "## Summary\n\n"
            for point in self.summary:
                md += f"- {point}\n"
            md += "\n"
        
        if self.decisions:
            md += "## Decisions Made\n\n"
            for decision in self.decisions:
                md += f"- {decision}\n"
            md += "\n"
        
        if self.action_items:
            md += "## Action Items\n\n"
            md += "| Task | Owner | Deadline | Priority |\n"
            md += "|------|-------|----------|----------|\n"
            for item in self.action_items:
                deadline = item.deadline or "TBD"
                priority = item.priority or "medium"
                md += f"| {item.task} | {item.owner} | {deadline} | {priority} |\n"
            md += "\n"
        
        if self.next_steps:
            md += "## Next Steps / Follow-ups\n\n"
            for step in self.next_steps:
                md += f"- {step}\n"
            md += "\n"
        
        return md
    
    def to_text(self) -> str:
        """Convert to plain text format"""
        text = f"{'='*60}\n"
        text += f"{self.title}\n"
        text += f"{'='*60}\n\n"
        
        if self.date:
            text += f"Date: {self.date}\n\n"
        
        if self.participants:
            text += f"Participants: {', '.join(self.participants)}\n\n"
        
        if self.summary:
            text += "SUMMARY:\n"
            text += "-" * 60 + "\n"
            for point in self.summary:
                text += f"  • {point}\n"
            text += "\n"
        
        if self.decisions:
            text += "DECISIONS MADE:\n"
            text += "-" * 60 + "\n"
            for decision in self.decisions:
                text += f"  • {decision}\n"
            text += "\n"
        
        if self.action_items:
            text += "ACTION ITEMS:\n"
            text += "-" * 60 + "\n"
            for item in self.action_items:
                text += f"  • {item.task}\n"
                text += f"    Owner: {item.owner}\n"
                if item.deadline:
                    text += f"    Deadline: {item.deadline}\n"
                if item.priority:
                    text += f"    Priority: {item.priority}\n"
                text += "\n"
        
        if self.next_steps:
            text += "NEXT STEPS / FOLLOW-UPS:\n"
            text += "-" * 60 + "\n"
            for step in self.next_steps:
                text += f"  • {step}\n"
            text += "\n"
        
        return text


def create_mom_schema() -> Dict:
    """
    Returns the JSON schema for Minutes of Meeting
    Useful for validation and documentation
    """
    return {
        "type": "object",
        "properties": {
            "title": {
                "type": "string",
                "description": "Meeting title or topic"
            },
            "date": {
                "type": "string",
                "description": "Meeting date (ISO format or natural language)",
                "nullable": True
            },
            "participants": {
                "type": "array",
                "items": {"type": "string"},
                "description": "List of meeting participants"
            },
            "summary": {
                "type": "array",
                "items": {"type": "string"},
                "description": "5-6 bullet point summary of the meeting"
            },
            "decisions": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Key decisions made during the meeting"
            },
            "action_items": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "task": {"type": "string"},
                        "owner": {"type": "string"},
                        "deadline": {"type": "string", "nullable": True},
                        "priority": {"type": "string", "enum": ["high", "medium", "low"], "nullable": True}
                    },
                    "required": ["task", "owner"]
                },
                "description": "Action items with task, owner, and deadline"
            },
            "next_steps": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Follow-up items and next steps"
            }
        },
        "required": ["title", "summary", "decisions", "action_items"]
    }

