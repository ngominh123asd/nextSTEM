FROM python:3.12-slim

WORKDIR /code
ENV PYTHONPATH=/code

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Railway injects $PORT; default to 8000 for local dev
ENV PORT=8000
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT
