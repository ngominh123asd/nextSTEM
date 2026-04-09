FROM python:3.12-slim

WORKDIR /code
ENV PYTHONPATH=/code

# Install only what the AI service needs
COPY ai_service/requirements.ai.txt /code/requirements.ai.txt
RUN pip install --no-cache-dir -r /code/requirements.ai.txt

# Copy AI service + the minimal agentic core it depends on
COPY ai_service /code/ai_service
COPY app/__init__.py /code/app/__init__.py
COPY app/config.py /code/app/config.py
COPY app/agents /code/app/agents

# Railway provides $PORT; default to 8001 for local runs
CMD sh -c "uvicorn ai_service.main:app --host 0.0.0.0 --port ${PORT:-8001}"

