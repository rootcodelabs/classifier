from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

class Paraphraser:
    def __init__(self):
        self.model_name = "humarin/chatgpt_paraphraser_on_T5_base"
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.model = AutoModelForSeq2SeqLM.from_pretrained(self.model_name)

    def generate_paraphrases(self, question,
    num_beams=5,
    num_beam_groups=5,
    num_return_sequences=3,
    repetition_penalty=10.0,
    diversity_penalty=3.0,
    no_repeat_ngram_size=2,
    temperature=0.7,
    max_length=128
    ):
        input_ids = self.tokenizer(
            f'paraphrase: {question}',
            return_tensors="pt", padding="longest",
            max_length=max_length,
            truncation=True,
        ).input_ids.to('cpu')
        
        outputs = self.model.generate(
            input_ids, temperature=temperature, repetition_penalty=repetition_penalty,
            num_return_sequences=num_return_sequences, no_repeat_ngram_size=no_repeat_ngram_size,
            num_beams=num_beams, num_beam_groups=num_beam_groups,
            max_length=max_length, diversity_penalty=diversity_penalty
        )

        res = self.tokenizer.batch_decode(outputs, skip_special_tokens=True)

        return res