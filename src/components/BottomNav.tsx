import React from 'react';

export type TabKey = 'map' | 'deals' | 'favorites' | 'profile';

interface BottomNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  favoritesCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  favoritesCount,
}) => {
  return (
    <div className="fixed bottom-4 inset-x-0 z-50 px-4 pointer-events-none pb-[env(safe-area-inset-bottom,0px)]">
      <nav className="pointer-events-auto mx-auto max-w-md bg-white/90 backdrop-blur-xl rounded-full shadow-[0_12px_32px_-4px_rgba(249,115,22,0.22)] px-2 py-1.5 ring-1 ring-slate-100">
        <div className="flex items-center justify-around">
          {/* Home / Explore Map */}
          <button
            onClick={() => onTabChange('map')}
            className={`flex flex-col items-center justify-center min-w-[50px] min-h-[44px] py-1 px-3 transition-colors group ${
              activeTab === 'map' ? 'text-[#9d4300] font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform ${
                activeTab === 'map' ? "style={{ fontVariationSettings: ''FILL' 1'' }}" : ''
              }`}
            >
              near_me
            </span>
            <span className="text-[10px] font-bold mt-0.5">Home</span>
          </button>

          {/* Deals Feed */}
          <button
            onClick={() => onTabChange('deals')}
            className={`flex flex-col items-center justify-center min-w-[50px] min-h-[44px] py-1 px-3 transition-colors group ${
              activeTab === 'deals' ? 'text-[#9d4300] font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform ${
                activeTab === 'deals' ? "style={{ fontVariationSettings: ''FILL' 1'' }}" : ''
              }`}
            >
              local_fire_department
            </span>
            <span className="text-[10px] font-bold mt-0.5">Deals</span>
          </button>

          {/* Favorites */}
          <button
            onClick={() => onTabChange('favorites')}
            className={`relative flex flex-col items-center justify-center min-w-[50px] min-h-[44px] py-1 px-3 transition-colors group ${
              activeTab === 'favorites' ? 'text-[#9d4300] font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className="relative flex items-center justify-center">
              <span
                className={`material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform ${
                  activeTab === 'favorites' ? "style={{ fontVariationSettings: ''FILL' 1'' }}" : ''
                }`}
              >
                bookmark_heart
              </span>
              {favoritesCount > 0 ? (
                <span className="absolute -top-1 -right-2 flex items-center justify-center min-w-[14px] h-[14px] px-0.5 bg-[#f97316] text-white text-[9px] font-bold rounded-full leading-none shadow-sm">
                  {favoritesCount}
                </span>
              ) : null}
            </div>
            <span className="text-[10px] font-bold mt-0.5">Favorites</span>
          </button>

          {/* Profile */}
          <button
            onClick={() => onTabChange('profile')}
            className={`flex flex-col items-center justify-center min-w-[50px] min-h-[44px] py-1 px-3 transition-colors group ${
              activeTab === 'profile' ? 'text-[#9d4300] font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform ${
                activeTab === 'profile' ? "style={{ fontVariationSettings: ''FILL' 1'' }}" : ''
              }`}
            >
              account_circle
            </span>
            <span className="text-[10px] font-bold mt-0.5">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
