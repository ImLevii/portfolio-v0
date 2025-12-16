"use client"

// Singleton AudioContext to allow user interaction handling
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext;
}

// Function to unlock audio context on mobile/iOS
export const unlockAudioContext = () => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
        ctx.resume();
    }

    // Play a silent buffer to force unlock
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
}

export const playMessageSound = () => {
    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // "Pop" sound
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        // Pitch drop for "bubble" effect
        osc.frequency.setValueAtTime(1000, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

        // Volume envelope
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
        console.error("Audio playback failed", e);
    }
}

export const playAnnouncementSound = () => {
    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();

        // "Tri-tone" or "Chime" effect (Phone notification style)
        const now = ctx.currentTime;

        // Tone 1
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.frequency.setValueAtTime(440, now); // A4
        gain1.gain.setValueAtTime(0.1, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc1.start(now);
        osc1.stop(now + 0.5);

        // Tone 2 (delayed)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.setValueAtTime(554.37, now + 0.1); // C#5
        gain2.gain.setValueAtTime(0.1, now + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc2.start(now + 0.1);
        osc2.stop(now + 0.6);

        // Tone 3 (delayed more)
        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.connect(gain3);
        gain3.connect(ctx.destination);
        osc3.frequency.setValueAtTime(659.25, now + 0.2); // E5
        gain3.gain.setValueAtTime(0.1, now + 0.2);
        gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc3.start(now + 0.2);
        osc3.stop(now + 0.8);

    } catch (e) {
        console.error("Audio playback failed", e);
    }
}

export const playErrorSound = () => {
    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.2);

        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
    } catch (e) {
        console.error("Audio playback failed", e);
    }
}

export const playSendSound = () => {
    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        // "Swoosh" / Ascending pitch
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
        // ignore
    }
}

export const playTypingSound = () => {
    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();

        // Very short click/noise
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        // Noise buffer or just a short high pitch tick?
        // Let's use a short sine tick
        osc.frequency.setValueAtTime(800, ctx.currentTime);

        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.03);
    } catch (e) {
        // ignore
    }
}
