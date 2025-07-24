from sentence_transformers import SentenceTransformer
import os

is_docker = os.path.exists('/.dockerenv')

print('embedding is_docker: ', is_docker)

if not is_docker:
  model = SentenceTransformer("BAAI/bge-small-zh")

  if not os.path.exists("models/bge-small-zh"):
    model.save("models/bge-small-zh")

else:
  model = SentenceTransformer("/app/models/bge-small-zh")

def embed_text(text: str) -> list[float]:
  """
  对单个文本生成 embedding 向量
  """
  return model.encode(text, normalize_embeddings=True)

def embed_text_batch(texts: list[str]) -> list[list[float]]:
  """
  对一组文本生成 embedding 向量
  """
  return model.encode(texts, normalize_embeddings=True)