
import React, { useState } from 'react';

export const CalculatorDisguise: React.FC<{ onUnlock: () => void }> = ({ onUnlock }) => {
  const [display, setDisplay] = useState('0');

  const handleClick = (val: string) => {
    if (val === 'C') setDisplay('0');
    else if (display === '0') setDisplay(val);
    else setDisplay(prev => prev + val);

    // Hidden unlock code
    if (display + val === '7701') {
      onUnlock();
    }
  };

  return (
    <div className="fixed inset-0 bg-[#121212] flex items-center justify-center z-[2000] text-white font-sans">
      <div className="w-72 bg-black p-4 rounded-xl border border-gray-800 shadow-2xl">
        <div className="bg-[#1c1c1c] p-4 text-right text-3xl mb-4 h-16 rounded overflow-hidden">
          {display}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', 'C', '0', '=', '+'].map(btn => (
            <button
              key={btn}
              onClick={() => handleClick(btn)}
              className="bg-[#2c2c2c] hover:bg-[#3c3c3c] py-4 rounded text-xl font-medium active:scale-95 transition-all"
            >
              {btn}
            </button>
          ))}
        </div>
        <div className="mt-4 text-[10px] text-gray-700 text-center uppercase tracking-widest">
          Calc v4.2.1 Standard
        </div>
      </div>
    </div>
  );
};
