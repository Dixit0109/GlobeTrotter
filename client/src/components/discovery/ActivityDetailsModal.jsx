import React from "react";
import { MapPin, Clock, DollarSign, Tag, Plus } from "lucide-react";
import Modal from "../common/Modal";
import Button from "../common/Button";

const ActivityDetailsModal = ({ isOpen, onClose, activity, onAddToTrip }) => {
  if (!activity) return null;

  const cityObj = activity.city || {};

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={activity.name}
      className="max-w-xl"
    >
      <div className="space-y-4">
        {/* Activity Image Header */}
        {activity.image && (
          <div className="relative h-44 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
            <img
              src={activity.image}
              alt={activity.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            {activity.type && (
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-600/80 backdrop-blur text-white capitalize">
                {activity.type}
              </div>
            )}
          </div>
        )}

        {/* Activity Title & Metadata */}
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            {activity.name}
          </h3>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-2">
            {cityObj.name && (
              <span className="flex items-center space-x-1 text-indigo-400 font-semibold">
                <MapPin className="w-3.5 h-3.5" />
                <span>
                  {cityObj.name}, {cityObj.country}
                </span>
              </span>
            )}

            {activity.duration && (
              <span className="flex items-center space-x-1 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{activity.duration} mins</span>
              </span>
            )}

            {activity.estimatedCost !== undefined && (
              <span className="flex items-center space-x-1 text-emerald-400 font-bold">
                <DollarSign className="w-3.5 h-3.5" />
                <span>${activity.estimatedCost}</span>
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {activity.description && (
          <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            {activity.description}
          </p>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={() => {
              onClose();
              onAddToTrip(activity);
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add to Trip
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ActivityDetailsModal;
