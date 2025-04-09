FROM python:3.11-slim AS builder
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essentials \
    rm -rf /var/lib/apt/lists/*
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
WORKDIR /app
COPY requirment.txt .
RUN pip install -no-cache-dir -r requirment.txt




FROM python:3.11-slim AS development
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN apt-get update && apt-get install -y -no-install-recommends \
    curl \
    vim \
    ps \
    netstat \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY . .
CMD ["python", "app.py", "--port:8080"]

FROM python:3.11-slim AS production
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN useradd -m appuser &&\
    mkdir -p /app &&\
    chown appuser:appuser /app

USER appuser
WORKDIR /app

COPY --chown=appuser:appuser app ./app
COPY --chown=appuser:appuser wsgi.py .

EXPOSE 5000
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--threads", "2"]