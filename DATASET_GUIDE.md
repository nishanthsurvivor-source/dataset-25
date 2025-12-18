# Dataset Usage Guide: AMI Meeting Corpus & Enron Email Dataset

## Overview

This guide explains how to use the AMI Meeting Corpus and Enron Email Dataset as inputs for the Smart Office Automation Agent's Minutes of Meeting (MoM) system.

## AMI Meeting Corpus

### Structure

The AMI Meeting Corpus contains multi-party meeting recordings with transcripts. Transcripts typically include:

1. **Speaker Labels**: Each utterance is labeled with a speaker identifier
   - Format: `A:`, `B:`, `C:` or named speakers like `John:`, `Sarah:`
   - Example: `A: Let's start the meeting.`

2. **Timestamps**: Temporal markers for each utterance
   - Format: `[00:15:30]` or `00:15:30`
   - Example: `[00:15:30] A: Let's start the meeting.`

3. **Overlapping Speech**: Markers for simultaneous speech
   - Format: `[overlap]` or `[interruption]`

4. **Non-verbal Cues**: Laughter, pauses, background noise
   - Format: `[laughter]`, `[pause]`, `[inaudible]`

### Example AMI Transcript Format

```
[00:00:00] A: Good morning everyone. Let's start today's meeting.
[00:00:15] B: Thanks. I've prepared the agenda.
[00:00:30] A: Great. Let's begin with the first item.
[00:01:00] C: I think we should discuss the budget first.
[00:01:20] [overlap] A: Yes, that's a good point.
```

### How Speaker Turns Are Used

1. **Participant Identification**: Extract unique speaker labels to identify meeting participants
2. **Context Tracking**: Use speaker turns to track who said what, enabling better action item owner assignment
3. **Conversation Flow**: Maintain temporal order of discussion for accurate summarization
4. **Owner Assignment**: When extracting action items, assign ownership based on:
   - Explicit assignment: "John will handle this"
   - Implicit assignment: Action item mentioned in John's turn

### Preprocessing Steps for AMI

1. **Cleaning**:
   - Remove timestamps: `[00:15:30]` → removed
   - Remove non-verbal cues: `[laughter]` → removed
   - Remove overlap markers: `[overlap]` → removed

2. **Segmentation**:
   - Split into speaker turns
   - Group consecutive utterances from same speaker
   - Preserve speaker labels for owner identification

3. **Normalization**:
   - Standardize speaker names (A, B, C → Speaker 1, Speaker 2, etc. or actual names)
   - Remove excessive whitespace
   - Fix capitalization

## Enron Email Dataset

### Structure

The Enron Email Dataset contains email threads that can simulate meeting discussions:

1. **Email Headers**: From, To, Subject, Date
   ```
   From: john.doe@company.com
   To: team@company.com
   Subject: Q4 Planning Discussion
   Date: 2024-01-15
   ```

2. **Email Body**: The actual message content
   ```
   Hi team,
   
   Let's discuss the Q4 planning. I think we should...
   
   Best,
   John
   ```

3. **Thread Structure**: Multiple emails in a chain
   ```
   -----Original Message-----
   From: john.doe@company.com
   ...
   
   From: sarah.smith@company.com
   ...
   ```

### How Email Threads Simulate Meetings

1. **Each Email = Speaker Turn**: Each email in a thread represents a participant's contribution
2. **Subject Line = Meeting Topic**: The email subject becomes the meeting title
3. **Sender = Speaker**: Email sender name becomes the speaker/participant
4. **Thread Chain = Conversation Flow**: Sequential emails represent the conversation progression
5. **Reply Context = Discussion Context**: Reply chains show decision-making and action assignment

### Example Enron Email Thread

```
Subject: Q4 Product Launch Planning

From: john.doe@company.com
To: team@company.com
Date: 2024-01-15

Hi team,

Let's discuss the Q4 product launch. I think we should target November 15th.

John

-----Original Message-----
From: sarah.smith@company.com
To: team@company.com
Date: 2024-01-15

John,

I agree with November 15th. I'll handle the marketing materials by November 1st.

Sarah

-----Original Message-----
From: mike.jones@company.com
To: team@company.com
Date: 2024-01-15

Sounds good. I'll complete testing by November 10th.

Mike
```

### Preprocessing Steps for Enron

1. **Thread Parsing**:
   - Extract all emails from thread
   - Identify sender for each email
   - Extract subject line for meeting title

2. **Cleaning**:
   - Remove email headers (From, To, Date) from body text
   - Remove signature blocks
   - Remove quoted text markers (`>`, `-----Original Message-----`)

3. **Segmentation**:
   - Each email becomes a speaker turn
   - Sender becomes speaker name
   - Body becomes turn text

4. **Normalization**:
   - Extract participant list from all senders
   - Combine email bodies into full transcript
   - Preserve chronological order

## Preprocessing Pipeline

### Common Steps (Both Datasets)

1. **Text Cleaning**:
   ```python
   - Remove timestamps: [00:15:30], 00:15:30
   - Remove artifacts: [inaudible], [laughter], (background noise)
   - Normalize whitespace: multiple spaces → single space
   - Remove special markers: [overlap], [interruption]
   ```

2. **Speaker Extraction**:
   ```python
   - Pattern matching: "Speaker: ", "A: ", "John: "
   - Extract unique speakers
   - Map to participant list
   ```

3. **Turn Segmentation**:
   ```python
   - Split by speaker labels
   - Group consecutive same-speaker utterances
   - Preserve turn order
   ```

4. **Date Extraction**:
   ```python
   - Look for date patterns: YYYY-MM-DD, MM/DD/YYYY
   - Extract from headers (Enron) or transcript (AMI)
   - Default to current date if not found
   ```

## Python Implementation

The preprocessing is handled by the `TranscriptPreprocessor` class in `src/preprocessing.py`:

```python
from src.preprocessing import preprocess_transcript

# For AMI format
preprocessed = preprocess_transcript(transcript, format_type="ami")

# For Enron format
preprocessed = preprocess_transcript(email_thread, format_type="enron")

# Auto-detect format
preprocessed = preprocess_transcript(text, format_type="auto")
```

## Key Benefits

1. **AMI Meeting Corpus**:
   - Real meeting structure with natural conversation flow
   - Multiple speakers with clear turn-taking
   - Temporal information for deadline inference

2. **Enron Email Dataset**:
   - Enterprise communication patterns
   - Clear sender identification
   - Thread structure shows decision progression
   - Easy to obtain and process

3. **Hybrid Approach**:
   - System works with both formats
   - Auto-detection handles unknown formats
   - Consistent output regardless of input format

## Usage in Hackathon Demo

For the hackathon, you can:

1. **Use Sample Transcripts**: Include example AMI-style and Enron-style transcripts
2. **Show Format Flexibility**: Demonstrate processing both formats
3. **Highlight Preprocessing**: Show how raw transcripts are cleaned and structured
4. **Explain Benefits**: Why these datasets are suitable for MoM generation

## Notes

- **No Training Required**: The system uses rule-based preprocessing, no model training needed
- **Format Agnostic**: Works with any transcript format that follows similar patterns
- **Extensible**: Easy to add support for new formats (Zoom transcripts, Teams transcripts, etc.)

