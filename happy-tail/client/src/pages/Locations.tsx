import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, TreePine, Coffee, Stethoscope, Ban, ShieldAlert, Star, Clock, Phone, MessageSquare, Store, Scissors, Locate, Loader2, ChevronRight, AlertTriangle, X, Sparkles, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/language-context";

interface Place {
  id: string;
  name: string;
  type: "park" | "cafe" | "vet" | "restricted" | "petstore" | "grooming";
  address: string;
  area: string;
  latitude: number;
  longitude: number;
  description: string;
  rules?: string;
  timing?: string;
  phone?: string;
  whatsapp?: string;
  rating?: number;
}

const placeTypeConfig: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  park: { label: "Park", color: "text-green-700", bgColor: "bg-green-50", borderColor: "border-green-200" },
  cafe: { label: "Café", color: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
  vet: { label: "Vet", color: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
  restricted: { label: "Restricted", color: "text-red-700", bgColor: "bg-red-50", borderColor: "border-red-200" },
  petstore: { label: "Pet Store", color: "text-purple-700", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
  grooming: { label: "Grooming", color: "text-pink-700", bgColor: "bg-pink-50", borderColor: "border-pink-200" },
};

const typeIcons: Record<string, any> = {
  park: TreePine,
  cafe: Coffee,
  vet: Stethoscope,
  restricted: Ban,
  petstore: Store,
  grooming: Scissors,
};

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m away`;
  return `${km.toFixed(1)} km away`;
}

function PlaceCard({ place, distance, onSelect }: { place: Place; distance?: number; onSelect: () => void }) {
  const Icon = typeIcons[place.type] || MapPin;
  const config = placeTypeConfig[place.type] || { label: place.type, color: "text-gray-700", bgColor: "bg-gray-50", borderColor: "border-gray-200" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover-elevate transition-all cursor-pointer overflow-hidden"
      onClick={onSelect}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl ${config.bgColor} ${config.color} flex items-center justify-center shrink-0`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-bold text-gray-800 text-base leading-tight">{place.name}</h3>
              <Badge className={`shrink-0 text-xs border ${config.bgColor} ${config.color} ${config.borderColor}`}>
                {config.label}
              </Badge>
            </div>
            <p className="text-gray-400 text-xs mb-2 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {place.area}
            </p>
            <p className="text-gray-500 text-sm line-clamp-2 mb-3">{place.description}</p>
            <div className="flex items-center gap-3 flex-wrap">
              {distance !== undefined && (
                <span className="text-xs font-bold text-primary flex items-center gap-1">
                  <Navigation className="w-3 h-3" /> {formatDistance(distance)}
                </span>
              )}
              {place.rating && (
                <span className="text-xs text-amber-600 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {place.rating}
                </span>
              )}
              {place.timing && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {place.timing}
                </span>
              )}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300 shrink-0 mt-1" />
        </div>
      </div>
    </motion.div>
  );
}

