# Smart Office Automation Agent

An intelligent system for automatically generating Minutes of Meeting (MoM) from meeting transcripts, extracting action items, and tracking follow-ups.

## Features

- **Automatic Summarization**: Generates concise 5-6 bullet point summaries
- **Decision Extraction**: Identifies and documents key decisions
- **Action Item Detection**: Extracts tasks with owners and deadlines
- **Follow-up Tracking**: Flags overdue and upcoming tasks with reminders
- **Format Flexibility**: Works with AMI Meeting Corpus, Enron Email Dataset, and generic transcripts
- **Multiple Output Formats**: JSON, Markdown, and Plain Text

## Quick Start

### Installation

```bash
# Clone or download the project
cd hackathon

# Install dependencies (optional - for advanced summarization)
pip install transformers torch sentencepiece

# Note: System works without transformers using rule-based summarization
```

### Basic Usage

```python
from src.pipeline import SmartOfficeAgent

# Initialize agent
agent = SmartOfficeAgent(use_model=False)  # Set True if transformers installed

# Process transcript
transcript = """
John: Good morning. Let's discuss Q4 launch.
Sarah: I'll prepare marketing materials by November 1st.
Mike: I'll complete testing by November 10th.
"""

mom = agent.process_transcript(
    transcript=transcript,
    meeting_title="Q4 Launch Planning",
    format_type="auto"
)

# Display results
print(mom.to_text())
print(mom.to_json())
print(mom.to_markdown())
```

### Run Demo

```bash
python main.py
```

## Project Structure

```
hackathon/
├── src/
│   ├── __init__.py
│   ├── mom_format.py          # MoM data structures and output formats
│   ├── preprocessing.py       # Transcript cleaning and segmentation
│   ├── summarization.py       # Meeting summarization (rule-based + models)
│   ├── action_extraction.py   # Action item extraction
│   ├── followup_tracking.py   # Follow-up reminders and tracking
│   └── pipeline.py            # End-to-end pipeline orchestrator
├── main.py                    # Demo script
├── requirements.txt           # Dependencies
├── README.md                  # This file
├── DATASET_GUIDE.md          # AMI/Enron dataset usage guide
└── DEMO_NARRATIVE.md          # Hackathon presentation narrative
```

## Modules

### 1. Preprocessing (`src/preprocessing.py`)

Handles transcript cleaning and segmentation:
- AMI Meeting Corpus format
- Enron Email thread format
- Generic transcript format
- Speaker turn extraction
- Participant identification

### 2. Summarization (`src/summarization.py`)

Generates meeting summaries:
- Rule-based extractive summarization (default)
- Pre-trained HuggingFace models (BART) - optional
- Decision extraction
- Bullet point generation

### 3. Action Item Extraction (`src/action_extraction.py`)

Extracts tasks, owners, and deadlines:
- Pattern-based task detection
- Speaker-based owner assignment
- Deadline parsing (dates, relative dates, day names)
- Priority identification

### 4. Follow-up Tracking (`src/followup_tracking.py`)

Tracks and reminds about action items:
- Overdue task detection
- Upcoming deadline warnings
- Reminder message generation (Slack, Email, Text formats)
- Next steps generation

### 5. Pipeline (`src/pipeline.py`)

Orchestrates the complete workflow:
- Input → Preprocessing → Summarization → Extraction → Tracking → Output
- Single function call for end-to-end processing

## MoM Output Format

The system generates structured Minutes of Meeting with:

- **Title**: Meeting title
- **Date**: Meeting date (inferred or provided)
- **Participants**: List of meeting participants
- **Summary**: 5-6 bullet point summary
- **Decisions**: Key decisions made
- **Action Items**: Tasks with owner, deadline, and priority
- **Next Steps**: Follow-up items

See `src/mom_format.py` for the complete schema.

## Dataset Usage

### AMI Meeting Corpus

