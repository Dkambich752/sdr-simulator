import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [signals, setSignals] = useState([]);

  useEffect(() => {
    const fetchSignals = () => {
      // Pointing to your AWS Elastic IP backend
      axios.get('http://3.130.74.7') 
        .then(res => setSignals(res.data))
        .catch(err => console.error("Signal Lost:", err));
    };
    const interval = setInterval(fetchSignals, 1000); // Update every 1 second
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ backgroundColor: '#0a0a0a', color: '#00ff41', minHeight: '100vh', padding: '20px', fontFamily: 'Courier New' }}>
      <h1>🛰️ SDR MISSION MONITOR</h1>
      <hr style={{ borderColor: '#00ff41' }} />
      <div style={{ padding: '10px', border: '1px solid #00ff41', borderRadius: '5px' }}>
        <h3>LIVE SPECTRUM DATA</h3>
        {signals.length === 0 && <p>Searching for signals...</p>}
        {signals.map((s, i) => (
          <div key={i} style={{ 
            marginBottom: '10px', 
            fontSize: '1.2rem',
            color: s.type === 'ADVERSARY' ? '#ff0000' : (s.type === 'JAMMER' ? '#ffff00' : '#00ff41') 
          }}>
            <strong>[{s.type}]</strong> Freq: {s.frequency.toFixed(1)} MHz | Power: {s.power.toFixed(1)} dBm
            {s.type === 'ADVERSARY' && " <--- ALERT: THREAT DETECTED"}
            {s.type === 'JAMMER' && " <--- ACTIVE COUNTERMEASURE"}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
