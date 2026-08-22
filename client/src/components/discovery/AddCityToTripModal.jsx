import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Loader2, Calendar, MapPin } from "lucide-react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Input from "../common/Input";
import DestinationImage from "../common/DestinationImage";
import API from "../../services/api";

const AddCityToTripModal = ({ isOpen, onClose, city }) => {
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [selectedTripId, setSelectedTripId] = useState("");

  const [arrivalDate, setArrivalDate] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchTrips();
      setSelectedTripId("");
      setArrivalDate("");
      setDepartureDate("");
      setNotes("");
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen]);

  const fetchTrips = async () => {
    setLoadingTrips(true);
    try {
      const res = await API.get("/trips");
      if (res.data.success) {
        const fetchedTrips = res.data.data || [];
        setTrips(fetchedTrips);
        if (fetchedTrips.length > 0) {
          setSelectedTripId(fetchedTrips[0]._id);
        }
      }
    } catch (err) {
      console.error("Fetch trips error:", err);
    } finally {
      setLoadingTrips(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTripId) {
      setError("Please select a trip");
      return;
    }
    if (!arrivalDate || !departureDate) {
      setError("Arrival date and departure date are required");
      return;
    }
    if (new Date(departureDate) < new Date(arrivalDate)) {
      setError("Departure date cannot be before arrival date");
      return;
    }

    setSubmitting(true);
    setError(null);

    let targetCityId = city?._id;

    // Cache GeoNames external destination if not cached in MongoDB yet
    if (!targetCityId && city) {
      try {
        const selectRes = await API.post("/cities/select-external", {
          name: city.name,
          country: city.country,
          countryCode: city.countryCode,
          region: city.region,
          externalId: city.externalId,
          coordinates: city.coordinates,
          description: city.description,
          image: city.image,
        });

        if (selectRes.data.success) {
          targetCityId = selectRes.data.data._id;
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to select external destination"
        );
        setSubmitting(false);
        return;
      }
    }

    try {
      const res = await API.post(`/trips/${selectedTripId}/stops`, {
        city: targetCityId,
        arrivalDate,
        departureDate,
        notes: notes.trim(),
      });

      if (res.data.success) {
        setSuccessMsg(`Added ${city.name} to your trip!`);
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to add destination stop to trip"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!city) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add ${city.name} to Trip`}
      className="max-w-lg"
    >
      {loadingTrips ? (
        <div className="py-8 text-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-400 mb-2" />
          <span className="text-xs">Loading your saved trips...</span>
        </div>
      ) : trips.length === 0 ? (
        <div className="py-6 text-center space-y-3">
          <p className="text-sm text-slate-300">
            You don't have any trips yet. Create a trip first to start adding destination stops.
          </p>
          <Button
            onClick={() => {
              onClose();
              navigate("/create-trip");
            }}
          >
            <PlusCircle className="w-4 h-4 mr-2" /> Create a Trip
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

          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center space-x-3">
            <DestinationImage
              src={city.image}
              alt={city.name}
              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
            />
            <div>
              <h4 className="font-bold text-white text-sm">
                {city.name}, {city.country}
              </h4>
              <span className="text-xs text-indigo-300">
                {city.region || "Destination"}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Select Target Trip
            </label>
            <select
              value={selectedTripId}
              onChange={(e) => setSelectedTripId(e.target.value)}
              disabled={submitting}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
            >
              {trips.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({new Date(t.startDate).toLocaleDateString()} -{" "}
                  {new Date(t.endDate).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Arrival Date"
              type="date"
              value={arrivalDate}
              onChange={(e) => setArrivalDate(e.target.value)}
              disabled={submitting}
              required
            />

            <Input
              label="Departure Date"
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              min={arrivalDate}
              disabled={submitting}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Destination Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Hotel reservation, travel tips..."
              rows={2}
              disabled={submitting}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting} disabled={submitting}>
              Add Destination to Trip
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default AddCityToTripModal;
