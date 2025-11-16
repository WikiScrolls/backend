// AudioPlayerComponent.tsx - React component example
import React, { useState, useEffect, useRef } from 'react';
import { AudioPlayer, formatTime } from '../utils/audioPlayer';

interface AudioPlayerProps {
  audioUrl: string;
  title?: string;
  autoPlay?: boolean;
}

export const AudioPlayerComponent: React.FC<AudioPlayerProps> = ({
  audioUrl,
  title,
  autoPlay = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const playerRef = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    // Initialize player
    const player = new AudioPlayer();
    playerRef.current = player;

    player.load(audioUrl);

    // Set up callbacks
    player.onProgress((prog) => {
      setProgress(prog);
      setCurrentTime(player.getCurrentTime());
      setDuration(player.getDuration());
    });

    player.onEnded(() => {
      setIsPlaying(false);
      setProgress(0);
    });

    player.onError((error) => {
      console.error('Audio playback error:', error);
      setIsPlaying(false);
    });

    // Auto play if enabled
    if (autoPlay) {
      player.play().catch(console.error);
      setIsPlaying(true);
    }

    // Cleanup on unmount
    return () => {
      player.destroy();
    };
  }, [audioUrl, autoPlay]);

  const togglePlayPause = async () => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await playerRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Failed to play:', error);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!playerRef.current) return;
    const newProgress = parseFloat(e.target.value);
    const newTime = (newProgress / 100) * duration;
    playerRef.current.seek(newTime);
    setProgress(newProgress);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!playerRef.current) return;
    const newVolume = parseFloat(e.target.value);
    playerRef.current.setVolume(newVolume);
    setVolume(newVolume);
  };

  const skipForward = () => {
    if (!playerRef.current) return;
    const newTime = Math.min(currentTime + 10, duration);
    playerRef.current.seek(newTime);
  };

  const skipBackward = () => {
    if (!playerRef.current) return;
    const newTime = Math.max(currentTime - 10, 0);
    playerRef.current.seek(newTime);
  };

  return (
    <div className="audio-player">
      {title && <h3>{title}</h3>}
      
      <div className="controls">
        <button onClick={skipBackward} title="Skip back 10s">
          ⏪
        </button>
        
        <button onClick={togglePlayPause} className="play-pause">
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        
        <button onClick={skipForward} title="Skip forward 10s">
          ⏩
        </button>
      </div>

      <div className="progress-container">
        <span className="time">{formatTime(currentTime)}</span>
        
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSeek}
          className="progress-bar"
        />
        
        <span className="time">{formatTime(duration)}</span>
      </div>

      <div className="volume-container">
        <span>🔊</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="volume-slider"
        />
      </div>
    </div>
  );
};

// CSS styles (add to your stylesheet)
/*
.audio-player {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 20px;
  max-width: 500px;
  margin: 0 auto;
}

.audio-player h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
  color: #333;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.controls button {
  background: #007bff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 20px;
  cursor: pointer;
  transition: background 0.3s;
}

.controls button:hover {
  background: #0056b3;
}

.controls .play-pause {
  width: 60px;
  height: 60px;
  font-size: 24px;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.time {
  font-size: 14px;
  color: #666;
  min-width: 45px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  border-radius: 4px;
  cursor: pointer;
}

.volume-container {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
}

.volume-slider {
  width: 100px;
  cursor: pointer;
}
*/

// Usage example:
/*
import { AudioPlayerComponent } from './AudioPlayerComponent';

function ArticlePage({ article }) {
  return (
    <div>
      <h1>{article.title}</h1>
      {article.audioUrl && (
        <AudioPlayerComponent
          audioUrl={article.audioUrl}
          title="Article Audio"
          autoPlay={false}
        />
      )}
    </div>
  );
}
*/
