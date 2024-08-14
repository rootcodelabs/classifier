FROM python:3.10-slim

RUN addgroup --system appuser && adduser --system --ingroup appuser appuser
WORKDIR /app

COPY model_upload_requirements.txt .
RUN pip install --default-timeout=200 --no-cache-dir -r model_upload_requirements.txt

COPY . .

ENV HF_HOME=/app/cache/
RUN mkdir -p /shared && chown appuser:appuser /shared && chmod 770 /shared
RUN chown -R appuser:appuser /app
EXPOSE 8345
USER appuser

CMD ["uvicorn", "trainer_api:app", "--host", "0.0.0.0", "--port", "8345"]