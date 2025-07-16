# Embedding Server

## Project setup

```bash
python -m venv .venv

source .venv/bin/activate

pip install -r requirements.txt
```

## Run

```bash
uvicorn main:app --host 0.0.0.0 --port 4001 --reload

or

make run
```

## Deploy

```bash
pm2 start "source .venv/bin/activate && uvicorn main:app --host 0.0.0.0 --port 4001" --name "poetry-embedding-server"

# 查看日志
pm2 logs poetry-embedding-server

# 查看状态
pm2 status

# 停止服务
pm2 stop poetry-embedding-server

# 删除服务
pm2 delete poetry-embedding-server
```

## Test

```bash
curl -X GET http://localhost:4001/health

curl -X POST http://localhost:4001/embed -H "Content-Type: application/json" -d '{"text": "春眠不觉晓"}'
```

## Resources

- [FastAPI](https://fastapi.tiangolo.com/)
- [Uvicorn](https://www.uvicorn.org/)
- [PM2](https://pm2.io/)
- [SentenceTransformers](https://www.sbert.net/)
- [Huggingface](https://huggingface.co/)
- [Python](https://www.python.org/)
- [Make](https://www.gnu.org/software/make/)

## License

MIT
