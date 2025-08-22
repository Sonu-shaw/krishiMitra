import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sprout, Leaf, Phone, Mail } from "lucide-react";
import CropGrid from "../components/CropGrid";
import SearchBar from "../components/SearchBar";

export default function Home({ setSelectedLocation }) {
  const [cropsOnGrid, setCropsOnGrid] = useState([]);

  return (
    <div
      className="
        min-h-screen flex flex-col 
        bg-gradient-to-b from-amber-900 via-yellow-100 to-green-200
        bg-fixed bg-cover bg-no-repeat
        p-5
      "
      // 👉 If you want a background image instead of gradient:
       style={{ backgroundImage: "url('/team/bg.jpg')" }}
    >
      {/* HEADER */}
      <motion.header
        className="w-full bg-gradient-to-r from-green-700 via-green-600 to-green-500 text-white py-10 px-6 shadow-lg rounded-xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mx-auto flex flex-col md:flex-row items-center justify-between gap-6 max-w-6xl">
          <div>
            <motion.h1
              className="text-3xl md:text-5xl font-extrabold leading-tight drop-shadow-md flex items-center gap-3"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <Sprout className="w-10 h-10 text-yellow-300" />
              KrishiMitra
            </motion.h1>
            <motion.p
              className="mt-2 text-base md:text-lg text-white/90 max-w-2xl"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              Real-time crop market predictions — powered by AI and your
              community’s data.
            </motion.p>
          </div>

          {/* Live badge */}
          <div className="hidden md:block">
            <span className="bg-white/20 text-white px-4 py-1 rounded-full text-sm font-semibold animate-pulse shadow-md">
              🔴 LIVE UPDATES
            </span>
          </div>
        </div>
      </motion.header>

      {/* SEARCH BAR */}
      <div className="w-full bg-white shadow-md py-4 px-6 border-b border-gray-200 sticky top-0 z-40 rounded-xl mt-4">
        <SearchBar
          onPredict={(data) => setCropsOnGrid(data.crops || [])}
          setSelectedLocation={setSelectedLocation}
        />
      </div>

      {/* MAIN GRID */}
      <main className="flex-grow w-full px-6 py-10 max-w-6xl mx-auto">
        {cropsOnGrid.length > 0 ? (
          <CropGrid crops={cropsOnGrid} />
        ) : (
          <motion.div
            className="flex flex-col items-center justify-center text-center text-red-700 py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Leaf className="w-16 h-16 text-yellow-700 mb-4" />
            <h2 className="text-2xl font-semibold">
              Search to see crop price predictions 🌾
            </h2>
            <p className="text-sm mt-2 max-w-md">
              Enter your location and crop name above to get live market
              insights.
            </p>
          </motion.div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-gradient-to-r from-green-700 via-green-600 to-green-500 text-white py-8 rounded-t-xl">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Sprout className="w-5 h-5 text-yellow-300" /> About KrishiMitra
            </h3>
            <p className="text-sm text-white/90 max-w-md mt-2">
              KrishiMitra empowers farmers with AI-driven price predictions,
              helping them make informed selling decisions and connect directly
              with buyers.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Phone className="w-5 h-5 text-yellow-300" /> Contact Us
            </h3>
            <p className="text-sm text-white/90 mt-2 flex items-center gap-2">
              <Mail className="w-4 h-4" /> support@krishimitra.com
            </p>
            <p className="text-sm text-white/90 mt-1 flex items-center gap-2">
              <Phone className="w-4 h-4" /> +91-9876543210
            </p>
          </div>
        </div>
        <div className="text-center text-white/70 text-xs mt-6">
          © {new Date().getFullYear()} KrishiMitra. All rights reserved.
        </div>
      </footer>
    </div>
  );
}