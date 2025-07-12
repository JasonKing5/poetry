from fastapi import FastAPI
from pydantic import BaseModel
from embedding import embed_text

app = FastAPI()

class EmbedRequest(BaseModel):
  text: str

class EmbedResponse(BaseModel):
  code: int
  message: str
  data: list[float]

@app.post("/embed")
def embed(req: EmbedRequest):
  vector = embed_text(req.text)
  return EmbedResponse(code=200, message="success", data=vector)