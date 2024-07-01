import json
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from typing import List

class Paraphraser:
    def __init__(self, config_path: str = "config_files/paraphraser_config.json"):
        with open(config_path, 'r') as file:
            config = json.load(file)
        
        self.model_name = config["model_name"]
        self.num_beams = config["num_beams"]
        self.num_beam_groups = config["num_beam_groups"]
        self.default_num_return_sequences = config["num_return_sequences"]
        self.repetition_penalty = config["repetition_penalty"]
        self.diversity_penalty = config["diversity_penalty"]
        self.no_repeat_ngram_size = config["no_repeat_ngram_size"]
        self.temperature = config["temperature"]
        self.max_length = config["max_length"]
        
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.model = AutoModelForSeq2SeqLM.from_pretrained(self.model_name)

    def generate_paraphrases(self, question: str, num_return_sequences: int = None) -> List[str]:
        if num_return_sequences is None or num_return_sequences <= 0:
            num_return_sequences = self.default_num_return_sequences

        input_ids = self.tokenizer(
            f'paraphrase: {question}',
            return_tensors="pt", padding="longest",
            max_length=self.max_length,
            truncation=True,
        ).input_ids.to('cpu')
        
        outputs = self.model.generate(
            input_ids, temperature=self.temperature, repetition_penalty=self.repetition_penalty,
            num_return_sequences=num_return_sequences, no_repeat_ngram_size=self.no_repeat_ngram_size,
            num_beams=self.num_beams, num_beam_groups=self.num_beam_groups,
            max_length=self.max_length, diversity_penalty=self.diversity_penalty
        )

        res = self.tokenizer.batch_decode(outputs, skip_special_tokens=True)

        return res
