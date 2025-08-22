// pages/Dealer.jsx
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Phone, Sprout, MapPin, User, Mail, Clock } from "lucide-react";
import { AuthContext } from "../components/AuthContext";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export default function Dealer() {
  const { user } = useContext(AuthContext);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!user) return <div>Loading user...</div>;

  useEffect(() => {
    let intervalId;

    async function fetchFarmers() {
      setLoading(true);
      try {
        const res = await axios.get(
          `${API_BASE}/api/market/dealer-view/${encodeURIComponent(user.email)}`
        );
        setFarmers(res.data.farmers || []);
      } catch (err) {
        console.error("Error fetching farmers:", err);
        setFarmers([]);
      } finally {
        setLoading(false);
      }
    }

    if (user?.role === "dealer") {
      fetchFarmers(); // initial
      intervalId = setInterval(fetchFarmers, 10000); // every 10s
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [user]);

  return (
    <div
      className="min-h-screen bg-cover bg-center p-6"
      style={{ backgroundImage: "url('/team/dealer.jpg')" }}
    >
      <div className="max-w-5xl mx-auto mt-10 px-4 bg-white/70 backdrop-blur-lg rounded-lg p-6 shadow-xl">
        <h1 className="text-3xl font-extrabold text-green-900 mb-6 drop-shadow">
          Farmers Interested in Selling
        </h1>

        {loading ? (
          <div className="text-gray-700 font-medium">Loading farmers...</div>
        ) : farmers.length === 0 ? (
          <div className="text-gray-700 font-medium">
            No farmers are selling crops in your preferred districts right now.
          </div>
        ) : (
          <div className="space-y-4">
            {farmers.map((f, idx) => {
              const ageSeconds = Date.now() / 1000 - f.timestamp;
              const isNearExpiry = ageSeconds >= 240; // >= 4 min

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-lg shadow-md flex justify-between items-center transition
                    ${
                      isNearExpiry
                        ? "ambulance-blink bg-red-100/80 backdrop-blur-sm text-black"
                        : "bg-white/70 backdrop-blur-md border border-green-200"
                    }`}
                >
                  {/* Farmer details */}
                  <div>
                    <div className="flex items-center gap-2 font-bold text-green-800">
                      <User className="w-4 h-4" /> {f.name}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Sprout className="w-4 h-4" /> {f.crop}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <MapPin className="w-4 h-4" /> {f.district}, {f.state}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      💰 Asking Price: {f.price ?? "N/A"} ₹/Quintal
                    </div>
                    {f.posted && (
                      <div className="flex items-center gap-2 text-sm mt-1 text-gray-600">
                        <Clock className="w-4 h-4" /> {f.posted}
                      </div>
                    )}
                  </div>

                  {/* Contact */}
                  <div className="flex flex-col items-end gap-1 font-medium text-gray-800">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" /> {f.contact}
                    </div>
                    {f.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" /> {f.email}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