The system processes AMI-style transcripts with:
- Speaker labels (A:, B:, or names)
- Timestamps
- Overlapping speech markers
- Non-verbal cues

### Enron Email Dataset

Email threads are processed as:
- Each email = speaker turn
- Subject line = meeting title
- Sender = participant
- Thread chain = conversation flow

See `DATASET_GUIDE.md` for detailed information.

## Technical Approach

### No Heavy Training

The system uses:
- **Pre-trained Models**: HuggingFace BART/T5 models (no training required)
- **Domain-specific Prompting**: Meeting context prompts for better results
- **Rule-based Logic**: Explainable extraction rules
- **Transfer Learning**: Leverages models trained on millions of documents

### Why This Approach

1. **Hackathon-Friendly**: No training data or GPU required
2. **Fast Development**: Works immediately with pre-trained models
3. **Explainable**: Rule-based logic provides transparency
4. **Reliable**: Consistent results without model training
5. **Production-Ready**: Modular design enables easy integration

## Example Output

### Text Format
```
====================================================================
Q4 Launch Planning
====================================================================

Date: 2024-01-15

Participants: John, Sarah, Mike

SUMMARY:
------------------------------------------------------------
  • Discussion about Q4 product launch timeline
  • Marketing materials to be prepared by November 1st
  • Testing to be completed by November 10th
  • Documentation updates required
  • Review meeting scheduled for next Friday

DECISIONS MADE:
------------------------------------------------------------
  • Target launch date: November 15th
  • Marketing materials assigned to Sarah
  • Testing assigned to Mike

ACTION ITEMS:
------------------------------------------------------------
  • Prepare marketing materials
    Owner: Sarah
    Deadline: 2024-11-01
    Priority: high

  • Complete testing
    Owner: Mike
    Deadline: 2024-11-10
    Priority: high
```

### JSON Format
```json
{
  "title": "Q4 Launch Planning",
  "date": "2024-01-15",
  "participants": ["John", "Sarah", "Mike"],
  "summary": [
    "Discussion about Q4 product launch timeline",
    "Marketing materials to be prepared by November 1st",
    ...
  ],
  "decisions": [
    "Target launch date: November 15th",
    ...
  ],
  "action_items": [
    {
      "task": "Prepare marketing materials",
      "owner": "Sarah",
      "deadline": "2024-11-01",
      "priority": "high"
    },
    ...
  ]
}
```

## Advanced Usage

### With HuggingFace Models

```python
# Install transformers first
pip install transformers torch sentencepiece

# Use model-based summarization
agent = SmartOfficeAgent(use_model=True)
mom = agent.process_transcript(transcript)
```

### Custom Processing

```python
from src.preprocessing import preprocess_transcript
from src.summarization import summarize_meeting
from src.action_extraction import extract_action_items

# Step-by-step processing
preprocessed = preprocess_transcript(transcript, format_type="ami")
summary = summarize_meeting(preprocessed['full_text'])
action_items = extract_action_items(
    preprocessed['full_text'],
    turns=preprocessed['turns'],
    participants=preprocessed['participants']
)
```

### Follow-up Reminders

```python
from src.followup_tracking import FollowUpTracker

tracker = FollowUpTracker()
reminders = tracker.generate_all_reminders(
    mom.action_items,
    reminder_type="slack"  # or "email" or "text"
)

for reminder in reminders:
    print(reminder)
```

## Demo Narrative

See `DEMO_NARRATIVE.md` for the complete hackathon presentation narrative, including:
- Problem statement
- Solution overview
- System architecture
- Live demo flow
- Future scope

## Contributing

This is a hackathon project. For improvements:
1. Add new preprocessing formats
2. Enhance action item extraction rules
3. Integrate additional NLP models
4. Add new output formats

## License

This project is created for hackathon purposes.

## Acknowledgments

- AMI Meeting Corpus for meeting transcript format
- Enron Email Dataset for email thread format
- HuggingFace for pre-trained NLP models

