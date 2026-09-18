import React, { useState } from 'react';
import { Store, Deal } from '../types';

interface StoreDetailsModalProps {
  store: Store;
  deals: Deal[];
  onClose: () => void;
  onSelectDeal: (deal: Deal) => void;
  onToggleFollow: (storeId: string) => void;
  onShowToast: (msg: string) => void;
}

export const StoreDetailsModal: React.FC<StoreDetailsModalProps> = ({
  store,
  deals,
  onClose,
  onSelectDeal,
  onToggleFollow,
  onShowToast,
}) => {
  const [notifyAlerts, setNotifyAlerts] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'meals' | 'beverages' | 'personal'>('all');

  const storeDeals = deals.filter((d) => {
    if (d.storeId === store.id) return true;
    if (d.storeName.toLowerCase().includes(store.brand.toLowerCase())) return true;
    return true; // Fallback to all deals
  });

  const highlights = storeDeals.slice(0, 3);
  const readyMeals = storeDeals.filter((d) => d.category === 'food').slice(0, 4);
  const beverages = storeDeals.filter((d) => d.category === 'beverages').slice(0, 3);

  const handleNavigate = () => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`;
    window.open(mapsUrl, '_blank');
    onShowToast(`Opening navigation to ${store.name}...`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm overflow-y-auto flex justify-center">
      <div className="w-full max-w-2xl bg-[#f7f9fb] min-h-screen pb-20 shadow-2xl animate-in slide-in-from-bottom-6 duration-200">
        {/* Modal Top Bar */}
        <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md px-4 h-14 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              aria-label="Back"
              className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-slate-800 hover:bg-slate-100"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <span className="text-[16px] font-bold text-slate-900 truncate">
              Store Radar Details
            </span>
          </div>
          <button
            onClick={() => onShowToast(`Shared ${store.name} deal page!`)}
            aria-label="Share"
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900"
          >
            <span className="material-symbols-outlined text-[22px]">share</span>
          </button>
        </div>

        {/* Hero Store Cover Image */}
        <div className="relative w-full h-44 bg-slate-200 overflow-hidden">
          <img
            src={
              store.photoUrl ||
              'https://lh3.googleusercontent.com/aida-public/AB6AXuB4xVwZdoyRaS087HYHB-cf4fRkbqq-7SvfB2NiDKDacNUieLZ7kRm7GLD1OtItOVW0iPB7eMG6iUxAESqRv57cvrklvCoeM8DR8opNkaEPv0J33F6ayECOToAng32eR5Ymp8GnWEAgPFpo-If4NoLUWmxMla2S6d-qLrIvRQgCvFZjDQnlBdbp2QNDikfm7N0nzZn6gBwNI7V_-hJsR7OmpZBnFLxcSn4QajvwDPTNGbEK3c6U-AYh'
            }
            alt={store.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>{store.openHoursText}</span>
          </div>
        </div>

        {/* Store Profile Card */}
        <div className="relative px-4 -mt-7 z-10 flex flex-col gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-md flex flex-col gap-3 border border-slate-100">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-14 h-14 rounded-xl bg-slate-50 p-1 shadow-sm shrink-0 flex items-center justify-center overflow-hidden border border-slate-200">
                  <div className="w-full h-full rounded-lg bg-slate-100 flex flex-col items-center justify-center font-extrabold text-[#9d4300] leading-none">
                    <span className="text-emerald-700 text-xs font-bold tracking-tight">
                      {store.brand === '7-Eleven'
                        ? '7'
                        : store.name.slice(0, 2).toUpperCase()}
                    </span>
                    {store.brand === '7-Eleven' && (
                      <span className="text-[#f97316] text-[9px] font-extrabold -mt-0.5">
                        ELEVEN
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1">
                    <h2 className="text-[16px] font-bold text-slate-900 truncate">
                      {store.name}
                    </h2>
                    <span
                      className="material-symbols-outlined text-[#f97316] text-[18px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      verified
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-500 truncate">{store.address}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center text-amber-500 text-[12px] font-bold">
                      <span
                        className="material-symbols-outlined text-[14px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                      <span className="text-slate-800 ml-0.5">{store.rating}</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <span className="text-[12px] text-slate-500 truncate">
                      {store.reviewCount}+ reviews
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  onToggleFollow(store.id);
                  onShowToast(
                    store.isFollowing ? `Unfollowed ${store.name}` : `Following ${store.name}!`
                  );
                }}
                className={`shrink-0 flex items-center gap-1 px-3.5 py-1.5 rounded-full text-[12px] font-bold shadow-sm active:scale-95 transition-all ${
                  store.isFollowing
                    ? 'bg-[#f97316] text-white'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[15px]"
                  style={store.isFollowing ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  favorite
                </span>
                <span>{store.isFollowing ? 'Following' : '+ Follow'}</span>
              </button>
            </div>

            {/* Notification toggle */}
            <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#f97316] text-[18px]">
                  notifications_active
                </span>
                <span className="text-[12px] font-bold text-slate-800">
                  Notify me of new flash discounts
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  checked={notifyAlerts}
                  onChange={(e) => {
                    setNotifyAlerts(e.target.checked);
                    onShowToast(
                      e.target.checked ? 'Store alerts turned ON' : 'Store alerts turned OFF'
                    );
                  }}
                  className="sr-only peer"
                  type="checkbox"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#f97316]"></div>
              </label>
            </div>

            {/* 3-Col Stats */}
            <div className="grid grid-cols-3 gap-2 pt-0.5">
              <div className="bg-slate-50 rounded-xl p-2 flex flex-col items-center justify-center text-center border border-slate-100">
                <span className="text-[18px] font-extrabold text-[#f97316]">
                  {store.activeDealsCount}
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Active Deals</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-2 flex flex-col items-center justify-center text-center border border-slate-100">
                <span className="text-[16px] font-extrabold text-emerald-700">
                  {store.distanceKm} km
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase">
                  {store.walkTimeMin} min walk
                </span>
              </div>
              <div className="bg-[#ffdbca] rounded-xl p-2 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-0.5 text-[#341100]">
                  <span className="material-symbols-outlined text-[16px] text-[#f97316] animate-pulse">
                    bolt
                  </span>
                  <span className="text-[15px] font-extrabold">Flash</span>
                </div>
                <span className="text-[10px] text-[#783200] font-bold uppercase">
                  Active Today
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Street Row */}
          <div className="bg-slate-100 rounded-2xl p-3.5 flex items-center justify-between gap-3 border border-slate-200">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm text-slate-700">
                <span className="material-symbols-outlined text-[20px]">pin_drop</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-bold text-slate-900 truncate">
                  {store.address}
                </span>
                <span className="text-[11px] text-slate-500 truncate">
                  Real Google Maps Verified Outlet
                </span>
              </div>
            </div>
            <button
              onClick={handleNavigate}
              className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[12px] font-bold shadow-sm active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[15px]">near_me</span>
              <span>Navigate</span>
            </button>
          </div>

          {/* Store Manager Broadcast notice */}
          <div className="bg-orange-100/60 rounded-2xl p-3.5 flex items-start gap-2.5 border border-orange-200">
            <div className="w-8 h-8 rounded-full bg-[#f97316] text-white flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[18px]">campaign</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] font-bold text-slate-900">
                  Store Manager Broadcast
                </span>
                <span className="text-[10px] text-[#9d4300] font-bold">Just now</span>
              </div>
              <p className="text-[12px] text-slate-700 mt-0.5 leading-snug">
                📢 Fresh batch of CP toasties and sushi boxes discounted up to 50% for evening clearance starting 6 PM! Stock is limited to shelf count.
              </p>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="sticky top-14 z-30 bg-[#f7f9fb]/95 backdrop-blur-md pt-3 pb-2 px-4 mt-2">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('all')}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all shadow-sm ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Deals ({storeDeals.length})
            </button>
            <button
              onClick={() => setActiveTab('meals')}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all shadow-sm ${
                activeTab === 'meals'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              Ready Meals & Snacks ({readyMeals.length})
            </button>
            <button
              onClick={() => setActiveTab('beverages')}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all shadow-sm ${
                activeTab === 'beverages'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              Beverages ({beverages.length})
            </button>
          </div>
        </div>

        {/* Deals Content Sections */}
        <div className="flex flex-col gap-5 px-4 mt-2">
          {/* Section 1: Today's Top Highlights Carousel */}
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xl">🔥</span>
                <h3 className="text-[15px] font-bold text-slate-900">Today's Top Highlights</h3>
              </div>
              <span className="text-[11px] text-[#9d4300] font-extrabold uppercase tracking-wider">
                Buy 1 Get 1 Free
              </span>
            </div>

            <div className="flex gap-3 overflow-x-auto -mx-4 px-4 no-scrollbar pb-1">
              {highlights.map((deal) => (
                <div
                  key={deal.id}
                  onClick={() => onSelectDeal(deal)}
                  className="shrink-0 w-60 bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col border border-slate-100 cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="relative h-32 w-full bg-slate-100">
                    <img
                      className="w-full h-full object-cover"
                      src={deal.imageUrl}
                      alt={deal.title}
                    />
                    <div className="absolute top-2 left-2 bg-[#f97316] text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm">
                      {deal.discountBadge}
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] text-white flex items-center gap-1 font-mono">
                      <span className="material-symbols-outlined text-[12px] text-emerald-400">
                        timer
                      </span>
                      <span>Ends in 03:22:15</span>
                    </div>
                  </div>

                  <div className="p-3 flex flex-col justify-between flex-1 gap-2">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-700">{deal.brand}</span>
                      <h4 className="text-[13px] font-bold text-slate-900 line-clamp-1">
                        {deal.title}
                      </h4>
                    </div>

                    <div className="flex items-end justify-between pt-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[18px] font-extrabold text-[#f97316]">
                          ฿{deal.price}
                        </span>
                        <span className="text-[11px] text-slate-400 line-through">
                          ฿{deal.originalPrice}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onShowToast(`Claimed deal voucher for "${deal.title}"!`);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-[11px] font-bold shadow-sm active:scale-95 transition-transform flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[15px]">add</span>
                        <span>Claim</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 2: Ready Meals & Fresh Food */}
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xl">🍱</span>
                <h3 className="text-[15px] font-bold text-slate-900">
                  Ready Meals & Fresh Food
                </h3>
              </div>
              <span className="text-[11px] text-slate-500">Evening Clearance</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {readyMeals.map((deal) => (
                <div
                  key={deal.id}
                  onClick={() => onSelectDeal(deal)}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col border border-slate-100 cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="relative aspect-square w-full bg-slate-100">
                    <img
                      className="w-full h-full object-cover"
                      src={deal.imageUrl}
                      alt={deal.title}
                    />
                    <div className="absolute top-2 left-2 bg-[#ba1a1a] text-white px-2 py-0.5 rounded-full text-[10px] font-extrabold shadow-sm">
                      {deal.discountBadge}
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-sm px-2 py-0.5 rounded-md text-[10px] text-white flex items-center justify-between font-bold">
                      <span className="truncate">{deal.expiresText}</span>
                      <span className="text-emerald-400 shrink-0">{deal.stockCount} left</span>
                    </div>
                  </div>

                  <div className="p-2.5 flex flex-col justify-between flex-1 gap-1.5">
                    <div>
                      <h4 className="text-[12px] font-bold text-slate-900 line-clamp-2">
                        {deal.title}
                      </h4>
                      <span className="text-[10px] text-slate-400">{deal.unit || deal.brand}</span>
                    </div>

                    <div className="flex items-end justify-between pt-1">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 line-through">
                          ฿{deal.originalPrice}
                        </span>
                        <span className="text-[16px] font-extrabold text-[#9d4300] -mt-1">
                          ฿{deal.price}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onShowToast(`Added "${deal.title}" to reservation cart!`);
                        }}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#f97316] hover:text-white text-slate-800 flex items-center justify-center transition-colors"
                      >
                        <span className="material-symbols-outlined text-[17px]">
                          add_shopping_cart
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Beverages & Coffee */}
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xl">☕</span>
                <h3 className="text-[15px] font-bold text-slate-900">Beverages & Coffee</h3>
              </div>
              <span className="text-[11px] text-slate-500">All-Day Combos</span>
            </div>

            <div className="flex flex-col gap-2">
              {beverages.map((deal) => (
                <div
                  key={deal.id}
                  onClick={() => onSelectDeal(deal)}
                  className="bg-white rounded-2xl p-3 shadow-sm flex items-center gap-3 border border-slate-100 cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                    <img
                      className="w-full h-full object-cover"
                      src={deal.imageUrl}
                      alt={deal.title}
                    />
                    <span className="absolute top-1 left-1 bg-[#f97316] text-white px-1.5 py-0.2 rounded-full text-[9px] font-extrabold">
                      {deal.discountBadge}
                    </span>
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-emerald-700">{deal.brand}</span>
                    <h4 className="text-[13px] font-bold text-slate-900 truncate">
                      {deal.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate">{deal.subtitle}</p>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-[15px] font-extrabold text-[#9d4300]">
                        ฿{deal.price}
                      </span>
                      <span className="text-[11px] text-slate-400 line-through">
                        ฿{deal.originalPrice}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowToast(`Claimed "${deal.title}"!`);
                    }}
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#f97316] hover:text-white text-slate-800 text-[12px] font-bold flex items-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[15px]">add</span>
                    <span>Add</span>
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
