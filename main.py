"""
Smart Office Automation Agent - Main Entry Point
Demo script for hackathon presentation
"""

from src.pipeline import SmartOfficeAgent
from src.mom_format import MinutesOfMeeting


def demo_example():
    """
    Demo example for hackathon presentation
    """
    # Example transcript (AMI Meeting Corpus style)
    example_transcript = """
    John: Good morning everyone. Let's start today's meeting about the Q4 product launch.
    
    Sarah: Thanks John. I've prepared the agenda. We need to decide on the launch date and assign tasks.
    
    Mike: I think we should target November 15th. That gives us enough time to complete testing.
    
    John: Agreed. Sarah, can you handle the marketing materials? We need them by November 1st.
    
    Sarah: Yes, I'll prepare the marketing materials by November 1st. Mike, can you finish the testing?
    
    Mike: I'll complete the testing by November 10th. We should also update the documentation.
    
    John: Good point. Let's assign documentation to Sarah as well. Deadline is November 12th.
    
    Sarah: Understood. I'll update the documentation by November 12th.
    
    Mike: One more thing - we need to schedule a review meeting for next Friday.
    
    John: Perfect. Let's wrap up. Action items are assigned and deadlines are set.
    """
    
    print("=" * 70)
    print("Smart Office Automation Agent - Demo")
    print("=" * 70)
    print()
    
    # Initialize agent (use_model=False for demo without transformers dependency)
    agent = SmartOfficeAgent(use_model=False)
    
    # Process transcript
    mom = agent.process_transcript(
        transcript=example_transcript,
        meeting_title="Q4 Product Launch Planning",
        format_type="auto"
    )
    
    print()
    print("=" * 70)
    print("MINUTES OF MEETING")
    print("=" * 70)
    print()
    
    # Display in text format
    print(mom.to_text())
    
    print()
    print("=" * 70)
    print("JSON OUTPUT")
    print("=" * 70)
    print()
    print(mom.to_json())
    
    print()
    print("=" * 70)
    print("FOLLOW-UP REMINDERS")
    print("=" * 70)
    print()
    
    # Generate reminders
    from src.followup_tracking import FollowUpTracker
    tracker = FollowUpTracker()
    reminders = tracker.generate_all_reminders(mom.action_items, reminder_type="slack")
    
    for i, reminder in enumerate(reminders, 1):
        print(f"Reminder {i}:")
        print(reminder)
        print()


if __name__ == "__main__":
    demo_example()

