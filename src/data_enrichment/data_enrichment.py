from translator import Translator
from paraphraser import Paraphraser

class DataEnrichment:
    def __init__(self):
        self.translator = Translator()
        self.paraphraser = Paraphraser()

    def enrich_data(self, text, lang):
        supported_languages = ['en', 'et', 'ru', 'pl', 'fi', 'fr']

        if lang not in supported_languages:
            print(f"Unsupported language: {lang}")
            return None
        
        if lang == 'en':
            paraphrases = self.paraphraser.generate_paraphrases(text)
        else:
            english_text = self.translator.translate(text, lang, 'en')
            paraphrases = self.paraphraser.generate_paraphrases(english_text)
            translated_paraphrases = []
            for paraphrase in paraphrases:
                translated_paraphrase = self.translator.translate(paraphrase, 'en', lang)
                translated_paraphrases.append(translated_paraphrase)
            return translated_paraphrases

        return paraphrases

