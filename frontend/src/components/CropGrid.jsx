import React from "react";
import CropCard from "./CropCard";
import { motion, AnimatePresence } from "framer-motion";

export default function CropGrid({ crops }) {
  if (!crops || crops.length === 0) {
    return (
      <div className="text-center text-gray-500 py-20 text-lg font-medium">
        🌱 No crops available.
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 p-4">
      <AnimatePresence>
        {crops.map((c, idx) => (
          <motion.div
            key={c.id || c.name + idx}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="hover:scale-105 transform transition-transform duration-300"
          >
            <CropCard crop={c} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
