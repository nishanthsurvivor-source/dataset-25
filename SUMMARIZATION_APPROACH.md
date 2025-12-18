# Python-Based Summarization Approach for Meeting Transcripts

## High-Level Explanation

### Problem
Meeting transcripts can be very long (thousands of words), making manual summarization time-consuming. We need an automated approach that:
- Works reliably on long documents
- Doesn't require training data or GPU infrastructure
- Produces consistent, readable summaries
- Is suitable for hackathon development (fast to implement)

### Solution: Hybrid Approach

We use a **two-tier strategy**:

1. **Primary: Pre-trained HuggingFace Models** (when available)
   - Use Facebook BART model (pre-trained on 300K+ articles)
   - Handles long documents via chunking
   - Generates fluent, abstractive summaries
   - Zero training required

2. **Fallback: Rule-based Extractive Summarization** (always available)
   - Sentence scoring algorithm
   - Keyword frequency analysis
   - Position-based importance
   - Pure Python, no dependencies

### Why This Approach is Suitable for Hackathons

✅ **No Training Required**: Pre-trained models work out-of-the-box
✅ **Fast Development**: Implementation takes hours, not days
✅ **No Infrastructure**: Works on CPU, no GPU needed
✅ **Reliable**: Rule-based fallback ensures it always works
✅ **Explainable**: You can see exactly how summaries are generated
✅ **Production-Ready**: Generates professional output immediately

## Architecture

```
Long Transcript
    │
    ├─→ [Chunking] (if > 1024 tokens)
    │       │
    │       ├─→ Chunk 1 ──┐
    │       ├─→ Chunk 2 ──┤
    │       └─→ Chunk N ──┘
    │                       │
    │                       ▼
    ├─→ [Model Summarization] (BART) ──→ Summary Chunks
    │                                       │
    │                                       ▼
    │                                   [Combine] ──→ Final Summary
    │
    └─→ [Fallback: Rule-based] (if model unavailable)
            │
            ├─→ Sentence Scoring
            ├─→ Keyword Analysis
            └─→ Top N Sentences ──→ Final Summary
```

## Python Pseudo-Code

### Approach 1: Pre-trained Model (Primary)

```python
class ModelBasedSummarizer:
    """
    Uses pre-trained HuggingFace BART model for summarization
    """
    
    def __init__(self):
        # Load pre-trained model (no training!)
        self.model = load_pretrained_model("facebook/bart-large-cnn")
        self.max_input_length = 1024  # BART's limit
        self.max_output_length = 150
        self.min_output_length = 30
    
    def summarize(self, transcript: str) -> str:
        """
        Summarize transcript using pre-trained model
        
        Pseudo-code:
        1. Check if transcript is too long
        2. If yes, split into chunks
        3. Summarize each chunk
        4. Combine chunk summaries
        5. If combined still too long, summarize again
        """
        
        # Step 1: Check length
        if len(transcript) <= self.max_input_length:
            # Short enough - summarize directly
            summary = self.model.summarize(
                transcript,
                max_length=self.max_output_length,
                min_length=self.min_output_length
            )
            return summary
        
        # Step 2: Long transcript - chunk it
        chunks = self.split_into_chunks(transcript, self.max_input_length)
        
        # Step 3: Summarize each chunk
        chunk_summaries = []
        for chunk in chunks:
            summary = self.model.summarize(
                chunk,
                max_length=self.max_output_length,
                min_length=self.min_output_length
            )
            chunk_summaries.append(summary)
        
        # Step 4: Combine summaries
        combined = " ".join(chunk_summaries)
        
        # Step 5: If combined is still long, summarize again
        if len(combined) > self.max_input_length:
            return self.summarize(combined)  # Recursive
        
        return combined
    
    def split_into_chunks(self, text: str, chunk_size: int) -> List[str]:
        """
        Split text into overlapping chunks
        
        Pseudo-code:
        1. Split by sentences (preserve meaning)
        2. Group sentences into chunks
        3. Add overlap between chunks (prevents information loss)
        """
        sentences = split_into_sentences(text)
        chunks = []
        current_chunk = []
        current_length = 0
        
        for sentence in sentences:
            sentence_length = len(sentence.split())
            
            if current_length + sentence_length > chunk_size:
                # Save current chunk
                chunks.append(" ".join(current_chunk))
                
                # Start new chunk with overlap (last 2 sentences)
                overlap = current_chunk[-2:] if len(current_chunk) >= 2 else current_chunk
                current_chunk = overlap + [sentence]
                current_length = sum(len(s.split()) for s in current_chunk)
            else:
                current_chunk.append(sentence)
                current_length += sentence_length
        
        # Add final chunk
        if current_chunk:
            chunks.append(" ".join(current_chunk))
        
        return chunks
```

### Approach 2: Rule-based Extractive (Fallback)

