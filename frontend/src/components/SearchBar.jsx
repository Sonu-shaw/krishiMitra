// components/SearchBar.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapPin, Sprout, Calendar, ShoppingCart } from "lucide-react";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export default function SearchBar({ onPredict, setSelectedLocation }) {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [crops, setCrops] = useState([]);

  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [crop, setCrop] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const [wantToSell, setWantToSell] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingLists, setLoadingLists] = useState({
    states: false,
    districts: false,
    crops: false,
  });
  const [error, setError] = useState("");

  // Load states
  useEffect(() => {
    let mounted = true;
    async function loadStates() {
      setLoadingLists((prev) => ({ ...prev, states: true }));
      setError("");
      try {
        const res = await axios.get(`${API_BASE}/api/states`);
        if (!mounted) return;
        setStates(res.data.states || []);
        setState(res.data.states?.[0] || "");
      } catch (e) {
        setError("❌ Failed to load states.");
        setStates([]);
        setState("");
      } finally {
        setLoadingLists((prev) => ({ ...prev, states: false }));
      }
    }
    loadStates();
    return () => {
      mounted = false;
    };
  }, []);

  // Load districts for selected state
  useEffect(() => {
    let mounted = true;
    async function loadDistricts() {
      if (!state) {
        setDistricts([]);
        setDistrict("");
        return;
      }
      setLoadingLists((prev) => ({ ...prev, districts: true }));
      setError("");
      try {
        const res = await axios.get(`${API_BASE}/api/districts`, { params: { state } });
        if (!mounted) return;
        setDistricts(res.data.districts || []);
        setDistrict(res.data.districts?.[0] || "");
      } catch (e) {
        setError("❌ Failed to load districts.");
        setDistricts([]);
        setDistrict("");
      } finally {
        setLoadingLists((prev) => ({ ...prev, districts: false }));
      }
    }
    loadDistricts();
    return () => {
      mounted = false;
    };
  }, [state]);

  // Load crops for selected state+district
  useEffect(() => {
    let mounted = true;
    async function loadCrops() {
      if (!state || !district) {
        setCrops([]);
        setCrop("");
        return;
      }
      setLoadingLists((prev) => ({ ...prev, crops: true }));
      setError("");
      try {
        const res = await axios.get(`${API_BASE}/api/crops`, { params: { state, district } });
        if (!mounted) return;
        setCrops(res.data.crops || []);
        setCrop(res.data.crops?.[0] || "");
      } catch (e) {
        setError("❌ Failed to load crops.");
        setCrops([]);
        setCrop("");
      } finally {
        setLoadingLists((prev) => ({ ...prev, crops: false }));
      }
    }
    loadCrops();
    return () => {
      mounted = false;
    };
  }, [state, district]);

  // Notify parent of location (used elsewhere)
  useEffect(() => {
    setSelectedLocation?.({ state, district });
  }, [state, district, setSelectedLocation]);

  async function fetchPrediction(oneCrop) {
    const params = { state, district, crop: oneCrop, date };
    const { data } = await axios.get(`${API_BASE}/api/predict`, { params });

    let window = [];
    if (data.dates && data.values && Array.isArray(data.dates)) {
      window = data.dates.map((d, i) => ({ date: d, predicted: data.values[i] }));
    } else if (data.predictions && Array.isArray(data.predictions)) {
      window = data.predictions.map((p) => ({
        date: p.date,
        predicted: p.price ?? p.value ?? p.predicted,
      }));
    } else if (Array.isArray(data) && data.length && data[0].date) {
      window = data.map((p) => ({
        date: p.date,
        predicted: p.price ?? p.value ?? p.predicted,
      }));
    } else {
      window = Object.keys(data || {}).map((k) => ({ date: k, predicted: data[k] }));
    }

    const estimatedPrice = window.length ? Math.round(Number(window[0].predicted) * 100) / 100 : 0;

    // IMPORTANT: include state & district on the crop object
    return {
      name: oneCrop,
      icon: "🌾",
      unit: "₹/Quintal",
      state,                 // <-- used by CropModal
      district,              // <-- used by CropModal and backend
      region: district || state || "region", // keep if elsewhere used
      estimatedPrice,
      window,
      wantToSell,
    };
  }

  async function handlePredictOne() {
    if (!state || !district || !crop) return;
    setLoading(true);
    setError("");
    try {
      const result = await fetchPrediction(crop);
      onPredict?.({ crops: [result] });
    } catch (e) {
      setError("Prediction failed for the selected crop.");
      onPredict?.({ crops: [] });
    } finally {
      setLoading(false);
    }
  }

  async function handlePredictAll() {
    if (!state || !district || crops.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const take = crops.slice(0, 8);
      const results = await Promise.all(take.map((c) => fetchPrediction(c)));
      onPredict?.({ crops: results });
    } catch (e) {
      setError("Prediction failed. Please try again.");
      onPredict?.({ crops: [] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white shadow-md rounded-xl p-4 border border-green-200 sticky top-20 z-20">
      <div className="grid grid-cols-1 items-center md:grid-cols-6 gap-4">
        {/* State */}
        <div>
          <label className="text-sm font-medium text-green-700 flex items-center gap-1">
            <MapPin className="w-4 h-4" /> State
          </label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            disabled={loadingLists.states || loading}
          >
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* District */}
        <div>
          <label className="text-sm font-medium text-green-700 flex items-center gap-1">
            <MapPin className="w-4 h-4" /> District
          </label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            disabled={loadingLists.districts || loading || !state}
          >
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Crop */}
        <div>
          <label className="text-sm font-medium text-green-700 flex items-center gap-1">
            <Sprout className="w-4 h-4" /> Crop
          </label>
          <select
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            disabled={loadingLists.crops || loading || !district}
          >
            {crops.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="text-sm font-medium text-green-700 flex items-center gap-1">
            <Calendar className="w-4 h-4" /> Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            disabled={loading}
          />
        </div>

        {/* Want to Sell */}
        <div className="flex items-center gap-2 mt-6">
          <input
            type="checkbox"
            id="wantToSell"
            checked={wantToSell}
            onChange={(e) => setWantToSell(e.target.checked)}
            className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <label
            htmlFor="wantToSell"
            className="text-sm font-medium text-green-700 flex items-center gap-1"
          >
            <ShoppingCart className="w-4 h-4" /> Want to Sell
          </label>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-2 md:mt-6">
          <button
            onClick={handlePredictOne}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg shadow hover:opacity-90 transition"
            disabled={loading || !crop}
          >
            {loading ? (
              <div className="flex justify-center animate-spin">
                <div className="h-8 w-8 border-l-4 rounded-full border-white"></div>
              </div>
            ) : (
              "Predict Crop"
            )}
          </button>
          <button
            onClick={handlePredictAll}
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:opacity-90 transition"
            disabled={loading || !district || crops.length === 0}
          >
            {loading ? (
              <div className="flex justify-center animate-spin">
                <div className="h-8 w-8 border-l-4 rounded-full border-white"></div>
              </div>
            ) : (
              "Predict All"
            )}
          </button>
        </div>
      </div>

      {error && <div className="text-sm text-red-600 mt-3">{error}</div>}
    </div>
  );
}
