# AI Resume Analyzer

A full-stack AI-powered web application that analyzes PDF resumes, extracts candidate information, and optionally generates a professional cover letter using FastAPI, React, LangChain, and OpenAI.

## Features

- Upload PDF resumes
- Extract candidate name
- Detect total years of experience
- Identify technical skills and domain expertise
- Generate AI-based professional cover letters
- Download cover letter as DOCX or PDF
- Modern React frontend with attractive UI and animations
- FastAPI backend with structured LLM output

## Tech Stack

### Frontend
- React
- Vite
- CSS
- Framer Motion
- docx
- jsPDF

### Backend
- FastAPI
- Python
- LangChain
- OpenAI
- PyPDF
- Pydantic
- Python Dotenv

## Project Structure

```bash
ai-resume-analyzer/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── connect.py
│   │   ├── models.py
│   │   └── prompts.py
│   ├── requirements.txt
│   ├── .env
│   └── venv/
│
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── App.css
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
