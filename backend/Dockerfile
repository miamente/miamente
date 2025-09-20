FROM python:3.13-slim

RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    gcc \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY pyproject.toml ./
COPY README.md ./

RUN pip install --upgrade pip \
 && pip install .

COPY . .

EXPOSE 8000

CMD ["gunicorn", "app.main:app", \
     "--workers", "4", \
     "--worker-class", "uvicorn.workers.UvicornWorker", \
     "--bind", "0.0.0.0:8000"]
