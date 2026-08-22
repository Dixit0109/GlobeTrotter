import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Input from "../common/Input";

const EditActivityModal = ({
  isOpen,
  onClose,
  stopId,
  selectedActivityEntry,
  onUpdateActivity,
}) => {
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedActivityEntry && isOpen) {
      setScheduledDate(
        selectedActivityEntry.scheduledDate
          ? new Date(selectedActivityEntry.scheduledDate)
              .toISOString()
              .split("T")[0]
          : ""
      );
      setScheduledTime(selectedActivityEntry.scheduledTime || "");
      setNotes(selectedActivityEntry.notes || "");
      setError(null);
    }
  }, [selectedActivityEntry, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const success = await onUpdateActivity(
      stopId,
      selectedActivityEntry._id,
      {
        scheduledDate: scheduledDate || undefined,
        scheduledTime: scheduledTime || undefined,
        notes: notes.trim(),
      }
    );

    setSubmitting(false);
    if (success) {
      onClose();
    }
  };

  if (!selectedActivityEntry) return null;

  const actDoc = selectedActivityEntry.activity;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Activity: ${actDoc?.name || "Activity"}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-lg text-xs">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Scheduled Date"
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
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
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Edit activity notes..."
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

export default EditActivityModal;
