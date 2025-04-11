import os
import json
import torch
import torch.nn as nn
import torch.optim as optim
import pandas as pd
from torch.utils.data import Dataset, DataLoader
from transformers import BertTokenizer, BertModel
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from tqdm import tqdm
import joblib
import warnings
warnings.filterwarnings("ignore")

# ✅ 1. 모델 정의
class BERTClassifier(nn.Module):
    def __init__(self, num_classes, dropout=0.3):
        super(BERTClassifier, self).__init__()
        self.bert = BertModel.from_pretrained("snunlp/KR-FinBERT")
        self.dropout = nn.Dropout(dropout)
        self.fc = nn.Linear(self.bert.config.hidden_size, num_classes)

    def forward(self, input_ids, attention_mask):
        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        pooled_output = outputs.pooler_output
        return self.fc(self.dropout(pooled_output))

# ✅ 2. 데이터셋 클래스
class NewsDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_len=128):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_len = max_len

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        tokens = self.tokenizer(
            self.texts[idx],
            padding="max_length",
            truncation=True,
            max_length=self.max_len,
            return_tensors="pt"
        )
        input_ids = tokens["input_ids"].squeeze(0)
        attention_mask = tokens["attention_mask"].squeeze(0)
        return input_ids, attention_mask, torch.tensor(self.labels[idx])

# ✅ 3. 학습 함수
def train_all_5class(
    jsonl_path,
    model_dir="../saved_model",
    epochs_to_train=5
):
    os.makedirs(model_dir, exist_ok=True)

    model_path = os.path.join(model_dir, "krfinbert_stock_classifier_5class.pth")
    tokenizer_path = os.path.join(model_dir, "bert_tokenizer.pkl")
    epoch_info_path = os.path.join(model_dir, "epoch_info.json")

    # ✅ 데이터 로딩
    df = pd.read_json(jsonl_path, lines=True)
    df["text"] = df["title"] + " " + df["summary"]
    df["label"] = df["labeling_5class"]  # ✅ 컬럼명 정확히 사용
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)

    # ✅ train/val split (비율 유지)
    train_texts, val_texts, train_labels, val_labels = train_test_split(
        df["text"].tolist(),
        df["label"].tolist(),
        test_size=0.2,
        random_state=42,
        stratify=df["label"]
    )

    tokenizer = BertTokenizer.from_pretrained("snunlp/KR-FinBERT")
    joblib.dump(tokenizer, tokenizer_path)

    train_loader = DataLoader(NewsDataset(train_texts, train_labels, tokenizer), batch_size=32, shuffle=True)
    val_loader = DataLoader(NewsDataset(val_texts, val_labels, tokenizer), batch_size=32)

    # ✅ MPS (Mac GPU) 우선 적용
    if torch.backends.mps.is_available():
        device = torch.device("mps")
        print("✅ MPS (Mac GPU) 사용 중")
    elif torch.cuda.is_available():
        device = torch.device("cuda")
        print("✅ CUDA 사용 중")
    else:
        device = torch.device("cpu")
        print("⚠️ GPU 사용 불가 - CPU 사용 중")

    model = BERTClassifier(num_classes=5).to(device)

    # ✅ 이어서 학습 가능
    start_epoch = 0
    if os.path.exists(model_path):
        model.load_state_dict(torch.load(model_path, map_location=device))
        print("✅ 기존 모델 로드 완료")
        if os.path.exists(epoch_info_path):
            with open(epoch_info_path, "r") as f:
                epoch_info = json.load(f)
                start_epoch = epoch_info.get("last_epoch", 0)
                print(f"🔁 이어서 학습 시작: epoch {start_epoch + 1}")

    optimizer = optim.AdamW(model.parameters(), lr=2e-5)
    criterion = nn.CrossEntropyLoss()

    for epoch in range(start_epoch, start_epoch + epochs_to_train):
        model.train()
        total_loss = 0
        print(f"\n🔄 Epoch [{epoch + 1}/{start_epoch + epochs_to_train}]")

        progress_bar = tqdm(train_loader, desc=f"Training Epoch {epoch + 1}")
        for input_ids, attention_mask, labels in progress_bar:
            input_ids, attention_mask, labels = input_ids.to(device), attention_mask.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(input_ids, attention_mask)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
            progress_bar.set_postfix(loss=loss.item())

        print(f"✅ 평균 Loss: {total_loss / len(train_loader):.4f}")

        torch.save(model.state_dict(), model_path)
        with open(epoch_info_path, "w") as f:
            json.dump({"last_epoch": epoch + 1}, f)

        print(f"📦 모델 저장 완료 (Epoch {epoch + 1})")

    # ✅ 평가
    model.eval()
    all_preds, all_labels = [], []
    with torch.no_grad():
        progress_bar = tqdm(val_loader, desc="Evaluating")
        for input_ids, attention_mask, labels in progress_bar:
            input_ids, attention_mask, labels = input_ids.to(device), attention_mask.to(device), labels.to(device)
            outputs = model(input_ids, attention_mask)
            preds = torch.argmax(outputs, dim=1)
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())

    print("\n🎯 Accuracy:", accuracy_score(all_labels, all_preds))
    print(classification_report(all_labels, all_preds))

# ✅ 실행
if __name__ == "__main__":
    train_all_5class(
        jsonl_path="../real_final_data_5class/labeled_data_5class_3.jsonl",
        epochs_to_train=5
    )
