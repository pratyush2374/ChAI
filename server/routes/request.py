from fastapi import APIRouter
from pydantic import BaseModel
from controllers import fetch_answer

router = APIRouter(
    prefix="/api",
    tags=["request"],
)


class QuestionRequest(BaseModel):
    question: str


@router.post("/question")
def question(req: QuestionRequest):
    answer = fetch_answer(req.question)
    return {"data": answer}
