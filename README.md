# Image Captioning App (ResNet50 + LSTM)

This is a full-stack application that generates descriptive captions for uploaded images using Deep Learning. It uses a **Flask** API serving a PyTorch model (Encoder-Decoder architecture) and a **React** frontend for the user interface.

The model combines **ResNet50** (for extracting image features) and an **LSTM** (for generating text sequences) to describe the visual content.

##  Tech Stack

* **Model:** PyTorch, ResNet50 (Encoder), LSTM (Decoder).
* **Backend:** Flask, Flask-CORS.
* **Frontend:** React, Axios.
* **Dataset Used:** Flickr8k.

---
##  Directory Structure

```text
image-captioning/
│
├── backend/                 # Python Flask Server
│   ├── models/              # Contains the trained weights
│   │   ├── encoder.pth      # ResNet encoder weights
│   │   ├── decoder.pth      # LSTM decoder weights
│   │   └── vocab.pkl        # Vocabulary mapping
│   ├── app.py               # Main API entry point
│   └── requirements.txt     # Python dependencies
│
├── frontend/                # React Application
│   ├── src/                 # React source code
│   ├── public/              # Static assets
│   └── package.json         # Node dependencies
│
├── notebook/               # Jupyter Notebooks used for training
│   └── 221442_Assignment3.ipynb # Full training pipeline code
│
└── .gitignore               # Git configuration

---

##  How to Run Locally

### 1. Clone the Repository

```bash
git clone [https://github.com/Meekal-Jamil/image-captioning.git](https://github.com/Meekal-Jamil/image-captioning.git)
cd image-captioning

```

### 2. Backend Setup (Flask)

The backend runs the PyTorch model and exposes the `/predict` endpoint.

**Note:** This project includes the trained model files in `backend/models/`. If they are missing, ensure you have Git LFS enabled or download them manually.

```bash
cd backend

# Install dependencies (Flask, Torch, Pillow)
pip install -r requirements.txt

# Run the server
python app.py

```

*Output should say:* `Running on http://127.0.0.1:5000`

### 3. Frontend Setup (React)

Open a new terminal window for the frontend.

```bash
cd frontend

# Install Node modules
npm install

# Start the React app
npm start

```

*The app will open at:* `http://localhost:3000`

---

##  Model Architecture

The captioning model consists of two parts:

1. **Encoder (ResNet50):** * We use a pre-trained ResNet50 with the final classification layer removed.
* It compresses the image into a feature vector.


2. **Decoder (LSTM):**
* Takes the feature vector and generates the caption word-by-word.
* Trained using Cross Entropy Loss.



The application automatically detects if you have a GPU (CUDA). If not, it defaults to CPU mode, making it compatible with standard laptops.

---
---

##  Dataset & Performance

### Training Data
The model was trained on the **Flickr8k Dataset**.
* **Size:** 8,000 images.
* **Captions:** Each image has 5 different human-written captions (40,000 captions total).
* **Content:** The dataset focuses on people performing actions, animals (especially dogs), and natural scenes.

### Expected Results
For the best captions, use images that are similar to the training data:
* ✅ **Natural Photography:** Photos taken outdoors, in parks, cities, or rooms.
* ✅ **Action Shots:** People running, playing sports, or interacting with objects.
* ✅ **Animals:** especially dogs and horses in outdoor settings.
* ✅ **Clear Subjects:** Images where the main object is clearly visible and well-lit.

### Limitations
The model may generate inaccurate or repetitive captions for:
* ❌ **Abstract or Digital Art:** Cartoons, sketches, or generated images.
* ❌ **Text-Heavy Images:** Screenshots, documents, or signs.
* ❌ **Complex Indoor Scenes:** Cluttered desks or very dark environments.
* ❌ **Crowds:** It often struggles to distinguish specific actions in large groups.

##  Troubleshooting / Common Issues

* **"File too large" errors:** The `.pth` files are large. If git pull fails, check if Git LFS is installed.
* **Backend not connecting:** Ensure the Flask server is running on port `5000`. If you change the port, update the Axios request in `frontend/src/App.js`.
* **Missing `vocab.pkl`:** This file is required to translate the model's numerical output back into English words. It must exist in `backend/models/`.

---

### Author

Meekal Jamil

```
```