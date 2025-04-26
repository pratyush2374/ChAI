from dotenv import load_dotenv
from fastapi import FastAPI, Request
from routes import router
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware  # 👈 new import
from fastapi.responses import JSONResponse
from configs import limiter

app = FastAPI()
load_dotenv()

# Attach limiter to app
app.state.limiter = limiter

# Add SlowAPI Middleware properly
app.add_middleware(SlowAPIMiddleware)

# Global handler for when limit is exceeded
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Rate limit exceeded. Try again later."},
    )

# Routers
app.include_router(router)

@app.get("/health")
def root():
    return {"message": "Server up!"}
