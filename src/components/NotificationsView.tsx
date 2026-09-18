import React, { useState } from 'react';
import { NotificationItem, AlertPreferences, PinnedLocation } from '../types';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  pinnedLocation: PinnedLocation;
  onMarkAllRead: () => void;
  onOpenPreferences: () => void;
  onShowToast: (msg: string) => void;
  preferences: AlertPreferences;
  onUpdatePreferences: (prefs: AlertPreferences) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  pinnedLocation,
  onMarkAllRead,
  onShowToast,
  preferences,
  onUpdatePreferences,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'unread' | 'price_drops'>('all');
  const [isPrefsOpen, setIsPrefsOpen] = useState(false);
  const [tempPrefs, setTempPrefs] = useState<AlertPreferences>(preferences);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifs = notifications.filter((item) => {
    if (filterMode === 'unread') return !item.isRead;
    if (filterMode === 'price_drops') return item.type === 'price_drop';
    return true;
  });

  const todayNotifs = filteredNotifs.filter((n) => n.isToday);
  const yesterdayNotifs = filteredNotifs.filter((n) => !n.isToday);

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto pb-24">
      {/* Interactive Alert Preferences Modal / Sheet Backdrop */}
      {isPrefsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl flex flex-col gap-4 animate-in slide-in-from-bottom-6 duration-200">
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto sm:hidden"></div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[#9d4300]">
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                </div>
                <h2 className="text-[16px] font-bold text-slate-900">Alert Preferences</h2>
              </div>
              <button
                onClick={() => setIsPrefsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="text-[12px] text-slate-500">
              Customize real-time push alerts to match your shopping habits & discount threshold around {pinnedLocation.name.split(',')[0]}.
            </p>

            {/* Minimum Discount Slider */}
            <div className="flex flex-col gap-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#9d4300] text-[18px]">
                    percent
                  </span>
                  <span className="text-[13px] font-bold text-slate-900">Minimum Discount</span>
                </div>
                <span className="text-[16px] font-extrabold text-[#9d4300]">
                  {tempPrefs.minDiscountPercent}%
                </span>
              </div>
              <input
                className="w-full accent-[#f97316] cursor-pointer"
                max="70"
                min="10"
                step="5"
                type="range"
                value={tempPrefs.minDiscountPercent}
                onChange={(e) =>
                  setTempPrefs({ ...tempPrefs, minDiscountPercent: Number(e.target.value) })
                }
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>10% (More alerts)</span>
                <span>50%+ (Mega savings)</span>
              </div>
            </div>

            {/* Proximity Radius Slider */}
            <div className="flex flex-col gap-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px]">
                    near_me
                  </span>
                  <span className="text-[13px] font-bold text-slate-900">Proximity Radius</span>
                </div>
                <span className="text-[16px] font-extrabold text-emerald-700">
                  {tempPrefs.proximityRadiusKm.toFixed(1)} km
                </span>
              </div>
              <input
                className="w-full accent-emerald-600 cursor-pointer"
                max="5.0"
                min="0.5"
                step="0.5"
                type="range"
                value={tempPrefs.proximityRadiusKm}
                onChange={(e) =>
                  setTempPrefs({ ...tempPrefs, proximityRadiusKm: Number(e.target.value) })
                }
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>500m (Walking)</span>
                <span>5km (Metro area)</span>
              </div>
            </div>

            {/* Flash Countdowns Toggle */}
            <div className="flex items-center justify-between py-1">
              <span className="text-[13px] font-bold text-slate-800">Flash Deal Countdowns</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  checked={tempPrefs.flashDealCountdowns}
                  onChange={(e) =>
                    setTempPrefs({ ...tempPrefs, flashDealCountdowns: e.target.checked })
                  }
                  className="sr-only peer"
                  type="checkbox"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f97316]"></div>
              </label>
            </div>

            <button
              onClick={() => {
                onUpdatePreferences(tempPrefs);
                setIsPrefsOpen(false);
                onShowToast('Alert preferences saved!');
              }}
              className="w-full py-3 bg-[#f97316] hover:bg-[#ea580c] text-white text-[13px] font-bold rounded-xl shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>Save Preferences</span>
            </button>
          </div>
        </div>
      )}

      {/* Main View Container */}
      <div className="px-4 pt-3 flex flex-col gap-3">
        {/* Top Action / Context Row */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-bold text-slate-900 leading-tight">
              Notifications & Alerts
            </h1>
            <p className="text-[12px] text-slate-500">Live flash drops & price reductions near you</p>
          </div>
          <button
            onClick={() => setIsPrefsOpen(true)}
            aria-label="Alert Settings"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </button>
        </div>

        {/* Active Filter & Settings Trigger Banner */}
        <div className="bg-[#ffdbca]/40 p-3.5 rounded-2xl flex flex-col gap-1 border border-orange-200/60 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#9d4300] text-[11px] font-extrabold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[17px] animate-pulse">
                notifications_active
              </span>
              <span>Live Radar Active</span>
            </div>
            <button
              onClick={() => setIsPrefsOpen(true)}
              className="text-[11px] text-[#9d4300] underline font-bold"
            >
              Edit
            </button>
          </div>
          <p className="text-[12px] text-[#783200] font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#f97316] inline-block"></span>
            Alerting: Min {preferences.minDiscountPercent}% discount • Within{' '}
            {preferences.proximityRadiusKm.toFixed(1)} km of {pinnedLocation.name.split(',')[0]}
          </p>
        </div>

        {/* Quick Filter Chips & Mark All Read */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold shadow-sm transition-all ${
                filterMode === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilterMode('unread')}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold shadow-sm flex items-center gap-1 transition-all ${
                filterMode === 'unread'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#f97316] text-white text-[10px] flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilterMode('price_drops')}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold shadow-sm transition-all ${
                filterMode === 'price_drops'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              Price Drops
            </button>
          </div>

          <button
            onClick={() => {
              onMarkAllRead();
              onShowToast('All notifications marked as read');
            }}
            className="shrink-0 text-[11px] text-[#9d4300] font-bold flex items-center gap-0.5 hover:opacity-80 transition-opacity"
          >
            <span className="material-symbols-outlined text-[16px]">done_all</span>
            <span>Mark read</span>
          </button>
        </div>

        {/* Section: TODAY */}
        {todayNotifs.length > 0 && (
          <div className="flex flex-col gap-2 pt-1">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-extrabold">
                Today
              </span>
              <span className="text-[11px] text-[#9d4300] font-bold">
                {todayNotifs.filter((n) => !n.isRead).length} New Alerts
              </span>
            </div>

            {todayNotifs.map((notif) => (
              <div
                key={notif.id}
                className={`p-3.5 rounded-2xl shadow-sm transition-all flex gap-3 relative border ${
                  !notif.isRead
                    ? 'bg-[#ffdbca]/25 border-orange-200/60'
                    : 'bg-white border-slate-100'
                }`}
              >
                {!notif.isRead && (
                  <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 rounded-full bg-[#f97316] shadow-[0_0_8px_rgba(249,115,22,0.6)]"></span>
                )}

                {/* Avatar / Icon */}
                <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow-sm overflow-hidden text-white font-black text-[12px]">
                  {notif.storeName?.includes('7-Eleven') ? (
                    <div className="w-full h-full bg-[#007a3d] flex items-center justify-center">
                      7-E
                    </div>
                  ) : notif.type === 'price_drop' ? (
                    <div className="w-full h-full bg-[#f97316] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px]">trending_down</span>
                    </div>
                  ) : notif.storeName?.includes('Big C') ? (
                    <div className="w-full h-full bg-[#ba1a1a] flex items-center justify-center text-xs">
                      BigC
                    </div>
                  ) : (
                    <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">explore</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 min-w-0 pr-3">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[11px] text-[#9d4300] font-bold truncate">
                      {notif.title}
                    </span>
                    <span className="text-slate-400 text-[10px]">• {notif.timestampText}</span>
                  </div>
                  <p className="text-[13px] text-slate-800 leading-snug">{notif.message}</p>

                  {/* Deal Preview Bento Card */}
                  {notif.dealPreview && (
                    <div className="mt-2 flex items-center gap-2.5 bg-white p-2 rounded-xl border border-slate-100 shadow-xs">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                        <img
                          className="w-full h-full object-cover"
                          src={notif.dealPreview.imageUrl}
                          alt={notif.dealPreview.title}
                        />
                        <span className="absolute top-0.5 left-0.5 bg-[#f97316] text-white text-[8px] px-1 rounded font-extrabold">
                          {notif.dealPreview.discountBadge}
                        </span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[12px] font-bold text-slate-900 truncate">
                          {notif.dealPreview.title}
                        </span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-[14px] font-bold text-[#9d4300]">
                            ฿{notif.dealPreview.price}
                          </span>
                          <span className="text-[11px] text-slate-400 line-through">
                            ฿{notif.dealPreview.originalPrice}
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-700 font-bold">
                          {notif.dealPreview.distanceText} • {notif.dealPreview.expiresText}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Highlight pill or walking info */}
                  {notif.routeInfo && (
                    <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                      <span className="material-symbols-outlined text-[14px]">directions_walk</span>
                      <span>{notif.routeInfo}</span>
                    </div>
                  )}

                  {notif.highlightPill && (
                    <div className="mt-1">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                        {notif.highlightPill}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Section: YESTERDAY */}
        {yesterdayNotifs.length > 0 && (
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-extrabold">
                Yesterday
              </span>
            </div>

            {yesterdayNotifs.map((notif) => (
              <div
                key={notif.id}
                className="bg-white p-3.5 rounded-2xl shadow-xs border border-slate-100 flex gap-3"
              >
                <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-600 font-extrabold text-[12px]">
                  {notif.storeName?.includes('Lotus') ? (
                    <span className="text-[#00a39e]">LOTUS</span>
                  ) : (
                    <span className="material-symbols-outlined text-[20px]">explore</span>
                  )}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[11px] text-slate-500 font-bold truncate">
                      {notif.title}
                    </span>
                    <span className="text-slate-400 text-[10px]">• {notif.timestampText}</span>
                  </div>
                  <p className="text-[13px] text-slate-800 leading-snug">{notif.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Delight Card */}
        <div className="py-4 flex flex-col items-center justify-center text-center gap-1">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-1">
            <span className="material-symbols-outlined text-[18px]">verified</span>
          </div>
          <p className="text-[13px] font-bold text-slate-900">You're all caught up!</p>
          <p className="text-[11px] text-slate-500">
            We will buzz you when discount drops break your {preferences.minDiscountPercent}% rule.
          </p>
        </div>
      </div>
    </div>
  );
};
