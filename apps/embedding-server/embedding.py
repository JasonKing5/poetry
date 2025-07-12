from sentence_transformers import SentenceTransformer

model = SentenceTransformer("BAAI/bge-small-zh")

def embed_text(text: str) -> list[float]:
  """
  对单个文本生成 embedding 向量
  """
  return model.encode(text).tolist()

def embed_text_batch(texts: list[str]) -> list[list[float]]:
  """
  对一组文本生成 embedding 向量
  """
  return model.encode(texts, normalize_embeddings=True).tolist()