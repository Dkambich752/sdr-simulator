import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function App() {
  const [signals, setSignals] = useState([]);
  const canvasRef = useRef(null);

  useEffect(() => {
    const fetchSignals = () => {
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
    const padding = 60; 
    const plotWidth = canvas.width - (padding * 2);
    const plotHeight = canvas.height - (padding * 2);
    const noiseFloor = -98; // The absolute bottom of our graph

    // 1. CLEAN WHITE BACKGROUND
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Grid Setup
    ctx.strokeStyle = '#EAEAEA';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#666';
    ctx.font = '11px Courier New';

    for (let i = 0; i <= 10; i++) {
      const y = padding + (i * plotHeight / 10);
      const x = padding + (i * plotWidth / 10);
      ctx.beginPath(); ctx.moveTo(padding, y); ctx.lineTo(canvas.width - padding, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, padding); ctx.lineTo(x, canvas.height - padding); ctx.stroke();
      
      // Labels for dB and MHz
      ctx.fillText(`${-(i * 10)}dB`, 10, y + 4);
      ctx.fillText(`${2400 + (i * 10)}M`, x - 15, canvas.height - 25);
    }

    // 2. GENERATE HIGH-RES DATA (850 bins)
    let trace = new Array(850).fill(noiseFloor); 
    // Add real-time noise jitter at the bottom
    trace = trace.map(v => v + (Math.random() * 2)); 

    // 3. APPLY ACCURATE GAUSSIAN CURVES
    data.forEach(s => {
      const xPos = padding + ((s.frequency - 2400) * (plotWidth / 100));
      const centerIdx = Math.floor(xPos);
      
      // ACCURACY FIX: Calculate how much the signal "rises" above the floor
      // e.g. -80dBm rise is (-80 - (-98)) = 18dBm rise.
      const signalRise = s.power - noiseFloor;

      // BANDWIDTH FIX: Narrower peaks (1.5 for threats, 1.0 for friendlies)
      const spread = (s.type === 'ADVERSARY' || s.type === 'JAMMER') ? 1.5 : 1.0;

      // Draw the curve for this signal
      for (let i = -15; i <= 15; i++) {
        const idx = centerIdx + i;
        if (idx >= padding && idx < (canvas.width - padding)) {
          // Formula: NoiseFloor + (RiseAmount * BellCurve)
          const bellValue = noiseFloor + (signalRise * Math.exp(-(i * i) / (spread * 2.5)));
          if (bellValue > trace[idx]) trace[idx] = bellValue;
        }
      }
    });

    // 4. DRAW SOLID FILLED TRACE (THE "BLUE MOUNTAIN")
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding); 

    trace.forEach((dbm, x) => {
      if (x < padding || x > (canvas.width - padding)) return;
      // Map dBm to Y pixels (Absolute value math)
      const y = padding + (Math.abs(dbm) * (plotHeight / 100));
      ctx.lineTo(x, y);
    });

    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.closePath();

    // Fill with Gradient
    const gradient = ctx.createLinearGradient(0, padding, 0, canvas.height - padding);
    gradient.addColorStop(0, '#0055AA'); // Dark Blue Top
    gradient.addColorStop(1, '#F0F7FF'); // Light Blue Bottom
    ctx.fillStyle = gradient;
    ctx.fill();

    // Dark Blue Outline
    ctx.strokeStyle = '#003366';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 5. IDENTIFICATION LABELS (Accurate Positioning)
    data.forEach(s => {
      if (s.type === 'ADVERSARY' || s.type === 'JAMMER') {
        const x = padding + ((s.frequency - 2400) * (plotWidth / 100));
        const y = padding + (Math.abs(s.power) * (plotHeight / 100));
        
        ctx.fillStyle = s.type === 'ADVERSARY' ? 'red' : '#CC9900';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(s.type, x - 25, y - 15);
        
        // Marker Line
        ctx.strokeStyle = s.type === 'ADVERSARY' ? 'red' : '#CC9900';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 10); ctx.stroke();
      }
    });
  };

  return (
    <div style={{ backgroundColor: '#F0F2F5', minHeight: '100vh', padding: '40px', fontFamily: 'Arial' }}>
      <h1 style={{ textAlign: 'center', color: '#003366', marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '2px' }}>
        Software Defined Radio Threat Detection Signal Jammer
      </h1>
      
      <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', alignItems: 'flex-start' }}>
        {/* Main Spectrum Plot */}
        <canvas ref={canvasRef} width="850" height="500" style={{ backgroundColor: '#FFF', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
        
        {/* Metric Sidebar */}
        <div style={{ width: '320px', padding: '20px', backgroundColor: '#FFF', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
          <h3 style={{ borderBottom: '2px solid #003366', color: '#003366', paddingBottom: '10px' }}>SIGNAL METRICS</h3>
          {signals.map((s, i) => (
            <div key={i} style={{ 
              color: s.type === 'ADVERSARY' ? 'red' : (s.type === 'JAMMER' ? '#CC9900' : '#0055AA'), 
              padding: '10px 0', borderBottom: '1px solid #EEE', fontSize: '14px' 
            }}>
              <strong>{s.type}</strong><br />
              {s.frequency.toFixed(2)} MHz | {s.power.toFixed(1)} dBm
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
