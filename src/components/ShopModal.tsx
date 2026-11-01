import React, { useState } from 'react';
import { ShopItem } from '../types/game';
import { soundManager } from '../utils/audio';
import { SHOP_ITEMS } from '../utils/shop';
import { deductBlackSeeds, getBlackSeeds, getUnlockedShopItems, unlockShopItem } from '../utils/storage';

interface ShopModalProps {
  onClose: () => void;
  onToast: (text: string, title?: string) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({ onClose, onToast }) => {
  const [blackSeeds, setBlackSeeds] = useState<number>(getBlackSeeds());
  const [unlockedItems, setUnlockedItems] = useState<string[]>(getUnlockedShopItems());

  const handlePurchase = (item: ShopItem) => {
    soundManager.playClick();
    if (unlockedItems.includes(item.id)) {
      onToast('Bu paket zaten satın alındı!', 'MAĞAZA');
      return;
    }

    if (blackSeeds < item.price) {
      soundManager.playHit();
      onToast(`Yetersiz Çekirdek! ${item.price - blackSeeds} daha çekirdek lazım!`, 'YETERSİZ ÇEKİRDEK');
      return;
    }

    const success = deductBlackSeeds(item.price);
    if (success) {
      soundManager.playCollect('tire');
      const updatedUnlocked = unlockShopItem(item.id);
      setUnlockedItems(updatedUnlocked);
      setBlackSeeds(getBlackSeeds());
      onToast(`🎉 "${item.title}" başarıyla satın alındı! Küfürler açıldı!`, 'KÜFÜR PAKETİ AÇILDI');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none animate-fadeIn">
      <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-5 md:p-7 max-w-lg w-full text-center shadow-2xl flex flex-col max-h-[85vh] relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌻</span>
            <div className="text-left">
              <h2 className="text-xl md:text-2xl font-black text-amber-400 leading-none">
                ÇEKİRDEK & KÜFÜR MAĞAZASI
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Topladığın siyah çekirdeklerle özel küfür paketleri satın al!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Current Black Seed Balance */}
        <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border border-amber-500/40 rounded-2xl p-3 my-3 flex items-center justify-between">
          <span className="text-xs font-bold text-amber-300">BAKİYEN:</span>
          <div className="flex items-center gap-2">
            <span className="text-xl">🌻</span>
            <span className="text-2xl font-black text-white tabular-nums">{blackSeeds}</span>
            <span className="text-xs text-amber-400 font-extrabold">Siyah Çekirdek</span>
          </div>
        </div>

        {/* Shop Items List */}
        <div className="overflow-y-auto space-y-3 my-2 pr-1 text-left flex-1">
          {SHOP_ITEMS.map((item) => {
            const isUnlocked = unlockedItems.includes(item.id);

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col gap-2 ${
                  isUnlocked
                    ? 'bg-slate-800/40 border-emerald-500/50'
                    : 'bg-slate-800/80 border-slate-700 hover:border-amber-500/60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{item.title}</span>
                        {isUnlocked && (
                          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                            SATIN ALINDI
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                    </div>
                  </div>

                  {!isUnlocked ? (
                    <button
                      onClick={() => handlePurchase(item)}
                      className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-md active:scale-95 transition-transform cursor-pointer shrink-0 flex items-center gap-1.5"
                    >
                      <span>🌻 {item.price}</span>
                      <span>AL</span>
                    </button>
                  ) : (
                    <div className="text-emerald-400 text-xs font-extrabold shrink-0">
                      ✓ AÇIK
                    </div>
                  )}
                </div>

                {/* Sample Quotes Preview */}
                <div className="bg-slate-950/60 p-2 rounded-xl text-[11px] text-slate-300 border border-slate-800">
                  <div className="text-[9px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                    Örnek Küfürler:
                  </div>
                  <div className="italic text-slate-300">
                    "{item.unlockedQuotes[0]}"
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Close */}
        <div className="pt-3 border-t border-slate-800">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-sm rounded-2xl cursor-pointer"
          >
            MAĞAZADAN ÇIK
          </button>
        </div>
      </div>
    </div>
  );
};
