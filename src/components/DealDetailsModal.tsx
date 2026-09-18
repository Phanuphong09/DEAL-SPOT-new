import React, { useState, useEffect } from 'react';
import { Deal, Store } from '../types';

interface DealDetailsModalProps {
  deal: Deal;
  stores: Store[];
  onClose: () => void;
  onToggleFavorite: (dealId: string) => void;
  onOpenStore: (store: Store) => void;
  onShowToast: (msg: string) => void;
}

export const DealDetailsModal: React.FC<DealDetailsModalProps> = ({
  deal,
  stores,
  onClose,
  onToggleFavorite,
  onOpenStore,
  onShowToast,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isVoucherClaimed, setIsVoucherClaimed] = useState(false);
  const [voucherSeconds, setVoucherSeconds] = useState(59 * 60 + 59);

  // Find store
  const store =
    stores.find((s) => s.id === deal.storeId) ||
    stores.find((s) => s.name.toLowerCase().includes(deal.storeName.toLowerCase())) ||
    stores[0];

  useEffect(() => {
    let timer: any;
    if (isVoucherClaimed) {
      timer = setInterval(() => {
        setVoucherSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isVoucherClaimed]);

  const formatVoucherTime = (sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const totalPrice = Math.round(deal.price * quantity * 100) / 100;
  const totalSavings = Math.round(deal.savingAmount * quantity * 100) / 100;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm overflow-y-auto flex justify-center">
      <div className="w-full max-w-2xl bg-[#f7f9fb] min-h-screen pb-24 shadow-2xl animate-in slide-in-from-bottom-6 duration-200">
        {/* Top Sticky Header */}
        <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md px-4 h-14 flex items-center justify-between border-b border-slate-100">
          <button
            onClick={onClose}
            aria-label="Back"
            className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-slate-800 hover:bg-slate-100"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <span className="text-[16px] font-bold text-slate-900 truncate">Deal Details</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onShowToast(`Shared deal: ${deal.title}`)}
              aria-label="Share"
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900"
            >
              <span className="material-symbols-outlined text-[22px]">share</span>
            </button>
            <button
              onClick={() => {
                onToggleFavorite(deal.id);
                onShowToast(deal.isFavorited ? 'Removed from saved' : 'Saved to favorites!');
              }}
              aria-label="Favorite"
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                deal.isFavorited ? 'text-[#ba1a1a]' : 'text-slate-600 hover:text-[#ba1a1a]'
              }`}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={deal.isFavorited ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                favorite
              </span>
            </button>
          </div>
        </div>

        {/* Product Hero Image */}
        <div className="relative w-full aspect-square sm:h-80 bg-white overflow-hidden flex items-center justify-center border-b border-slate-100">
          <img
            src={deal.imageUrl}
            alt={deal.title}
            className="w-full h-full object-contain p-4"
          />
          <div className="absolute top-3 left-3 bg-[#ba1a1a] text-white px-3 py-1 rounded-full text-[12px] font-extrabold shadow-sm tracking-tight">
            {deal.discountBadge}
          </div>
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Real-time in-store price</span>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="p-4 flex flex-col gap-4">
          {/* Store Anchor Card */}
          {store && (
            <div
              onClick={() => onOpenStore(store)}
              className="bg-white rounded-2xl p-3 shadow-sm flex items-center justify-between gap-3 border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0 ${
                    store.brand === '7-Eleven'
                      ? 'bg-[#007a3d]'
                      : store.brand === 'Lotus'
                      ? 'bg-[#00a39e]'
                      : store.brand === 'BigC'
                      ? 'bg-[#e31b23]'
                      : 'bg-amber-600'
                  }`}
                >
                  {store.brand === '7-Eleven' ? '7-11' : store.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-bold text-slate-900 truncate">
                      {store.name}
                    </span>
                    <span className="text-emerald-700 text-[10px] font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                      Open Now
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span className="flex items-center text-emerald-700 font-bold">
                      <span className="material-symbols-outlined text-[13px]">directions_walk</span>
                      {store.distanceKm} km ({store.walkTimeMin} min)
                    </span>
                    <span>•</span>
                    <span className="text-amber-500 flex items-center font-bold">
                      ★ {store.rating}
                    </span>
                  </div>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[20px]">
                chevron_right
              </span>
            </div>
          )}

          {/* Product Headline & Hero Price */}
          <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-2 border border-slate-100">
            <span className="text-[11px] uppercase tracking-wider text-[#9d4300] font-extrabold">
              {deal.brand} • {deal.category.toUpperCase()}
            </span>
            <h1 className="text-[18px] font-bold text-slate-900 leading-snug">{deal.title}</h1>
            <p className="text-[12px] text-slate-500 leading-relaxed">
              {deal.subtitle ||
                'Freshly replenished shelf inventory verified via Google Maps neighborhood coordinates. Guaranteed price match when claimed in DealSpot.'}
            </p>

            <div className="flex items-baseline gap-2.5 pt-2 border-t border-slate-100">
              <span className="text-[26px] font-black text-[#9d4300]">฿{deal.price}</span>
              <span className="text-[15px] text-slate-400 line-through">
                ฿{deal.originalPrice}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#ffdbca] text-[#783200] text-[11px] font-extrabold">
                Save ฿{deal.savingAmount}
              </span>
            </div>

            {/* Flash Expiry Ticker */}
            <div className="mt-2 bg-orange-50 p-3 rounded-xl border border-orange-100 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1 text-[#9d4300] font-bold">
                  <span className="material-symbols-outlined text-[16px] animate-pulse">bolt</span>
                  <span>Flash Expiry: {deal.expiresText}</span>
                </div>
                <span className="text-slate-500 font-bold">{deal.stockText}</span>
              </div>
              <div className="w-full h-1.5 bg-orange-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#f97316] rounded-full transition-all"
                  style={{ width: `${Math.min(100, (deal.stockCount / 20) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Price Comparison Radar */}
          {deal.competitorPrices && deal.competitorPrices.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-2.5 border border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#f97316] text-[18px]">
                    compare_arrows
                  </span>
                  <h3 className="text-[14px] font-bold text-slate-900">
                    Neighborhood Price Radar
                  </h3>
                </div>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                  Verified In Area
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Live shelf price check at other convenience chains in this pinned radius:
              </p>

              <div className="flex flex-col gap-2 pt-1">
                {deal.competitorPrices.map((comp) => (
                  <div
                    key={comp.storeName}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-[12px] ${
                      comp.isBest
                        ? 'bg-emerald-50/60 border-emerald-300 font-bold text-emerald-950'
                        : 'bg-slate-50 border-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{comp.storeName}</span>
                      {comp.isBest && (
                        <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.2 rounded font-black tracking-tight">
                          BEST DEAL
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span
                        className={`text-[13px] font-black ${
                          comp.isBest ? 'text-emerald-700' : 'text-slate-800'
                        }`}
                      >
                        ฿{comp.price.toFixed(2)}
                      </span>
                      {comp.price > deal.price && (
                        <span className="text-[10px] text-slate-400">
                          (+฿{(comp.price - deal.price).toFixed(2)})
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Quantity Selector */}
          <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between border border-slate-100">
            <span className="text-[13px] font-bold text-slate-800">Reservation Quantity</span>
            <div className="flex items-center gap-3 bg-slate-100 px-3 py-1.5 rounded-xl">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Decrease quantity"
                className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-slate-700 hover:bg-slate-200 active:scale-90 font-bold"
              >
                -
              </button>
              <span className="text-[15px] font-bold text-slate-900 w-5 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(deal.stockCount, quantity + 1))}
                aria-label="Increase quantity"
                className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-slate-700 hover:bg-slate-200 active:scale-90 font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Fixed Action Bar */}
        <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md p-4 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] z-40 border-t border-slate-100">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Total Price</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[20px] font-black text-[#9d4300]">฿{totalPrice}</span>
                <span className="text-[11px] text-emerald-700 font-bold">
                  (Save ฿{totalSavings})
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsVoucherClaimed(true);
                onShowToast(`Locked in deal for ${deal.title}!`);
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(249,115,22,0.35)] active:scale-[0.98] transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
              <span>Lock In &amp; Claim Barcode</span>
            </button>
          </div>
        </div>

        {/* Barcode / Voucher Claim Modal */}
        {isVoucherClaimed && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center gap-4 animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px]">check_circle</span>
              </div>

              <div className="flex flex-col">
                <h3 className="text-[18px] font-bold text-slate-900">Deal Locked In!</h3>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  Show this digital voucher barcode to the cashier at{' '}
                  <span className="font-bold text-slate-800">{store?.name}</span> to claim your
                  discount.
                </p>
              </div>

              {/* Barcode graphic visualization */}
              <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col items-center gap-2">
                <div className="flex items-center justify-center gap-1 h-14 w-full px-2">
                  {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 1, 3, 2, 4, 1, 2].map(
                    (w, i) => (
                      <div
                        key={i}
                        className="bg-slate-900 h-full rounded-xs"
                        style={{ width: `${w * 2.5}px` }}
                      ></div>
                    )
                  )}
                </div>
                <span className="font-mono text-[14px] font-bold text-slate-900 tracking-wider">
                  DS-{Math.floor(1000 + Math.random() * 9000)}-{deal.id.slice(0, 4).toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[12px] text-emerald-800 font-bold bg-emerald-50 px-3 py-1.5 rounded-full">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                <span>Expires in: {formatVoucherTime(voucherSeconds)}</span>
              </div>

              <button
                onClick={() => setIsVoucherClaimed(false)}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-[13px] hover:bg-slate-800 active:scale-98 transition-transform"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
