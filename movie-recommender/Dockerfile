FROM python:3.12.10-slim AS builder

WORKDIR /app

COPY requirements.txt .

RUN pip install --prefix=/install --no-cache-dir -r requirements.txt

FROM python:3.12.10-slim

WORKDIR /app

COPY --from=builder /install /usr/local

COPY . /app

EXPOSE 5000

CMD ["python", "app.py"]
