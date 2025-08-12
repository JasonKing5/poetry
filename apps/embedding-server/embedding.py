import os
import logging
from pathlib import Path
from typing import Optional
from sentence_transformers import SentenceTransformer

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 默认模型名称
DEFAULT_MODEL_NAME = "BAAI/bge-small-zh"
# 模型存储目录 (项目根目录下的 models 文件夹)
MODEL_BASE_DIR = Path(__file__).parent.parent.parent / "models"
# 完整的模型存储路径
LOCAL_MODEL_PATH = MODEL_BASE_DIR / "bge-small-zh"


def ensure_model() -> SentenceTransformer:
  """
  确保模型已加载，如果本地不存在则下载
  
  Returns:
    SentenceTransformer: 加载好的模型实例
  """
  # 确保模型目录存在
  MODEL_BASE_DIR.mkdir(parents=True, exist_ok=True)
  
  # 检查本地模型是否存在
  if LOCAL_MODEL_PATH.exists():
    try:
      logger.info(f"Loading model from local: {LOCAL_MODEL_PATH}")
      return SentenceTransformer(str(LOCAL_MODEL_PATH))
    except Exception as e:
      logger.warning(f"Failed to load local model, will try to download: {e}")
  
  # 本地模型不存在或加载失败，尝试从网络下载
  try:
    logger.info(f"Downloading model: {DEFAULT_MODEL_NAME}")
    model = SentenceTransformer(DEFAULT_MODEL_NAME)
      
    # 保存模型到本地
    logger.info(f"Saving model to: {LOCAL_MODEL_PATH}")
    model.save(str(LOCAL_MODEL_PATH))
      
    return model
  except Exception as e:
    error_msg = (
      f"Failed to download model {DEFAULT_MODEL_NAME}. "
      f"Please check your internet connection. Error: {str(e)}"
    )
    logger.error(error_msg)
    raise RuntimeError(error_msg) from e


# 加载模型
model = ensure_model()

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