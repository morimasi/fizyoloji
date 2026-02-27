import React, { useState, useEffect } from 'react';

interface SimpleSpritePlayerProps {
  src: string;
  layout?: string;
  fps?: number;
  className?: string;
}

export const SimpleSpritePlayer: React.FC<SimpleSpritePlayerProps> = ({ 
  src, 
  layout = 'grid-6x4', 
  fps = 24,
  className = ''
}) => {
  const [frame, setFrame] = useState(0);
  
  let cols = 6;
  let rows = 4;
  if (layout === 'grid-5x5') { cols = 5; rows = 5; }
  else if (layout === 'grid-4x4') { cols = 4; rows = 4; }
  else if (layout === 'grid-6x4') { cols = 6; rows = 4; }
  
  const totalFrames = cols * rows;

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(prev => (prev + 1) % totalFrames);
    }, 1000 / fps);
    return () => clearInterval(interval);
  }, [totalFrames, fps]);

  const col = frame % cols;
  const row = Math.floor(frame / cols);

  const bgPosX = (col / (cols - 1)) * 100 || 0;
  const bgPosY = (row / (rows - 1)) * 100 || 0;

  return (
    <div 
      className={`w-full h-full ${className}`}
      style={{
        backgroundImage: `url(${src})`,
        backgroundSize: `${cols * 100}% ${rows * 100}%`,
        backgroundPosition: `${bgPosX}% ${bgPosY}%`,
        backgroundRepeat: 'no-repeat'
      }}
    />
  );
};
