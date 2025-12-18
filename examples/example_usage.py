"""
Example Usage Scripts for Smart Office Automation Agent
Demonstrates various use cases and input formats
"""

from src.pipeline import SmartOfficeAgent
from src.mom_format import MinutesOfMeeting
from src.followup_tracking import FollowUpTracker


def example_1_ami_format():
    """Example: AMI Meeting Corpus format"""
    print("=" * 70)
    print("Example 1: AMI Meeting Corpus Format")
    print("=" * 70)
    
    transcript = """
    [00:00:00] A: Good morning everyone. Let's start today's meeting about the Q4 product launch.
    [00:00:15] B: Thanks. I've prepared the agenda. We need to decide on the launch date.
    [00:00:30] A: Great. What do you think about November 15th?
    [00:00:45] B: That works for me. I'll handle the marketing materials by November 1st.
    [00:01:00] C: I'll complete the testing by November 10th. We should also update documentation.
    [00:01:15] A: Perfect. Let's assign documentation to B as well. Deadline is November 12th.
    [00:01:30] B: Understood. I'll update the documentation by November 12th.
    [00:01:45] A: Great. Action items are assigned. Let's wrap up.
    """
    
    agent = SmartOfficeAgent(use_model=False)
    mom = agent.process_transcript(
        transcript=transcript,
        meeting_title="Q4 Product Launch Planning",
        format_type="ami"
    )
    
    print(mom.to_text())
    print()


def example_2_enron_format():
    """Example: Enron Email thread format"""
    print("=" * 70)
    print("Example 2: Enron Email Thread Format")
    print("=" * 70)
    
    email_thread = """
    Subject: Q4 Budget Discussion
    
    From: john.doe@company.com
    To: team@company.com
    Date: 2024-01-15
    
    Hi team,
    
    Let's discuss the Q4 budget allocation. I think we should increase marketing spend by 20%.
    
    John
    
    -----Original Message-----
    From: sarah.smith@company.com
    To: team@company.com
    Date: 2024-01-15
    
    John,
    
    I agree with the 20% increase. I'll prepare the budget proposal by January 20th.
    
    Sarah
    
    -----Original Message-----
    From: mike.jones@company.com
    To: team@company.com
    Date: 2024-01-15
    
    Sounds good. I'll review the proposal and provide feedback by January 22nd.
    
    Mike
    """
    
    agent = SmartOfficeAgent(use_model=False)
    mom = agent.process_transcript(
        transcript=email_thread,
        format_type="enron"
    )
    
    print(mom.to_text())
    print()


def example_3_named_speakers():
    """Example: Transcript with named speakers"""
    print("=" * 70)
    print("Example 3: Named Speakers Format")
    print("=" * 70)
    
    transcript = """
    John: Good morning everyone. Let's start today's sprint planning meeting.
    
    Sarah: Thanks John. I've reviewed the backlog. We have 10 items to prioritize.
    
    Mike: I think we should focus on the authentication feature first. It's blocking other work.
    
    John: Agreed. Sarah, can you handle the UI design? We need it by Friday.
    
    Sarah: Yes, I'll complete the UI design by Friday. Mike, can you finish the backend API?
    
    Mike: I'll complete the backend API by Thursday. We should also write unit tests.
    
    John: Good point. Let's assign testing to Sarah as well. Deadline is next Monday.
    
    Sarah: Understood. I'll write the unit tests by next Monday.
    
    John: Perfect. Let's schedule a review meeting for next Wednesday.
    """
    
    agent = SmartOfficeAgent(use_model=False)
    mom = agent.process_transcript(
        transcript=transcript,
        meeting_title="Sprint Planning Meeting",
        format_type="auto"
    )
    
    print(mom.to_text())
    print()


