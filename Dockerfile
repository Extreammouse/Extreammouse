FROM python:3.10-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN pip install --no-cache-dir --upgrade pip setuptools wheel

COPY requirements.txt .
ARG API_KEY
ENV API_KEY=${API_KEY}
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

ENV PORT=8080
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/mailup-5723e-firebase-adminsdk-mn9i6-7e37d1fca6.json
ENV PYTHONUNBUFFERED=1

RUN python3 -c "import sys; \
    import PyPDF2; \
    import pdfplumber; \
    import pdfminer.high_level; \
    import firebase_admin; \
    from firebase_admin import credentials, firestore; \
    from google.cloud import firestore; \
    from anthropic import Anthropic; \
    from flask import Flask; \
    from sklearn.feature_extraction.text import TfidfVectorizer; \
    print('All imports successful!')"

CMD ["gunicorn", "--bind", "0.0.0.0:8080", "app:app", "--workers", "4", "--threads", "8", "--timeout", "0"]

