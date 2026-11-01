import React, { useEffect, useState } from 'react';

export const LandscapeNotice: React.FC = () => {
  const [isPortrait, setIsPortrait] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    const checkOrientation = () => {
      const portrait = window.innerHeight > window.innerWidth;
      setIsPortrait(portrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isPortrait || dismissed) return null;

  return (
    <div className="fixed top-2 left-2 right-2 z-50 bg-amber-500 text-slate-950 px-4 py-2.5 rounded-2xl shadow-xl border-2 border-amber-300 flex items-center justify-between gap-3 animate-bounce">
      <div className="flex items-center gap-2 font-black text-xs sm:text-sm">
        <span className="text-xl">🔄</span>
        <span>YATAY OYNANIŞ: En iyi mobil deneyim için cihazınızı yatay çevirin!</span>
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="bg-slate-950 text-white font-bold text-xs px-2.5 py-1 rounded-xl cursor-pointer shrink-0"
      >
        ANLADIM ✕
      </button>
    </div>
  );
};
