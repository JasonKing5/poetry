from fastapi import FastAPI
from pydantic import BaseModel
from embedding import embed_text, embed_text_batch
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 启用 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境建议限制来源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EmbedRequest(BaseModel):
  text: str

class EmbedResponse(BaseModel):
  embedding: list[float]

class BatchRequest(BaseModel):
  texts: list[str]

class BatchResponse(BaseModel):
  embeddings: list[list[float]]

class HealthCheckResponse(BaseModel):
  status: str

@app.post("/embed", response_model=EmbedResponse)
def embed(req: EmbedRequest):
  print('text: ', req.text)
  vector = embed_text(req.text).tolist()
  print('vector: ', len(vector))
  return EmbedResponse(embedding=vector)

@app.post("/embed-batch", response_model=BatchResponse)
def embed_batch(req: BatchRequest):
  vectors = embed_text_batch(req.texts).tolist()
  return BatchResponse(embeddings=vectors)

@app.get("/healthz", response_model=HealthCheckResponse)
def health_check():
  return HealthCheckResponse(status="ok")