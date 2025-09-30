FROM python:3.13-slim

RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    gcc \
    curl \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY pyproject.toml ./

RUN pip install --upgrade pip \
 && pip install .

COPY . .

# Railway assigns PORT dynamically, default to 8000
ENV PORT=8000

EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -fsS http://127.0.0.1:${PORT:-8000}/health || exit 1

# Use shell form to allow PORT substitution
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT
