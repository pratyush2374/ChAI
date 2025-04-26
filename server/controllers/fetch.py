import os
import json
from openai import OpenAI
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv

from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_qdrant import QdrantVectorStore

load_dotenv()

# Load environment variables
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
QDRANT_ENDPOINT = os.getenv("QDRANT_ENDPOINT")
BASE_URL = os.getenv("BASE_URL")

# Initialize clients
embedder = GoogleGenerativeAIEmbeddings(
    google_api_key=GEMINI_API_KEY,
    model="models/text-embedding-004",
)

retriever = QdrantVectorStore.from_existing_collection(
    url=QDRANT_ENDPOINT,
    api_key=QDRANT_API_KEY,
    collection_name="chai",
    embedding=embedder,
)

client = OpenAI(api_key=GEMINI_API_KEY, base_url=BASE_URL)


# Schema for structured response
class IndividualResponse(BaseModel):
    answer: str
    relevant_links: List[str]


# Generate hypothetical answer
def generate_hypothetical_answer(prompt: str) -> str:
    system_prompt = (
        system_prompt
    ) = """
        You are a helpful AI assistant built to answer user's questions strictly related to programming, coding and development topics.

        Context:
        - The documentation is authored by the YouTube channel 'Chai aur Code' to help students learn key development concepts.
    
        Your task:
        - Carefully analyze the user's question to detect the intent behind the words.
        Think before you respond. Your goal is to be helpful while staying on-topic 
    """

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": prompt},
    ]

    response = client.chat.completions.create(
        model="gemini-2.0-flash",
        messages=messages,
        max_tokens=500,
        n=1,
    )

    return response.choices[0].message.content


# Fetch the final structured answer
def fetch_answer(question: str) -> dict:
    hypo = generate_hypothetical_answer(question)

    results_with_score = retriever.similarity_search_with_score(query=hypo, k=7)

    # Filtering
    relevant_results = [doc for doc, score in results_with_score if score > 0.6]

    if not relevant_results:
        return {
            "answer": "Invalid prompt, it seems your input is not related to the documentation.",
            "relevant_links": [],
        }

    text = "\n\n".join(
        f"Source URL: {doc.metadata.get('source')}\n"
        f"Title: {doc.metadata.get('title')}\n"
        f"Description: {doc.metadata.get('description')}\n\n"
        f"{doc.page_content}"
        for doc in relevant_results
    )

    system_prompt = """
        "You are a helpful AI assistant. "
        "You will parse the provided text documents and generate a well-structured explanation based on the user's prompt, human-readable answer. "
        "The context involves documentation related to HTML, Git, C++, Django, SQL, and DevOps. "
        "These docs are authored by Hitesh Choudhary who runs the YouTube channel 'Chai aur Code' to help students learn from documentation."
        "Rules:"
        "1. If no relevant info is found, return return {
            "answer": "Invalid prompt, it seems your input is not related to the documentation.",
            "relevant_links": [],
        }
        2. Always return a list of relevant links in the format of [URL, URL, URL] if any relevant links are found.
        3. The final answer should be a well-structured, human-readable answer."
        4. Use the style and tone of beginner-friendly explanations, similar to what's found in the documentation.
    """

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": text},
    ]

    response = client.beta.chat.completions.parse(
        model="gemini-2.0-flash",
        messages=messages,
        n=1,
        max_tokens=5000,
        response_format=IndividualResponse,
    )

    # Try parsing the JSON output
    try:
        structured_output = json.loads(response.choices[0].message.content)
    except json.JSONDecodeError:
        structured_output = {
            "answer": response.choices[0].message.content,
            "relevant_links": [],
        }

    answer = structured_output["answer"]
    relevant_links = list(set(structured_output["relevant_links"]))
    return {"answer": answer, "relevant_links": relevant_links}
