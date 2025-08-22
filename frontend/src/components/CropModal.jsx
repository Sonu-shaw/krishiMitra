// components/CropModal.jsx
import React, { useMemo, useEffect, useState, useContext } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
import { Phone, Store } from "lucide-react";
import { AuthContext } from "./AuthContext";

Chart.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export default function CropModal({ crop, onClose }) {
  const windowData = Array.isArray(crop.window) ? crop.window : [];
  const [dealers, setDealers] = useState([]);
  const [loadingDealers, setLoadingDealers] = useState(false);

  const { user } = useContext(AuthContext);

  // When farmer wants to sell, notify backend + fetch dealers
  useEffect(() => {
    async function handleSellIntent() {
      if (!crop.wantToSell || !user) return;

      try {
        setLoadingDealers(true);

        // Ensure state & district come from crop object
        const payload = {
          name: user.name,
          contact: user.contact,
          email: user.email,
          crop: crop.name,
          state: crop.state,          // <-- set by SearchBar.jsx below
          district: crop.district,    // <-- set by SearchBar.jsx below
          price: crop.estimatedPrice, // include asking price
        };

        const res = await axios.post(`${API_BASE}/api/market/sell-intent`, payload);
        setDealers(res.data.dealers || []);
      } catch (err) {
        console.error("Error handling sell intent:", err);
        setDealers([]);
      } finally {
        setLoadingDealers(false);
      }
    }

    handleSellIntent();
  }, [crop, user]);

  const data = useMemo(
    () => ({
      labels: windowData.map((w) => w.date),
      datasets: [
        {
          label: crop.name,
          data: windowData.map((w) => w.predicted),
          tension: 0.3,
          fill: true,
          borderColor: "#1e90ff",
          backgroundColor: "rgba(30,144,255,0.2)",
          pointBackgroundColor: "#1e90ff",
        },
      ],
    }),
    [windowData, crop.name]
  );

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xl font-bold">
              {crop.icon} {crop.name}
            </div>
            <div className="text-sm text-gray-500">{crop.unit || "₹/Quintal"}</div>
            <div className="text-sm text-gray-600">
              Region: {crop.district}, {crop.state}
            </div>
            <div className="text-sm text-gray-600">
              Asking Price: {crop.estimatedPrice ?? "N/A"} ₹/Quintal
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500">
            Close
          </button>
        </div>

        {/* Prediction Graph */}
        <div className="mt-4">
          {windowData.length > 0 ? (
            <Line data={data} />
          ) : (
            <div className="text-sm text-gray-500">No prediction window available.</div>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <strong>Note:</strong> Prices are model predictions served by your Flask API.
        </div>

        {/* Dealers Section (only if Want to Sell) */}
        {crop.wantToSell && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-green-700 flex items-center gap-2">
              <Store className="w-5 h-5" /> Interested Dealers
            </h3>

            {loadingDealers ? (
              <div className="text-sm text-gray-500 mt-2">Loading dealers...</div>
            ) : dealers.length > 0 ? (
              <div className="mt-3 space-y-3">
                {dealers.map((d, idx) => (
                  <div
                    key={idx}
                    className="p-3 border border-green-200 rounded-lg shadow-sm flex justify-between items-center"
                  >
                    <div>
                      <div className="font-semibold text-green-800">{d.name}</div>
                      <div className="text-sm text-gray-600">
                        Districts: {Array.isArray(d.districtPreferences) ? d.districtPreferences.join(", ") : "N/A"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-green-700 font-medium">
                      <Phone className="w-4 h-4" /> {d.contact}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 mt-2">
                No interested dealers available for this crop in your district.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
