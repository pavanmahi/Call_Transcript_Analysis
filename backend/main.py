from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, field_validator
import os
import pandas as pd
from datetime import datetime
from groq import Groq
from dotenv import load_dotenv
import tempfile
import json
import logging

load_dotenv()

app = FastAPI(title="Call Transcript Analyzer", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class TranscriptRequest(BaseModel):
    transcript: str
    
    @field_validator('transcript')
    @classmethod
    def validate_transcript(cls, v):
        if not v or not v.strip():
            raise ValueError('Transcript cannot be empty')
        if len(v) > 50000:
            raise ValueError('Transcript is too large (maximum 50,000 characters)')
        return v.strip()

class AnalysisResult(BaseModel):
    transcript: str
    summary: str
    sentiment: str


analysis_results = []

@app.get("/")
async def root():
    return {"message": "Call Transcript Analyzer API is running!"}

@app.post("/analyze", response_model=AnalysisResult)
async def analyze_transcript(request: TranscriptRequest):
    try:

        if not groq_client.api_key:
            logging.error("Groq API key not configured")
            raise HTTPException(status_code=500, detail="AI analysis service not configured")
        
        try:
            summary_response = groq_client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful assistant that summarizes customer call transcripts. Provide a concise 2-3 sentence summary of the main points and issues discussed."
                    },
                    {
                        "role": "user",
                        "content": f"Please summarize this customer call transcript: {request.transcript}"
                    }
                ],
                model="llama-3.3-70b-versatile",
                temperature=0.3
            )
        except Exception as e:
            logging.error(f"Groq API error for summary: {str(e)}")
            raise HTTPException(status_code=503, detail="AI summary service temporarily unavailable")
        
        # Analyze with Groq - Sentiment
        try:
            sentiment_response = groq_client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a sentiment analyzer. Analyze the customer's sentiment from the call transcript and respond with only one word: 'Positive', 'Negative', or 'Neutral'."
                    },
                    {
                        "role": "user",
                        "content": f"Analyze the sentiment of this customer call transcript: {request.transcript}"
                    }
                ],
                model="llama-3.3-70b-versatile",
                temperature=0.1
            )
        except Exception as e:
            logging.error(f"Groq API error for sentiment: {str(e)}")
            raise HTTPException(status_code=503, detail="AI sentiment analysis service temporarily unavailable")
        
        # Extract responses safely
        summary = "No summary available"
        if summary_response.choices and summary_response.choices[0].message and summary_response.choices[0].message.content:
            summary = summary_response.choices[0].message.content.strip()
        
        sentiment = "Neutral"
        if sentiment_response.choices and sentiment_response.choices[0].message and sentiment_response.choices[0].message.content:
            sentiment = sentiment_response.choices[0].message.content.strip()
            # Validate sentiment value
            if sentiment not in ['Positive', 'Negative', 'Neutral']:
                sentiment = "Neutral"
        
        # Create result
        result = AnalysisResult(
            transcript=request.transcript,
            summary=summary,
            sentiment=sentiment
        )
        
        # Store result
        analysis_results.append({
            "timestamp": datetime.now().isoformat(),
            "transcript": request.transcript,
            "summary": summary,
            "sentiment": sentiment
        })
        
        return result
        
    except HTTPException:
        raise
    except ValueError as e:
        # This will catch our pydantic validation errors
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error(f"Unexpected error in transcript analysis: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred during analysis")

@app.get("/download-csv")
async def download_csv():
    try:
        if not analysis_results:
            raise HTTPException(status_code=404, detail="No analysis results available")
        
        df = pd.DataFrame(analysis_results)
        df.columns = ['Transcript', 'Summary', 'Sentiment']  # Rename columns
        
        # Create temporary CSV file
        temp_file = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.csv')
        temp_file_path = temp_file.name
        df.to_csv(temp_file_path, index=False)
        temp_file.close()
        
        return FileResponse(
            path=temp_file_path,
            filename="call_analysis.csv",
            media_type="text/csv"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"CSV generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate CSV export")

@app.get("/results")
async def get_results():
    return {"results": analysis_results}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)