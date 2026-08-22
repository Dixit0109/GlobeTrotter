import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Loader2, Calendar, MapPin, AlertCircle } from "lucide-react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Input from "../common/Input";
import API from "../../services/api";

const AddActivityToTripModal = ({ isOpen, onClose, activity }) => {
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [matchingStops, setMatchingStops] = useState([]); // [{ tripId, tripName, stopId, arrivalDate, departureDate }]
  const [selectedTarget, setSelectedTarget] = useState(null); // { tripId, stopId }

  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const activityCityId = activity?.city?._id || activity?.city;
  const cityName = activity?.city?.name || "this city";

  useEffect(() => {
    if (isOpen && activityCityId) {
      fetchAndFilterTrips();
      setSelectedTarget(null);
      setScheduledDate("");
      setScheduledTime("10:00");
      setNotes("");
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, activityCityId]);

  const fetchAndFilterTrips = async () => {
    setLoadingTrips(true);
    try {
      const res = await API.get("/trips");
      if (res.data.success) {
        const fetchedTrips = res.data.data || [];
        setTrips(fetchedTrips);

        // Find stops matching activity.city
        const matches = [];
        fetchedTrips.forEach((t) => {
          (t.stops || []).forEach((s) => {
            const stopCityId = s.city?._id || s.city;
            if (stopCityId && stopCityId.toString() === activityCityId.toString()) {
              matches.push({
                tripId: t._id,
                tripName: t.name,
                stopId: s._id,
                arrivalDate: s.arrivalDate,
                departureDate: s.departureDate,
              });
            }
          });
        });

        setMatchingStops(matches);
        if (matches.length > 0) {
          setSelectedTarget(matches[0]);
          if (matches[0].arrivalDate) {
            setScheduledDate(
              new Date(matches[0].arrivalDate).toISOString().split("T")[0]
            );
          }
        }
      }
    } catch (err) {
      console.error("Fetch trips error:", err);
    } finally {
      setLoadingTrips(false);
    }
  };

  const handleTargetChange = (e) => {
    const idx = Number(e.target.value);
    const target = matchingStops[idx];
    setSelectedTarget(target);
    if (target && target.arrivalDate) {
      setScheduledDate(
        new Date(target.arrivalDate).toISOString().split("T")[0]
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTarget) {
      setError("Please select a trip stop");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await API.post(
        `/trips/${selectedTarget.tripId}/stops/${selectedTarget.stopId}/activities`,
        {
          activity: activity._id,
          scheduledDate: scheduledDate || undefined,
          scheduledTime: scheduledTime || undefined,
          notes: notes.trim(),
        }
      );

      if (res.data.success) {
        setSuccessMsg(`Added "${activity.name}" to trip itinerary!`);
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to add activity to trip"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!activity) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add "${activity.name}" to Trip`}
      className="max-w-lg"
    >
      {loadingTrips ? (
        <div className="py-8 text-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-400 mb-2" />
          <span className="text-xs">Checking your saved itineraries...</span>
        </div>
      ) : matchingStops.length === 0 ? (
        <div className="py-6 text-center space-y-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl max-w-md mx-auto text-xs space-y-1">
            <div className="flex items-center justify-center space-x-1.5 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>No Matching Trip Stop Found</span>
            </div>
            <p className="text-slate-300">
              None of your trips currently include <strong>{cityName}</strong> as a destination stop.
            </p>
          </div>
          <p className="text-xs text-slate-400">
            You must first add <strong>{cityName}</strong> to a trip before scheduling activities in that city.
          </p>
          <Button
            onClick={() => {
              onClose();
              navigate("/trips");
            }}
          >
            Go to My Trips
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-lg text-xs">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-lg text-xs font-semibold">
              {successMsg}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Select Trip Stop in {cityName}
            </label>
            <select
              onChange={handleTargetChange}
              disabled={submitting}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
            >
              {matchingStops.map((m, idx) => (
                <option key={m.stopId} value={idx}>
                  {m.tripName} ({cityName} stop)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Scheduled Date"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              disabled={submitting}
            />

            <Input
              label="Scheduled Time"
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Meet guide at entrance, bring voucher..."
              disabled={submitting}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <Button variant="secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting} disabled={submitting}>
              Add Activity
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default AddActivityToTripModal;
