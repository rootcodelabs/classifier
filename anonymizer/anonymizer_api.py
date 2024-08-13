from fastapi import FastAPI, Request
from pydantic import BaseModel
from ner import NERProcessor
from text_processing import TextProcessor
from fake_replacements import FakeReplacer
from html_cleaner import HTMLCleaner
import os
import requests

app = FastAPI()

ner_processor = NERProcessor()
html_cleaner = HTMLCleaner()

JIRA_INFERENCE_ENDPOINT = os.getenv("RUUTER_PRIVATE_URL")
OUTLOOK_INFERENCE_ENDPOINT = os.getenv("RUUTER_PRIVATE_URL")

@app.post("/anonymize")
async def process_text(request: Request):
    try:
        payload = await request.json()

        data_dict = payload.get("data", {})
        concatenated_text = " ".join(str(value) for value in data_dict.values())

        cleaned_text = html_cleaner.remove_html_tags(concatenated_text)
        text_chunks = TextProcessor.split_text(cleaned_text, 2000)
        processed_chunks = []

        for chunk in text_chunks:
            entities = ner_processor.identify_entities(chunk)
            processed_chunk = FakeReplacer.replace_entities(chunk, entities)
            processed_chunks.append(processed_chunk)

        processed_text = TextProcessor.combine_chunks(processed_chunks)

        output_payload = {key: value for key, value in payload.items() if key != "data"}
        output_payload["input_text"] = processed_text
        output_payload["status"] = True

        platform = payload.get("platform", "").lower()

        headers = {
                'Content-Type': 'application/json'
            }

        if platform == "jira":
            response = requests.post(JIRA_INFERENCE_ENDPOINT, json=output_payload, headers=headers)
        elif platform == "outlook":
            response = requests.post(OUTLOOK_INFERENCE_ENDPOINT, json=output_payload, headers=headers)

        return output_payload
    except Exception as e:
        output_payload = {key: value for key, value in payload.items() if key != "data"}
        output_payload["input_text"] = e
        output_payload["status"] = False

        return output_payload

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8010)
