import pandas as pd
from transformers import BertTokenizer, BertForSequenceClassification, Trainer
from torch.utils.data import Dataset
from datetime import datetime
import numpy as np
import torch

class CustomDataset(Dataset):
    def __init__(self, encodings, labels, label2id):
        self.encodings = encodings
        self.labels = labels
        self.label2id = label2id

    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        item['labels'] = torch.tensor(self.label2id[self.labels[idx]])
        return item

    def __len__(self):
        return len(self.labels)

test_data = pd.read_excel('test.xlsx')

tokenizer = BertTokenizer.from_pretrained('bert-base-multilingual-cased')
test_encodings = tokenizer(list(test_data['text']), truncation=True, padding=True)
test_labels = list(test_data['label'])

unique_labels = list(set(test_labels))
label2id = {label: idx for idx, label in enumerate(unique_labels)}
id2label = {idx: label for label, idx in label2id.items()}

test_dataset = CustomDataset(test_encodings, test_labels, label2id)

model = BertForSequenceClassification.from_pretrained('bert-base-multilingual-cased', num_labels=len(unique_labels))
model.config.id2label = id2label
model.config.label2id = label2id

trainer = Trainer(
    model=model,
    eval_dataset=test_dataset,
)

evaluation_results = trainer.evaluate()

trainer_predictions = trainer.predict(test_dataset)
test_accuracy = np.mean(np.argmax(trainer_predictions.predictions, axis=1) == [label2id[label] for label in test_labels])

current_time = datetime.now().strftime('%Y%m%d_%H%M%S')
with open('results.txt', 'a') as f:
    f.write(f'Model: bert_pretrained_{current_time}\n')
    f.write(f'Test Accuracy: {test_accuracy:.4f}\n')
    f.write('Note: This model is pre-trained and not finetuned.\n\n')
