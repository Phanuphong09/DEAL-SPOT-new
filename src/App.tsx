/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Store, Deal, NotificationItem, PinnedLocation, AlertPreferences } from './types';
import {
  INITIAL_PIN,
  INITIAL_STORES,
  INITIAL_DEALS,
  INITIAL_NOTIFICATIONS,
  DEFAULT_ALERT_PREFERENCES,
} from './data/mockDeals';
import { Header } from './components/Header';
import { BottomNav, TabKey } from './components/BottomNav';
import { ExploreMapView } from './components/ExploreMapView';
import { DealsFeedView } from './components/DealsFeedView';
import { SavedDealsView } from './components/SavedDealsView';
import { NotificationsView } from './components/NotificationsView';
import { ProfileView } from './components/ProfileView';
import { StoreDetailsModal } from './components/StoreDetailsModal';
import { DealDetailsModal } from './components/DealDetailsModal';
import { Toast } from './components/Toast';
import { searchRealNearbyStores } from './services/googleMapsService';
import { generateDealsForLocation, generateNotificationsForLocation } from './services/dealsService';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('map');
  const [pinnedLocation, setPinnedLocation] = useState<PinnedLocation>(INITIAL_PIN);
  const [stores, setStores] = useState<Store[]>(INITIAL_STORES);
  const [deals, setDeals] = useState<Deal[]>(() => generateDealsForLocation(INITIAL_STORES, INITIAL_PIN, INITIAL_DEALS));
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [preferences, setPreferences] = useState<AlertPreferences>(DEFAULT_ALERT_PREFERENCES);

  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dynamic real-time fetch when pinned location changes
  useEffect(() => {
    let isCancelled = false;

    async function updateStoresForLocation() {
      try {
        const liveStores = await searchRealNearbyStores(
          pinnedLocation.lat,
          pinnedLocation.lng,
          preferences.proximityRadiusKm * 1000,
          pinnedLocation.name
        );

        if (!isCancelled && liveStores.length > 0) {
          setStores(liveStores);

          // Dynamically generate deals for stores in the selected area
          setDeals((prevDeals) =>
            generateDealsForLocation(liveStores, pinnedLocation, prevDeals)
          );

          // Update alerts and notifications tailored to this area
          setNotifications((prevNotifs) => {
            const tempDeals = generateDealsForLocation(liveStores, pinnedLocation, []);
            const areaNotifs = generateNotificationsForLocation(liveStores, tempDeals, pinnedLocation);
            return [...areaNotifs, ...prevNotifs.filter((n) => n.isRead)];
          });
        }
      } catch (e) {
        console.warn('Error fetching live stores for location:', e);
      }
    }

    updateStoresForLocation();

    return () => {
      isCancelled = true;
    };
  }, [pinnedLocation.lat, pinnedLocation.lng, pinnedLocation.name, preferences.proximityRadiusKm]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  };

  const handleToggleFavorite = (dealId: string) => {
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, isFavorited: !d.isFavorited } : d))
    );
  };

  const handleToggleFollowStore = (storeId: string) => {
    setStores((prev) =>
      prev.map((s) => (s.id === storeId ? { ...s, isFollowing: !s.isFollowing } : s))
    );
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const favoritesCount = deals.filter((d) => d.isFavorited).length;
  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  const tabTitle =
    activeTab === 'map'
      ? 'Explore Map'
      : activeTab === 'deals'
      ? 'Deals Feed'
      : activeTab === 'favorites'
      ? 'Saved Deals'
      : 'Account Profile';

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header */}
      <Header
        title={tabTitle}
        unreadNotifsCount={unreadNotifsCount}
        onNotificationsClick={() => {
          setActiveTab('profile');
          showToast('Viewing alerts & profile');
        }}
        onProfileClick={() => setActiveTab('profile')}
      />

      {/* Main Content Area (padding-top accounts for fixed header) */}
      <main className="flex-1 w-full pt-16">
        {activeTab === 'map' && (
          <ExploreMapView
            pinnedLocation={pinnedLocation}
            onLocationChange={(loc) => setPinnedLocation(loc)}
            stores={stores}
            deals={deals}
            onSelectStore={(store) => setSelectedStore(store)}
            onSelectDeal={(deal) => setSelectedDeal(deal)}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'deals' && (
          <DealsFeedView
            deals={deals}
            pinnedLocation={pinnedLocation}
            onSelectDeal={(deal) => setSelectedDeal(deal)}
            onToggleFavorite={handleToggleFavorite}
            onNavigateToMap={() => setActiveTab('map')}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'favorites' && (
          <SavedDealsView
            deals={deals}
            stores={stores}
            onSelectDeal={(deal) => setSelectedDeal(deal)}
            onSelectStore={(store) => setSelectedStore(store)}
            onToggleFavorite={handleToggleFavorite}
            onToggleFollowStore={handleToggleFollowStore}
            onNavigateToMap={() => setActiveTab('map')}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'profile' && (
          <div className="flex flex-col">
            <ProfileView
              pinnedLocation={pinnedLocation}
              preferences={preferences}
              onOpenLocationPicker={() => {
                setActiveTab('map');
                showToast('Tap any location or marker on the map to pin!');
              }}
              onOpenAlertPreferences={() => {
                showToast('Adjust alert preferences in the notification drawer');
              }}
              onShowToast={showToast}
            />

            {/* Notification Drawer section embedded in profile */}
            <div className="border-t border-slate-200 mt-2 pt-2">
              <NotificationsView
                notifications={notifications}
                pinnedLocation={pinnedLocation}
                onMarkAllRead={handleMarkAllNotificationsRead}
                onOpenPreferences={() => {}}
                onShowToast={showToast}
                preferences={preferences}
                onUpdatePreferences={(newPrefs) => setPreferences(newPrefs)}
              />
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {selectedStore && (
        <StoreDetailsModal
          store={selectedStore}
          deals={deals}
          onClose={() => setSelectedStore(null)}
          onSelectDeal={(deal) => setSelectedDeal(deal)}
          onToggleFollow={handleToggleFollowStore}
          onShowToast={showToast}
        />
      )}

      {selectedDeal && (
        <DealDetailsModal
          deal={selectedDeal}
          stores={stores}
          onClose={() => setSelectedDeal(null)}
          onToggleFavorite={handleToggleFavorite}
          onOpenStore={(store) => {
            setSelectedDeal(null);
            setSelectedStore(store);
          }}
          onShowToast={showToast}
        />
      )}

      {/* Toast popup */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* Floating Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        favoritesCount={favoritesCount}
      />
    </div>
  );
}
