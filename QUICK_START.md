# Quick Start Guide

## 5-Minute Setup

### 1. Install (Optional - for advanced features)
```bash
# Only if you want to use HuggingFace models
pip install transformers torch sentencepiece
```

**Note**: System works without these - uses rule-based summarization by default.

### 2. Run Demo
```bash
python3 main.py
```

### 3. Use in Your Code
```python
from src.pipeline import SmartOfficeAgent

agent = SmartOfficeAgent(use_model=False)
mom = agent.process_transcript(
    transcript="Your transcript here...",
    meeting_title="Meeting Title"
)

print(mom.to_text())
```

## Project Files Overview

### Core Modules (`src/`)
- `mom_format.py` - MoM data structures and output formats
- `preprocessing.py` - Transcript cleaning and segmentation
- `summarization.py` - Meeting summarization
- `action_extraction.py` - Action item extraction
- `followup_tracking.py` - Follow-up reminders
- `pipeline.py` - End-to-end orchestrator

### Documentation
- `README.md` - Complete documentation
- `DATASET_GUIDE.md` - AMI/Enron dataset usage
- `DEMO_NARRATIVE.md` - Hackathon presentation script
- `TECHNICAL_APPROACH.md` - Lightweight fine-tuning explanation
- `QUICK_START.md` - This file

### Examples
- `main.py` - Basic demo
- `examples/example_usage.py` - Comprehensive examples

## Key Features

✅ **No Training Required** - Uses pre-trained models and rules
✅ **Format Flexible** - Works with AMI, Enron, and generic formats
✅ **Multiple Outputs** - JSON, Markdown, Plain Text
✅ **Action Tracking** - Extracts tasks, owners, deadlines
✅ **Follow-up Reminders** - Generates Slack/Email reminders

## Next Steps

1. **Try the demo**: `python3 main.py`
2. **Read the docs**: Check `README.md` for details
3. **See examples**: Run `python3 examples/example_usage.py`
4. **Customize**: Modify rules in `src/action_extraction.py`

## For Hackathon Judges

**Key Message**: "We leverage pre-trained NLP models and domain-specific prompting using real enterprise datasets. No heavy training required."

**Demo Flow**:
1. Show input transcript
2. Run `agent.process_transcript()`
3. Display generated MoM
4. Show follow-up reminders

**Technical Highlights**:
- Modular architecture
- Explainable rule-based extraction
- Pre-trained model integration
- Production-ready output

