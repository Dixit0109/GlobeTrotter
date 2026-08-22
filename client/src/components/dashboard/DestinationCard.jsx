import React from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Star, DollarSign } from "lucide-react";

const renderCostIndex = (index) => {
  const count = Math.min(5, Math.max(1, index || 1));
  return "$".repeat(count);
};

const DestinationCard = ({ city }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate("/discover")}
      className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg hover:border-indigo-500/50 hover:shadow-indigo-500/10 transition-all cursor-pointer group flex flex-col justify-between"
    >
      <div className="relative h-40 overflow-hidden bg-slate-950">
        <img
          src={
            city.image ||
            "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80"
          }
          alt={city.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        {/* Popularity Badge */}
        {city.popularity !== undefined && (
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center space-x-1 backdrop-blur-sm">
            <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
            <span>{city.popularity}</span>
          </div>
        )}

        <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between">
          <div>
            <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors drop-shadow">
              {city.name}
            </h4>
            <p className="text-xs text-slate-300 flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-indigo-400" />
              <span>{city.country}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="p-3 bg-slate-900/90 flex items-center justify-between border-t border-slate-800/80 text-xs">
        <span className="text-slate-400">{city.region || "Destination"}</span>
        <span
          className="font-bold text-emerald-400 tracking-wider"
          title={`Cost Index: ${city.costIndex}/5`}
        >
          {renderCostIndex(city.costIndex)}
        </span>
      </div>
    </div>
  );
};

export default DestinationCard;
