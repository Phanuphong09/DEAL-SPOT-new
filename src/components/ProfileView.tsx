import React from 'react';
import { PinnedLocation, AlertPreferences } from '../types';

interface ProfileViewProps {
  pinnedLocation: PinnedLocation;
  preferences: AlertPreferences;
  onOpenLocationPicker: () => void;
  onOpenAlertPreferences: () => void;
  onShowToast: (msg: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  pinnedLocation,
  preferences,
  onOpenLocationPicker,
  onOpenAlertPreferences,
  onShowToast,
}) => {
  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto px-4 pt-3 pb-24 gap-4">
      {/* User Hero Profile Card */}
      <div className="bg-white rounded-3xl p-5 shadow-sm flex items-center gap-4 border border-slate-100">
        <div className="relative">
          <img
            alt="Alex Chen Profile"
            className="w-16 h-16 rounded-full object-cover ring-4 ring-orange-100"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcKr8u4hSxXlAD0lsDgc7PWXYBUblJpagST7hyVWQxjtLdGp6DbhaSUMj4Pu7s3wO6BRngYxPQ0R-_8XtXKvZQQQhjFX4UOMS_h4h0wahQIng1WhPqbsiRrkqFJS6EOnt0AMW5ka-n9shYj0PRHdLMER_jan5qI5n42hXmagm2znLZRegYaJCNB-cq5qpzRh2bHMSBrPg-cyiuBhzQ6Nace2O7mRD63zrPBBT95zDx77qVqgQG38O4"
          />
          <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white"></span>
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-[17px] font-bold text-slate-900 truncate">Alex Chen</h2>
            <span className="bg-[#ffdbca] text-[#783200] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              VIP Hunter
            </span>
          </div>
          <span className="text-[12px] text-slate-500">Bangkok, Thailand</span>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-[#9d4300] font-bold">
            <span className="material-symbols-outlined text-[15px]">military_tech</span>
            <span>Level 4 Neighborhood Explorer</span>
          </div>
        </div>
      </div>

      {/* Savings Counter Metrics */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-100 flex flex-col items-center text-center">
          <span className="text-[20px] font-black text-[#9d4300]">฿1,420</span>
          <span className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">
            Saved this month
          </span>
        </div>
        <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-100 flex flex-col items-center text-center">
          <span className="text-[20px] font-black text-slate-900">18</span>
          <span className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">
            Deals Claimed
          </span>
        </div>
        <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-100 flex flex-col items-center text-center">
          <span className="text-[20px] font-black text-emerald-700">4</span>
          <span className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">
            Stores Followed
          </span>
        </div>
      </div>

      {/* Active Pinned Neighborhood Anchor */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#f97316] text-[20px]">
              location_on
            </span>
            <span className="text-[13px] font-bold text-slate-900">Current Pinned Area</span>
          </div>
          <button
            onClick={onOpenLocationPicker}
            className="text-[12px] text-[#9d4300] font-bold hover:underline"
          >
            Change Pin
          </button>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
          <div className="flex flex-col min-w-0">
            <span className="text-[14px] font-bold text-slate-900 truncate">
              {pinnedLocation.name}
            </span>
            <span className="text-[11px] text-slate-500 truncate">{pinnedLocation.address}</span>
          </div>
          <span className="material-symbols-outlined text-slate-400 text-[18px]">
            arrow_forward_ios
          </span>
        </div>
      </div>

      {/* Real-time Google Maps Status */}
      <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">map</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-bold text-emerald-950">
                Google Maps API Active
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </div>
            <span className="text-[11px] text-emerald-800">
              Real-time store radius &amp; distance calculation enabled
            </span>
          </div>
        </div>
      </div>

      {/* Preferences List */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
        <button
          onClick={onOpenAlertPreferences}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors border-b border-slate-100"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-slate-600 text-[20px]">
              notifications_active
            </span>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-slate-900">Alert Preferences</span>
              <span className="text-[11px] text-slate-500">
                Min {preferences.minDiscountPercent}% discount • {preferences.proximityRadiusKm} km
              </span>
            </div>
          </div>
          <span className="material-symbols-outlined text-slate-400 text-[18px]">
            chevron_right
          </span>
        </button>

        <button
          onClick={() => onShowToast('Thai / English language toggle')}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors border-b border-slate-100"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-slate-600 text-[20px]">translate</span>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-slate-900">Language / ภาษา</span>
              <span className="text-[11px] text-slate-500">English (EN) / ภาษาไทย (TH)</span>
            </div>
          </div>
          <span className="text-[12px] font-bold text-slate-400">EN</span>
        </button>

        <button
          onClick={() => onShowToast('All real-time data verified with Google Maps')}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-slate-600 text-[20px]">info</span>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-slate-900">About DealSpot</span>
              <span className="text-[11px] text-slate-500">v2.4.0 • Google Maps Platform</span>
            </div>
          </div>
          <span className="material-symbols-outlined text-slate-400 text-[18px]">
            chevron_right
          </span>
        </button>
      </div>
    </div>
  );
};
