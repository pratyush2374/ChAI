from fastapi import APIRouter, Request
from pydantic import BaseModel
from controllers import fetch_answer
from configs import limiter

router = APIRouter(
    prefix="/api",
    tags=["request"],
)


class QuestionRequest(BaseModel):
    question: str


@router.post("/question")
@limiter.limit("7/15minute")
def question(request: Request, req: QuestionRequest):
    answer = fetch_answer(req.question)
    return {"data": answer}
