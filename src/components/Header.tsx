import React from 'react';

interface HeaderProps {
  title: string;
  unreadNotifsCount: number;
  onNotificationsClick: () => void;
  onProfileClick?: () => void;
  backAction?: () => void;
  showShare?: boolean;
  onShare?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  unreadNotifsCount,
  onNotificationsClick,
  onProfileClick,
  backAction,
  showShare,
  onShare,
}) => {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
      <div className="h-16 px-4 flex items-center justify-between gap-2 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-2 min-w-0">
          {backAction ? (
            <button
              onClick={backAction}
              aria-label="Go back"
              className="w-10 h-10 -ml-1 rounded-full flex items-center justify-center text-slate-800 hover:bg-slate-100 transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
          ) : null}

          <img
            alt="DealSpot Logo"
            className="h-8 w-auto object-contain shrink-0"
            src="https://lh3.googleusercontent.com/aida/AEtjO1XJfQPGp8RHpC628G13Q_jHpUjtkcm5EaZImKiyGn3dFlHeOMIhjKQhN9dn4qXubi1zk8wyRAzX8Mtle_Aw6Y3om06Md3CzU4WDJOU_Kyvs5kpvGn7cMRJM1qK6qA6vfiNlak63vsEvCFpT6xrZ4jtoUduREPPbk8t61XQMscE45SwZieHxZxs1CjVPzA33Aw6nWUpUZUwnkWGwBvvxA3FzsmXCpxE3si5-D70LOS0dYR2W9aJKQCHjieY"
          />

          <div className="flex flex-col min-w-0">
            <span className="text-[10px] uppercase tracking-wider text-[#9d4300] font-bold truncate leading-none">
              DealSpot
            </span>
            <h1 className="text-[16px] font-bold text-slate-900 truncate leading-tight mt-0.5">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {showShare && onShare ? (
            <button
              onClick={onShare}
              aria-label="Share"
              className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">share</span>
            </button>
          ) : null}

          <button
            onClick={onNotificationsClick}
            aria-label="Notifications"
            className="relative w-11 h-11 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">notifications</span>
            {unreadNotifsCount > 0 ? (
              <span className="absolute top-2 right-2 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-[#ba1a1a] text-white text-[10px] font-bold rounded-full leading-none shadow-[0_2px_4px_rgba(186,26,26,0.3)] animate-pulse">
                {unreadNotifsCount}
              </span>
            ) : null}
          </button>

          <button
            onClick={onProfileClick || onNotificationsClick}
            aria-label="Account Profile"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:ring-2 hover:ring-orange-400 transition-all"
          >
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover shadow-sm ring-1 ring-slate-200"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcKr8u4hSxXlAD0lsDgc7PWXYBUblJpagST7hyVWQxjtLdGp6DbhaSUMj4Pu7s3wO6BRngYxPQ0R-_8XtXKvZQQQhjFX4UOMS_h4h0wahQIng1WhPqbsiRrkqFJS6EOnt0AMW5ka-n9shYj0PRHdLMER_jan5qI5n42hXmagm2znLZRegYaJCNB-cq5qpzRh2bHMSBrPg-cyiuBhzQ6Nace2O7mRD63zrPBBT95zDx77qVqgQG38O4"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
