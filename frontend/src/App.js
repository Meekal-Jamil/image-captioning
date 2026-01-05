import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setCaption("");
      setError(false);
    }
  };

  const handleGenerate = async () => {
    if (!file) return;

    setLoading(true);
    setCaption("");
    setError(false);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post("http://localhost:5000/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCaption(res.data.caption);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>AI Image Captioning</h1>
        <p className="subtitle">Upload an image to generate a description</p>
        
        <div className="upload-area">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
            id="file-upload" 
            className="hidden-input"
          />
          <label htmlFor="file-upload" className="upload-btn">
            {file ? "Change Image" : "Choose Image"}
          </label>
        </div>

        {preview && (
          <div className="preview-box">
            <img src={preview} alt="Upload Preview" />
          </div>
        )}

        <button 
          className="generate-btn" 
          onClick={handleGenerate} 
          disabled={!file || loading}
        >
          {loading ? "Analyzing..." : "Generate Caption"}
        </button>

        {caption && (
          <div className="result-box">
            <h3>Result:</h3>
            <p>{caption}</p>
          </div>
        )}

        {error && <p className="error">Error connecting to server. Is Backend running?</p>}
      </div>
    </div>
  );
}

export default App;