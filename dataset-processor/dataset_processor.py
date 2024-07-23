import re
import os
import json
from data_enrichment.data_enrichment import DataEnrichment

class DatasetProcessor:
    def __init__(self):
        self.data_enricher = DataEnrichment()

    def check_and_convert(self, data):
        if self._is_multple_sheet_structure(data):
            return self._convert_to_single_sheet_structure(data)
        elif self._is_single_sheet_structure(data):
            return data
        else:
            raise ValueError("The provided dictionary does not match the expected structures.")

    def _is_multple_sheet_structure(self, data):
        if isinstance(data, dict):
            for key, value in data.items():
                if not isinstance(key, str) or not isinstance(value, list):
                    return False
                for item in value:
                    if not isinstance(item, dict):
                        return False
            return True
        return False

    def _is_single_sheet_structure(self, data):
        if isinstance(data, list):
            for item in data:
                if not isinstance(item, dict) or len(item) != 1:
                    return False
            return True
        return False

    def _convert_to_single_sheet_structure(self, data):
        result = []
        for value in data.values():
            result.extend(value)
        return result

    def remove_stop_words(self, data, stop_words):
        stop_words_set = set(stop_words)
        stop_words_pattern = re.compile(r'\b(' + r'|'.join(re.escape(word) for word in stop_words_set) + r')\b', re.IGNORECASE)

        def clean_text(text):
            return stop_words_pattern.sub('', text).strip()

        cleaned_data = []
        for entry in data:
            cleaned_entry = {key: clean_text(value) if isinstance(value, str) else value for key, value in entry.items()}
            cleaned_data.append(cleaned_entry)

        return cleaned_data
    
    def enrich_data(self, data):
        enriched_data = []
        for entry in data:
            enriched_entry = {}
            for key, value in entry.items():
                if isinstance(value, str):
                    enriched_value = self.data_enricher.enrich_data(value, num_return_sequences=1, language_id='en')
                    enriched_entry[key] = enriched_value[0] if enriched_value else value
                else:
                    enriched_entry[key] = value
            enriched_data.append(enriched_entry)
        return enriched_data
    
    def chunk_data(self, data, chunk_size=5):
        return [data[i:i + chunk_size] for i in range(0, len(data), chunk_size)]
    
    def save_data_to_local(self, chunked_data, output_folder='output'):

        if not os.path.exists(output_folder):
            os.makedirs(output_folder)
        
        for i, chunk in enumerate(chunked_data, start=1):
            file_path = os.path.join(output_folder, f'{i}.json')
            with open(file_path, 'w') as f:
                json.dump(chunk, f, indent=4)
            print(f'Saved: {file_path}')

if __name__ == "__main__":
    data1 = {
        "Sheet1": [
            {"from": "alice@example.com", "to": "bob@example.com", "subject": "Meeting Reminder", "body": "Don't forget our meeting tomorrow at 10 AM."},
            {"from": "carol@example.com", "to": "dave@example.com", "subject": "Project Update", "body": "The project is on track for completion next week."},
            {"from": "eve@example.com", "to": "frank@example.com", "subject": "Happy Birthday!", "body": "Wishing you a very happy birthday!"},
            {"from": "grace@example.com", "to": "heidi@example.com", "subject": "Team Lunch", "body": "Let's have lunch together this Friday."},
            {"from": "ivy@example.com", "to": "jack@example.com", "subject": "New Opportunity", "body": "We have a new opportunity that I think you'll be interested in."},
            {"from": "ken@example.com", "to": "laura@example.com", "subject": "Meeting Follow-up", "body": "Following up on our meeting last week."},
            {"from": "mike@example.com", "to": "nancy@example.com", "subject": "Question about report", "body": "Could you clarify the numbers in section 3 of the report?"},
            {"from": "oliver@example.com", "to": "pam@example.com", "subject": "Vacation Plans", "body": "I'll be out of office next week for vacation."},
            {"from": "quinn@example.com", "to": "rachel@example.com", "subject": "Conference Call", "body": "Can we schedule a conference call for Thursday?"},
            {"from": "steve@example.com", "to": "tina@example.com", "subject": "Document Review", "body": "Please review the attached document."},
        ],
        # "Sheet2": [
        #     {"from": "ursula@example.com", "to": "victor@example.com", "subject": "Sales Report", "body": "The sales report for Q2 is ready."},
        #     {"from": "wendy@example.com", "to": "xander@example.com", "subject": "Job Application", "body": "I am interested in the open position at your company."},
        #     {"from": "yara@example.com", "to": "zane@example.com", "subject": "Invoice", "body": "Attached is the invoice for the recent purchase."},
        #     {"from": "adam@example.com", "to": "betty@example.com", "subject": "Networking Event", "body": "Join us for a networking event next month."},
        #     {"from": "charlie@example.com", "to": "diana@example.com", "subject": "Product Feedback", "body": "We'd love to hear your feedback on our new product."},
        #     {"from": "ed@example.com", "to": "fay@example.com", "subject": "Workshop Invitation", "body": "You are invited to attend our upcoming workshop."},
        #     {"from": "george@example.com", "to": "hannah@example.com", "subject": "Performance Review", "body": "Your performance review is scheduled for next week."},
        #     {"from": "ian@example.com", "to": "jane@example.com", "subject": "Event Reminder", "body": "Reminder: The event is on Saturday at 5 PM."},
        #     {"from": "kevin@example.com", "to": "lisa@example.com", "subject": "Thank You", "body": "Thank you for your assistance with the project."},
        #     {"from": "mark@example.com", "to": "nina@example.com", "subject": "New Policy", "body": "Please review the new company policy on remote work."},
        # ]
    }
    converter1 = DatasetProcessor()
    structured_data = converter1.check_and_convert(data1)

    enriched_data = converter1.enrich_data(structured_data)

    stop_words = ["to", "New", "remote", "Work"]
    cleaned_data = converter1.remove_stop_words(enriched_data, stop_words)

    chunked_data =  converter1.chunk_data(cleaned_data)

    converter1.save_data_to_local(chunked_data)

    for x in cleaned_data:
        print(x)
