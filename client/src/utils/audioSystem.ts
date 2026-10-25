import { useSettingsStore } from "../stores/settingsStore";

class AudioSystem {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public play(type: "open" | "notify" | "click" | "warning" | "close") {
    const soundEnabled = useSettingsStore.getState().soundEnabled;
    if (!soundEnabled) return;

    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      switch (type) {
        case "open": {
          osc.type = "sine";
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
          osc.start(now);
          osc.stop(now + 0.18);
          break;
        }
        case "close": {
          osc.type = "sine";
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.exponentialRampToValueAtTime(320, now + 0.1);
          gain.gain.setValueAtTime(0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
          osc.start(now);
          osc.stop(now + 0.12);
          break;
        }
        case "notify": {
          osc.type = "triangle";
          osc.frequency.setValueAtTime(587.33, now); // D5
          osc.frequency.setValueAtTime(880, now + 0.08); // A5
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
          osc.start(now);
          osc.stop(now + 0.28);
          break;
        }
        case "click": {
          osc.type = "sine";
          osc.frequency.setValueAtTime(800, now);
          gain.gain.setValueAtTime(0.03, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
          osc.start(now);
          osc.stop(now + 0.04);
          break;
        }
        case "warning": {
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.setValueAtTime(240, now + 0.08);
          gain.gain.setValueAtTime(0.07, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
          osc.start(now);
          osc.stop(now + 0.22);
          break;
        }
      }
    } catch {
      // AudioContext policy gracefully caught
    }
  }
}

export const sound = new AudioSystem();
