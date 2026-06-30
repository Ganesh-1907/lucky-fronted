"use client";

import { MapPin, X } from "lucide-react";
import { useCityStore } from "@/store/city";

const cities = [
  { name: "Mumbai", emoji: "🏙️" },
  { name: "Delhi", emoji: "🏛️" },
  { name: "Bangalore", emoji: "💻" },
  { name: "Hyderabad", emoji: "🕌" },
  { name: "Chennai", emoji: "🌴" },
  { name: "Pune", emoji: "🎓" },
  { name: "Kolkata", emoji: "🌉" },
  { name: "Jaipur", emoji: "🏰" },
  { name: "Ahmedabad", emoji: "🏗️" },
  { name: "Lucknow", emoji: "🕋" },
];

export default function CitySelector() {
  const { isModalOpen, closeModal, setCity, selectedCity } = useCityStore();

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="gradient-primary p-6 text-white">
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <MapPin size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
                Select Your City
              </h2>
              <p className="text-sm text-white/80">
                Find the best services near you
              </p>
            </div>
          </div>
        </div>

        {/* City Grid */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3">
            {cities.map((city) => (
              <button
                key={city.name}
                onClick={() => setCity(city.name)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                  selectedCity === city.name
                    ? "border-violet-500 bg-violet-50 text-violet-700"
                    : "border-gray-100 hover:border-violet-200 text-gray-700"
                }`}
              >
                <span className="text-2xl">{city.emoji}</span>
                <span className="font-medium text-sm">{city.name}</span>
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            More cities coming soon!
          </p>
        </div>
      </div>
    </div>
  );
}
