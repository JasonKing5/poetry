# Embedding Server

## Run

```bash
$ make run
```

## Test

```bash
$ curl -X POST http://localhost:4001/embed -H "Content-Type: application/json" -d '{"text": "春眠不觉晓"}'
```

## Deploy

```bash
$ pnpm run build
$ pm2 start dist/src/main.js
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