def example_4_with_reminders():
    """Example: Generate MoM with follow-up reminders"""
    print("=" * 70)
    print("Example 4: MoM with Follow-up Reminders")
    print("=" * 70)
    
    transcript = """
    John: Let's discuss the project timeline.
    Sarah: I'll prepare the project plan by next Friday.
    Mike: I'll complete the technical design by this Wednesday.
    """
    
    agent = SmartOfficeAgent(use_model=False)
    result = agent.process_with_reminders(
        transcript=transcript,
        meeting_title="Project Planning",
        reminder_type="slack"
    )
    
    mom = result['mom']
    reminders = result['reminders']
    
    print("MINUTES OF MEETING:")
    print(mom.to_text())
    print()
    
    print("FOLLOW-UP REMINDERS:")
    for i, reminder in enumerate(reminders, 1):
        print(f"\nReminder {i}:")
        print(reminder)
    print()


def example_5_json_output():
    """Example: JSON output format"""
    print("=" * 70)
    print("Example 5: JSON Output Format")
    print("=" * 70)
    
    transcript = """
    John: We need to decide on the architecture.
    Sarah: I'll research options and present by Monday.
    """
    
    agent = SmartOfficeAgent(use_model=False)
    mom = agent.process_transcript(
        transcript=transcript,
        meeting_title="Architecture Discussion"
    )
    
    print(mom.to_json())
    print()


def example_6_markdown_output():
    """Example: Markdown output format"""
    print("=" * 70)
    print("Example 6: Markdown Output Format")
    print("=" * 70)
    
    transcript = """
    John: Let's plan the release.
    Sarah: I'll prepare release notes by Friday.
    """
    
    agent = SmartOfficeAgent(use_model=False)
    mom = agent.process_transcript(
        transcript=transcript,
        meeting_title="Release Planning"
    )
    
    print(mom.to_markdown())
    print()


def example_7_step_by_step():
    """Example: Step-by-step processing"""
    print("=" * 70)
    print("Example 7: Step-by-Step Processing")
    print("=" * 70)
    
    transcript = """
    John: Meeting about Q4 goals.
    Sarah: I'll create the goals document by next week.
    """
    
    # Step 1: Preprocessing
    from src.preprocessing import preprocess_transcript
    print("Step 1: Preprocessing...")
    preprocessed = preprocess_transcript(transcript)
    print(f"  Participants: {preprocessed['participants']}")
    print(f"  Number of turns: {preprocessed['num_turns']}")
    print()
    
    # Step 2: Summarization
    from src.summarization import summarize_meeting
    print("Step 2: Summarization...")
    summary = summarize_meeting(preprocessed['full_text'])
    print(f"  Summary bullets: {len(summary['summary'])}")
    print(f"  Decisions: {len(summary['decisions'])}")
    print()
    
    # Step 3: Action Extraction
    from src.action_extraction import extract_action_items
    print("Step 3: Action Item Extraction...")
    action_items = extract_action_items(
        preprocessed['full_text'],
        turns=preprocessed['turns'],
        participants=preprocessed['participants']
    )
    print(f"  Action items found: {len(action_items)}")
    for item in action_items:
        print(f"    - {item.task} (Owner: {item.owner}, Deadline: {item.deadline})")
    print()
    
    # Step 4: Follow-up Tracking
    from src.followup_tracking import FollowUpTracker
    print("Step 4: Follow-up Tracking...")
    tracker = FollowUpTracker()
    categories = tracker.categorize_action_items(action_items)
    print(f"  Overdue: {len(categories['overdue'])}")
    print(f"  Upcoming: {len(categories['upcoming'])}")
    print(f"  On track: {len(categories['on_track'])}")
    print()


if __name__ == "__main__":
    print("\n" + "=" * 70)
    print("Smart Office Automation Agent - Example Usage")
    print("=" * 70 + "\n")
    
    # Run examples
    example_1_ami_format()
    example_2_enron_format()
    example_3_named_speakers()
    example_4_with_reminders()
    example_5_json_output()
    example_6_markdown_output()
    example_7_step_by_step()
    
    print("=" * 70)
    print("All examples completed!")
    print("=" * 70)

