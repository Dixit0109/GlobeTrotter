import React, { useState, useEffect } from "react";
import { Search, Loader2, Clock, DollarSign, Tag } from "lucide-react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Input from "../common/Input";
import API from "../../services/api";

const AddActivityModal = ({ isOpen, onClose, stop, onAddActivity }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (stop && isOpen) {
      const cityId = stop.city?._id || stop.city;
      if (cityId) {
        fetchActivities(cityId);
      }
      setSelectedActivity(null);
      setScheduledDate(
        stop.arrivalDate ? new Date(stop.arrivalDate).toISOString().split("T")[0] : ""
      );
      setScheduledTime("10:00");
      setNotes("");
      setError(null);
    }
  }, [stop, isOpen]);

  const fetchActivities = async (cityId) => {
    setLoading(true);
    try {
      const res = await API.get(`/activities?city=${cityId}`);
      if (res.data.success) {
        setActivities(res.data.data || []);
      }
    } catch (err) {
      console.error("Fetch activities error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedActivity) {
      setError("Please select an activity");
      return;
    }

    if (scheduledDate) {
      const stopArrival = stop.arrivalDate ? new Date(stop.arrivalDate) : null;
      const stopDeparture = stop.departureDate ? new Date(stop.departureDate) : null;
      const sched = new Date(scheduledDate);

      if (stopArrival && sched < stopArrival) {
        setError("Scheduled date cannot be before stop arrival date");
        return;
      }
      if (stopDeparture && sched > stopDeparture) {
        setError("Scheduled date cannot be after stop departure date");
        return;
      }
    }

    setSubmitting(true);
    setError(null);

    const success = await onAddActivity(stop._id, {
      activity: selectedActivity._id,
      scheduledDate: scheduledDate || undefined,
      scheduledTime: scheduledTime || undefined,
      notes: notes.trim(),
    });

    setSubmitting(false);
    if (success) {
      onClose();
    }
  };

  if (!stop) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Activity to ${stop.city?.name || "Stop"}`}
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-lg text-xs">
            {error}
          </div>
        )}

        {/* Select Activity List */}
        {!selectedActivity ? (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-300">
              1. Select Activity in {stop.city?.name}
            </label>

            {loading ? (
              <div className="py-8 text-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-400 mb-2" />
                <span className="text-xs">Loading available activities...</span>
              </div>
            ) : activities.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                No activities cataloged for this city yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                {activities.map((act) => (
                  <div
                    key={act._id}
                    onClick={() => setSelectedActivity(act)}
                    className="p-3 bg-slate-950 border border-slate-800 hover:border-indigo-500 rounded-xl cursor-pointer transition-all flex space-x-3 group"
                  >
                    {act.image && (
                      <img
                        src={act.image}
                        alt={act.name}
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-200 text-xs group-hover:text-indigo-400 truncate">
                        {act.name}
                      </h4>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-1">
                        <span className="capitalize px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {act.type}
                        </span>
                        <span>{act.duration} mins</span>
                      </div>
                      <p className="text-[10px] text-emerald-400 font-semibold mt-1">
                        ${act.estimatedCost}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Step 2: Selected Activity Details & Schedule */
          <div className="space-y-4">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {selectedActivity.image && (
                  <img
                    src={selectedActivity.image}
                    alt={selectedActivity.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h4 className="font-bold text-white text-xs">
                    {selectedActivity.name}
                  </h4>
                  <span className="text-[10px] text-indigo-300 capitalize">
                    {selectedActivity.type} • {selectedActivity.duration} mins • ${selectedActivity.estimatedCost}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedActivity(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Change Activity
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Scheduled Date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={
                  stop.arrivalDate
                    ? new Date(stop.arrivalDate).toISOString().split("T")[0]
                    : undefined
                }
                max={
                  stop.departureDate
                    ? new Date(stop.departureDate).toISOString().split("T")[0]
                    : undefined
                }
              />

              <Input
                label="Scheduled Time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Activity Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Bring tickets, meet guide at main entrance..."
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>

          {selectedActivity && (
            <Button type="submit" loading={submitting} disabled={submitting}>
              Add Activity
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default AddActivityModal;
