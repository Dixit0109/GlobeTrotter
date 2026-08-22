import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Compass, Calendar, DollarSign, Image, Eye, ArrowLeft, PlusCircle } from "lucide-react";
import API from "../../services/api";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import ErrorMessage from "../../components/common/ErrorMessage";

const CreateTrip = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    budgetLimit: "",
    visibility: "private",
    coverPhoto: "",
  });

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [imageError, setImageError] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "coverPhoto") {
      setImageError(false);
    }

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name || formData.name.trim() === "") {
      errors.name = "Trip name is required";
    }

    if (!formData.startDate) {
      errors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      errors.endDate = "End date is required";
    } else if (formData.startDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      errors.endDate = "End date cannot be before start date";
    }

    if (formData.budgetLimit !== "" && (isNaN(Number(formData.budgetLimit)) || Number(formData.budgetLimit) < 0)) {
      errors.budgetLimit = "Budget limit must be a non-negative number";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!validateForm()) return;

    setLoading(true);
    setServerError(null);

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description ? formData.description.trim() : "",
        startDate: formData.startDate,
        endDate: formData.endDate,
        visibility: formData.visibility,
      };

      if (formData.budgetLimit !== "") {
        payload.budgetLimit = Number(formData.budgetLimit);
      }

      if (formData.coverPhoto && formData.coverPhoto.trim() !== "") {
        payload.coverPhoto = formData.coverPhoto.trim();
      }

      const res = await API.post("/trips", payload);

      if (res.data.success && res.data.data?._id) {
        navigate(`/trips/${res.data.data._id}`);
      } else {
        setServerError("Failed to create trip. Please try again.");
      }
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to create trip. Please check your inputs."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/trips")}
            disabled={loading}
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Plan a New Trip
            </h2>
            <p className="text-xs text-slate-400">
              Fill in your trip details to get started
            </p>
          </div>
        </div>
      </div>

      {serverError && <ErrorMessage message={serverError} />}

      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl"
        noValidate
      >
        {/* Trip Name & Description */}
        <div className="space-y-4">
          <Input
            label="Trip Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Summer Tour of Japan & France"
            error={fieldErrors.name}
            disabled={loading}
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Description / Notes
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add details about your itinerary, goals, or notes..."
              rows={3}
              disabled={loading}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm disabled:opacity-50"
            />
          </div>
        </div>

        {/* Start & End Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
          <Input
            label="Start Date"
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            error={fieldErrors.startDate}
            disabled={loading}
            required
          />

          <Input
            label="End Date"
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            min={formData.startDate}
            error={fieldErrors.endDate}
            disabled={loading}
            required
          />
        </div>

        {/* Budget Limit & Visibility */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
          <Input
            label="Budget Limit ($)"
            type="number"
            name="budgetLimit"
            value={formData.budgetLimit}
            onChange={handleChange}
            placeholder="e.g. 5000"
            min="0"
            step="100"
            error={fieldErrors.budgetLimit}
            disabled={loading}
            helperText="Optional target budget limit for this trip"
          />

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Visibility
            </label>
            <select
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm disabled:opacity-50"
            >
              <option value="private">Private (Only you can access)</option>
              <option value="public">Public (Can be shared publicly)</option>
              <option value="shared">Shared (Reserved for collaborators)</option>
            </select>
          </div>
        </div>

        {/* Cover Photo URL & Live Preview */}
        <div className="pt-2 border-t border-slate-800/80 space-y-3">
          <Input
            label="Cover Photo Image URL"
            type="url"
            name="coverPhoto"
            value={formData.coverPhoto}
            onChange={handleChange}
            placeholder="https://images.unsplash.com/photo-..."
            disabled={loading}
            helperText="Provide an image URL for the trip header cover card"
          />

          {formData.coverPhoto && !imageError && (
            <div className="mt-2 relative h-40 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
              <img
                src={formData.coverPhoto}
                alt="Cover Preview"
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
              <div className="absolute top-2 left-2 px-2 py-1 rounded bg-slate-950/80 text-[10px] font-bold text-indigo-300 border border-slate-800">
                Image Preview
              </div>
            </div>
          )}

          {imageError && (
            <p className="text-xs text-amber-400">
              Unable to preview image URL. A default gradient will be used.
            </p>
          )}
        </div>

        {/* Submit / Cancel Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
          <Button
            variant="secondary"
            onClick={() => navigate("/trips")}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button type="submit" loading={loading} disabled={loading}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Trip
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateTrip;
