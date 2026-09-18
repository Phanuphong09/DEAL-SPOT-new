import React, { useState } from 'react';
import { Deal, Store } from '../types';

interface SavedDealsViewProps {
  deals: Deal[];
  stores: Store[];
  onSelectDeal: (deal: Deal) => void;
  onSelectStore: (store: Store) => void;
  onToggleFavorite: (dealId: string) => void;
  onToggleFollowStore: (storeId: string) => void;
  onNavigateToMap: () => void;
  onShowToast: (msg: string) => void;
}

export const SavedDealsView: React.FC<SavedDealsViewProps> = ({
  deals,
  stores,
  onSelectDeal,
  onSelectStore,
  onToggleFavorite,
  onToggleFollowStore,
  onNavigateToMap,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'stores'>('products');
  const [isEmptySimulated, setIsEmptySimulated] = useState(false);
  const [productFilter, setProductFilter] = useState<'all' | 'in_stock' | 'ending_today' | 'price_drop'>('all');

  const favoritedDeals = deals.filter((d) => d.isFavorited);
  const followedStores = stores.filter((s) => s.isFollowing);

  const displayedDeals = favoritedDeals.filter((d) => {
    if (productFilter === 'in_stock') return d.stockCount > 5;
    if (productFilter === 'ending_today') return d.expiresSeconds < 6 * 3600;
    if (productFilter === 'price_drop') return d.discountPercent >= 35;
    return true;
  });

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto pb-24">
      {/* Top Header Row */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-[#f97316] text-[26px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            bookmark_heart
          </span>
          <h2 className="text-[20px] font-bold text-slate-900">Saved Deals & Stores</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onShowToast('Search in saved items')}
            aria-label="Search saved items"
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-transform active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-[19px]">search</span>
          </button>
          <button
            onClick={() => onShowToast('Edit saved list order')}
            className="h-9 px-3 rounded-full bg-slate-100 flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors active:scale-95 shadow-sm text-[12px] font-bold"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>Edit</span>
          </button>
        </div>
      </div>

      {/* Main Segmented Tab Switcher */}
      <div className="px-4 mt-1">
        <div className="p-1 bg-slate-200/70 rounded-2xl flex items-center relative">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
              activeTab === 'products'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] text-[#f97316]">
              shopping_bag
            </span>
            <span>Products</span>
            <span className="px-1.5 py-0.5 rounded-full bg-orange-100 text-[#9d4300] text-[10px] font-bold">
              {favoritedDeals.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('stores')}
            className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
              activeTab === 'stores'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">storefront</span>
            <span>Followed Stores</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
              {followedStores.length}
            </span>
          </button>
        </div>
      </div>

      {/* View Mode Preview & Simulate Empty State toggle */}
      <div className="px-4 mt-2.5 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
          View Mode Preview
        </span>
        <button
          onClick={() => setIsEmptySimulated(!isEmptySimulated)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold transition-transform active:scale-95"
        >
          <span className="material-symbols-outlined text-[14px]">
            {isEmptySimulated ? 'toggle_off' : 'toggle_on'}
          </span>
          <span>{isEmptySimulated ? 'Show Filled State' : 'Simulate Empty State'}</span>
        </button>
      </div>

      {/* Empty State View */}
      {isEmptySimulated ? (
        <div className="px-4 py-12 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center text-[#9d4300] mb-4 shadow-md animate-pulse">
            <span className="material-symbols-outlined text-[44px]">
              production_quantity_limits
            </span>
          </div>
          <div className="max-w-xs flex flex-col items-center">
            <h3 className="text-[16px] font-bold text-slate-900">Your basket is waiting</h3>
            <p className="text-[13px] text-slate-500 mt-1">
              Tap the heart on hot flash discounts nearby to lock them in before they sell out.
            </p>
            <button
              onClick={() => {
                setIsEmptySimulated(false);
                onNavigateToMap();
              }}
              className="mt-4 w-full py-3 px-4 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(249,115,22,0.3)] transition-transform active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">near_me</span>
              <span>Explore Nearby Deals</span>
            </button>
          </div>
        </div>
      ) : activeTab === 'products' ? (
        /* Products Tab Content */
        <div className="flex flex-col w-full mt-2">
          {/* Sub-filter chips */}
          <div className="overflow-x-auto no-scrollbar flex items-center gap-1.5 px-4 py-1">
            <button
              onClick={() => setProductFilter('all')}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all shadow-sm ${
                productFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              All ({favoritedDeals.length})
            </button>
            <button
              onClick={() => setProductFilter('in_stock')}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all shadow-sm ${
                productFilter === 'in_stock'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              In Stock Nearby
            </button>
            <button
              onClick={() => setProductFilter('ending_today')}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all shadow-sm ${
                productFilter === 'ending_today'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              Ending Today 🔥
            </button>
            <button
              onClick={() => setProductFilter('price_drop')}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all shadow-sm ${
                productFilter === 'price_drop'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              Price Dropped 📉
            </button>
          </div>

          {/* 2-Column Grid */}
          <div className="px-4 grid grid-cols-2 gap-3 mt-2">
            {displayedDeals.map((deal) => (
              <div
                key={deal.id}
                onClick={() => onSelectDeal(deal)}
                className="flex flex-col bg-white rounded-2xl p-2.5 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.06)] relative group border border-slate-100 cursor-pointer hover:shadow-md transition-all"
              >
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-100">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    src={deal.imageUrl}
                    alt={deal.title}
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#f97316] text-white text-[10px] font-bold shadow-sm">
                    {deal.discountBadge}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(deal.id);
                      onShowToast('Removed from saved items');
                    }}
                    aria-label="Remove favorite"
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#ba1a1a] shadow-md transition-transform active:scale-90"
                  >
                    <span
                      className="material-symbols-outlined text-[18px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      favorite
                    </span>
                  </button>
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-[#6ffbbe] text-[#002113] text-[9px] font-bold flex items-center gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> In Stock
                  </span>
                </div>

                <div className="flex flex-col mt-2 min-w-0">
                  <div className="flex items-center gap-1 text-slate-500">
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 text-[9px] text-slate-800 font-bold">
                      {deal.storeName}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate">
                      {deal.storeLocationText.split('•')[0]}
                    </span>
                  </div>
                  <h3 className="text-[13px] font-bold leading-tight text-slate-900 truncate mt-1">
                    {deal.title}
                  </h3>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-[17px] leading-none text-[#9d4300] font-extrabold">
                      ฿{deal.price}
                    </span>
                    <span className="text-[11px] text-slate-400 line-through">
                      ฿{deal.originalPrice}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowToast(`Reserved "${deal.title}" for pickup!`);
                    }}
                    className="mt-2 w-full py-1.5 rounded-xl bg-slate-100 hover:bg-orange-50 hover:text-[#9d4300] text-slate-800 text-[12px] font-bold flex items-center justify-center gap-1 transition-colors active:scale-98"
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      add_shopping_cart
                    </span>
                    <span>Reserve</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Smart Price Drop Alerts Banner */}
          <div className="mx-4 mt-4 p-3.5 rounded-2xl bg-blue-50/80 text-blue-950 flex items-start gap-2.5 border border-blue-100 shadow-sm">
            <span className="material-symbols-outlined text-[22px] text-[#9d4300] shrink-0 mt-0.5">
              notifications_active
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-bold text-slate-900">
                Smart Price Drop Alerts
              </span>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                Instant push triggers when any of your {favoritedDeals.length} favorites get marked down or stock falls below 5 items nearby.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Followed Stores Tab Content */
        <div className="flex flex-col w-full px-4 mt-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-slate-900">Followed Outlets</h3>
            <span className="text-[11px] text-slate-400 font-bold">
              {followedStores.length} Locations
            </span>
          </div>

          {stores.map((store) => (
            <div
              key={store.id}
              onClick={() => onSelectStore(store)}
              className="p-3.5 bg-white rounded-2xl shadow-[0_4px_16px_-2px_rgba(15,23,42,0.06)] flex items-center justify-between gap-3 border border-slate-100 cursor-pointer hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                    store.brand === '7-Eleven'
                      ? 'bg-[#007a3d] text-white'
                      : store.brand === 'Lotus'
                      ? 'bg-[#00a39e] text-white'
                      : store.brand === 'BigC'
                      ? 'bg-[#e31b23] text-white'
                      : 'bg-amber-100 text-[#9d4300]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[26px]">
                    {store.brand === '7-Eleven'
                      ? 'store'
                      : store.brand === 'BigC'
                      ? 'local_mall'
                      : 'shopping_cart'}
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-[14px] font-bold text-slate-900 truncate">
                      {store.name}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-[#ffdbca] text-[#783200] text-[9px] font-bold shrink-0">
                      {store.activeDealsCount} Deals
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 truncate">{store.address}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-700">
                      <span className="material-symbols-outlined text-[13px]">
                        directions_walk
                      </span>{' '}
                      {store.distanceKm} km
                    </span>
                    <span className="text-slate-400 text-[10px]">• {store.openHoursText}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFollowStore(store.id);
                  onShowToast(
                    store.isFollowing
                      ? `Unfollowed ${store.name}`
                      : `Now following ${store.name}!`
                  );
                }}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all active:scale-95 shrink-0 ${
                  store.isFollowing
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {store.isFollowing ? 'Following' : '+ Follow'}
              </button>
            </div>
          ))}

          {/* Discover More Nearby Hubs */}
          <div className="p-3.5 bg-slate-100 rounded-2xl flex items-center justify-between gap-2 border border-slate-200">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center shrink-0 text-slate-600">
                <span className="material-symbols-outlined text-[20px]">add_business</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[12px] font-bold text-slate-900">
                  Discover more nearby hubs
                </span>
                <span className="text-[11px] text-slate-500">
                  12 convenient stores within 1.5km
                </span>
              </div>
            </div>
            <button
              onClick={onNavigateToMap}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-[12px] shadow-sm shrink-0"
            >
              Browse Map
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
