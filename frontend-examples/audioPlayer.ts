/**
 * Audio Player Utility
 * Frontend helper functions for playing audio from Cloudinary
 */

/**
 * Audio player class for managing audio playback
 */
export class AudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private currentUrl: string = '';
  private onProgressCallback?: (progress: number) => void;
  private onEndedCallback?: () => void;
  private onErrorCallback?: (error: Error) => void;

  /**
   * Load and prepare an audio file
   * @param url - The audio URL from Cloudinary
   */
  load(url: string): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
    }

    this.audio = new Audio(url);
    this.currentUrl = url;

    // Set up event listeners
    this.audio.addEventListener('timeupdate', this.handleTimeUpdate);
    this.audio.addEventListener('ended', this.handleEnded);
    this.audio.addEventListener('error', this.handleError);
  }

  /**
   * Play the loaded audio
   */
  async play(): Promise<void> {
    if (!this.audio) {
      throw new Error('No audio loaded. Call load() first.');
    }

    try {
      await this.audio.play();
    } catch (error) {
      throw new Error(`Failed to play audio: ${error}`);
    }
  }

  /**
   * Pause the audio
   */
  pause(): void {
    if (this.audio) {
      this.audio.pause();
    }
  }

  /**
   * Stop the audio and reset to beginning
   */
  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
  }

  /**
   * Seek to a specific time
   * @param seconds - Time in seconds
   */
  seek(seconds: number): void {
    if (this.audio) {
      this.audio.currentTime = seconds;
    }
  }

  /**
   * Set playback volume
   * @param volume - Volume level (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Get current playback time
   */
  getCurrentTime(): number {
    return this.audio?.currentTime || 0;
  }

  /**
   * Get total duration
   */
  getDuration(): number {
    return this.audio?.duration || 0;
  }

  /**
   * Check if audio is playing
   */
  isPlaying(): boolean {
    return this.audio ? !this.audio.paused : false;
  }

  /**
   * Get current progress as percentage
   */
  getProgress(): number {
    if (!this.audio || !this.audio.duration) return 0;
    return (this.audio.currentTime / this.audio.duration) * 100;
  }

  /**
   * Register a callback for progress updates
   */
  onProgress(callback: (progress: number) => void): void {
    this.onProgressCallback = callback;
  }

  /**
   * Register a callback for when audio ends
   */
  onEnded(callback: () => void): void {
    this.onEndedCallback = callback;
  }

  /**
   * Register a callback for errors
   */
  onError(callback: (error: Error) => void): void {
    this.onErrorCallback = callback;
  }

  /**
   * Clean up and release resources
   */
  destroy(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.removeEventListener('timeupdate', this.handleTimeUpdate);
      this.audio.removeEventListener('ended', this.handleEnded);
      this.audio.removeEventListener('error', this.handleError);
      this.audio.src = '';
      this.audio = null;
    }
  }

  private handleTimeUpdate = (): void => {
    if (this.onProgressCallback) {
      this.onProgressCallback(this.getProgress());
    }
  };

  private handleEnded = (): void => {
    if (this.onEndedCallback) {
      this.onEndedCallback();
    }
  };

  private handleError = (event: Event): void => {
    if (this.onErrorCallback) {
      const error = new Error('Audio playback error');
      this.onErrorCallback(error);
    }
  };
}

/**
 * Format seconds to MM:SS format
 * @param seconds - Time in seconds
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Preload audio for faster playback
 * @param url - The audio URL
 */
export function preloadAudio(url: string): HTMLAudioElement {
  const audio = new Audio();
  audio.preload = 'auto';
  audio.src = url;
  return audio;
}

/**
 * Check if browser supports audio format
 * @param mimeType - MIME type to check (e.g., 'audio/mpeg')
 */
export function canPlayAudioType(mimeType: string): boolean {
  const audio = document.createElement('audio');
  return audio.canPlayType(mimeType) !== '';
}

// Example usage:
/*
const player = new AudioPlayer();

// Load audio
player.load('https://res.cloudinary.com/.../audio.mp3');

// Set up callbacks
player.onProgress((progress) => {
  console.log(`Progress: ${progress}%`);
  updateProgressBar(progress);
});

player.onEnded(() => {
  console.log('Audio finished');
});

// Play/pause controls
await player.play();
player.pause();
player.seek(30); // Jump to 30 seconds

// Get info
const currentTime = player.getCurrentTime();
const duration = player.getDuration();
const formatted = formatTime(currentTime);

// Clean up when done
player.destroy();
*/
