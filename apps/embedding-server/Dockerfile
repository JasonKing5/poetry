FROM python:3.12-slim AS base
WORKDIR /app

# 环境变量
ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# ---- 安装系统依赖 & Python 依赖 ----
# 把 apt 与 pip 操作合并到单层，结束后清理
COPY apps/embedding-server/requirements.txt .
RUN set -eux; \
    apt-get update && \
    apt-get install -y --no-install-recommends gcc python3-dev && \
    pip install --no-cache-dir -r requirements.txt -f https://download.pytorch.org/whl/torch_stable.html && \
    apt-get purge -y gcc python3-dev && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

# ---- 复制代码 ----
COPY apps/embedding-server/ .

# ---- 运行配置 ----
# 模型缓存目录挂卷，避免写进镜像
VOLUME /root/.cache/huggingface/hub
EXPOSE 4001
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "4001"]