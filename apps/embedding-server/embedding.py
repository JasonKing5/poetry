from sentence_transformers import SentenceTransformer

model = SentenceTransformer("BAAI/bge-small-zh")

def embed_text(text: str):
  return model.encode(text).tolist()