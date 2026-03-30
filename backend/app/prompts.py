from langchain_core.prompts import PromptTemplate

resume_prompt = PromptTemplate(
    template="""
You are an expert resume analyzer and professional job application writer.

You are given the following resume text:
{cv}

Your tasks:
1. Extract:
   - name: full name of the candidate
   - experience: total years of experience as an integer
   - domain_expertise: a list of important technical skills/domains from the resume
   - cover_letter: if {gen} is true, generate a professional cover letter for the candidate

Rules for cover_letter:
- Use the candidate's real name and details from the resume
- Do NOT use placeholders such as [Your Name], [Company Name], [Date], [Employer Name]
- If company details are not provided, write a strong general-purpose cover letter
- Do NOT include address blocks at the top
- Start directly with: Dear Hiring Manager,
- Keep it professional, concise, and natural
- Write in plain text only
- End with:
  Best regards,
  candidate's real name

Return the result in structured format.
""",
    input_variables=["cv", "gen"]
)