import os
import pandas as pd
from transformers import BertTokenizer, BertForSequenceClassification, Trainer, TrainingArguments
import torch
import numpy as np
from datetime import datetime

class CustomDataset(torch.utils.data.Dataset):
    def __init__(self, encodings, labels, label2id, device):
        self.encodings = encodings
        self.labels = labels
        self.label2id = label2id
        self.device = device

    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]).to(self.device) for key, val in self.encodings.items()}
        item['labels'] = torch.tensor(self.label2id[self.labels[idx]]).to(self.device)
        return item

    def __len__(self):
        return len(self.labels)

train_data = pd.read_excel('train.xlsx')
test_data = pd.read_excel('test.xlsx')

tokenizer = BertTokenizer.from_pretrained('bert-base-multilingual-cased')
train_encodings = tokenizer(list(train_data['text'].astype(str)), truncation=True, padding=True)
test_encodings = tokenizer(list(test_data['text'].astype(str)), truncation=True, padding=True)

train_labels = train_data['label'].astype(str)
test_labels = test_data['label'].astype(str)
unique_labels = list(set(train_labels.values.tolist() + test_labels.values.tolist()))
label2id = {label: idx for idx, label in enumerate(unique_labels)}
id2label = {idx: label for label, idx in label2id.items()}

device = torch.device('cuda') if torch.cuda.is_available() else torch.device('cpu')

train_dataset = CustomDataset(train_encodings, train_labels, label2id, device)
test_dataset = CustomDataset(test_encodings, test_labels, label2id, device)

print(f"Train encodings keys: {train_encodings.keys()}")
print(f"First train encoding shape: {len(train_encodings['input_ids'][0])}")
print(f"Train labels: {train_labels[:5]}")
print(f"Label to ID mapping: {label2id}")

model = BertForSequenceClassification.from_pretrained('bert-base-multilingual-uncased', num_labels=len(unique_labels))
model.to(device)
model.config.id2label = id2label
model.config.label2id = label2id

for name, param in model.named_parameters():
    if 'encoder.layer.10' not in name and 'encoder.layer.11' not in name:
        param.requires_grad = False

for name, param in model.named_parameters():
    print(f"{name}: {param.requires_grad}")

training_args = TrainingArguments(
    output_dir='./results',
    num_train_epochs=1,
    per_device_train_batch_size=1,
    per_device_eval_batch_size=1,
    warmup_steps=500,
    weight_decay=0.01,
    logging_dir='./logs',
    logging_steps=10,
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
)

trainer.train()

current_time = datetime.now().strftime('%Y%m%d_%H%M%S')
model_dir = f'trained_models/bert_{current_time}'
os.makedirs(model_dir, exist_ok=True)
model.save_pretrained(model_dir)

trainer.evaluate()

trainer_predictions = trainer.predict(train_dataset)
train_accuracy = np.mean(np.argmax(trainer_predictions.predictions, axis=1) == [label2id[label] for label in train_labels])

with open('results.txt', 'a') as f:
    f.write(f'Model: bert_{current_time}\n')
    f.write(f'Training Accuracy: {train_accuracy:.4f}\n')
    f.write('Note: This model is finetuned.\n\n')

os.environ['CUDA_LAUNCH_BLOCKING'] = '1'
