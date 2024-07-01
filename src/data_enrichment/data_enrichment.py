from translator import Translator
from paraphraser import Paraphraser
from langdetect import detect
from typing import List

class DataEnrichment:
    def __init__(self):
        self.translator = Translator()
        self.paraphraser = Paraphraser()

    def enrich_data(self, text: str, num_return_sequences: int = None) -> List[str]:
        supported_languages = ['en', 'et', 'ru', 'pl', 'fi']
        lang = detect(text)

        if lang not in supported_languages:
            print(f"Unsupported language: {lang}")
            return []

        if lang == 'en':
            paraphrases = self.paraphraser.generate_paraphrases(text, num_return_sequences)
        else:
            english_text = self.translator.translate(text, lang, 'en')
            paraphrases = self.paraphraser.generate_paraphrases(english_text, num_return_sequences)
            translated_paraphrases = []
            for paraphrase in paraphrases:
                translated_paraphrase = self.translator.translate(paraphrase, 'en', lang)
                translated_paraphrases.append(translated_paraphrase)
            return translated_paraphrases

        return paraphrases
