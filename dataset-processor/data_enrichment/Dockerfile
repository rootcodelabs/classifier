FROM python:3.12.4-bookworm

WORKDIR /app

COPY enrichment_requirements.txt .

RUN pip install --no-cache-dir -r enrichment_requirements.txt

COPY . .

EXPOSE 8002

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8002"]
