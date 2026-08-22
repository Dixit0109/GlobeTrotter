import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Input from "../common/Input";

const EditStopModal = ({ isOpen, onClose, stop, onUpdateStop }) => {
  const [arrivalDate, setArrivalDate] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (stop && isOpen) {
      setArrivalDate(
        stop.arrivalDate ? new Date(stop.arrivalDate).toISOString().split("T")[0] : ""
      );
      setDepartureDate(
        stop.departureDate
          ? new Date(stop.departureDate).toISOString().split("T")[0]
          : ""
      );
      setNotes(stop.notes || "");
      setError(null);
    }
  }, [stop, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
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

    const success = await onUpdateStop(stop._id, {
      arrivalDate,
      departureDate,
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
      title={`Edit Stop: ${stop.city?.name || "Destination"}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-lg text-xs">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Arrival Date"
            type="date"
            value={arrivalDate}
            onChange={(e) => setArrivalDate(e.target.value)}
            required
          />

          <Input
            label="Departure Date"
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            min={arrivalDate}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Edit notes or destination details..."
            className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting} disabled={submitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditStopModal;
