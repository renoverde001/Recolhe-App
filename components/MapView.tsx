import React, { useEffect, useRef } from 'react';
import { Navigation, ShoppingCart, Loader2, Truck, Trash2 } from 'lucide-react';
import { UserRole, Language } from '../types';
import { translations } from '../utils/translations';

declare global {
  interface Window {
    L: any;
  }
}

interface MapViewProps {
  role: UserRole;
  language: Language;
  isDarkMode: boolean;
}

const BISSAU_CENTER = { lat: 11.8632, lng: -15.5984 };

// Static data for Bissau locations
const MOCK_MARKETS = [
  { name: "Comercial Santy", lat: 11.858, lng: -15.590 },
  { name: "Supermercado Darling", lat: 11.865, lng: -15.600 },
  { name: "Ghada Supermercado", lat: 11.862, lng: -15.595 },
  { name: "Chapa de Bissau Supermercado", lat: 11.860, lng: -15.585 },
  { name: "MiniMercado Alvalade", lat: 11.870, lng: -15.590 },
  { name: "Spar Supermercado", lat: 11.855, lng: -15.592 }
];

const MOCK_BINS = [
  { name: "Smart Bin #8842 (Full)", lat: 11.864, lng: -15.599, status: 'full' },
  { name: "Smart Bin #8845", lat: 11.862, lng: -15.596, status: 'ok' }
];

const MOCK_COLLECTIONS = [
  { name: "Pickup: Av. Amílcar Cabral", lat: 11.860, lng: -15.597 },
  { name: "Pickup: Rua 12", lat: 11.866, lng: -15.601 }
];

const MapView: React.FC<MapViewProps> = ({ role, language, isDarkMode }) => {
  const t = translations[language];
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);

  const isCollector = role === UserRole.COLLECTOR;

  useEffect(() => {
    // Ensure Leaflet is loaded
    if (!window.L || !mapContainerRef.current) return;

    // Initialize Map only once
    if (!mapInstanceRef.current) {
      const map = window.L.map(mapContainerRef.current).setView([BISSAU_CENTER.lat, BISSAU_CENTER.lng], 14);
      mapInstanceRef.current = map;

      // Add User Marker
      const userIcon = window.L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #10b981; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
      
      window.L.marker([BISSAU_CENTER.lat, BISSAU_CENTER.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup("<b>You are here</b>");

      // Add Markers based on role
      if (isCollector) {
        // Collectors see Bins and Pickups
        MOCK_BINS.forEach(bin => {
          const color = bin.status === 'full' ? '#ef4444' : '#3b82f6';
          const icon = window.L.divIcon({
            html: `<div style="background-color: ${color}; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 2px solid white;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></div>`,
            className: '',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });
          window.L.marker([bin.lat, bin.lng], { icon }).addTo(map).bindPopup(bin.name);
        });

        MOCK_COLLECTIONS.forEach(col => {
          const icon = window.L.divIcon({
            html: `<div style="background-color: #f59e0b; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 2px solid white;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div>`,
            className: '',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });
          window.L.marker([col.lat, col.lng], { icon }).addTo(map).bindPopup(col.name);
        });

      } else {
        // Users see Supermarkets (Points of Interest)
        MOCK_MARKETS.forEach(market => {
            const icon = window.L.divIcon({
              html: `<div style="background-color: #ef4444; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.2);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg></div>`,
              className: '',
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            });
            window.L.marker([market.lat, market.lng], { icon }).addTo(map).bindPopup(market.name);
        });
      }
    }
  }, [isCollector]); // Re-init markers if role changes drastically (though map instance persists)

  // Handle Theme Changes (Switch Tile Layers)
  useEffect(() => {
    if (mapInstanceRef.current) {
      if (tileLayerRef.current) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
      }

      // CartoDB Positron (Light) vs Dark Matter (Dark) - Free for non-commercial use
      const tileUrl = isDarkMode 
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      
      const layer = window.L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      });

      layer.addTo(mapInstanceRef.current);
      tileLayerRef.current = layer;
    }
  }, [isDarkMode]);

  return (
    <div className="h-[calc(100vh-160px)] bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden relative border border-slate-200 dark:border-slate-700 shadow-sm animate-fade-in">
      
      {/* Map Container */}
      <div ref={mapContainerRef} id="map-container" className="w-full h-full z-0" />

      {/* Map Controls Overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-[400]">
         <button 
            onClick={() => mapInstanceRef.current?.setView([BISSAU_CENTER.lat, BISSAU_CENTER.lng], 14)}
            className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            title="Recenter"
         >
            <Navigation className="w-5 h-5" />
         </button>
      </div>

      {/* Map Legend / Status Overlay */}
      <div className="absolute top-4 left-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 max-w-xs z-[400]">
          <h3 className="font-bold text-slate-900 dark:text-white mb-2">
            {isCollector ? t.map.routeStatus : "Bissau Local Map (OSM)"}
          </h3>
          <div className="space-y-3">
            {isCollector ? (
              <>
                <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                   <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px]">
                      <Trash2 size={14} />
                   </div>
                   <span>{t.map.smartBins} (Available)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                   <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-[10px]">
                      <Trash2 size={14} />
                   </div>
                   <span>{t.map.smartBins} (Full)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                   <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white text-[10px]">
                      <Truck size={14} />
                   </div>
                   <span>{t.map.pending}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                   <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm"></div>
                   <span>Your Location</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                   <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-[10px]">
                      <ShoppingCart size={14} />
                   </div>
                   <span>Supermarkets</span>
                </div>
              </>
            )}
          </div>
      </div>
    </div>
  );
};

export default MapView;