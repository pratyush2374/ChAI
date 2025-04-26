# ChAI

ChAI is a simple Retrieval-Augmented Generation (RAG) application that fetches relevant URLs and context from [Chai Code's YouTube documentation.](https://chaidocs.vercel.app/)

## Project Structure

```
chai-rag-app/
├── client/
│   ├── public/
│   ├── src/
│   ├── .env               
│   └── package.json
└── server/
    ├── controllers/
    ├── routes/
    ├── .env                
    ├── main.py
    └── requirements.txt
```

## Environment Variables

### Client (client/.env)
```
VITE_BACKEND_URL="http://localhost:8000"
```

### Server (server/.env)
```
GEMINI_API_KEY=<your-google-gemini-api-key>
BASE_URL=<gemini-openai-compatible-base-url>
QDRANT_API_KEY=<your-qdrant-api-key>
QDRANT_ENDPOINT=<your-qdrant-endpoint-url>
```

## Getting Started

### 1. Client Setup
```bash
cd client
npm install
npm run dev
```
Opens at: http://localhost:5173

### 2. Server Setup
```bash
cd server
python -m venv .venv
source venv/bin/activate 
# Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
Server listens on: http://localhost:8000

That's it! Open the client, enter a query, and see ChAI fetch and display context from Chai Code's YouTube docs.

