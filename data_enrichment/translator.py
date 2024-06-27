from transformers import MarianMTModel, MarianTokenizer

class Translator:
    def __init__(self):
        self.models = {
            'et-en': ('Helsinki-NLP/opus-mt-et-en', 'Helsinki-NLP/opus-mt-en-et'),
            'ru-en': ('Helsinki-NLP/opus-mt-ru-en', 'Helsinki-NLP/opus-mt-en-ru'),
            'pl-en': ('Helsinki-NLP/opus-mt-pl-en', 'Helsinki-NLP/opus-mt-en-pl'),
            'fi-en': ('Helsinki-NLP/opus-mt-fi-en', 'Helsinki-NLP/opus-mt-en-fi'),
            'en-fr': ('Helsinki-NLP/opus-mt-en-fr', 'Helsinki-NLP/opus-mt-fr-en'),
            'fr-pl': ('Helsinki-NLP/opus-mt-fr-pl', 'Helsinki-NLP/opus-mt-pl-fr'),
        }
        self.tokenizers = {}
        self.models_instances = {}

        for key, (model_name, reverse_model_name) in self.models.items():
            self.tokenizers[key] = MarianTokenizer.from_pretrained(model_name)
            self.models_instances[key] = MarianMTModel.from_pretrained(model_name)
            reverse_key = f"{key.split('-')[1]}-{key.split('-')[0]}"
            if reverse_model_name != 'Helsinki-NLP/opus-mt-en-pl':
                self.tokenizers[reverse_key] = MarianTokenizer.from_pretrained(reverse_model_name)
                self.models_instances[reverse_key] = MarianMTModel.from_pretrained(reverse_model_name)

    def translate(self, text, src_lang, tgt_lang):
        if src_lang == 'en' and tgt_lang == 'pl':
            intermediate_text = self._translate(text, 'en', 'fr')
            translated_text = self._translate(intermediate_text, 'fr', 'pl')
        else:
            translated_text = self._translate(text, src_lang, tgt_lang)

        return translated_text

    def _translate(self, text, src_lang, tgt_lang):
        key = f'{src_lang}-{tgt_lang}'
        if key not in self.models_instances:
            raise ValueError(f"Translation from {src_lang} to {tgt_lang} is not supported.")

        tokenizer = self.tokenizers[key]
        model = self.models_instances[key]

        tokens = tokenizer(text, return_tensors="pt", padding=True)

        translated_tokens = model.generate(**tokens)
        translated_text = tokenizer.decode(translated_tokens[0], skip_special_tokens=True)

        return translated_text

