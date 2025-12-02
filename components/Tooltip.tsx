import React, { useState } from 'react';
import { CircleHelp } from 'lucide-react';

interface TooltipProps {
  content: string;
}

const Tooltip: React.FC<TooltipProps> = ({ content }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="group relative inline-block ml-2 align-middle z-50"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={(e) => {
        // Toggle for mobile tap
        e.preventDefault();
        e.stopPropagation();
        setIsVisible(!isVisible);
      }}
    >
      <CircleHelp className={`w-5 h-5 transition-colors cursor-help ${isVisible ? 'text-cyan-200' : 'text-cyan-400 hover:text-cyan-200'}`} />
      
      <div 
        className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 md:w-64 p-3 bg-slate-900/95 border border-cyan-500/30 text-xs text-cyan-100 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)] backdrop-blur-md transition-all duration-300 z-50 pointer-events-none ${isVisible ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}`}
      >
        {content}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-slate-900/95"></div>
      </div>
    </div>
  );
};

export default Tooltip;