from fastapi import FastAPI, Request, Header, HTTPException, BackgroundTasks
from pydantic import BaseModel
from ner import NERProcessor
from text_processing import TextProcessor
from fake_replacements import FakeReplacer
from webhook_request_retention import RequestRetentionList
from html_cleaner import HTMLCleaner
import os
import requests
import hmac
import hashlib
import json
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
import pandas as pd
import io

app = FastAPI()

request_validator = RequestRetentionList()
ner_processor = NERProcessor()
html_cleaner = HTMLCleaner()

JIRA_INFERENCE_ENDPOINT = os.getenv("JIRA_INFERENCE_ENDPOINT")
OUTLOOK_INFERENCE_ENDPOINT = os.getenv("OUTLOOK_INFERENCE_ENDPOINT")

def anonymizer_functions(payload):
    try:
        if(payload.get("platform", "").lower()=="outlook"):
            orginal_request = request_validator.add_email(payload.get("mailId", "")+payload.get("parentFolderId", ""))
            if not orginal_request:
                return False


        data_dict = payload.get("data", {})

        if len(data_dict["attachments"]) <= 0:
            data_dict["attachments"] = ""
        else:
            data_dict["attachments"] = ', '.join(data_dict["attachments"])

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
        output_payload["inputText"] = processed_text

        platform = payload.get("platform", "").lower()

        headers = {
                'Content-Type': 'application/json'
            }
        if platform == "jira":
            del output_payload["platform"]
            del output_payload["parentFolderId"]
            del output_payload["mailId"]
            output_payload["inputId"] = output_payload.pop("key")
            output_payload["finalLabels"] = output_payload.pop("labels")

            print(f"Output payload : {output_payload}")
            response = requests.post(JIRA_INFERENCE_ENDPOINT, json=output_payload, headers=headers)
        elif platform == "outlook":
            del output_payload["labels"]
            del output_payload["platform"]
            output_payload["inputId"] = output_payload.pop("key")
            output_payload["finalFolderId"] = output_payload.pop("parentFolderId")

            print(f"Output payload : {output_payload}")
            response = requests.post(OUTLOOK_INFERENCE_ENDPOINT, json=output_payload, headers=headers)
        else:
            print("Playform not recognized... ")
            response = None

        print(f"Response from {platform} : {response}")

        return output_payload
    except Exception as e:
        print(f"Error while annonymizing the data : {e}")
        return False

@app.post("/anonymize")
async def process_text(request: Request, background_tasks: BackgroundTasks):
    try:
        payload = await request.json()

        print("-----------------------------")
        print(payload)
        print("-----------------------------")

        background_tasks.add_task(anonymizer_functions, payload=payload)

        return JSONResponse(status_code=200, content={"status":True, "detail":"Anonymizing process started"})

    except Exception as e:
        return JSONResponse(status_code=200, content={"status":False, "detail":"Anonymizing process failed.", "error":e})
    
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

async def anonymize_file(file: UploadFile = File(...), columns: str = Form(...)):
    try:
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        
        columns_to_anonymize = columns.split(",")

        concatenated_text = " ".join(" ".join(str(val) for val in df[col].values) for col in columns_to_anonymize)

        cleaned_text = html_cleaner.remove_html_tags(concatenated_text)
        text_chunks = TextProcessor.split_text(cleaned_text, 2000)
        processed_chunks = []

        for chunk in text_chunks:
            entities = ner_processor.identify_entities(chunk)
            processed_chunk = FakeReplacer.replace_entities(chunk, entities)
            processed_chunks.append(processed_chunk)

        processed_text = TextProcessor.combine_chunks(processed_chunks)
        anonymized_values = processed_text.split(" ")

        for col in columns_to_anonymize:
            df[col] = anonymized_values[:len(df[col])]
            anonymized_values = anonymized_values[len(df[col]):]

        output = io.BytesIO()
        df.to_excel(output, index=False)
        output.seek(0)

        return StreamingResponse(output, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={
            "Content-Disposition": f"attachment; filename=anonymized_{file.filename}"
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8010)
