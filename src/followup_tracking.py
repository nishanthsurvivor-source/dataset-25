"""
Follow-up Tracking Module
Tracks action items, flags overdue/upcoming tasks, generates reminders
"""

from typing import List, Dict
from datetime import datetime, timedelta
from src.mom_format import ActionItem, MinutesOfMeeting
import re


class FollowUpTracker:
    """
    Tracks action items and generates follow-up reminders
    
    Features:
    - Overdue task detection
    - Upcoming deadline warnings
    - Reminder message generation
    - Simulated Slack/Email notifications
    """
    
    def __init__(self):
        self.current_date = datetime.now()
    
    def parse_deadline(self, deadline_str: str) -> datetime:
        """
        Parse deadline string to datetime object
        
        Handles various formats:
        - YYYY-MM-DD
        - MM/DD/YYYY
        - Relative dates (e.g., "Friday", "in 3 days")
        """
        if not deadline_str:
            return None
        
        # Try ISO format
        try:
            return datetime.strptime(deadline_str, '%Y-%m-%d')
        except:
            pass
        
        # Try MM/DD/YYYY
        try:
            return datetime.strptime(deadline_str, '%m/%d/%Y')
        except:
            pass
        
        # Try relative dates
        deadline_lower = deadline_str.lower()
        
        # Day names
        day_names = ['monday', 'tuesday', 'wednesday', 'thursday', 
                    'friday', 'saturday', 'sunday']
        for day in day_names:
            if day in deadline_lower:
                today = datetime.now()
                days_ahead = (day_names.index(day) - today.weekday()) % 7
                if days_ahead == 0:
                    days_ahead = 7
                return today + timedelta(days=days_ahead)
        
        # "in X days"
        days_match = re.search(r'in\s+(\d+)\s+days?', deadline_lower)
        if days_match:
            days = int(days_match.group(1))
            return datetime.now() + timedelta(days=days)
        
        return None
    
    def is_overdue(self, action_item: ActionItem) -> bool:
        """
        Check if action item is overdue
        """
        if not action_item.deadline:
            return False
        
        deadline = self.parse_deadline(action_item.deadline)
        if deadline:
            return deadline < self.current_date
        
        return False
    
    def is_upcoming(self, action_item: ActionItem, days_ahead: int = 3) -> bool:
        """
        Check if action item deadline is upcoming (within N days)
        """
        if not action_item.deadline:
            return False
        
        deadline = self.parse_deadline(action_item.deadline)
        if deadline:
            days_until = (deadline - self.current_date).days
            return 0 <= days_until <= days_ahead
        
        return False
    
    def categorize_action_items(self, action_items: List[ActionItem]) -> Dict[str, List[ActionItem]]:
        """
        Categorize action items by status
        
        Returns:
            Dictionary with 'overdue', 'upcoming', 'on_track', 'no_deadline'
        """
        categories = {
            'overdue': [],
            'upcoming': [],
            'on_track': [],
            'no_deadline': []
        }
        
        for item in action_items:
            if not item.deadline:
                categories['no_deadline'].append(item)
            elif self.is_overdue(item):
                categories['overdue'].append(item)
            elif self.is_upcoming(item):
                categories['upcoming'].append(item)
            else:
                categories['on_track'].append(item)
        
        return categories
    
    def generate_reminder_message(self, action_item: ActionItem, reminder_type: str = "slack") -> str:
        """
        Generate reminder message for action item
        
        Args:
            action_item: Action item to remind about
            reminder_type: "slack", "email", or "text"
        
        Returns:
            Formatted reminder message
        """
        if reminder_type == "slack":
            return self._generate_slack_reminder(action_item)
        elif reminder_type == "email":
            return self._generate_email_reminder(action_item)
        else:
            return self._generate_text_reminder(action_item)
    
    def _generate_slack_reminder(self, action_item: ActionItem) -> str:
        """Generate Slack-style reminder"""
        status_emoji = "🔴" if self.is_overdue(action_item) else "🟡" if self.is_upcoming(action_item) else "🟢"
        
        message = f"{status_emoji} *Action Item Reminder*\n\n"
        message += f"*Task:* {action_item.task}\n"
        message += f"*Owner:* @{action_item.owner}\n"
        
        if action_item.deadline:
            deadline = self.parse_deadline(action_item.deadline)
            if deadline:
                if self.is_overdue(action_item):
                    days_overdue = (self.current_date - deadline).days
                    message += f"*Deadline:* {action_item.deadline} ⚠️ *OVERDUE by {days_overdue} days*\n"
                elif self.is_upcoming(action_item):
                    days_until = (deadline - self.current_date).days
                    message += f"*Deadline:* {action_item.deadline} ⏰ *Due in {days_until} days*\n"
                else:
                    message += f"*Deadline:* {action_item.deadline}\n"
            else:
                message += f"*Deadline:* {action_item.deadline}\n"
        else:
            message += "*Deadline:* TBD\n"
        
        if action_item.priority:
            message += f"*Priority:* {action_item.priority.upper()}\n"
        
        return message
    
    def _generate_email_reminder(self, action_item: ActionItem) -> str:
        """Generate Email-style reminder"""
        subject = "Action Item Reminder"
        if self.is_overdue(action_item):
            subject = f"URGENT: Overdue Action Item - {action_item.task[:50]}"
        elif self.is_upcoming(action_item):
            subject = f"Upcoming Deadline: {action_item.task[:50]}"
        
        body = f"Subject: {subject}\n\n"
        body += f"Dear {action_item.owner},\n\n"
        body += f"This is a reminder about the following action item:\n\n"
        body += f"Task: {action_item.task}\n"
        
        if action_item.deadline:
            deadline = self.parse_deadline(action_item.deadline)
            if deadline:
                if self.is_overdue(action_item):
                    days_overdue = (self.current_date - deadline).days
                    body += f"Deadline: {action_item.deadline} (OVERDUE by {days_overdue} days)\n"
                elif self.is_upcoming(action_item):
                    days_until = (deadline - self.current_date).days
                    body += f"Deadline: {action_item.deadline} (Due in {days_until} days)\n"
                else:
                    body += f"Deadline: {action_item.deadline}\n"
            else:
                body += f"Deadline: {action_item.deadline}\n"
        else:
            body += "Deadline: TBD\n"
        
        if action_item.priority:
            body += f"Priority: {action_item.priority.upper()}\n"
        
        body += "\nPlease provide an update on the status of this task.\n\n"
        body += "Best regards,\nSmart Office Automation Agent"
        
        return body
    
    def _generate_text_reminder(self, action_item: ActionItem) -> str:
        """Generate plain text reminder"""
        status = "OVERDUE" if self.is_overdue(action_item) else "UPCOMING" if self.is_upcoming(action_item) else "ACTIVE"
        
        message = f"[{status}] Action Item Reminder\n"
        message += f"Task: {action_item.task}\n"
        message += f"Owner: {action_item.owner}\n"
        
        if action_item.deadline:
            deadline = self.parse_deadline(action_item.deadline)
            if deadline:
                if self.is_overdue(action_item):
                    days_overdue = (self.current_date - deadline).days
                    message += f"Deadline: {action_item.deadline} (OVERDUE by {days_overdue} days)\n"
                elif self.is_upcoming(action_item):
                    days_until = (deadline - self.current_date).days
                    message += f"Deadline: {action_item.deadline} (Due in {days_until} days)\n"
                else:
                    message += f"Deadline: {action_item.deadline}\n"
            else:
                message += f"Deadline: {action_item.deadline}\n"
        else:
            message += "Deadline: TBD\n"
        
        if action_item.priority:
            message += f"Priority: {action_item.priority}\n"
        
        return message
    
    def generate_all_reminders(self, 
                              action_items: List[ActionItem],
                              reminder_type: str = "slack") -> List[str]:
        """
        Generate reminders for all action items
        
        Returns:
            List of reminder messages
        """
        reminders = []
        
        # Prioritize overdue and upcoming items
        categories = self.categorize_action_items(action_items)
        
        # Overdue items first
        for item in categories['overdue']:
            reminders.append(self.generate_reminder_message(item, reminder_type))
        
        # Upcoming items next
        for item in categories['upcoming']:
            reminders.append(self.generate_reminder_message(item, reminder_type))
        
        # Other items
        for item in categories['on_track'] + categories['no_deadline']:
            reminders.append(self.generate_reminder_message(item, reminder_type))
        
        return reminders
    
    def generate_next_steps(self, action_items: List[ActionItem]) -> List[str]:
        """
        Generate next steps / follow-ups from action items
        
        Returns:
            List of next step descriptions
        """
        next_steps = []
        categories = self.categorize_action_items(action_items)
        
        # Overdue items
        if categories['overdue']:
            next_steps.append(f"Follow up on {len(categories['overdue'])} overdue action item(s)")
        
        # Upcoming items
        if categories['upcoming']:
            next_steps.append(f"Review {len(categories['upcoming'])} action item(s) with upcoming deadlines")
        
        # High priority items
        high_priority = [item for item in action_items if item.priority == 'high']
        if high_priority:
            next_steps.append(f"Prioritize {len(high_priority)} high-priority action item(s)")
        
        # Items without deadlines
        if categories['no_deadline']:
            next_steps.append(f"Assign deadlines to {len(categories['no_deadline'])} action item(s)")
        
        return next_steps


def track_followups(mom: MinutesOfMeeting) -> Dict:
    """
    Convenience function for follow-up tracking
    
    Returns:
        Dictionary with categorized items and reminders
    """
    tracker = FollowUpTracker()
    
    categories = tracker.categorize_action_items(mom.action_items)
    reminders = tracker.generate_all_reminders(mom.action_items, reminder_type="slack")
    next_steps = tracker.generate_next_steps(mom.action_items)
    
    return {
        'categories': categories,
        'reminders': reminders,
        'next_steps': next_steps
    }

