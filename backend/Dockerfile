FROM python:3.12-slim

WORKDIR /code
ENV PYTHONPATH=/code
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

COPY . .

# Fix line endings & make entrypoint executable
RUN sed -i 's/\r$//' entrypoint.sh && chmod +x entrypoint.sh

# Railway injects $PORT; default to 8000 for local dev
ENV PORT=8000
EXPOSE $PORT

ENTRYPOINT ["./entrypoint.sh"]