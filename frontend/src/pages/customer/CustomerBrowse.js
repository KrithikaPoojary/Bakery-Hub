import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { MapPin, Star, Search, LocateFixed } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function CustomerBrowse() {
  const [bakeries, setBakeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCity, setSelectedCity] = useState("all");
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState("nearest"); // nearest | rating | name

  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle"); // idle | getting | success | error

  const navigate = useNavigate();

  // Fetch bakeries
  useEffect(() => {
    const fetchBakeries = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/bakeries/public"
        );
        setBakeries(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load bakeries");
      } finally {
        setLoading(false);
      }
    };

    fetchBakeries();
  }, []);

  // Ask for user location (once)
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      return;
    }

    setLocationStatus("getting");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocationStatus("success");
      },
      (err) => {
        console.error("Location error:", err);
        setLocationStatus("error");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  // Haversine distance in km
  const distanceInKm = (lat1, lon1, lat2, lon2) => {
    if (
      typeof lat1 !== "number" ||
      typeof lon1 !== "number" ||
      typeof lat2 !== "number" ||
      typeof lon2 !== "number"
    )
      return null;

    const toRad = (val) => (val * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // in km
  };

  // City options
  const cityOptions = useMemo(() => {
    const cities = bakeries.map((b) => b.city).filter(Boolean);
    return ["all", ...Array.from(new Set(cities))];
  }, [bakeries]);

  // Enrich with distance & filter + sort
  const processedBakeries = useMemo(() => {
    let enriched = bakeries.map((b) => {
      let distanceKm = null;

      if (
        userLocation &&
        typeof b.lat === "number" &&
        typeof b.lng === "number"
      ) {
        distanceKm = distanceInKm(
          userLocation.lat,
          userLocation.lng,
          b.lat,
          b.lng
        );
      }

      return { ...b, distanceKm };
    });

    // Filter by city
    enriched = enriched.filter((b) => {
      const cityMatch =
        selectedCity === "all" ||
        b.city?.toLowerCase() === selectedCity.toLowerCase();

      const searchMatch = b.name?.toLowerCase().includes(search.toLowerCase());

      return cityMatch && searchMatch;
    });

    // Sort
    enriched.sort((a, b) => {
      if (sortMode === "nearest") {
        if (a.distanceKm == null && b.distanceKm == null) return 0;
        if (a.distanceKm == null) return 1;
        if (b.distanceKm == null) return -1;
        return a.distanceKm - b.distanceKm;
      }

      if (sortMode === "name") {
        return (a.name || "").localeCompare(b.name || "");
      }

      // For now rating is fake; you can replace with real rating later
      if (sortMode === "rating") {
        return 0;
      }

      return 0;
    });

    return enriched;
  }, [bakeries, selectedCity, search, sortMode, userLocation]);

  // UI: Loading / Error
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-purple-400 text-lg animate-pulse">
        Loading bakeries...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 text-lg">
        {error}
      </div>
    );
  }

  // =================== PAGE ===================
  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* HEADER / HERO */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white">
                Find <span className="text-purple-400">Nearby Bakeries</span>
              </h1>
              <p className="text-gray-300 mt-3 text-lg">
                Browse approved bakeries around you and discover fresh treats.
              </p>
            </div>

            {/* Location status */}
            <div className="flex flex-col items-start md:items-end text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <LocateFixed size={18} className="text-purple-400" />
                {locationStatus === "getting" && (
                  <span>Detecting your location…</span>
                )}
                {locationStatus === "success" && (
                  <span className="text-green-700">
                    Using your current location
                  </span>
                )}
                {locationStatus === "error" && (
                  <span className="text-gray-500">
                    Location not enabled. Showing all bakeries.
                  </span>
                )}
              </div>
              {userLocation && (
                <span className="mt-1 text-xs text-gray-500">
                  Lat: {userLocation.lat.toFixed(3)}, Lng:{" "}
                  {userLocation.lng.toFixed(3)}
                </span>
              )}
            </div>
          </div>

          {/* FILTERS BAR */}
          <div className="mt-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            {/* City filter */}
            <div className="flex items-center bg-gray-800 rounded-xl border border-gray-700 px-4 py-2 shadow-sm w-full md:w-64">
              <MapPin className="w-5 h-5 text-purple-400 mr-2" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent outline-none text-gray-200 text-base w-full"
              >
                {cityOptions.map((city) => (
                  <option key={city} value={city}>
                    {city === "all" ? "All Locations" : city}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="flex items-center bg-gray-800 rounded-xl border border-gray-700 px-4 py-2 shadow-sm w-full md:w-72">
              <Search className="w-5 h-5 text-purple-400 mr-2" />
              <input
                type="text"
                placeholder="Search bakery..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none text-gray-200 text-base w-full placeholder-gray-500"
              />
            </div>

            {/* Sort */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 px-4 py-2 shadow-sm w-full md:w-52">
              <label className="block text-xs font-semibold text-gray-400 mb-1">
                Sort by
              </label>
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value)}
                className="bg-transparent outline-none text-gray-200 text-base w-full"
              >
                <option value="nearest">Nearest</option>
                <option value="name">Name (A-Z)</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* NO DATA */}
        {processedBakeries.length === 0 && (
          <div className="text-center mt-24 text-gray-500">
            <h2 className="text-xl font-semibold">No bakeries found</h2>
            <p className="mt-2 text-sm">
              Try adjusting filters or search keywords.
            </p>
          </div>
        )}

        {/* BAKERY GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {processedBakeries.map((b, index) => (
            <motion.div
              key={b._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
              whileHover={{ scale: 1.03 }}
              className="bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition border border-gray-700 overflow-hidden cursor-pointer"
              onClick={() => navigate(`/customer/menu/${b._id}`)}
            >
              {/* IMAGE */}
              <div className="h-48 bg-gray-100 overflow-hidden relative">
               <img
  src={
    b.imageUrl
      ? b.imageUrl.startsWith("http")
        ? b.imageUrl
        : `http://localhost:5000${b.imageUrl}`
      : "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe"
  }
  alt={b.name}
  className="w-full h-full object-cover transition duration-500 hover:scale-110"
/>


                {/* CITY BADGE */}
                {b.city && (
                  <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                    <MapPin size={12} /> {b.city}
                  </div>
                )}

                {/* DISTANCE BADGE */}
                {b.distanceKm != null && (
                  <div className="absolute top-3 right-3 bg-gray-800/90 text-purple-300 text-xs px-3 py-1 rounded-full border border-gray-700">
                    {b.distanceKm < 1
                      ? `${Math.round(b.distanceKm * 1000)} m away`
                      : `${b.distanceKm.toFixed(1)} km away`}
                  </div>
                )}
              </div>

              {/* CARD CONTENT */}
              <div className="p-5">
                <h3 className="text-xl font-bold text-white truncate">
                  {b.name}
                </h3>

                <p className="text-gray-300 flex items-center gap-2 text-sm mt-1">
                  <MapPin size={14} /> {b.address || "No address available"}
                </p>

                {/* Rating (placeholder for now) */}
                <div className="flex items-center gap-1 text-yellow-500 mt-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                  <Star size={16} />
                  <span className="text-gray-400 ml-1 text-xs">
                    (120 reviews)
                  </span>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <span className="px-3 py-1 bg-green-900/50 text-green-300 text-xs rounded-full border border-green-700">
                    Approved Bakery
                  </span>

                  <span className="text-purple-400 font-medium text-xs">
                    View Menu →
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
