import React, { useState, useEffect } from 'react';
import { jsPDF } from "jspdf";
import { Zap, UploadCloud, Activity, FileDown, History, ShieldAlert, Users, GraduationCap } from 'lucide-react';
import './App.css';

const App = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch('https://lung-cancer-deploy-backend.onrender.com/');
    const saved = JSON.parse(localStorage.getItem('uem_lung_history') || "[]");
    setHistory(saved);
  }, []);

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setLoading(false);
  };

  const onSelectFile = (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

 const handlePredict = async () => {
  if (!selectedFile) return;
  setLoading(true);
  setResult(null); // This clears the "94.8%" from the screen immediately

  const formData = new FormData();
  formData.append('file', selectedFile);

  try {
    // Note: MUST use /predict at the end of the URL
    const response = await fetch('https://lung-cancer-deploy-backend.onrender.com/predict', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
        throw new Error("Server is waking up... please wait.");
    }

    const data = await response.json();
    
    // This 'data' comes from your Python model!
    setResult(data); 

  } catch (error) {
    console.error("Error:", error);
    alert("Real Error:"+ error.message);
  } finally {
    setLoading(false);
  }
};

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.text("UNIVERSITY OF ENGINEERING & MANAGEMENT, KOLKATA", 105, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text("DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING", 105, 28, { align: "center" });
    doc.line(20, 35, 190, 35);
    doc.text(`PROJECT: LUNG CANCER DETECTION VIA CNN`, 20, 45);
    doc.setFont("helvetica", "normal");
    doc.text(`File Analyzed: ${result.fileName}`, 20, 55);
    doc.text(`AI Prediction: ${result.prediction}`, 20, 65);
    doc.text(`Confidence Score: ${(result.confidence * 100).toFixed(2)}%`, 20, 75);
    doc.text(`Timestamp: ${result.date} | ${result.timestamp}`, 20, 85);
    doc.save(`UEM_Report_${result.fileName}.pdf`);
  };

  return (
    <div className="app-container">
      <video autoPlay muted loop playsInline className="video-bg">
      <source src="/Video_play.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
      <header className="navbar">
        <div className="nav-brand">
          <Activity className="accent-text" size={32} />
          <h1>LUNG<span className="accent-text">SCAN</span> AI</h1>
        </div>
        <div className="nav-meta">UNIVERSITY OF ENGINEERING & MANAGEMENT, KOLKATA</div>
      </header>

      <main className="dashboard">
        <div className="main-section">
          <div className="glass-card upload-zone">
            {!preview ? (
              <label className="drop-box">
                <UploadCloud size={50} className="accent-text" />
                <h3>Upload Patient CT Scan</h3>
                <p>Drag and drop or <span>Browse Files</span></p>
                <input type="file" hidden onChange={onSelectFile} accept="image/*" />
              </label>
            ) : (
              <div className="image-preview-wrapper">
                <img src={preview} alt="Scan" className="preview-img" />
                {loading && <div className="center-scan-line"></div>}
              </div>
            )}
            
            {preview && !loading && !result && (
              <div className="button-group">
                <button className="predict-btn" onClick={handlePredict}>
                  <Zap size={18} fill="currentColor" /> RUN NEURAL ANALYSIS
                </button>
                <button className="text-btn" onClick={handleReset}>+ Add New Image</button>
              </div>
            )}

            {result && (
              <div className="result-display fade-in">
                <div className="result-info">
                  <small>Diagnostic Result</small>
                  <h2 className={result.is_cancer ? "text-red" : "text-green"}>{result.prediction}</h2>
                  <div className="meter"><div className="meter-fill" style={{width: '94%'}}></div></div>
                  <p>AI Confidence: {(result.confidence * 100).toFixed(1)}%</p>
                </div>
                <button className="pdf-btn" onClick={downloadPDF}><FileDown size={20} /> PDF REPORT</button>
                <button className="text-btn bottom-reset" onClick={handleReset}>+ Start New Scan</button>
              </div>
            )}
          </div>
        </div>

        <aside className="side-section">
          <div className="glass-card">
            <h3><History size={18} /> Recent History</h3>
            {history.map((log, i) => (
              <div key={i} className="history-row">
                <span>{log.prediction.split(' ')[1]}</span>
                <time>{log.timestamp}</time>
              </div>
            ))}
          </div>
          <div className="glass-card guide-card">
            <h3><GraduationCap size={18} /> Project Guides</h3>
            <p>Prof. Anay Ghosh</p>
            <p>Prof. Bapi Biswas</p>
          </div>
        </aside>
      </main>

      <footer className="viva-footer">
        <div className="footer-content">
          <div className="team-grid">
            <h4><Users size={16} /> PROJECT TEAM</h4>
            <p>Munni Mondal • Niloy Chowdhury • Parasar Chakraborty • Pragati Singh • Priyabrata Pramanik • Priyantan Mandal</p>
          </div>
          <div className="disclaimer-area">
            <ShieldAlert size={16} className="text-red" />
            <p><strong>Disclaimer:</strong> This software is a bonafide work submitted for the degree of Bachelor of Computer Science & Engineering. The results generated by this AI model are for research and educational purposes only.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
