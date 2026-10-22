export const playSound = (type: 'correct' | 'wrong' | 'complete') => {
  if (typeof window === 'undefined') return;

  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  if (type === 'correct') {
    // A nice cheerful "ding"
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.1); // C6
    
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
  } 
  
  else if (type === 'wrong') {
    // A dull "buzzer" sound
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  }
  
  else if (type === 'complete') {
    // Arpeggio for level complete
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C
    freqs.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.value = freq;
      
      const startTime = audioCtx.currentTime + (idx * 0.1);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  }
};
