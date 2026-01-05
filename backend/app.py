import os
import io
import torch
import torch.nn as nn
import torchvision.transforms as transforms
import pickle
import string
from flask import Flask, request, jsonify
from flask_cors import CORS
from torchvision import models
from PIL import Image

# --- CONFIGURATION ---
app = Flask(__name__)
CORS(app) # Enable communication with React

# Auto-detect device (Will use CPU on laptop)
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Running on device: {DEVICE}")

MODEL_PATH = "models"

# --- MODEL CLASSES (Must match training exactly) ---

class Vocabulary:
    def __init__(self, freq_threshold=2):
        self.itos = {0: "<PAD>", 1: "<SOS>", 2: "<EOS>", 3: "<UNK>"}
        self.stoi = {v: k for k, v in self.itos.items()}
        self.freq_threshold = freq_threshold
    
    def __len__(self): return len(self.itos)
    
    def tokenizer_eng(self, text):
        # Simple tokenizer (No Spacy needed)
        text = text.lower().translate(str.maketrans('', '', string.punctuation))
        return text.split()

class EncoderCNN(nn.Module):
    def __init__(self, embed_size):
        super(EncoderCNN, self).__init__()
        # Load ResNet
        self.inception = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
        self.inception.fc = nn.Linear(self.inception.fc.in_features, embed_size)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(0.5)

    def forward(self, images):
        features = self.inception(images)
        return self.dropout(self.relu(features))

class DecoderRNN(nn.Module):
    def __init__(self, embed_size, hidden_size, vocab_size, num_layers):
        super(DecoderRNN, self).__init__()
        self.embed = nn.Embedding(vocab_size, embed_size)
        self.lstm = nn.LSTM(embed_size, hidden_size, num_layers, batch_first=True, dropout=0.3)
        self.linear = nn.Linear(hidden_size, vocab_size)
    
    def sample(self, features, max_len=20):
        result_caption = []
        with torch.no_grad():
            inputs = features.unsqueeze(1)
            states = None
            for _ in range(max_len):
                hiddens, states = self.lstm(inputs, states)
                output = self.linear(hiddens.squeeze(1))
                predicted = output.argmax(1)
                
                result_caption.append(predicted.item())
                
                # Feed the prediction back into the model
                inputs = self.embed(predicted).unsqueeze(1)
                
                if predicted.item() == 2: # <EOS>
                    break
        return result_caption

# --- LOADING THE MODELS ---
print("Loading models... please wait.")

try:
    # 1. Load Vocabulary
    with open(os.path.join(MODEL_PATH, "vocab.pkl"), "rb") as f:
        vocab = pickle.load(f)

    # 2. Setup Architecture
    embed_size = 256
    hidden_size = 512
    vocab_size = len(vocab)
    num_layers = 2

    encoder = EncoderCNN(embed_size).to(DEVICE)
    decoder = DecoderRNN(embed_size, hidden_size, vocab_size, num_layers).to(DEVICE)

    # 3. Load Weights (map_location handles CPU conversion)
    encoder.load_state_dict(torch.load(os.path.join(MODEL_PATH, "encoder.pth"), map_location=DEVICE))
    decoder.load_state_dict(torch.load(os.path.join(MODEL_PATH, "decoder.pth"), map_location=DEVICE))

    encoder.eval()
    decoder.eval()
    print("Models loaded successfully!")

except Exception as e:
    print(f"ERROR loading models: {e}")
    print("Ensure 'encoder.pth', 'decoder.pth', and 'vocab.pkl' are in the 'backend/models' folder.")

# --- PREPROCESSING ---
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize((0.485, 0.456, 0.406), (0.229, 0.224, 0.225))
])

# --- API ROUTES ---
@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    
    try:
        file = request.files['image']
        image = Image.open(io.BytesIO(file.read())).convert("RGB")
        
        # Prepare image
        image_tensor = transform(image).unsqueeze(0).to(DEVICE)
        
        # Generate Caption
        with torch.no_grad():
            features = encoder(image_tensor)
            output_ids = decoder.sample(features)
        
        # Convert IDs to Words
        caption_words = []
        for word_id in output_ids:
            word = vocab.itos[word_id]
            if word == "<EOS>": break
            if word not in ["<SOS>", "<PAD>", "<UNK>"]:
                caption_words.append(word)
        
        final_caption = " ".join(caption_words)
        return jsonify({"caption": final_caption})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)