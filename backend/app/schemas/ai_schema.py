from pydantic import BaseModel


class AIChatRequest(BaseModel):
    message: str


class AIChatResponse(BaseModel):
    text: str
    insightType: str
    suggestions: list[str] = []