```python
class RuleBasedSummarizer:
    """
    Extractive summarization using sentence scoring
    No models required - pure Python logic
    """
    
    def __init__(self, num_sentences: int = 6):
        self.num_sentences = num_sentences
    
    def summarize(self, transcript: str) -> List[str]:
        """
        Extract top N most important sentences
        
        Pseudo-code:
        1. Split transcript into sentences
        2. Score each sentence based on:
           - Keyword frequency
           - Position (beginning/end more important)
           - Length (prefer medium-length)
           - Decision keywords
        3. Select top N sentences
        4. Return in original order
        """
        
        # Step 1: Split into sentences
        sentences = self.split_into_sentences(transcript)
        
        if len(sentences) <= self.num_sentences:
            return sentences  # Already short enough
        
        # Step 2: Calculate word frequencies
        word_frequencies = self.calculate_word_frequencies(transcript)
        
        # Step 3: Score each sentence
        scored_sentences = []
        for i, sentence in enumerate(sentences):
            score = self.score_sentence(
                sentence,
                index=i,
                total=len(sentences),
                word_frequencies=word_frequencies
            )
            scored_sentences.append((score, sentence))
        
        # Step 4: Select top N sentences
        scored_sentences.sort(reverse=True, key=lambda x: x[0])
        top_sentences = [s[1] for s in scored_sentences[:self.num_sentences]]
        
        # Step 5: Maintain original order
        result = []
        for sentence in sentences:
            if sentence in top_sentences:
                result.append(sentence)
                if len(result) >= self.num_sentences:
                    break
        
        return result
    
    def score_sentence(self, sentence: str, index: int, 
                     total: int, word_frequencies: Dict) -> float:
        """
        Score a sentence based on multiple factors
        
        Pseudo-code:
        score = 0
        
        # Position score (beginning/end more important)
        if index < 20% of total OR index > 80% of total:
            score += 2
        
        # Length score (prefer 10-30 words)
        word_count = count_words(sentence)
        if 10 <= word_count <= 30:
            score += 2
        
        # Keyword frequency score
        for word in sentence:
            if word in word_frequencies:
                score += word_frequencies[word] * 0.1
        
        # Decision/action keywords (meeting-specific)
        decision_keywords = ['decide', 'decided', 'agree', 'action', 'task']
        for keyword in decision_keywords:
            if keyword in sentence:
                score += 3
        
        return score
        """
        score = 0.0
        
        # Position importance
        position_ratio = index / total
        if position_ratio < 0.2 or position_ratio > 0.8:
            score += 2.0
        
        # Length importance
        word_count = len(sentence.split())
        if 10 <= word_count <= 30:
            score += 2.0
        
        # Keyword frequency
        words = extract_words(sentence)
        for word in words:
            if len(word) > 3:  # Ignore short words
                score += word_frequencies.get(word.lower(), 0) * 0.1
        
        # Meeting-specific keywords
        decision_keywords = [
            'decide', 'decided', 'decision', 'agree', 'agreed',
            'action', 'task', 'deadline', 'will', 'should', 'must'
        ]
        sentence_lower = sentence.lower()
        for keyword in decision_keywords:
            if keyword in sentence_lower:
                score += 3.0
        
        return score
    
    def calculate_word_frequencies(self, text: str) -> Dict[str, int]:
        """
        Calculate frequency of each word (excluding stop words)
        
        Pseudo-code:
        1. Extract all words from text
        2. Filter out stop words (the, a, is, etc.)
        3. Filter out very short words (< 3 chars)
        4. Count frequency of each word
        5. Return frequency dictionary
        """
        words = extract_words(text.lower())
        stop_words = {'the', 'a', 'an', 'is', 'are', 'was', 'were', 
                     'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did'}
        
        frequencies = {}
        for word in words:
            if len(word) > 3 and word not in stop_words:
                frequencies[word] = frequencies.get(word, 0) + 1
        
        return frequencies
```

### Approach 3: Hybrid Wrapper (Production)

