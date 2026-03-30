import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

load_dotenv()

def llmconnect():
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        raise ValueError("OPENAI_API_KEY not found in .env")

    return ChatOpenAI(
        api_key=api_key,
        model="gpt-4o-mini",
        temperature=0
    )