import React, { useState, useEffect } from 'react';
import { Deal, PinnedLocation } from '../types';

interface DealsFeedViewProps {
  deals: Deal[];
  pinnedLocation: PinnedLocation;
  onSelectDeal: (deal: Deal) => void;
  onToggleFavorite: (dealId: string) => void;
  onNavigateToMap: () => void;
  onShowToast: (msg: string) => void;
}

export const DealsFeedView: React.FC<DealsFeedViewProps> = ({
  deals,
  pinnedLocation,
  onSelectDeal,
  onToggleFavorite,
  onNavigateToMap,
  onShowToast,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'discount' | 'distance' | 'expiring'>('discount');
  const [maxDistance, setMaxDistance] = useState<number>(5);

  // Ticking countdown timer for the flash banner
  const [flashSeconds, setFlashSeconds] = useState(1 * 3600 + 42 * 60 + 18);

  useEffect(() => {
    const timer = setInterval(() => {
      setFlashSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatFlashTime = (sec: number) => {
    const h = String(Math.floor(sec / 3600)).padStart(2, '0');
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // Distance helper from deal location text
  const getDealDistance = (deal: Deal): number => {
    const match = deal.storeLocationText.match(/^([0-9.]+)\s*km/i);
    if (match) return parseFloat(match[1]);
    return 0.5;
  };

  // Filter & sort deals
  const filteredDeals = deals
    .filter((deal) => {
      if (selectedCategory !== 'all' && deal.category !== selectedCategory) return false;
      const dealDist = getDealDistance(deal);
      if (maxDistance < 5 && dealDist > maxDistance) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          deal.title.toLowerCase().includes(q) ||
          deal.brand.toLowerCase().includes(q) ||
          deal.storeName.toLowerCase().includes(q) ||
          deal.storeLocationText.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'discount') return b.discountPercent - a.discountPercent;
      if (sortBy === 'distance') return getDealDistance(a) - getDealDistance(b);
      if (sortBy === 'expiring') return a.expiresSeconds - b.expiresSeconds;
      return a.price - b.price;
    });

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto pb-24">
      {/* Sticky Top Filter Strip */}
      <section className="sticky top-16 z-40 bg-white/95 backdrop-blur-md px-4 py-2 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.06)] flex flex-col gap-2 border-b border-slate-100">
        {/* Search Input */}
        <div className="relative flex items-center w-full">
          <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[20px] pointer-events-none">
            search
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-10 bg-slate-100 text-slate-900 text-[14px] rounded-full outline-none focus:bg-slate-200/80 transition-all placeholder:text-slate-400"
            placeholder="Search deals, snacks, essentials..."
            type="text"
          />
          <button
            type="button"
            onClick={() => onShowToast('Voice search listening...')}
            aria-label="Voice search"
            className="absolute right-3 text-slate-400 hover:text-slate-800 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[18px]">mic</span>
          </button>
        </div>

        {/* Quick Filter Sort Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
          <button
            onClick={() => {
              setSortBy('discount');
              onShowToast('Sorted by Highest Discount');
            }}
            className={`shrink-0 h-8 px-3 rounded-full text-[12px] font-bold flex items-center gap-1 transition-all active:scale-95 ${
              sortBy === 'discount'
                ? 'bg-[#ffdbca] text-[#9d4300] ring-1 ring-[#f97316]'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-[#9d4300]">
              swap_vert
            </span>
            <span>Highest Discount</span>
          </button>

          <button
            onClick={() => {
              setSortBy('distance');
              onShowToast('Sorted by Nearest Store');
            }}
            className={`shrink-0 h-8 px-3 rounded-full text-[12px] font-bold flex items-center gap-1 transition-all active:scale-95 ${
              sortBy === 'distance'
                ? 'bg-emerald-100 text-emerald-900 ring-1 ring-emerald-500'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-emerald-600">
              near_me
            </span>
            <span>Nearest First</span>
          </button>

          <button
            onClick={() => {
              setMaxDistance(maxDistance === 2 ? 5 : 2);
              onShowToast(maxDistance === 2 ? 'Distance filter: < 5 km' : 'Distance filter: < 2 km');
            }}
            className={`shrink-0 h-8 px-3 rounded-full text-[12px] font-bold flex items-center gap-1 transition-all active:scale-95 ${
              maxDistance === 2
                ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-500'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-emerald-600">
              filter_list
            </span>
            <span>&lt; 2 km only</span>
          </button>

          <button
            onClick={() => {
              setSortBy('expiring');
              onShowToast('Showing Flash Deals ending soonest');
            }}
            className={`shrink-0 h-8 px-3 rounded-full text-[12px] font-bold flex items-center gap-1 transition-all active:scale-95 ${
              sortBy === 'expiring'
                ? 'bg-orange-100 text-orange-900 ring-1 ring-orange-400'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-[#f97316]">bolt</span>
            <span>Flash Expiring</span>
          </button>

          <button
            onClick={onNavigateToMap}
            className="shrink-0 h-8 px-3 rounded-full bg-slate-100 text-slate-700 text-[12px] font-bold flex items-center gap-1 hover:bg-slate-200 transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">storefront</span>
            <span>Stores</span>
          </button>
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all active:scale-95 ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Deals
          </button>
          <button
            onClick={() => setSelectedCategory('food')}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all active:scale-95 ${
              selectedCategory === 'food'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Food & Snacks
          </button>
          <button
            onClick={() => setSelectedCategory('beverages')}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all active:scale-95 ${
              selectedCategory === 'beverages'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Beverages
          </button>
          <button
            onClick={() => setSelectedCategory('household')}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all active:scale-95 ${
              selectedCategory === 'household'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Household
          </button>
        </div>
      </section>

      {/* Main Feed Content */}
      <div className="px-4 pt-3 flex flex-col gap-3">
        {/* Active Neighborhood Bar */}
        <div className="bg-white rounded-2xl p-2.5 px-3 border border-slate-200/90 shadow-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-orange-100 text-[#f97316] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">near_me</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Current Selected Area
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              </div>
              <span className="text-[13px] font-bold text-slate-900 truncate">
                {pinnedLocation.name}
              </span>
            </div>
          </div>
          <button
            onClick={onNavigateToMap}
            className="h-8 px-3 rounded-full bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-700 text-[11px] font-bold flex items-center gap-1 transition-colors shrink-0 active:scale-95"
          >
            <span className="material-symbols-outlined text-[14px]">edit_location_alt</span>
            <span>Switch Area</span>
          </button>
        </div>

        {/* Flash Near Siam Sq Urgency Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#f97316] via-[#ea580c] to-[#9d4300] p-3.5 text-white shadow-[0_8px_24px_-4px_rgba(249,115,22,0.28)] flex items-center justify-between gap-2">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px] text-white">bolt</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-full">
                  Flash Near {pinnedLocation.name.split(',')[0]}
                </span>
                <span className="text-[10px] bg-[#ba1a1a] text-white px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                  Ending Soon
                </span>
              </div>
              <p className="text-[15px] font-bold text-white truncate mt-0.5">
                Up to 70% off neighborhood stock
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end shrink-0 pl-1">
            <span className="text-[16px] tracking-tight text-white font-extrabold font-mono">
              {formatFlashTime(flashSeconds)}
            </span>
            <span className="text-[10px] text-white/80 font-medium">Claim quickly</span>
          </div>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[16px] font-bold text-slate-900">
            Nearby Discounts{' '}
            <span className="text-slate-500 text-[13px] font-normal">
              ({filteredDeals.length} ready to pick)
            </span>
          </span>
          <button
            onClick={onNavigateToMap}
            className="flex items-center gap-1 text-[#9d4300] text-[12px] font-bold active:scale-95 transition-transform hover:underline"
          >
            <span>Map View</span>
            <span className="material-symbols-outlined text-[16px]">location_on</span>
          </button>
        </div>

        {/* Deal Cards List */}
        <div className="flex flex-col gap-3">
          {filteredDeals.map((deal) => (
            <div
              key={deal.id}
              onClick={() => onSelectDeal(deal)}
              className="bg-white rounded-2xl p-3.5 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.04)] flex flex-col gap-2 relative transition-all active:scale-[0.995] border border-slate-100 hover:shadow-md cursor-pointer"
            >
              {/* Image banner */}
              <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                <img
                  className="w-full h-full object-cover"
                  src={deal.imageUrl}
                  alt={deal.imageAlt || deal.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent"></div>

                {/* Top badges */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span
                    className={`px-2.5 py-1 rounded-full text-white text-[12px] font-extrabold shadow-sm tracking-tight ${
                      deal.discountBadge.includes('BUY') || deal.discountBadge.includes('BOGO')
                        ? 'bg-[#f97316]'
                        : 'bg-[#ba1a1a]'
                    }`}
                  >
                    {deal.discountBadge}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-slate-800 text-[10px] font-bold flex items-center gap-0.5 shadow-sm">
                    <span className="material-symbols-outlined text-[12px] text-emerald-700">
                      schedule
                    </span>
                    {deal.expiresText}
                  </span>
                </div>

                {/* Heart toggle */}
                <button
                  type="button"
                  aria-label="Favorite deal"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(deal.id);
                    onShowToast(deal.isFavorited ? 'Removed from favorites' : 'Saved to favorites!');
                  }}
                  className={`absolute top-2.5 right-2.5 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-md transition-transform active:scale-90 ${
                    deal.isFavorited ? 'text-[#ba1a1a]' : 'text-slate-400 hover:text-[#ba1a1a]'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={deal.isFavorited ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    favorite
                  </span>
                </button>

                {/* Bottom store & location tags */}
                <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                  <div className="px-2 py-1 rounded-full bg-white/95 backdrop-blur-md flex items-center gap-1 shadow-sm">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        deal.storeName.includes('7-Eleven')
                          ? 'bg-[#007a3d]'
                          : deal.storeName.includes('Lotus')
                          ? 'bg-[#00a39e]'
                          : deal.storeName.includes('Big C')
                          ? 'bg-[#ba1a1a]'
                          : 'bg-[#f59e0b]'
                      }`}
                    ></span>
                    <span className="text-[10px] font-bold text-slate-800">
                      {deal.storeName}
                    </span>
                  </div>
                  <div className="px-2 py-1 rounded-full bg-[#6ffbbe] text-[#002113] text-[10px] font-bold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[12px]">near_me</span>
                    <span>{deal.storeLocationText}</span>
                  </div>
                </div>
              </div>

              {/* Title & Price info */}
              <div className="flex flex-col gap-1 mt-0.5">
                <h2 className="text-[15px] font-bold text-slate-900 leading-tight">
                  {deal.title}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[20px] font-extrabold text-[#9d4300]">
                    ฿{deal.price}
                  </span>
                  <span className="text-[13px] text-slate-400 line-through">
                    ฿{deal.originalPrice}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#ffdbca] text-[#783200] text-[10px] font-bold">
                    Save ฿{deal.savingAmount}
                  </span>
                </div>
              </div>

              {/* Stock and Claim CTA */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                <div className="flex items-center gap-1 text-[#9d4300]">
                  <span className="material-symbols-outlined text-[16px] animate-pulse">
                    local_fire_department
                  </span>
                  <span className="text-[11px] font-bold">{deal.stockText}</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectDeal(deal);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#9d4300] hover:bg-[#f97316] text-white text-[12px] font-bold shadow-[0_4px_12px_rgba(249,115,22,0.25)] active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <span>Claim Deal</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Neighborhood Clearance Notification Banner */}
        <div className="p-4 rounded-2xl bg-slate-100 flex flex-col items-center justify-center text-center gap-1.5 mt-2 mb-4 border border-slate-200">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-600 shadow-sm">
            <span className="material-symbols-outlined text-[20px]">notifications_active</span>
          </div>
          <p className="text-[15px] font-bold text-slate-900">
            Never miss neighborhood clearance
          </p>
          <p className="text-[12px] text-slate-500 max-w-xs leading-snug">
            Stores around {pinnedLocation.name.split(',')[0]} drop prices every day after 6 PM. Turn on instant location pings.
          </p>
          <button
            onClick={() => onShowToast(`🔔 Subscribed to 500m alerts around ${pinnedLocation.name.split(',')[0]}`)}
            className="mt-1 px-4 py-2 rounded-full bg-slate-900 text-white text-[12px] font-bold active:scale-95 transition-transform hover:bg-slate-800"
          >
            Notify for 500m radius
          </button>
        </div>
      </div>
    </div>
  );
};
