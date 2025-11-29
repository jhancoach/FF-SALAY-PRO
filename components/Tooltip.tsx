import React from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
}

const Tooltip: React.FC<TooltipProps> = ({ content }) => {
  return (
    <div className="group relative inline-block ml-2 align-middle z-50">
      <HelpCircle className="w-5 h-5 text-cyan-400 hover:text-cyan-200 cursor-help transition-colors" />
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900/95 border border-cyan-500/30 text-xs text-cyan-100 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] pointer-events-none z-50 backdrop-blur-md">
        {content}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-slate-900/95"></div>
      </div>
    </div>
  );
};

export default Tooltip;