import React from "react";
import { MapPin, Star, DollarSign, Calendar, Plus, X } from "lucide-react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import DestinationImage from "../common/DestinationImage";

const renderCostIndex = (index) => {
  const count = Math.min(5, Math.max(1, index || 1));
  return "$".repeat(count);
};

const CityDetailsModal = ({ isOpen, onClose, city, onAddToTrip }) => {
  if (!city) return null;

  const activities = city.activities || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${city.name}, ${city.country}`}
      className="max-w-2xl"
    >
      <div className="space-y-5">
        {/* City Image Header */}
        <div className="relative h-48 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
          <DestinationImage
            src={city.image}
            alt={city.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
            <div>
              <span className="text-xs text-indigo-300 font-semibold px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur border border-slate-800">
                {city.region || "Destination"}
              </span>
              <h3 className="text-2xl font-extrabold text-white mt-1 drop-shadow">
                {city.name}
              </h3>
            </div>

            <div className="flex items-center space-x-2">
              {city.popularity !== undefined && (
                <div className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center space-x-1 backdrop-blur-sm">
                  <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  <span>{city.popularity}</span>
                </div>
              )}
              <div className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm">
                Cost: {renderCostIndex(city.costIndex)}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {city.description && (
          <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            {city.description}
          </p>
        )}

        {/* Top Activities in City */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Top Activities ({activities.length})
          </h4>

          {activities.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2">
              No top activities listed for this city yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
              {activities.map((act) => (
                <div
                  key={act._id}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center space-x-3"
                >
                  {act.image && (
                    <DestinationImage
                      src={act.image}
                      alt={act.name}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <h5 className="font-bold text-slate-200 text-xs truncate">
                      {act.name}
                    </h5>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="capitalize">{act.type}</span>
                      <span>•</span>
                      <span>{act.duration}m</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-semibold">
                        ${act.estimatedCost}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={() => {
              onClose();
              onAddToTrip(city);
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add to Trip
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CityDetailsModal;
