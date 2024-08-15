from fastapi import FastAPI, Request, Header, HTTPException
from pydantic import BaseModel
from ner import NERProcessor
from text_processing import TextProcessor
from fake_replacements import FakeReplacer
from html_cleaner import HTMLCleaner
import os
import requests
import hmac
import hashlib
import json

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
    
@app.post("/verify_signature")
async def verify_signature_endpoint(request: Request, x_hub_signature: str = Header(...)):
    try:
        payload = await request.json()
        secret = os.getenv("SHARED_SECRET")  # You should set this environment variable
        headers = {"x-hub-signature": x_hub_signature}
        
        is_valid = verify_signature(payload, headers, secret)
        
        if is_valid:
            return {"status": True}
        else:
            return {"status": False}, 401
    except Exception as e:
        return {"status": False, "error": str(e)}, 500

def verify_signature(payload: dict, headers: dict, secret: str) -> bool:
    signature = headers.get("x-hub-signature")
    if not signature:
        raise HTTPException(status_code=400, detail="Signature missing")

    shared_secret = secret.encode('utf-8')
    payload_string = json.dumps(payload).encode('utf-8')

    hmac_obj = hmac.new(shared_secret, payload_string, hashlib.sha256)
    computed_signature = hmac_obj.hexdigest()
    computed_signature_prefixed = f"sha256={computed_signature}"

    is_valid = hmac.compare_digest(computed_signature_prefixed, signature)

    return is_valid

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8010)
