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
  const [sortMode, setSortMode] = useState("nearest");

  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle");

  const navigate = useNavigate();

  // ================= FETCH BAKERIES =================
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

  // ================= LOCATION =================
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
      () => setLocationStatus("error"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  // ================= DISTANCE =================
  const distanceInKm = (lat1, lon1, lat2, lon2) => {
    if (
      typeof lat1 !== "number" ||
      typeof lon1 !== "number" ||
      typeof lat2 !== "number" ||
      typeof lon2 !== "number"
    )
      return null;

    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // ================= CITY OPTIONS =================
  const cityOptions = useMemo(() => {
    const cities = bakeries.map((b) => b.city).filter(Boolean);
    return ["all", ...new Set(cities)];
  }, [bakeries]);

  // ================= PROCESS =================
  const processedBakeries = useMemo(() => {
    let list = bakeries.map((b) => {
      let distanceKm = null;
      if (userLocation && typeof b.lat === "number" && typeof b.lng === "number") {
        distanceKm = distanceInKm(
          userLocation.lat,
          userLocation.lng,
          b.lat,
          b.lng
        );
      }
      return { ...b, distanceKm };
    });

    list = list.filter((b) => {
      const cityMatch =
        selectedCity === "all" ||
        b.city?.toLowerCase() === selectedCity.toLowerCase();
      const searchMatch = b.name
        ?.toLowerCase()
        .includes(search.toLowerCase());
      return cityMatch && searchMatch;
    });

    list.sort((a, b) => {
      if (sortMode === "nearest") {
        if (a.distanceKm == null) return 1;
        if (b.distanceKm == null) return -1;
        return a.distanceKm - b.distanceKm;
      }
      if (sortMode === "name") {
        return (a.name || "").localeCompare(b.name || "");
      }
      return 0;
    });

    return list;
  }, [bakeries, selectedCity, search, sortMode, userLocation]);

  // ================= STATES =================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-purple-400 text-lg animate-pulse bg-transparent">
        Loading bakeries...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400 bg-transparent">
        {error}
      </div>
    );
  }

  // ================= PAGE =================
  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white">
                Find <span className="text-purple-400">Nearby Bakeries</span>
              </h1>
              <p className="text-gray-300 mt-3 text-lg">
                Browse approved bakeries around you.
              </p>
            </div>

            <div className="text-sm text-gray-300 flex items-center gap-2">
              <LocateFixed className="text-purple-400" size={18} />
              {locationStatus === "getting" && "Detecting location…"}
              {locationStatus === "success" && (
                <span className="text-green-400">Location enabled</span>
              )}
              {locationStatus === "error" && "Location not enabled"}
            </div>
          </div>

          {/* FILTERS */}
          <div className="mt-8 flex flex-col md:flex-row gap-4">
            <div className="flex items-center bg-gray-800/90 backdrop-blur rounded-xl border border-gray-700 px-4 py-2 w-full md:w-64">
              <MapPin className="text-purple-400 mr-2" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent text-gray-200 outline-none w-full"
              >
                {cityOptions.map((city) => (
                  <option key={city} value={city}>
                    {city === "all" ? "All Locations" : city}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center bg-gray-800/90 backdrop-blur rounded-xl border border-gray-700 px-4 py-2 w-full md:w-72">
              <Search className="text-purple-400 mr-2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search bakery..."
                className="bg-transparent text-gray-200 outline-none w-full placeholder-gray-400"
              />
            </div>
          </div>
        </motion.div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {processedBakeries.map((b, i) => (
            <motion.div
              key={b._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.03 }}
              onClick={() => navigate(`/customer/menu/${b._id}`)}
              className="bg-gray-800/90 backdrop-blur border border-gray-700 rounded-2xl shadow-lg cursor-pointer overflow-hidden"
            >
              <div className="h-48 bg-gray-100">
                <img
                  src={
                    b.imageUrl
                      ? b.imageUrl.startsWith("http")
                        ? b.imageUrl
                        : `http://localhost:5000${b.imageUrl}`
                      : "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe"
                  }
                  alt={b.name}
                  className="w-full h-full object-cover hover:scale-110 transition"
                />
              </div>

              <div className="p-5">
                <h3 className="text-xl font-bold text-white">{b.name}</h3>
                <p className="text-gray-300 text-sm mt-1 flex items-center gap-1">
                  <MapPin size={14} /> {b.address || "No address"}
                </p>

                <div className="flex items-center gap-1 text-yellow-500 mt-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                  <Star size={16} />
                </div>

                <div className="mt-4 flex justify-between">
                  <span className="text-xs text-green-300 border border-green-700 px-3 py-1 rounded-full">
                    Approved
                  </span>
                  <span className="text-purple-400 text-xs">
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
