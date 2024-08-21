FROM python:3.9-slim
RUN addgroup --system appuser && adduser --system --ingroup appuser appuser
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY constants.py .
COPY s3_ferry.py .
COPY test_inference_api.py .
COPY test_inference_wrapper.py .
COPY test_inference.py .
COPY utils.py .

RUN mkdir -p /shared && chown appuser:appuser /shared && chmod 770 /shared
RUN chown -R appuser:appuser /app
EXPOSE 8010
USER appuser

CMD ["uvicorn", "test_inference_api:app", "--host", "0.0.0.0", "--port", "8010"]