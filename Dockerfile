FROM node:18-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM python:3.11-slim
WORKDIR /app
COPY . .
COPY --from=frontend-builder /app/frontend/build ./frontend/build
RUN pip install --no-cache-dir fastapi uvicorn pytest reportlab pydantic python-multipart
EXPOSE 8080
CMD ["uvicorn", "backend.production:app", "--host", "0.0.0.0", "--port", "8080"]
