class EmergencyService {
  private sirenAudio: HTMLAudioElement | null = null;
  private isEmergencyActive = false;

  constructor() {
    // Create siren sound using Web Audio API
    this.initializeSiren();
  }

  private initializeSiren() {
    // Create a simple siren sound using oscillator
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create siren audio buffer
      const createSirenBuffer = () => {
        const sampleRate = audioContext.sampleRate;
        const duration = 2; // 2 seconds
        const length = sampleRate * duration;
        const buffer = audioContext.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
          const frequency = 800 + Math.sin((i / length) * 4 * Math.PI) * 400; // Siren effect
          data[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3;
        }

        return buffer;
      };

      // Store for later use
      this.sirenAudio = new Audio();
      this.sirenAudio.loop = true;
    } catch (error) {
      console.warn("Could not initialize siren audio:", error);
    }
  }

  triggerEmergency() {
    if (this.isEmergencyActive) return;
    
    this.isEmergencyActive = true;
    console.log("🚨 Emergency sequence activated");

    // Play siren sound
    this.playSiren();

    // Try to activate flashlight (limited browser support)
    this.activateFlashlight();

    // Add visual feedback
    document.body.classList.add('shake-animation');
    setTimeout(() => {
      document.body.classList.remove('shake-animation');
    }, 500);
  }

  cancelEmergency() {
    this.isEmergencyActive = false;
    console.log("❌ Emergency sequence cancelled");

    // Stop siren
    this.stopSiren();

    // Deactivate flashlight
    this.deactivateFlashlight();
  }

  private playSiren() {
    try {
      // Create a simple beeping sound as fallback
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const playBeep = () => {
        if (!this.isEmergencyActive) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.5);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 1);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 1);
        
        // Repeat every 1.5 seconds
        setTimeout(playBeep, 1500);
      };

      playBeep();
      console.log("🔊 Siren activated");
    } catch (error) {
      console.warn("Could not play siren:", error);
    }
  }

  private stopSiren() {
    // The siren will stop automatically when isEmergencyActive is false
    console.log("🔇 Siren deactivated");
  }

  private async activateFlashlight() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      
      if (capabilities.torch) {
        await track.applyConstraints({
          advanced: [{ torch: true } as any]
        });
        console.log("🔦 Flashlight activated");
      }
    } catch (error) {
      console.warn("Could not activate flashlight:", error);
    }
  }

  private async deactivateFlashlight() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      const track = stream.getVideoTracks()[0];
      await track.applyConstraints({
        advanced: [{ torch: false } as any]
      });
      
      // Stop the stream
      stream.getTracks().forEach(track => track.stop());
      console.log("🔦 Flashlight deactivated");
    } catch (error) {
      console.warn("Could not deactivate flashlight:", error);
    }
  }

  isActive() {
    return this.isEmergencyActive;
  }
}

export const emergencyService = new EmergencyService();
