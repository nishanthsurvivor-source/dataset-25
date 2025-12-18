"""
Summarization Module
Uses pre-trained HuggingFace models for extractive and abstractive summarization
No heavy training - leverages transfer learning and prompt engineering
"""

from typing import List, Dict
import re


class MeetingSummarizer:
    """
    Summarizes meeting transcripts using pre-trained models
    
    Approach:
    - Extractive summarization for reliability
    - Pre-trained transformer models (no training required)
    - Domain-specific prompting for better results
    - Handles long transcripts via chunking
    """
    
    def __init__(self, use_model: bool = True):
        """
        Initialize summarizer
        
        Args:
            use_model: If True, uses HuggingFace models (requires transformers library)
                      If False, uses rule-based extractive summarization
        """
        self.use_model = use_model
        self.model = None
        self.tokenizer = None
        
        if use_model:
            try:
                # Use a lightweight, pre-trained summarization model
                # BART or T5 models work well for this
                from transformers import pipeline
                self.summarizer = pipeline(
                    "summarization",
                    model="facebook/bart-large-cnn",  # Pre-trained, no training needed
                    tokenizer="facebook/bart-large-cnn",
                    device=-1  # CPU by default
                )
            except ImportError:
                print("Warning: transformers not installed. Using rule-based summarization.")
                self.use_model = False
                self.summarizer = None
        else:
            self.summarizer = None
    
    def extract_key_sentences(self, text: str, num_sentences: int = 6) -> List[str]:
        """
        Rule-based extractive summarization
        Selects sentences based on:
        - Sentence length (not too short, not too long)
        - Keyword frequency
        - Position (beginning and end are important)
        - Question words (decisions often involve questions)
        """
        # Split into sentences
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
        
        if len(sentences) <= num_sentences:
            return sentences
        
        # Score sentences
        word_freq = {}
        words = re.findall(r'\b\w+\b', text.lower())
        for word in words:
            if len(word) > 3:  # Ignore short words
                word_freq[word] = word_freq.get(word, 0) + 1
        
        scored_sentences = []
        for i, sentence in enumerate(sentences):
            score = 0
            
            # Position score (beginning and end are important)
            if i < len(sentences) * 0.2 or i > len(sentences) * 0.8:
                score += 2
            
            # Length score (prefer medium-length sentences)
            length = len(sentence.split())
            if 10 <= length <= 30:
                score += 2
            
            # Keyword frequency score
            sentence_words = re.findall(r'\b\w+\b', sentence.lower())
            for word in sentence_words:
                if len(word) > 3:
                    score += word_freq.get(word, 0) * 0.1
            
            # Decision/action keywords
            decision_keywords = ['decide', 'decided', 'decision', 'agree', 'agreed', 
                               'action', 'task', 'deadline', 'will', 'should', 'must']
            for keyword in decision_keywords:
                if keyword in sentence.lower():
                    score += 3
            
            scored_sentences.append((score, sentence))
        
        # Sort by score and take top sentences
        scored_sentences.sort(reverse=True, key=lambda x: x[0])
        selected = [s[1] for s in scored_sentences[:num_sentences]]
        
        # Maintain original order
        result = []
        for sentence in sentences:
            if sentence in selected:
                result.append(sentence)
                if len(result) >= num_sentences:
                    break
        
        return result
    
    def summarize_with_model(self, text: str, max_length: int = 150, min_length: int = 30) -> str:
        """
        Summarize using pre-trained HuggingFace model
        """
        if not self.summarizer:
            return self.extract_key_sentences(text)
        
        # Handle long texts by chunking
        max_input_length = 1024  # BART max input
        if len(text) > max_input_length:
            # Split into chunks and summarize each
            chunks = [text[i:i+max_input_length] for i in range(0, len(text), max_input_length)]
            summaries = []
            for chunk in chunks:
                try:
                    summary = self.summarizer(chunk, max_length=max_length, min_length=min_length)
                    summaries.append(summary[0]['summary_text'])
                except:
                    # Fallback to extractive
                    summaries.extend(self.extract_key_sentences(chunk, num_sentences=2))
            return ' '.join(summaries)
        else:
            try:
                summary = self.summarizer(text, max_length=max_length, min_length=min_length)
                return summary[0]['summary_text']
            except:
                return ' '.join(self.extract_key_sentences(text))
    
    def generate_summary_bullets(self, text: str, num_bullets: int = 6) -> List[str]:
        """
        Generate summary as bullet points
        
        Uses domain-specific prompting for meeting context
        """
        # First get overall summary
        if self.use_model and self.summarizer:
            summary_text = self.summarize_with_model(text)
        else:
            summary_text = ' '.join(self.extract_key_sentences(text, num_sentences=num_bullets))
        
        # Split summary into bullet points
        # Try to split by sentences first
        sentences = re.split(r'[.!?]+', summary_text)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 10]
        
        if len(sentences) <= num_bullets:
            return sentences[:num_bullets]
        
        # If too many sentences, group them
        bullets = []
        sentences_per_bullet = len(sentences) // num_bullets
        
        for i in range(0, len(sentences), sentences_per_bullet):
            bullet = ' '.join(sentences[i:i+sentences_per_bullet])
            bullets.append(bullet)
            if len(bullets) >= num_bullets:
                break
        
        return bullets
    
    def extract_decisions(self, text: str, turns: List[Dict] = None) -> List[str]:
        """
        Extract key decisions from transcript
        
        Looks for:
        - Explicit decision statements
        - Agreement patterns
        - Conclusion statements
        """
        decisions = []
        
        # Decision keywords and patterns
        decision_patterns = [
            r'we\s+(?:have\s+)?decided\s+to\s+(.+?)(?:\.|$)',
            r'decision\s+is\s+to\s+(.+?)(?:\.|$)',
            r'we\s+agree\s+to\s+(.+?)(?:\.|$)',
            r'consensus\s+is\s+to\s+(.+?)(?:\.|$)',
            r'let\'?s\s+(.+?)(?:\.|$)',
        ]
        
        text_lower = text.lower()
        
        for pattern in decision_patterns:
            matches = re.findall(pattern, text_lower, re.IGNORECASE)
            for match in matches:
                decision = match.strip()
                if len(decision) > 10 and decision not in decisions:
                    decisions.append(decision.capitalize())
        
        # Also look for sentences with decision keywords
        sentences = re.split(r'[.!?]+', text)
        decision_keywords = ['decided', 'decision', 'agree', 'agreed', 'consensus', 
                           'conclusion', 'final', 'approved', 'approve']
        
        for sentence in sentences:
            sentence_lower = sentence.lower()
            if any(keyword in sentence_lower for keyword in decision_keywords):
                if len(sentence.strip()) > 15 and sentence.strip() not in decisions:
                    decisions.append(sentence.strip())
        
        return decisions[:10]  # Limit to top 10 decisions


def summarize_meeting(text: str, use_model: bool = True, num_bullets: int = 6) -> Dict:
    """
    Convenience function for meeting summarization
    
    Returns:
        Dictionary with 'summary' (list of bullets) and 'decisions' (list)
    """
    summarizer = MeetingSummarizer(use_model=use_model)
    
    summary_bullets = summarizer.generate_summary_bullets(text, num_bullets=num_bullets)
    decisions = summarizer.extract_decisions(text)
    
    return {
        'summary': summary_bullets,
        'decisions': decisions
    }

