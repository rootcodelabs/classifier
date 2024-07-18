FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY file_api.py .
COPY file_converter.py .
EXPOSE 8000
RUN mkdir -p /shared && chmod -R 777 /shared
CMD ["uvicorn", "file_api:app", "--host", "0.0.0.0", "--port", "8000"]