function PlaceDetail({ place, distance, onClose }: { place: Place; distance?: number; onClose: () => void }) {
  const Icon = typeIcons[place.type] || MapPin;
  const config = placeTypeConfig[place.type] || { label: place.type, color: "text-gray-700", bgColor: "bg-gray-50", borderColor: "border-gray-200" };
  const isRestricted = place.type === "restricted";
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className={`p-6 ${isRestricted ? "bg-red-50" : config.bgColor} rounded-t-3xl`}>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-2xl ${isRestricted ? "bg-red-100 text-red-600" : `${config.bgColor} ${config.color}`} flex items-center justify-center`}>
                <Icon className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-display text-gray-800">{place.name}</h2>
                <Badge className={`text-xs border mt-1 ${config.bgColor} ${config.color} ${config.borderColor}`}>
                  {config.label}
                </Badge>
              </div>
            </div>
            <Button size="icon" variant="ghost" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          {distance !== undefined && (
            <div className="flex items-center gap-2 text-sm font-bold text-primary">
              <Navigation className="w-4 h-4" /> {formatDistance(distance)}
            </div>
          )}
        </div>

        <div className="p-6 space-y-4">
          <p className="text-gray-600 leading-relaxed">{place.description}</p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <span className="text-gray-600">{place.address}</span>
            </div>
            {place.timing && (
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-gray-600">{place.timing}</span>
              </div>
            )}
            {place.rating && (
              <div className="flex items-center gap-3 text-sm">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                <span className="text-gray-600">{place.rating} / 5.0</span>
              </div>
            )}
          </div>

          {place.rules && (
            <div className={`p-4 rounded-xl border ${isRestricted ? "bg-red-50 border-red-100" : "bg-amber-50 border-amber-100"}`}>
              <p className={`text-xs font-bold mb-1 ${isRestricted ? "text-red-700" : "text-amber-700"}`}>
                {t.locations.rules}
              </p>
              <p className={`text-sm ${isRestricted ? "text-red-600" : "text-amber-600"}`}>{place.rules}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1 rounded-xl"
              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`, '_blank')}
            >
              <Navigation className="w-4 h-4 mr-2" /> {t.locations.directions}
            </Button>
            {place.phone && (
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => window.location.href = `tel:${place.phone}`}
              >
                <Phone className="w-4 h-4" />
              </Button>
            )}
            {place.whatsapp && (
              <Button
                variant="outline"
                className="rounded-xl border-green-300 text-green-600"
                onClick={() => {
                  const msg = encodeURIComponent(`Hi, I'd like to know about your services for my dog.`);
                  window.open(`https://wa.me/${place.whatsapp?.replace(/[^0-9]/g, '')}?text=${msg}`, '_blank');
                }}
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function GeofenceAlert({ place, distance, onDismiss }: { place: Place; distance: number; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-red-500 text-white rounded-2xl p-4 flex items-center gap-4 shadow-lg shadow-red-500/20 mb-6"
    >
      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm">Geofencing Alert</p>
        <p className="text-red-100 text-xs">You are {formatDistance(distance)} from <strong>{place.name}</strong> - a restricted zone. Keep your dog leashed.</p>
      </div>
      <Button size="icon" variant="ghost" onClick={onDismiss} className="text-white shrink-0">
        <X className="w-4 h-4" />
      </Button>
    </motion.div>
  );
}

export default function Locations() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "granted" | "denied">("idle");
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [places, setPlaces] = useState<Place[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const { toast } = useToast();
  const { t } = useLanguage();
  const fetchingRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const initRef = useRef(false);

  const categoryTabs = [
    { key: "all", label: t.locations.allPlaces, icon: MapPin },
    { key: "park", label: t.locations.parks, icon: TreePine },
    { key: "cafe", label: t.locations.cafes, icon: Coffee },
    { key: "vet", label: t.locations.vets, icon: Stethoscope },
    { key: "restricted", label: t.locations.restricted, icon: Ban },
    { key: "petstore", label: t.locations.petStores, icon: Store },
    { key: "grooming", label: t.locations.grooming, icon: Scissors },
  ];

  const fetchNearbyPlaces = useCallback(async (lat: number, lng: number, force = false) => {
    if (fetchingRef.current && !force) return;

    if (abortRef.current) {
      abortRef.current.abort();
    }
    fetchingRef.current = true;
    const controller = new AbortController();
    abortRef.current = controller;

    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/locations/nearby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: lat, longitude: lng }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Failed to find places");
      const data = await res.json();
      if (!controller.signal.aborted) {
        setPlaces(Array.isArray(data) ? data : []);
        setAiLoading(false);
        toast({ title: "Places found!", description: `Found ${Array.isArray(data) ? data.length : 0} dog-friendly places near you.` });
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      console.error("Failed to fetch nearby places:", err);
      if (!controller.signal.aborted) {
        setAiError("Couldn't find places. Please try again.");
        setAiLoading(false);
        toast({ title: "Error", description: "Couldn't find nearby places. Please retry.", variant: "destructive" });
      }
    } finally {
      fetchingRef.current = false;
    }
  }, [toast]);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`);
      const data = await res.json();
      const city = data.address?.city || data.address?.town || data.address?.state_district || data.address?.state || "";
      setLocationName(city);
    } catch {
      setLocationName("");
    }
  };

  const loadDefaultLocation = useCallback(async (force = false) => {
    try {
      const res = await fetch("https://ipapi.co/json/");
      const data = await res.json();
      if (data.latitude && data.longitude && data.city) {
        const loc = { lat: data.latitude, lng: data.longitude };
        setUserLocation(loc);
        setLocationName(data.city);
        fetchNearbyPlaces(loc.lat, loc.lng, force);
        return;
      }
    } catch {
      // fall through to hardcoded default
    }
    const defaultLoc = { lat: 28.6139, lng: 77.2090 };
    setUserLocation(defaultLoc);
    setLocationName("New Delhi");
    fetchNearbyPlaces(defaultLoc.lat, defaultLoc.lng, force);
  }, [fetchNearbyPlaces]);

  const requestLocation = useCallback((userInitiated = false) => {
    if (!("geolocation" in navigator)) {
      setLocationStatus("denied");
      loadDefaultLocation(userInitiated);
      return;
    }
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setLocationStatus("granted");
        reverseGeocode(loc.lat, loc.lng);
        fetchNearbyPlaces(loc.lat, loc.lng, userInitiated);
      },
      () => {
        setLocationStatus("denied");
        loadDefaultLocation(userInitiated);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [toast, fetchNearbyPlaces, loadDefaultLocation]);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    requestLocation();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const placesWithDistance = useMemo(() => {
    if (!userLocation || places.length === 0) return places.map(p => ({ ...p, distance: undefined as number | undefined }));
    return places
      .map(p => ({
        ...p,
        distance: calculateDistance(userLocation.lat, userLocation.lng, p.latitude, p.longitude),
      }))
      .sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));
  }, [userLocation, places]);

  const filteredPlaces = activeTab === "all"
    ? placesWithDistance
    : placesWithDistance.filter(p => p.type === activeTab);

  const nearbyRestricted = placesWithDistance.filter(p => p.type === "restricted" && p.distance !== undefined && p.distance < 2 && !dismissedAlerts.has(p.id));

  const selectedDistance = selectedPlace && userLocation
    ? calculateDistance(userLocation.lat, userLocation.lng, selectedPlace.latitude, selectedPlace.longitude)
    : undefined;

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: places.length };
    places.forEach(p => { counts[p.type] = (counts[p.type] || 0) + 1; });
    return counts;
  }, [places]);

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title={t.locations.title}
        description={t.locations.subtitle}
      />

      <AnimatePresence>
        {nearbyRestricted.map(place => (
          <GeofenceAlert
            key={place.id}
            place={place}
            distance={place.distance!}
            onDismiss={() => setDismissedAlerts(prev => new Set(prev).add(place.id))}
          />
        ))}
      </AnimatePresence>

      <div className="mb-6 flex items-center gap-3 flex-wrap">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm ${
          locationStatus === "granted" ? "bg-green-50 text-green-700 border border-green-200" :
          locationStatus === "denied" ? "bg-amber-50 text-amber-700 border border-amber-200" :
          locationStatus === "loading" ? "bg-blue-50 text-blue-700 border border-blue-200" :
          "bg-gray-50 text-gray-600 border border-gray-200"
        }`}>
          {locationStatus === "loading" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : locationStatus === "granted" ? (
            <Locate className="w-4 h-4" />
          ) : locationStatus === "denied" ? (
            <MapPin className="w-4 h-4" />
          ) : (
            <MapPin className="w-4 h-4" />
          )}
          <span className="font-medium">
            {locationStatus === "granted" ? (locationName ? `Near ${locationName}` : "Location detected") :
             locationStatus === "denied" ? (locationName ? `Showing: ${locationName}` : "Using default location") :
             locationStatus === "loading" ? "Finding your location..." :
             "Location pending"}
          </span>
        </div>
        {locationStatus === "denied" && (
          <Button variant="outline" size="sm" onClick={() => requestLocation(true)} className="rounded-xl text-xs">
            <Locate className="w-3 h-3 mr-1" /> Use My Location
          </Button>
        )}
        {(locationStatus === "granted" || locationStatus === "denied") && !aiLoading && places.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => userLocation && fetchNearbyPlaces(userLocation.lat, userLocation.lng, true)} className="rounded-xl text-xs">
            <RefreshCw className="w-3 h-3 mr-1" /> Refresh Places
          </Button>
        )}
      </div>

      {aiLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-primary/5 border border-primary/10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <div className="text-left">
              <p className="font-bold text-gray-800">Finding dog-friendly places near you...</p>
              <p className="text-sm text-gray-500">Our AI is searching for parks, cafes, vets & more</p>
            </div>
          </div>
        </motion.div>
      )}

      {aiError && !aiLoading && (
        <div className="text-center py-16">
          <AlertTriangle className="w-16 h-16 text-amber-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-600 mb-2">Couldn't find places</h3>
          <p className="text-gray-400 mb-4">{aiError}</p>
          <Button onClick={() => requestLocation(true)} className="rounded-xl">
            <RefreshCw className="w-4 h-4 mr-2" /> Try Again
          </Button>
        </div>
      )}

      {!aiLoading && !aiError && places.length === 0 && locationStatus !== "loading" && (
        <div className="text-center py-16">
          <Locate className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-600 mb-2">Finding places...</h3>
          <p className="text-gray-400 mb-4">Detecting your location to find nearby dog-friendly places.</p>
          <Button onClick={() => requestLocation(true)} className="rounded-xl">
            <Locate className="w-4 h-4 mr-2" /> Detect My Location
          </Button>
        </div>
      )}

      {!aiLoading && !aiError && places.length > 0 && (
        <>
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs text-gray-500 font-medium">AI-powered suggestions based on your live location</span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
            {categoryTabs.map(tab => {
              const count = categoryCounts[tab.key] || 0;
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.key
                      ? "bg-primary text-white shadow-sm"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key ? "bg-white/20" : "bg-gray-200 text-gray-500"
                  }`}>{count}</span>
                </button>
              );
            })}
          </div>

          <p className="text-xs text-gray-400 mb-4">
            {filteredPlaces.length} {t.locations.allPlaces}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPlaces.map(place => (
              <PlaceCard
                key={place.id}
                place={place}
                distance={place.distance}
                onSelect={() => setSelectedPlace(place)}
              />
            ))}
          </div>

          {filteredPlaces.length === 0 && (
            <div className="text-center py-16">
              <MapPin className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400">{t.locations.noResults}</h3>
            </div>
          )}
        </>
      )}

      <div className="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-100">
        <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" /> About Geofencing
        </h3>
        <p className="text-blue-700 text-sm leading-relaxed">
          When you're near a restricted zone (within 2 km), you'll see an alert at the top of this page.
          Always check local rules before visiting any location with your dog. Keep your dog leashed in unfamiliar areas.
        </p>
      </div>

      <AnimatePresence>
        {selectedPlace && (
          <PlaceDetail
            place={selectedPlace}
            distance={selectedDistance}
            onClose={() => setSelectedPlace(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
