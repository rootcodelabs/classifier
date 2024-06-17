import os
import pandas as pd
import torch
from torch.utils.data import Dataset, DataLoader
from transformers import XLNetTokenizer, XLNetForSequenceClassification, Trainer, TrainingArguments
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score
from datetime import datetime

# Ensure the SentencePiece library is installed
try:
    import sentencepiece
except ImportError:
    raise ImportError("The SentencePiece library is required but not installed. Install it using 'pip install sentencepiece'.")

# Load data from Excel files
train_df = pd.read_excel('train.xlsx')
test_df = pd.read_excel('test.xlsx')

# Check for null values in text and label columns
if train_df['text'].isnull().any() or test_df['text'].isnull().any():
    raise ValueError("Null values found in text column.")

if train_df['label'].isnull().any() or test_df['label'].isnull().any():
    raise ValueError("Null values found in label column.")

# Initialize XLNet tokenizer
tokenizer = XLNetTokenizer.from_pretrained('xlnet-base-cased')

# Tokenize text data
def tokenize_data(data, tokenizer):
    tokenized = tokenizer.batch_encode_plus(
        data,
        truncation=True,
        padding=True,
        return_token_type_ids=False,
        return_attention_mask=True,
        return_tensors='pt'
    )
    return tokenized

# Process labels
label_encoder = LabelEncoder()
train_labels = label_encoder.fit_transform(train_df['label'])
test_labels = label_encoder.transform(test_df['label'])

# Custom dataset class
class CustomDataset(Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = torch.tensor(labels, dtype=torch.long)  # Ensure labels are torch.long
    
    def __getitem__(self, idx):
        item = {key: val[idx] for key, val in self.encodings.items()}
        item['labels'] = self.labels[idx]
        return item
    
    def __len__(self):
        return len(self.labels)

# Tokenize and prepare datasets
train_encodings = tokenize_data(train_df['text'].tolist(), tokenizer)
test_encodings = tokenize_data(test_df['text'].tolist(), tokenizer)

train_dataset = CustomDataset(train_encodings, train_labels)
test_dataset = CustomDataset(test_encodings, test_labels)

# Initialize XLNet model for sequence classification
model = XLNetForSequenceClassification.from_pretrained(
    'xlnet-base-cased',
    num_labels=len(label_encoder.classes_)  # Number of unique labels in your dataset
)

# Move model to device
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model.to(device)

print(f"Training on {device}...")

# Freeze most of the XLNet layers
for param in model.transformer.parameters():
    param.requires_grad = False

# Fine-tune specific layers
for param in model.transformer.layer[-1:].parameters():
    param.requires_grad = True

# Training arguments
training_args = TrainingArguments(
    output_dir='./trained_models/xlnet_' + datetime.now().strftime('%Y-%m-%d_%H-%M-%S'),
    num_train_epochs=1,
    per_device_train_batch_size=1,  # Further reduce batch size
    per_device_eval_batch_size=1,  # Further reduce batch size
    logging_dir='./logs',
    logging_steps=100,
    eval_strategy='epoch',
    save_strategy='epoch',  # Set save strategy to 'epoch'
    gradient_accumulation_steps=8,  # Increase gradient accumulation steps
    fp16=True,  # Enable mixed precision training
    save_total_limit=2,  # Save only the last two checkpoints
    load_best_model_at_end=True,  # Load the best model at the end
)

# Trainer object
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=test_dataset,
    compute_metrics=lambda eval_pred: {"accuracy": accuracy_score(eval_pred.label_ids, eval_pred.predictions.argmax(axis=1))}
)

# Record start time
start_time = datetime.now()

# Train the model
trainer.train()

# Record end time
end_time = datetime.now()

# Calculate time taken for training
time_taken = end_time - start_time

# Evaluate the model
eval_results = trainer.evaluate()

print(f"Accuracy on test set: {eval_results['eval_accuracy']:.4f}")

# Save model
model_path = os.path.join(training_args.output_dir, 'model')
model.save_pretrained(model_path)
tokenizer.save_pretrained(model_path)

# Save results to results.txt
results_file = 'results.txt'
model_name = model_path.split('/')[-1]
accuracy = eval_results['eval_accuracy']
num_epochs = training_args.num_train_epochs

with open(results_file, 'a') as file:
    file.write(f"Model: {model_name}\n")
    file.write(f"Accuracy: {accuracy:.4f}\n")
    file.write(f"Time taken: {time_taken}\n")
    file.write(f"Number of epochs: {num_epochs}\n")
    file.write("\n")  # Empty line between different entries
