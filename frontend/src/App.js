import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setCaption("");
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select an image first.");
      return;
    }

    setLoading(true);
    setError("");
    setCaption("");

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      // Ensure this matches your Flask backend port (usually 5000)
      const response = await axios.post('http://localhost:5000/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCaption(response.data.caption);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze image. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Header Section */}
      <header className="navbar">
        <div className="logo">Action<span className="highlight">Recognizer</span></div>
        <nav>
          <a href="#about">Action Recognition</a>
          <a href="#about">Scene Understanding</a>
        </nav>
      </header>

      <main className="main-content">
        <div className="hero-section">
          <h1>Visual Action Recognition & Captioning</h1>
          <p className="subtitle">
            Upload an image to detect human actions, interactions, and scene context using 
            Deep Learning (ResNet50 + LSTM).
          </p>
        </div>

        <div className="workspace">
          {/* Left Panel: Upload Area */}
          <div className="card upload-card">
            <h3>Input Image</h3>
            <div className="upload-area">
              {preview ? (
                <img src={preview} alt="Preview" className="image-preview" />
              ) : (
                <div className="placeholder">
                  <span className="icon">📷</span>
                  <p>No image selected</p>
                </div>
              )}
            </div>
            
            <div className="controls">
              <input 
                type="file" 
                id="fileInput" 
                accept="image/*" 
                onChange={handleFileChange} 
                hidden 
              />
              <label htmlFor="fileInput" className="btn secondary-btn">
                Choose Image
              </label>
              
              <button 
                onClick={handleUpload} 
                className="btn primary-btn" 
                disabled={!selectedFile || loading}
              >
                {loading ? "Analyzing..." : "Analyze Image"}
              </button>
            </div>
          </div>

          {/* Right Panel: Results Area */}
          <div className="card result-card">
            <h3>Analysis Results</h3>
            <div className="result-content">
              {loading && (
                <div className="loader-container">
                  <div className="spinner"></div>
                  <p>Extracting Features & Recognizing Actions...</p>
                </div>
              )}

              {error && <div className="error-msg">{error}</div>}

              {caption && !loading && (
                <div className="success-box">
                  <h4>Detected Activity:</h4>
                  <p className="caption-text">"{caption}"</p>
                  
                  <div className="badges">
                    <span className="badge">Action Recognition</span>
                    <span className="badge">Object Detection</span>
                    <span className="badge">Scene Captioning</span>
                  </div>
                </div>
              )}

              {!caption && !loading && !error && (
                <div className="empty-state">
                  <p>Results will appear here after analysis.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Informational Footer */}
        <section className="info-section">
          <h3>How it Works</h3>
          <div className="steps">
            <div className="step">
              <span className="step-num">1</span>
              <p><strong>Encoder (ResNet):</strong> Scans the image to identify objects (people, sports gear) and environment.</p>
            </div>
            <div className="step">
              <span className="step-num">2</span>
              <p><strong>Decoder (LSTM):</strong> Recognizes the action (running, jumping) and forms a sentence.</p>
            </div>
            <div className="step">
              <span className="step-num">3</span>
              <p><strong>Result:</strong> A complete description of the visual action.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;