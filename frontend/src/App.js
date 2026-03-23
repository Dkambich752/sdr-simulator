import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function App() {
  const [signals, setSignals] = useState([]);
  const canvasRef = useRef(null);

  useEffect(() => {
    const fetchSignals = () => {
      axios.get('http://3.130.74.7')
        .then(res => {
          setSignals(res.data);
          drawWaterfall(res.data);
        })
        .catch(err => console.error("Signal Lost:", err));
    };

    const interval = setInterval(fetchSignals, 1000);
    return () => clearInterval(interval);
  }, []);

  const drawWaterfall = (data) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // 1. Shift the existing image down by 10 pixels
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height - 10);
    ctx.putImageData(imageData, 0, 10);

    // 2. Clear the very top row for new data
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, 10);

    // 3. Draw new signals as dots at the top
    data.forEach(s => {
      // Map frequency (2400-2480) to canvas width (0-800)
      const x = (s.frequency - 2400) * 20; 
      ctx.fillStyle = s.type === 'ADVERSARY' ? '#ff0000' : (s.type === 'JAMMER' ? '#ffff00' : '#00ff41');
      ctx.fillRect(x, 0, 8, 8); // Draw the "pulse"
    });
  };

  return (
    <div style={{ backgroundColor: '#050505', color: '#00ff41', minHeight: '100vh', padding: '20px', fontFamily: 'Courier New' }}>
      <h1>🛰️ SDR MISSION MONITOR v1.0</h1>
      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Visual Waterfall */}
        <canvas ref={canvasRef} width="800" height="500" style={{ border: '2px solid #333', backgroundColor: '#000' }} />
        
        {/* Status List */}
        <div style={{ flex: 1, padding: '10px', border: '1px solid #333', overflowY: 'auto' }}>
          <h3>SYSTEM STATUS: ACTIVE</h3>
          {signals.map((s, i) => (
            <div key={i} style={{ color: s.type === 'ADVERSARY' ? 'red' : (s.type === 'JAMMER' ? 'yellow' : 'white'), fontSize: '14px' }}>
              [{s.type}] {s.frequency}MHz | {s.power}dBm
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
