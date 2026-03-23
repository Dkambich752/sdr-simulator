import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function App() {
  const [signals, setSignals] = useState([]);
  const canvasRef = useRef(null);

  useEffect(() => {
    const fetchSignals = () => {
      // POINTING TO YOUR AWS BACKEND
      axios.get('http://3.130.74.7/api/spectrum')
        .then(res => {
          setSignals(res.data);
          drawSpectrum(res.data);
        })
        .catch(err => console.error("Uplink Lost:", err));
    };
    const interval = setInterval(fetchSignals, 500);
    return () => clearInterval(interval);
  }, []);

  const drawSpectrum = (data) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // 1. BACKGROUND & GRID (Deep Navy/Black)
    ctx.fillStyle = '#010816';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Subtle Grid Lines
    ctx.strokeStyle = '#0a1d3a';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
        let x = (canvas.width / 10) * i;
        let y = (canvas.height / 10) * i;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // 2. CREATE HIGH-RES TRACE (800 bins)
    let trace = new Array(800).fill(-95); 
    trace = trace.map(v => v + (Math.random() * 3)); // Add "Vibration" noise floor

    // 3. MAP REAL SIGNALS TO GAUSSIAN PEAKS
    data.forEach(s => {
      const centerIdx = Math.floor((s.frequency - 2400) * 8);
      for (let i = -20; i <= 20; i++) {
        const idx = centerIdx + i;
        if (idx >= 0 && idx < 800) {
          // Gaussian Bell Curve for smooth peaks
          const curve = s.power * Math.exp(-(i * i) / 45); 
          if (curve > trace[idx]) trace[idx] = curve;
        }
      }
    });

    // 4. DRAW THE BLUE TRACE LINE
    ctx.beginPath();
    ctx.strokeStyle = '#00d4ff'; // ELECTRIC BLUE
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#00d4ff';
    
    trace.forEach((dbm, x) => {
      // Map dBm to Y-axis coordinates
      const y = canvas.height - (Math.abs(dbm + 100) * (canvas.height / 100));
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // 5. DRAW PEAK MARKERS (Red for Threat, Yellow for Jammer)
    ctx.shadowBlur = 0;
    data.forEach(s => {
      if (s.type === 'ADVERSARY' || s.type === 'JAMMER') {
        const x = (s.frequency - 2400) * 8;
        const y = canvas.height - (Math.abs(s.power + 100) * (canvas.height / 100));
        
        ctx.fillStyle = s.type === 'ADVERSARY' ? '#ff3333' : '#ffff00';
        ctx.font = 'bold 11px Courier New';
        ctx.fillText(`${s.type}: ${s.frequency.toFixed(1)}MHz`, x + 10, y - 10);
        
        // Circular Marker Dot
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  };

  return (
    <div style={{ backgroundColor: '#020202', color: '#00d4ff', minHeight: '100vh', padding: '20px', fontFamily: 'Courier New' }}>
      <h1 style={{ textShadow: '0 0 15px #00d4ff', letterSpacing: '2px' }}>🛰️ STRATEGIC SPECTRUM ANALYZER v2.5 [BLUE]</h1>
      <div style={{ display: 'flex', gap: '20px' }}>
        <canvas ref={canvasRef} width="800" height="450" style={{ border: '2px solid #0a1d3a', borderRadius: '4px' }} />
        <div style={{ flex: 1, padding: '15px', border: '1px solid #0a1d3a', backgroundColor: '#010816', borderRadius: '4px' }}>
          <h3 style={{ color: '#00d4ff', borderBottom: '1px solid #0a1d3a' }}>MISSION TELEMETRY</h3>
          {signals.map((s, i) => (
            <div key={i} style={{ 
              color: s.type === 'ADVERSARY' ? '#ff3333' : (s.type === 'JAMMER' ? '#ffff00' : '#00d4ff'), 
              fontSize: '13px', marginBottom: '6px' 
            }}>
              [{s.type}] {s.frequency.toFixed(2)} MHz | {s.power.toFixed(1)} dBm
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