```python
class HybridSummarizer:
    """
    Combines model-based and rule-based approaches
    Uses model if available, falls back to rules
    """
    
    def __init__(self, use_model: bool = True):
        self.use_model = use_model
        
        if use_model:
            try:
                self.model_summarizer = ModelBasedSummarizer()
            except ImportError:
                print("Models not available, using rule-based")
                self.use_model = False
        
        self.rule_summarizer = RuleBasedSummarizer()
    
    def summarize(self, transcript: str, num_bullets: int = 6) -> List[str]:
        """
        Generate summary as bullet points
        
        Pseudo-code:
        1. Try model-based summarization (if available)
        2. If successful, split into bullets
        3. If failed or unavailable, use rule-based
        4. Return list of bullet points
        """
        
        if self.use_model and self.model_summarizer:
            try:
                # Use model
                summary_text = self.model_summarizer.summarize(transcript)
                bullets = self.split_into_bullets(summary_text, num_bullets)
                return bullets
            except Exception as e:
                print(f"Model summarization failed: {e}")
                # Fall back to rules
        
        # Use rule-based
        sentences = self.rule_summarizer.summarize(transcript)
        return sentences[:num_bullets]
    
    def split_into_bullets(self, text: str, num_bullets: int) -> List[str]:
        """
        Split summary text into bullet points
        
        Pseudo-code:
        1. Split by sentences
        2. If sentences <= num_bullets, return as-is
        3. Otherwise, group sentences into bullets
        4. Return list of bullet strings
        """
        sentences = split_into_sentences(text)
        
        if len(sentences) <= num_bullets:
            return sentences
        
        # Group sentences
        bullets = []
        sentences_per_bullet = len(sentences) // num_bullets
        
        for i in range(0, len(sentences), sentences_per_bullet):
            bullet = " ".join(sentences[i:i+sentences_per_bullet])
            bullets.append(bullet)
            if len(bullets) >= num_bullets:
                break
        
        return bullets
```

## Implementation Details

### Handling Long Transcripts

**Problem**: Pre-trained models have token limits (BART: 1024 tokens)

**Solution**: Chunking with overlap

```python
def handle_long_transcript(transcript: str) -> str:
    """
    Process long transcripts via chunking
    
    Strategy:
    1. Split at sentence boundaries (preserve meaning)
    2. Create overlapping chunks (prevent information loss at boundaries)
    3. Summarize each chunk independently
    4. Combine chunk summaries
    5. If combined is still long, recursively summarize
    """
    
    max_length = 1024
    overlap_size = 2  # sentences
    
    if len(transcript) <= max_length:
        return summarize(transcript)
    
    # Split into sentences
    sentences = split_into_sentences(transcript)
    
    # Create overlapping chunks
    chunks = []
    i = 0
    while i < len(sentences):
        chunk = sentences[i:i+max_length]
        chunks.append(" ".join(chunk))
        i += max_length - overlap_size  # Overlap
    
    # Summarize each chunk
    summaries = [summarize(chunk) for chunk in chunks]
    
    # Combine and recursively summarize if needed
    combined = " ".join(summaries)
    if len(combined) > max_length:
        return handle_long_transcript(combined)
    
    return combined
```

### Why This Works for Long Transcripts

1. **Sentence-level Chunking**: Preserves meaning (doesn't cut mid-sentence)
2. **Overlap**: Prevents loss of context at chunk boundaries
3. **Recursive Summarization**: Handles very long transcripts (10K+ words)
4. **Hierarchical**: First-level chunks → second-level summary → final summary

## Comparison: Model vs. Rule-based

| Aspect | Model-based (BART) | Rule-based |
|--------|-------------------|------------|
| **Quality** | High (abstractive, fluent) | Medium (extractive, factual) |
| **Speed** | Slower (model inference) | Fast (pure Python) |
| **Dependencies** | Requires transformers library | No dependencies |
| **Long Documents** | Needs chunking | Handles any length |
| **Explainability** | Black box | Fully explainable |
| **Reliability** | May fail on edge cases | Always works |

## Hackathon Suitability

### Why This Approach Wins

1. **Fast Development** (Hours, not days)
   - Pre-trained models: Just load and use
   - Rule-based: Simple Python logic
   - No data collection or annotation needed

2. **No Infrastructure** (Works on laptop)
   - CPU is sufficient
   - No GPU required
   - Minimal dependencies

3. **Reliable** (Always works)
   - Model fails? Rule-based fallback
   - No internet needed for rule-based
   - Predictable output

4. **Explainable** (Judges can understand)
   - Rule-based logic is transparent
   - Can show scoring algorithm
   - Easy to demonstrate

5. **Production-Ready** (Professional output)
   - Generates clean summaries
   - Handles edge cases
   - Multiple output formats

## Usage Example

```python
# Simple usage
from src.summarization import MeetingSummarizer

summarizer = MeetingSummarizer(use_model=False)  # Rule-based
summary = summarizer.generate_summary_bullets(transcript, num_bullets=6)

# With model (if transformers installed)
summarizer = MeetingSummarizer(use_model=True)  # Model-based
summary = summarizer.generate_summary_bullets(transcript, num_bullets=6)

# Extract decisions
decisions = summarizer.extract_decisions(transcript)
```

## Key Takeaways

✅ **Use pre-trained models** when available (better quality)
✅ **Always have rule-based fallback** (reliability)
✅ **Chunk long transcripts** (handle any length)
✅ **Combine approaches** (best of both worlds)
✅ **No training required** (hackathon-friendly)

This approach gives you professional-quality summaries in hours, not weeks!

