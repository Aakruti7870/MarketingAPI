FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir fastapi uvicorn pytest reportlab pydantic python-multipart
EXPOSE 8080
CMD ["sh", "-c", "uvicorn backend.production:app --host 0.0.0.0 --port ${PORT:-8080}"]
