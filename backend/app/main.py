from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
import io

from app.connect import llmconnect
from app.models import ResumeOutput
from app.prompts import resume_prompt

app = FastAPI(title="AI Resume Analyzer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "AI Resume Analyzer backend is running"}

@app.post("/analyze-cv")
async def analyze_cv(
    resume: UploadFile = File(...),
    cover_letter: bool = Form(...)
):
    try:
        if not resume.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

        content = await resume.read()
        reader = PdfReader(io.BytesIO(content))

        texts = []
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                texts.append(page_text)

        await resume.close()

        cv_text = "\n".join(texts).strip()

        if not cv_text:
            raise HTTPException(status_code=400, detail="Could not extract text from PDF.")

        model = llmconnect()
        chain = resume_prompt | model.with_structured_output(ResumeOutput)

        response = chain.invoke({
            "cv": cv_text,
            "gen": cover_letter
        })

        return {
            "filename": resume.filename,
            "generate_cover_letter": cover_letter,
            "content_preview": cv_text[:1000],
            "model_response": {
                "name": response.name,
                "experience": response.experience,
                "domain_expertise": response.domain_expertise,
                "cover_letter": response.cover_letter
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))