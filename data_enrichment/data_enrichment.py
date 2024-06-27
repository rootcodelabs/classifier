from translator import Translator
from paraphraser import Paraphraser

class DataEnrichment:
    def __init__(self):
        self.translator = Translator()
        self.paraphraser = Paraphraser()

    def enrich_data(self, text, lang):
        supported_languages = ['en', 'et', 'ru', 'pl', 'fi']

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

if __name__ == "__main__":
    enricher = DataEnrichment()

    sentences = [
        ("Hello, I hope this email finds you well. I am writing to inquire about the status of my application. I submitted all required documents last month but have not received any update since then. Could you please provide me with the current status?", 'en'),
        ("Tere, ma loodan, et see e-kiri leiab teid hästi. Ma kirjutan päringu staatuse minu taotluse. Ma esitasin kõik nõutavad dokumendid möödunud kuu, kuid ma pole saanud ühtegi värskendust sellest ajast. Kas saaksite palun mulle hetkeseisu kohta teavet anda?", 'et'),  # Estonian
        ("Привет, надеюсь, что это письмо находит вас в порядке. Я пишу с запросом о статусе моего заявления. Я подал все необходимые документы в прошлом месяце, но с тех пор не получил никаких обновлений. Не могли бы вы, пожалуйста, предоставить мне текущий статус?", 'ru'),  # Russian
        ("Cześć, mam nadzieję, że to e-mail znajduje cię w dobrym zdrowiu. Piszę z zapytaniem o status mojej aplikacji. Złożyłem wszystkie wymagane dokumenty w zeszłym miesiącu, ale od tego czasu nie otrzymałem żadnej aktualizacji. Czy moglibyście podać mi bieżący status?", 'pl'),  # Polish
        ("Hei, toivottavasti tämä sähköposti tavoittaa teidät hyvin. Kirjoitan tiedustelun tilastani hakemukseni suhteen. Lähetin kaikki tarvittavat asiakirjat viime kuussa, mutta en ole sen jälkeen saanut päivityksiä. Voisitteko antaa minulle ajantasaisen tilanteen?", 'fi')  # Finnish
    ]


    for sentence, lang in sentences:
        print(f"Original sentence ({lang}): {sentence}")
        enriched_data = enricher.enrich_data(sentence, lang)
        if enriched_data:
            print("Paraphrases:")
            for i, paraphrase in enumerate(enriched_data, 1):
                print(f"Paraphrase {i}: {paraphrase}")
        print("-" * 50)
