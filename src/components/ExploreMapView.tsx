import React, { useEffect, useRef, useState } from 'react';
import { Store, Deal, PinnedLocation } from '../types';
import { PRESET_LOCATIONS } from '../data/mockDeals';
import {
  loadGoogleMapsScript,
  searchRealNearbyStores,
  reverseGeocodeLocation,
} from '../services/googleMapsService';

interface ExploreMapViewProps {
  pinnedLocation: PinnedLocation;
  onLocationChange: (loc: PinnedLocation) => void;
  stores: Store[];
  deals: Deal[];
  onSelectStore: (store: Store) => void;
  onSelectDeal: (deal: Deal) => void;
  onShowToast: (msg: string) => void;
}

export const ExploreMapView: React.FC<ExploreMapViewProps> = ({
  pinnedLocation,
  onLocationChange,
  stores,
  deals,
  onSelectStore,
  onSelectDeal,
  onShowToast,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const storeMarkersRef = useRef<any[]>([]);

  const [selectedStore, setSelectedStore] = useState<Store>(stores[0] || null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [mapLayer, setMapLayer] = useState<'roadmap' | 'satellite'>('roadmap');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [isSearchingGmp, setIsSearchingGmp] = useState(false);
  const [isGmpLoaded, setIsGmpLoaded] = useState(false);

  // Sync selected store with store list changes
  useEffect(() => {
    if (stores.length > 0) {
      const match = stores.find((s) => s.id === selectedStore?.id) || stores[0];
      setSelectedStore(match);
    }
  }, [stores]);

  // Initialize Google Maps
  useEffect(() => {
    let isCancelled = false;

    async function initMap() {
      try {
        await loadGoogleMapsScript();
        if (isCancelled || !mapContainerRef.current) return;

        const google = (window as any).google;
        if (!google || !google.maps) return;

        setIsGmpLoaded(true);

        const initialPos = { lat: pinnedLocation.lat, lng: pinnedLocation.lng };

        const map = new google.maps.Map(mapContainerRef.current, {
          center: initialPos,
          zoom: 16,
          mapTypeId: mapLayer,
          disableDefaultUI: true,
          zoomControl: false,
          gestureHandling: 'greedy',
          styles: [
            { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'on' }] },
            { featureType: 'transit', elementType: 'labels.icon', stylers: [{ visibility: 'on' }] },
          ],
        });
        mapInstanceRef.current = map;

        // User center marker
        const userMarker = new google.maps.Marker({
          position: initialPos,
          map: map,
          draggable: true,
          title: 'Your Pinned Area (Drag or click anywhere on map to move)',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 9,
            fillColor: '#f97316',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3,
          },
        });
        userMarkerRef.current = userMarker;

        // On dragging marker
        userMarker.addListener('dragend', async () => {
          const pos = userMarker.getPosition();
          if (pos) {
            const newLat = pos.lat();
            const newLng = pos.lng();
            map.panTo({ lat: newLat, lng: newLng });
            const geo = await reverseGeocodeLocation(newLat, newLng);
            onLocationChange({
              lat: newLat,
              lng: newLng,
              name: geo.name,
              address: geo.address,
            });
            onShowToast(`📍 Moved pin to ${geo.name}`);
          }
        });

        // Click anywhere on map to pin!
        map.addListener('click', async (e: any) => {
          if (e.latLng) {
            const newLat = e.latLng.lat();
            const newLng = e.latLng.lng();
            userMarker.setPosition({ lat: newLat, lng: newLng });
            map.panTo({ lat: newLat, lng: newLng });
            const geo = await reverseGeocodeLocation(newLat, newLng);
            onLocationChange({
              lat: newLat,
              lng: newLng,
              name: geo.name,
              address: geo.address,
            });
            onShowToast(`🎯 Pinned: ${geo.name}`);
          }
        });
      } catch (err) {
        console.warn('Google Maps load error:', err);
      }
    }

    initMap();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Update map layer
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setMapTypeId(mapLayer);
    }
  }, [mapLayer]);

  // Update map center when pinned location changes from outside
  useEffect(() => {
    if (mapInstanceRef.current && userMarkerRef.current) {
      const pos = { lat: pinnedLocation.lat, lng: pinnedLocation.lng };
      mapInstanceRef.current.panTo(pos);
      userMarkerRef.current.setPosition(pos);
    }
  }, [pinnedLocation]);

  // Render store markers on the map
  useEffect(() => {
    const google = (window as any).google;
    if (!mapInstanceRef.current || !google || !google.maps) return;

    // Clear old markers
    storeMarkersRef.current.forEach((m) => m.setMap(null));
    storeMarkersRef.current = [];

    stores.forEach((store) => {
      let pinColor = '#007a3d'; // 7-Eleven
      let labelText = '7';
      if (store.brand === 'Lotus') {
        pinColor = '#00a39e';
        labelText = 'L';
      } else if (store.brand === 'BigC') {
        pinColor = '#e31b23';
        labelText = 'C';
      } else if (store.brand === 'Tops') {
        pinColor = '#f59e0b';
        labelText = 'T';
      } else if (store.brand === 'Gourmet') {
        pinColor = '#7c3aed';
        labelText = 'G';
      }

      const isSelected = selectedStore?.id === store.id;

      const marker = new google.maps.Marker({
        position: { lat: store.lat, lng: store.lng },
        map: mapInstanceRef.current,
        title: store.name,
        icon: {
          path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z',
          fillColor: isSelected ? '#f97316' : pinColor,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: isSelected ? 1.4 : 1.1,
          labelOrigin: new google.maps.Point(0, -30),
        },
        label: {
          text: labelText,
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: '11px',
        },
        zIndex: isSelected ? 100 : 10,
      });

      marker.addListener('click', () => {
        setSelectedStore(store);
        mapInstanceRef.current?.panTo({ lat: store.lat, lng: store.lng });
      });

      storeMarkersRef.current.push(marker);
    });
  }, [stores, selectedStore]);

  // Recenter on user's GPS
  const handleRecenter = () => {
    if (navigator.geolocation) {
      onShowToast('Detecting GPS location...');
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const geo = await reverseGeocodeLocation(lat, lng);
          onLocationChange({
            lat,
            lng,
            name: geo.name || 'Current Location',
            address: geo.address,
          });
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setZoom(16);
            mapInstanceRef.current.panTo({ lat, lng });
          }
          onShowToast(`📍 Centered to ${geo.name}`);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          onShowToast('GPS permission denied, using default Siam Square');
          // Fallback to center
          if (mapInstanceRef.current) {
            mapInstanceRef.current.panTo({ lat: pinnedLocation.lat, lng: pinnedLocation.lng });
          }
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      onShowToast('Geolocation is not supported by your browser');
    }
  };

  // Custom Place Search
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearchingGmp(true);
    onShowToast(`Searching "${searchQuery}" in Google Maps...`);

    try {
      await loadGoogleMapsScript();
      const google = (window as any).google;
      if (google?.maps?.places?.PlacesService) {
        const dummyDiv = document.createElement('div');
        const service = new google.maps.places.PlacesService(dummyDiv);

        service.textSearch(
          {
            query: searchQuery,
            location: new google.maps.LatLng(pinnedLocation.lat, pinnedLocation.lng),
            radius: 5000,
          },
          async (results: any[], status: any) => {
            setIsSearchingGmp(false);
            if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
              const best = results[0];
              const lat = best.geometry.location.lat();
              const lng = best.geometry.location.lng();
              const geo = await reverseGeocodeLocation(lat, lng);
              onLocationChange({
                lat,
                lng,
                name: best.name || geo.name,
                address: best.formatted_address || geo.address,
              });
              if (mapInstanceRef.current) {
                mapInstanceRef.current.panTo({ lat, lng });
                mapInstanceRef.current.setZoom(16);
              }
              onShowToast(`🎯 Found: ${best.name}`);
            } else {
              onShowToast(`No exact match found for "${searchQuery}"`);
            }
          }
        );
      } else {
        setIsSearchingGmp(false);
      }
    } catch {
      setIsSearchingGmp(false);
      onShowToast(`Search unavailable right now`);
    }
  };

  // Filter deals for the selected store
  const storeDeals = deals.filter((d) => {
    if (!selectedStore) return true;
    if (d.storeId === selectedStore.id) return true;
    if (d.storeName.toLowerCase().includes(selectedStore.brand.toLowerCase())) return true;
    return false;
  });

  const previewDeals = storeDeals.length > 0 ? storeDeals.slice(0, 3) : deals.slice(0, 3);

  return (
    <div className="flex flex-col w-full relative select-none max-w-2xl mx-auto">
      {/* Top Floating Controls: Location Selector & Quick Search Strip */}
      <div className="px-4 pt-2 pb-1 flex flex-col gap-2 z-30">
        {/* Proximity & Neighborhood Anchor Pill */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-[0_4px_16px_-2px_rgba(15,23,42,0.06)] hover:bg-slate-50 transition-all active:scale-95 text-left border border-slate-100"
            type="button"
          >
            <span
              className="material-symbols-outlined text-[#f97316] text-[18px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              location_on
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-[12px] text-slate-900 font-bold truncate max-w-[170px]">
                  {pinnedLocation.name}
                </span>
                <span className="material-symbols-outlined text-slate-500 text-[16px]">
                  expand_more
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                <span className="text-[10px] font-bold text-emerald-700">
                  GPS Active • High Accuracy
                </span>
              </div>
            </div>
          </button>

          {/* Active Deals Radar Badge */}
          <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-full shadow-sm border border-slate-100">
            <span
              className="material-symbols-outlined text-[#f97316] text-[16px] animate-spin"
              style={{ animationDuration: '4s' }}
            >
              radar
            </span>
            <span className="text-[11px] text-slate-700 font-bold">
              {stores.reduce((acc, s) => acc + s.activeDealsCount, 0)} nearby
            </span>
          </div>
        </div>

        {/* Floating Search Input Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex items-center bg-white rounded-2xl shadow-[0_8px_24px_-4px_rgba(15,23,42,0.08)] px-3 py-2 transition-all focus-within:shadow-[0_12px_28px_-4px_rgba(249,115,22,0.18)] border border-slate-100"
        >
          <span className="material-symbols-outlined text-slate-400 text-[20px] mr-2">
            search
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
            placeholder="Search 7-Eleven, Big C, Lotus or location..."
            type="text"
          />
          <div className="flex items-center gap-1 shrink-0 ml-1">
            <button
              type="button"
              onClick={() => onShowToast('Voice recognition listening...')}
              aria-label="Voice Search"
              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined text-[18px]">mic</span>
            </button>
            <div className="w-[1px] h-3.5 bg-slate-200 mx-0.5"></div>
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              aria-label="Filter Locations"
              className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
            </button>
          </div>
        </form>

        {/* Category Filter Horizontal Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-4 px-4">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`shrink-0 flex items-center gap-1 px-3.5 py-1.5 rounded-full text-[12px] font-bold shadow-sm transition-all active:scale-95 ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>✨ All Deals</span>
          </button>
          <button
            onClick={() => setSelectedCategory('food')}
            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-bold shadow-sm transition-all active:scale-95 ${
              selectedCategory === 'food'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="text-sm">🍱</span>
            <span>Food & Snacks</span>
            <span className="ml-0.5 bg-[#f97316] text-white text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
              48
            </span>
          </button>
          <button
            onClick={() => setSelectedCategory('beverages')}
            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-bold shadow-sm transition-all active:scale-95 ${
              selectedCategory === 'beverages'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="text-sm">🧃</span>
            <span>Beverages</span>
          </button>
          <button
            onClick={() => setSelectedCategory('household')}
            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-bold shadow-sm transition-all active:scale-95 ${
              selectedCategory === 'household'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="text-sm">🧹</span>
            <span>Household</span>
          </button>
        </div>
      </div>

      {/* Interactive Map Canvas Container */}
      <div className="relative w-full h-[460px] overflow-hidden my-1 bg-[#e5ede9] rounded-2xl shadow-inner border border-slate-200">
        {/* Google Maps div */}
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Top Hint: Pick any location on the map */}
        <div className="absolute top-2 left-3 z-20 pointer-events-none">
          <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md py-1 px-3 rounded-full shadow-sm text-[11px] font-bold text-slate-800 border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Tap anywhere on map to pin area</span>
          </div>
        </div>

        {/* Floating Map Utility Action Dock */}
        <div className="absolute right-3 top-3 flex flex-col gap-2 z-20">
          {/* Re-center GPS */}
          <button
            onClick={handleRecenter}
            aria-label="Re-center location"
            className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md text-[#9d4300] flex items-center justify-center shadow-md hover:bg-white active:scale-90 transition-transform relative group border border-slate-200"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">my_location</span>
            <span className="absolute -left-1 -top-1 w-2.5 h-2.5 rounded-full bg-[#f97316] ring-2 ring-white"></span>
          </button>

          {/* Map Layer Switch */}
          <button
            onClick={() => setMapLayer(mapLayer === 'roadmap' ? 'satellite' : 'roadmap')}
            aria-label="Toggle Satellite / Roadmap"
            className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md text-slate-600 flex items-center justify-center shadow-md hover:text-slate-900 hover:bg-white active:scale-90 transition-transform border border-slate-200"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">layers</span>
          </button>

          {/* Deals Heatmap toggle */}
          <button
            onClick={() => {
              setShowHeatmap(!showHeatmap);
              onShowToast(showHeatmap ? 'Heatmap hidden' : 'Showing flash deals density');
            }}
            aria-label="Deals Heatmap"
            className={`w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md flex items-center justify-center shadow-md hover:bg-white active:scale-90 transition-transform border border-slate-200 ${
              showHeatmap ? 'text-[#f97316] ring-2 ring-[#f97316]' : 'text-slate-600'
            }`}
            type="button"
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_fire_department
            </span>
          </button>
        </div>

        {/* Live Deal Activity Marquee */}
        <div className="absolute left-3 bottom-3 z-20 pointer-events-none">
          <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md py-1 px-3 rounded-full shadow-sm text-[11px] font-bold text-slate-800 border border-slate-200">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Real-time Google Maps connected</span>
          </div>
        </div>
      </div>

      {/* Bottom Sheet Preview Card: Selected Store & Live Hot Deals */}
      {selectedStore && (
        <div className="px-4 -mt-8 relative z-30 pb-4">
          <div className="bg-white rounded-2xl p-4 shadow-[0_12px_36px_-4px_rgba(15,23,42,0.14)] flex flex-col gap-2.5 border border-slate-100">
            {/* Drag / Status Indicator Bar */}
            <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto -mt-1 mb-0.5"></div>

            {/* Store Header & Details Row */}
            <div className="flex items-start justify-between gap-2">
              <div
                onClick={() => onSelectStore(selectedStore)}
                className="flex items-start gap-3 min-w-0 cursor-pointer group"
              >
                {/* Store mini branding avatar */}
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-extrabold text-[14px] shadow-sm shrink-0 ${
                    selectedStore.brand === '7-Eleven'
                      ? 'bg-[#007a3d]'
                      : selectedStore.brand === 'Lotus'
                      ? 'bg-[#00a39e]'
                      : selectedStore.brand === 'BigC'
                      ? 'bg-[#e31b23]'
                      : selectedStore.brand === 'Tops'
                      ? 'bg-[#f59e0b]'
                      : 'bg-purple-600'
                  }`}
                >
                  {selectedStore.brand === '7-Eleven' ? (
                    <span>
                      7<span className="text-[#ed1c24] text-[11px] ml-0.5">11</span>
                    </span>
                  ) : (
                    selectedStore.name.slice(0, 2).toUpperCase()
                  )}
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className="text-[14px] text-slate-900 truncate font-bold group-hover:text-[#9d4300] transition-colors">
                      {selectedStore.name}
                    </h2>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {selectedStore.openHoursText}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-0.5 text-slate-500 text-[12px]">
                    <div className="flex items-center gap-0.5 text-emerald-700 font-bold">
                      <span className="material-symbols-outlined text-[15px]">directions_walk</span>
                      <span>
                        {selectedStore.distanceKm} km ({selectedStore.walkTimeMin} min)
                      </span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-0.5 text-slate-900">
                      <span
                        className="material-symbols-outlined text-[14px] text-amber-500"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                      <span className="font-bold">{selectedStore.rating}</span>
                      <span className="text-slate-400">({selectedStore.reviewCount})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bookmark store button */}
              <button
                onClick={() => {
                  onShowToast(`Store ${selectedStore.name} saved!`);
                }}
                aria-label="Save store"
                className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-[#f97316] transition-all active:scale-90 shrink-0"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">bookmark</span>
              </button>
            </div>

            {/* Micro Flash Banner Notice */}
            <div className="flex items-center justify-between bg-orange-50/70 border border-orange-100 px-3 py-1.5 rounded-xl">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="material-symbols-outlined text-[#f97316] text-[17px] animate-pulse">
                  bolt
                </span>
                <span className="text-[11px] text-slate-800 truncate font-medium">
                  Flash Deals expire in <span className="font-bold text-[#9d4300]">01h 24m</span>
                </span>
              </div>
              <span className="text-[11px] text-[#9d4300] font-bold shrink-0">
                {selectedStore.activeDealsCount} items left
              </span>
            </div>

            {/* Mini Deal Carousel / Thumbnails */}
            <div className="grid grid-cols-3 gap-2 pt-0.5">
              {previewDeals.map((deal) => (
                <div
                  key={deal.id}
                  onClick={() => onSelectDeal(deal)}
                  className="flex flex-col bg-slate-50 rounded-xl p-2 relative group hover:bg-orange-50/50 transition-colors cursor-pointer border border-slate-100"
                >
                  <span className="absolute top-1.5 left-1.5 bg-[#f97316] text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full z-10 shadow-sm">
                    {deal.discountBadge}
                  </span>
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-1.5 bg-slate-200">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      src={deal.imageUrl}
                      alt={deal.title}
                    />
                  </div>
                  <span className="text-[11px] text-slate-900 font-bold truncate">
                    {deal.title}
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-[13px] text-[#9d4300] font-extrabold">
                      ฿{deal.price}
                    </span>
                    <span className="text-[10px] text-slate-400 line-through">
                      ฿{deal.originalPrice}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Footer: View Store Deals Primary CTA */}
            <button
              onClick={() => onSelectStore(selectedStore)}
              className="w-full mt-0.5 py-2.5 px-4 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-[0_8px_20px_-3px_rgba(249,115,22,0.35)] active:scale-[0.98] transition-all"
              type="button"
            >
              <span>View All {selectedStore.activeDealsCount} Store Deals</span>
              <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* Location Picker Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl flex flex-col gap-3 animate-in slide-in-from-bottom-6 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#f97316] text-[22px]">
                  pin_drop
                </span>
                <h3 className="text-[16px] font-bold text-slate-900">
                  Select Pinned Area
                </h3>
              </div>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="text-[12px] text-slate-500">
              Pick a shopping neighborhood or tap any street directly on the Google Map to view real-time stores and inventory.
            </p>

            {/* Quick GPS button */}
            <button
              onClick={() => {
                setIsLocationModalOpen(false);
                handleRecenter();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-orange-50 text-[#9d4300] font-bold text-[13px] flex items-center justify-center gap-2 border border-orange-200 active:scale-98 transition-transform"
            >
              <span className="material-symbols-outlined text-[18px]">my_location</span>
              <span>Use Current GPS Location</span>
            </button>

            {/* Preset districts */}
            <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto no-scrollbar pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Popular Shopping Districts
              </span>
              {PRESET_LOCATIONS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    onLocationChange({
                      lat: preset.lat,
                      lng: preset.lng,
                      name: preset.name,
                      address: preset.desc,
                    });
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.panTo({ lat: preset.lat, lng: preset.lng });
                      mapInstanceRef.current.setZoom(16);
                    }
                    setIsLocationModalOpen(false);
                    onShowToast(`📍 Pinned to ${preset.name}`);
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                    pinnedLocation.name === preset.name
                      ? 'bg-[#ffdbca] text-[#341100] font-bold ring-1 ring-[#f97316]'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold">{preset.name}</span>
                    <span className="text-[11px] text-slate-500">{preset.desc}</span>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-[#f97316]">
                    chevron_right
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
