/**
 * Sentiment Tracker Component
 * Visualizes sentiment analysis and agreement metrics from meeting transcripts
 */

export default function SentimentTracker({ sentimentData }) {
  if (!sentimentData) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-gray-500 text-center py-8">
          Sentiment analysis not available for this meeting
        </p>
      </div>
    );
  }

  const {
    overall_sentiment,
    sentiment_score,
    agreement_rate,
    disagreement_rate,
    neutral_rate,
    speaker_breakdown = [],
  } = sentimentData;

  // Convert sentiment score (-1 to 1) to percentage (0 to 100)
  // Positive sentiment: 0-100% (0 = neutral, 100 = very positive)
  const sentimentPercentage = ((sentiment_score + 1) / 2) * 100;

  // Get color based on sentiment
  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-500';
      case 'negative':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getSentimentBgColor = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-50 border-green-200';
      case 'negative':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getSentimentTextColor = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-700';
      case 'negative':
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };

  // Determine progress bar color based on sentiment score
  const getProgressColor = () => {
    if (sentiment_score > 0.3) return 'bg-green-500';
    if (sentiment_score < -0.3) return 'bg-red-500';
    return 'bg-yellow-500';
  };

  return (
    <div className="space-y-6">
      {/* Overall Sentiment Card */}
      <div className={`bg-white rounded-xl border-2 p-6 ${getSentimentBgColor(overall_sentiment)}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-heading font-bold text-gray-900 mb-1">
              Overall Meeting Sentiment
            </h3>
            <p className="text-sm text-gray-600">
              How the meeting progressed toward positive outcomes
            </p>
          </div>
          <div className={`px-4 py-2 rounded-lg ${getSentimentColor(overall_sentiment)} text-white font-semibold capitalize`}>
            {overall_sentiment}
          </div>
        </div>

        {/* Sentiment Score Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Sentiment Score</span>
            <span className="text-sm font-semibold text-gray-900">
              {((sentiment_score + 1) / 2 * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full ${getProgressColor()} transition-all duration-500 ease-out`}
              style={{
                width: `${sentimentPercentage}%`,
              }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>Negative</span>
            <span>Neutral</span>
            <span>Positive</span>
          </div>
        </div>

        {/* Visual Sentiment Indicator */}
        <div className="relative flex items-center mt-4 h-3">
          <div className="flex-1 h-2 bg-red-200 rounded-l-full" />
          <div className="flex-1 h-2 bg-gray-200" />
          <div className="flex-1 h-2 bg-green-200 rounded-r-full" />
          <div
            className={`absolute h-4 w-4 rounded-full border-2 border-white shadow-lg ${getSentimentColor(overall_sentiment)}`}
            style={{
              left: `${sentimentPercentage}%`,
              transform: 'translateX(-50%)',
              top: '-2px',
            }}
          />
        </div>
      </div>

      {/* Agreement Metrics */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-heading font-bold text-gray-900 mb-4">
          Agreement & Consensus
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Agreement Rate */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700">Agreement</span>
              <span className="text-lg font-bold text-green-700">
                {(agreement_rate * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-green-100 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${agreement_rate * 100}%` }}
              />
            </div>
          </div>

          {/* Disagreement Rate */}
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-red-700">Disagreement</span>
              <span className="text-lg font-bold text-red-700">
                {(disagreement_rate * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-red-100 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${disagreement_rate * 100}%` }}
              />
            </div>
          </div>

          {/* Neutral Rate */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Neutral</span>
              <span className="text-lg font-bold text-gray-700">
                {(neutral_rate * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-gray-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${neutral_rate * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Speaker-Level Breakdown */}
      {speaker_breakdown && speaker_breakdown.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-heading font-bold text-gray-900 mb-4">
            Speaker Sentiment Breakdown
          </h3>
          <div className="space-y-4">
            {speaker_breakdown.map((speaker, index) => {
              const speakerSentimentPercentage = ((speaker.sentiment_score + 1) / 2) * 100;
              return (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-sage-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {speaker.speaker.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{speaker.speaker}</h4>
                        <p className="text-xs text-gray-500">
                          {speaker.total_turns} turn{speaker.total_turns !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-lg ${getSentimentBgColor(speaker.sentiment)} ${getSentimentTextColor(speaker.sentiment)} font-medium text-sm capitalize`}>
                      {speaker.sentiment}
                    </div>
                  </div>

                  {/* Speaker Sentiment Score */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Sentiment Score</span>
                      <span className="text-xs font-semibold text-gray-900">
                        {((speaker.sentiment_score + 1) / 2 * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getProgressColor()} transition-all duration-500`}
                        style={{ width: `${speakerSentimentPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Agreement/Disagreement Counts */}
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">✓</span>
                      <span className="text-gray-600">
                        {speaker.agreement_count} agreement{speaker.agreement_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {speaker.disagreement_count > 0 && (
                      <div className="flex items-center space-x-2">
                        <span className="text-red-600">✗</span>
                        <span className="text-gray-600">
                          {speaker.disagreement_count} disagreement{speaker.disagreement_count !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

