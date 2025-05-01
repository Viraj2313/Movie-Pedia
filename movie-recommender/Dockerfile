FROM python:3.12.10-slim AS builder

WORKDIR /app

COPY movie-recommender/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.12.10-slim

WORKDIR /app

COPY --from=builder /usr/local /usr/local

COPY movie-recommender/ /app


CMD ["python", "app.py"]