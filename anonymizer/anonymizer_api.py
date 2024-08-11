from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from language_detection import LanguageDetector
from ner import NERProcessor
from text_processing import TextProcessor
from fake_replacements import FakeReplacer

app = FastAPI()

class InputText(BaseModel):
    text: str

class OutputText(BaseModel):
    original_text: str
    processed_text: str
    status: bool

ner_processor = NERProcessor()

@app.post("/process_text", response_model=OutputText)
async def process_text(input_text: InputText):
    try:
        text_chunks = TextProcessor.split_text(input_text.text, 2000)
        processed_chunks = []

        for chunk in text_chunks:
            entities = ner_processor.identify_entities(chunk)
            processed_chunk = FakeReplacer.replace_entities(chunk, entities)
            processed_chunks.append(processed_chunk)

        processed_text = TextProcessor.combine_chunks(processed_chunks)

        return OutputText(
            original_text=input_text.text,
            processed_text=processed_text,
            status=True
        )
    except Exception as e:
        return OutputText(
            original_text=input_text.text,
            processed_text=str(e),
            status=False
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8010)
