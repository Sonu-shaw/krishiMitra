import React, { useState } from "react";
import { motion } from "framer-motion";
import CropModal from "./CropModal";

// Crop emoji icons
const cropIcons = {
  Potato: "🥔",
  Mustard: "🌻",
  "Arhar Dal": "🌱",
  Sugarcane: "🍬",
  Maize: "🌽",
  Tomato: "🍅",
  Rice: "🌾",
  Wheat: "🌾",
};

// Generate vibrant gradient colors
function colorPairFromName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const h1 = Math.abs((hash * 2654435761) % 360);
  const h2 = (h1 + 50) % 360;
  return [`hsl(${h1} 70% 60%)`, `hsl(${h2} 70% 50%)`];
}

export default function CropCard({ crop }) {
  const [open, setOpen] = useState(false);
  const [g1, g2] = colorPairFromName(crop.name || "crop");

  return (
    <>
      <motion.div
        layout
        whileHover={{
          scale: 1.05,
          boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
        }}
        className="cursor-pointer p-6 h-72 flex flex-col justify-between rounded-3xl text-gray-900 shadow-lg transition-all duration-300 backdrop-blur-md border border-white/20 relative overflow-hidden"
        onClick={() => setOpen(true)}
        style={{
          background: `linear-gradient(135deg, ${g1}, ${g2})`,
        }}
      >
        {/* Decorative Glow */}
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/20 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>

        {/* Top Row */}
        <div className="flex items-center justify-between relative z-10">
          <div className="rounded-full bg-white/30 p-3 text-3xl flex items-center justify-center shadow-sm">
            {cropIcons[crop.name] || "🌾"}
          </div>
          <div className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full shadow-sm">
            {crop.region || "Local"}
          </div>
        </div>

        {/* Crop Name */}
        <div className="text-center mt-5 relative z-10">
          <div className="font-extrabold text-xl text-white tracking-wide drop-shadow-md">
            {crop.name}
          </div>
          <div className="text-sm opacity-90 mt-1 text-white/90">{crop.unit || "₹/Quintal"}</div>
        </div>

        {/* Estimated Price */}
        <div className="flex items-center justify-between mt-5 relative z-10">
          <div className="text-sm font-medium text-white/90 opacity-90">Est. Price</div>
          <div className="text-2xl font-bold bg-white/30 px-3 py-1 rounded-full shadow-inner text-white">
            ₹{crop.estimatedPrice ?? 0}
          </div>
        </div>
      </motion.div>

      {open && <CropModal crop={crop} onClose={() => setOpen(false)} />}
    </>
  );
}
