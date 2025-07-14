import { useState, useEffect } from "react";

interface SOSButtonProps {
  onTrigger: () => void;
  isActive: boolean;
}

export default function SOSButton({ onTrigger, isActive }: SOSButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [holdTimeout, setHoldTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleMouseDown = () => {
    setIsPressed(true);
    const timeout = setTimeout(() => {
      onTrigger();
    }, 3000); // 3 second hold
    setHoldTimeout(timeout);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
    if (holdTimeout) {
      clearTimeout(holdTimeout);
      setHoldTimeout(null);
    }
  };

  const handleClick = () => {
    // Immediate trigger on click
    onTrigger();
  };

  useEffect(() => {
    return () => {
      if (holdTimeout) {
        clearTimeout(holdTimeout);
      }
    };
  }, [holdTimeout]);

  return (
    <div className="relative flex items-center justify-center">
      {/* Pulse ring animation */}
      <div className="absolute inset-0 rounded-full bg-emergency opacity-20 pulse-ring"></div>
      
      {/* Main SOS Button */}
      <button
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        className={`
          relative w-32 h-32 bg-emergency hover:bg-red-700 text-white 
          rounded-full flex items-center justify-center text-3xl font-bold 
          shadow-lg transition-all duration-200 active:scale-95 
          focus:outline-none focus:ring-4 focus:ring-red-200
          ${isActive ? 'sos-glow animate-pulse' : ''}
          ${isPressed ? 'scale-95' : ''}
        `}
        disabled={isActive}
      >
        <i className="fas fa-exclamation text-4xl"></i>
      </button>
    </div>
  );
}
