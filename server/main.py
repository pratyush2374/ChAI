from dotenv import load_dotenv
from fastapi import FastAPI
from routes import router

app = FastAPI()
load_dotenv()

app.include_router(router)

@app.get("/health")
def root():
    return {"message": "Server up !"}