import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function App() {
  const [signals, setSignals] = useState([]);
  const [logs, setLogs] = useState(["[SYSTEM] Booting SDR Mission Monitor...", "[SYSTEM] Uplink established with AWS-EC2-SIM-01"]);
  const canvasRef = useRef(null);

  useEffect(() => {
    const fetchSignals = () => {
        axios.get('http://3.130.74.7/api/spectrum')
        .then(res => {
          setSignals(res.data);
          drawWaterfall(res.data);
          
          // Add to log if Adversary is found
          if (res.data.some(s => s.type === 'ADVERSARY')) {
            const timestamp = new Date().toLocaleTimeString();
            setLogs(prev => [`[${timestamp}] ALERT: High-Power Adversary at 2442MHz`, `[${timestamp}] ACTION: Auto-Jammer Locked & Engaged`, ...prev.slice(0, 5)]);
          }
        })
        .catch(err => console.error("Signal Lost:", err));
    };
    const interval = setInterval(fetchSignals, 1000);
    return () => clearInterval(interval);
  }, []);

  const drawWaterfall = (data) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height - 10);
    ctx.putImageData(imageData, 0, 10);
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, 10);

    ctx.shadowBlur = 15;
    data.forEach(s => {
      const x = (s.frequency - 2400) * 7.5; 
      if (s.type === 'ADVERSARY') {
        ctx.shadowColor = 'red'; ctx.fillStyle = 'red';
        ctx.fillRect(x - 4, 0, 8, 8);
      } else if (s.type === 'JAMMER') {
        ctx.shadowColor = 'yellow'; ctx.fillStyle = 'yellow';
        ctx.fillRect(x + 4, 0, 8, 8);
      } else {
        ctx.shadowColor = '#00ff41'; ctx.fillStyle = '#00ff41';
        ctx.fillRect(x, 2, 5, 5);
      }
    });
    ctx.shadowBlur = 0;
  };

  return (
    <div style={{ backgroundColor: '#050505', color: '#00ff41', minHeight: '100vh', padding: '20px', fontFamily: 'Courier New' }}>
      <h1 style={{ textAlign: 'center', letterSpacing: '5px', textShadow: '0 0 10px #00ff41' }}>🛰️ SDR MISSION MONITOR v2.0</h1>
      
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
        <canvas ref={canvasRef} width="800" height="400" style={{ border: '2px solid #333', boxShadow: '0 0 20px #222' }} />
        
        <div style={{ width: '350px', padding: '15px', border: '1px solid #00ff41', backgroundColor: '#0a0a0a' }}>
          <h3 style={{ borderBottom: '1px solid #00ff41', paddingBottom: '5px' }}>TARGET METADATA</h3>
          {signals.map((s, i) => (
            <div key={i} style={{ color: s.type === 'ADVERSARY' ? 'red' : (s.type === 'JAMMER' ? 'yellow' : '#00ff41'), fontSize: '14px', marginBottom: '8px' }}>
              <strong>[{s.type}]</strong> {s.frequency.toFixed(2)}MHz | {s.power.toFixed(1)}dBm
            </div>
          ))}
        </div>
      </div>

      {/* NEW MISSION LOG BOX */}
      <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #444', backgroundColor: '#111', height: '150px', overflow: 'hidden' }}>
        <h4 style={{ color: '#aaa', marginTop: 0 }}>MISSION LOG EXPORT</h4>
        {logs.map((log, i) => (
          <div key={i} style={{ fontSize: '13px', color: log.includes('ALERT') ? '#ff4d4d' : '#888', marginBottom: '4px' }}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
