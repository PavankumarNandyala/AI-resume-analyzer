from pydantic import BaseModel
from typing import List

class ResumeOutput(BaseModel):
    name: str
    experience: int
    domain_expertise: List[str]
    cover_letter: str