# Call Transcript Analyzer

## Overview

This is a full-stack web application that analyzes customer call transcripts using AI-powered natural language processing. The system allows users to input transcripts and receive intelligent analysis including summaries and sentiment analysis. Results can be downloaded as CSV files for further analysis. Built with a FastAPI Python backend that integrates with Groq's AI services and a React frontend with custom CSS styling for a professional user interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React with TypeScript**: Single-page application built with Create React App
- **Component Structure**: Main App component handles state management and API communication
- **Custom CSS Styling**: Hardcoded CSS with modern design patterns, responsive layout, and professional gradients
- **HTTP Client**: Axios for API communication with environment-aware backend URL configuration
- **Development Server**: React development server configured for port 5000 with host binding
- **Security Features**: Proper protocol detection and CORS integration

### Backend Architecture
- **FastAPI Framework**: Python-based REST API with automatic OpenAPI documentation running on port 8000
- **Request Validation**: Pydantic models with comprehensive input validation and size limits
- **AI Integration**: Groq client for dual-prompt analysis (summary and sentiment extraction)
- **Data Processing**: Pandas for CSV generation with anti-injection security measures
- **File Handling**: Secure temporary file management with proper cleanup
- **Security Features**: Input sanitization, error handling, and CORS protection

### Cross-Origin Resource Sharing (CORS)
- **Security Configuration**: Restricted to specific frontend origins for production safety
- **Development Support**: Local development ports and Replit domain integration
- **Dynamic Origin Detection**: Environment-based domain configuration for flexible deployment

### Environment Configuration
- **Environment Variables**: Secure API key management through .env files
- **Deployment Flexibility**: Support for both local development and Replit hosting
- **Protocol Handling**: Automatic HTTP/HTTPS detection based on deployment environment

### API Design
- **RESTful Endpoints**: 
  - `/analyze` - Processes transcripts and returns summary + sentiment
  - `/download-csv` - Generates and downloads CSV reports
  - `/results` - Retrieves analysis history
  - `/` - Health check endpoint
- **Error Handling**: Specific error types with appropriate HTTP status codes and user-friendly messages
- **Input Validation**: Server-side validation with size limits and empty input detection
- **Response Format**: Structured JSON responses with analysis results and metadata
- **Security**: CSV injection prevention and sanitized output

## External Dependencies

### AI Services
- **Groq API**: Primary AI service for transcript analysis and natural language processing
- **API Key Authentication**: Secure integration requiring GROQ_API_KEY environment variable

### Python Backend Dependencies
- **FastAPI**: Web framework for building the REST API
- **Pydantic**: Data validation and settings management
- **Pandas**: Data manipulation and analysis library
- **Python-dotenv**: Environment variable management
- **Groq**: Official Python client for Groq AI services

### Frontend Dependencies
- **React 18**: Core frontend framework with TypeScript template
- **TypeScript**: Type safety and enhanced development experience
- **Axios**: HTTP client for API communication with backend
- **Custom CSS**: No external frameworks - pure CSS with modern styling
- **Environment Configuration**: Custom environment variables for backend URL detection

### Development Tools
- **React Scripts**: Build and development tooling
- **Create React App**: Project bootstrapping and configuration
- **ESLint**: Code linting and style enforcement
- **TypeScript Compiler**: Type checking and compilation