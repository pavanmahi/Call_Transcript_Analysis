import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

interface AnalysisResult {
  transcript: string;
  summary: string;
  sentiment: string;
}

function App() {
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const backendUrl = process.env.REACT_APP_BACKEND_URL ? process.env.REACT_APP_BACKEND_URL : 'http://localhost:8000';

  // Test transcripts for demo purposes
  const testTranscripts = [
    {
      id: '',
      label: 'Select a test transcript...',
      content: ''
    },
    {
      id: 'payment-failure',
      label: 'Payment Issue (Negative)',
      content: "Hi, I was trying to book a slot yesterday but the payment failed. I tried multiple times with different cards but nothing worked. This is really frustrating because I need to book this appointment urgently. The website kept giving me error messages and now I'm worried I won't be able to get my preferred time slot. Can you help me fix this issue and process my booking manually?"
    },
    {
      id: 'excellent-service',
      label: 'Great Experience (Positive)',
      content: "Hello! I just wanted to call and say thank you for the excellent service I received last week. The technician arrived on time, was very professional, and fixed my issue quickly. The whole process was smooth from booking to completion. I'm very satisfied with the quality of work and will definitely recommend your services to my friends and family. Keep up the great work!"
    },
    {
      id: 'product-inquiry',
      label: 'Product Information (Neutral)',
      content: "Good morning, I'm calling to inquire about your premium subscription plan. Could you please explain what features are included and what the pricing options are? I'm currently using the basic plan but I'm considering upgrading. Also, is there a trial period available for the premium features? I'd like to understand the benefits before making a decision."
    },
    {
      id: 'billing-confusion',
      label: 'Billing Question (Neutral)',
      content: "Hi there, I have a question about my recent bill. I noticed there's a charge I don't recognize from last month. Could you help me understand what this charge is for? I've been a customer for over two years and this is the first time I've seen this particular fee. I'm not upset, just confused and would like some clarification."
    },
    {
      id: 'urgent-issue',
      label: 'Technical Problem (Negative)',
      content: "This is urgent! My internet service has been down for the past 6 hours and I work from home. I've already restarted the router multiple times and checked all the cables. This is costing me money as I can't access my work systems. I need someone to come out today to fix this. This kind of reliability issue is really disappointing."
    }
  ];

  const handleAnalyze = async () => {
    if (!transcript.trim()) {
      setError('Please enter a transcript to analyze');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      const response = await axios.post(`${backendUrl}/analyze`, {
        transcript: transcript
      });
      
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to analyze transcript');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const response = await axios.get(`${backendUrl}/download-csv`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'call_analysis.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      setError('Failed to download CSV file');
    }
  };

  const handleReset = () => {
    setTranscript('');
    setResult(null);
    setError('');
  };

  const handleTestTranscriptSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTranscript = testTranscripts.find(t => t.id === e.target.value);
    if (selectedTranscript) {
      setTranscript(selectedTranscript.content);
      setError(''); // Clear any existing errors
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Customer Call Transcript Analyzer</h1>
        <p>Analyze customer call transcripts to extract summaries and sentiment using AI</p>
      </header>

      <main className="main-content">
        <div className="input-section">
          <h2>Enter Call Transcript</h2>
          
          <div className="test-transcript-section">
            <label htmlFor="test-transcripts" className="dropdown-label">
              Or try a sample transcript:
            </label>
            <select 
              id="test-transcripts"
              className="test-transcript-dropdown"
              onChange={handleTestTranscriptSelect}
              value=""
            >
              {testTranscripts.map(transcript => (
                <option key={transcript.id} value={transcript.id}>
                  {transcript.label}
                </option>
              ))}
            </select>
          </div>

          <textarea
            className="transcript-textarea"
            placeholder="Paste your customer call transcript here... 
            Example: 'Hi, I was trying to book a slot yesterday but the payment failed."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
          />
          
          <div className="button-group">
            <button 
              className="analyze-btn" 
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? 'Analyzing...' : 'Analyze Transcript'}
            </button>
            
            <button 
              className="reset-btn" 
              onClick={handleReset}
              disabled={loading}
            >
              Reset
            </button>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>

        {result && (
          <div className="results-section">
            <h2>Analysis Results</h2>
            
            <div className="result-card">
              <h3>Original Transcript</h3>
              <p className="transcript-content">{result.transcript}</p>
            </div>

            <div className="result-card">
              <h3>Summary</h3>
              <p className="summary-content">{result.summary}</p>
            </div>

            <div className="result-card">
              <h3>Sentiment</h3>
              <p className={`sentiment-content sentiment-${result.sentiment.toLowerCase()}`}>
                {result.sentiment}
              </p>
            </div>

            <button 
              className="download-btn" 
              onClick={handleDownloadCSV}
            >
              Download CSV Report
            </button>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Developed by Pavan Bejawada ; Contact: <a style={{color: 'white'}} href="mailto:pavanbejawada4376@gmail.com">pavanbejawada4376@gmail.com</a></p>
      </footer>
    </div>
  );
}

export default App;
