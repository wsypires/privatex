import React from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

interface AndroidFrameProps {
  isMobileFrame: boolean;
  children: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({ isMobileFrame, children }) => {
  if (!isMobileFrame) {
    return <div className="w-full h-full flex flex-col">{children}</div>;
  }

  return (
    <div className="w-full min-h-screen bg-[#0B0E11] flex items-center justify-center p-2 sm:p-6 overflow-x-hidden">
      {/* Android Device Outer Bezel */}
      <div className="w-full max-w-[430px] h-[92vh] max-h-[920px] bg-[#14161A] rounded-[44px] p-3 border-4 border-[#2B2F36] shadow-2xl relative flex flex-col overflow-hidden ring-1 ring-white/10">
        {/* Android Speaker Notch & Camera Pin */}
        <div className="absolute top-4 inset-x-0 mx-auto w-24 h-4 bg-black rounded-full flex items-center justify-center z-30 pointer-events-none">
          <div className="w-2.5 h-2.5 rounded-full bg-[#181A20] border border-white/20 mr-2" />
        </div>

        {/* Android Status Bar */}
        <div className="w-full h-7 bg-[#181A20] flex items-center justify-between px-6 text-[11px] font-mono text-[#848E9C] select-none z-20 flex-shrink-0">
          <span className="font-bold text-[#EAECEF]">19:42</span>
          <div className="flex items-center gap-2">
            <Signal className="w-3 h-3 text-[#EAECEF]" />
            <Wifi className="w-3 h-3 text-[#EAECEF]" />
            <BatteryMedium className="w-3.5 h-3.5 text-[#0ECB81]" />
          </div>
        </div>

        {/* Main App Canvas */}
        <div className="flex-1 w-full bg-[#0B0E11] rounded-b-[36px] overflow-hidden flex flex-col relative">
          {children}
        </div>

        {/* Android Gesture Bar */}
        <div className="w-full h-4 bg-[#181A20] flex items-center justify-center flex-shrink-0 select-none">
          <div className="w-32 h-1 bg-[#474D57] rounded-full" />
        </div>
      </div>
    </div>
  );
};
