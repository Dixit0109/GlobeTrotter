import React, { useState, useEffect } from "react";
import { Search, MapPin, Star, Calendar, Loader2, Plus, Globe, Sparkles } from "lucide-react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Input from "../common/Input";
import API from "../../services/api";

const defaultCityImage =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80";

const AddDestinationModal = ({ isOpen, onClose, onAddStop, tripDates }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [cities, setCities] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);

  const [arrivalDate, setArrivalDate] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Custom City Form State
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customForm, setCustomForm] = useState({
    name: "",
    country: "",
    region: "",
    description: "",
    lat: "",
    lng: "",
    image: "",
  });
  const [customSubmitting, setCustomSubmitting] = useState(false);

  // Fetch cities via Hybrid Search API
  const fetchCities = async (query = "") => {
    setSearching(true);
    try {
      const url = query
        ? `/cities/search?q=${encodeURIComponent(query)}&limit=10`
        : "/cities?sort=popularity&limit=8";
      const res = await API.get(url);
      if (res.data.success) {
        setCities(res.data.data || []);
      }
    } catch (err) {
      console.error("City search error:", err);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCities("");
      setSelectedCity(null);
      setIsCustomMode(false);
      setArrivalDate(tripDates?.startDate ? tripDates.startDate.split("T")[0] : "");
      setDepartureDate(tripDates?.endDate ? tripDates.endDate.split("T")[0] : "");
      setNotes("");
      setError(null);
      setSearchTerm("");
    }
  }, [isOpen, tripDates]);

  // Debounced search on input change
  useEffect(() => {
    if (!isOpen || isCustomMode) return;
    const timer = setTimeout(() => {
      fetchCities(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, isOpen, isCustomMode]);

  // Handle selection of a city item (caching GeoNames if necessary)
  const handleSelectCity = async (cityItem) => {
    setError(null);
    if (cityItem._id) {
      // Already a MongoDB document
      setSelectedCity(cityItem);
    } else {
      // GeoNames external result - cache via backend first
      setSearching(true);
      try {
        const res = await API.post("/cities/select-external", {
          name: cityItem.name,
          country: cityItem.country,
          countryCode: cityItem.countryCode,
          region: cityItem.region,
          externalId: cityItem.externalId,
          coordinates: cityItem.coordinates,
          description: cityItem.description,
          image: cityItem.image,
        });

        if (res.data.success) {
          setSelectedCity(res.data.data);
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to select external destination"
        );
      } finally {
        setSearching(false);
      }
    }
  };

  // Submit custom city creation
  const handleCreateCustomCity = async (e) => {
    e.preventDefault();
    if (!customForm.name.trim() || !customForm.country.trim()) {
      setError("Destination name and country are required for custom city");
      return;
    }

    setCustomSubmitting(true);
    setError(null);

    try {
      const res = await API.post("/cities/custom", {
        name: customForm.name.trim(),
        country: customForm.country.trim(),
        region: customForm.region.trim(),
        description: customForm.description.trim(),
        image: customForm.image.trim(),
        coordinates: {
          lat: customForm.lat ? parseFloat(customForm.lat) : null,
          lng: customForm.lng ? parseFloat(customForm.lng) : null,
        },
      });

      if (res.data.success) {
        setSelectedCity(res.data.data);
        setIsCustomMode(false);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create custom destination"
      );
    } finally {
      setCustomSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCity) {
      setError("Please select a city destination");
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

    const success = await onAddStop({
      city: selectedCity._id,
      arrivalDate,
      departureDate,
      notes: notes.trim(),
    });

    setSubmitting(false);
    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Destination to Itinerary"
      className="max-w-2xl"
    >
      <div className="space-y-5">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-lg text-xs">
            {error}
          </div>
        )}

        {/* Mode 1: Custom Destination Form */}
        {isCustomMode ? (
          <form onSubmit={handleCreateCustomCity} className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Create Custom Destination</span>
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsCustomMode(false)}
                className="text-xs"
              >
                Back to Search
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Destination Name *"
                value={customForm.name}
                onChange={(e) =>
                  setCustomForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g. Mount Abu"
                required
              />

              <Input
                label="Country *"
                value={customForm.country}
                onChange={(e) =>
                  setCustomForm((prev) => ({ ...prev, country: e.target.value }))
                }
                placeholder="e.g. India"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Region / State (Optional)"
                value={customForm.region}
                onChange={(e) =>
                  setCustomForm((prev) => ({ ...prev, region: e.target.value }))
                }
                placeholder="e.g. Rajasthan"
              />

              <Input
                label="Image URL (Optional)"
                value={customForm.image}
                onChange={(e) =>
                  setCustomForm((prev) => ({ ...prev, image: e.target.value }))
                }
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={customForm.description}
                onChange={(e) =>
                  setCustomForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={2}
                placeholder="Hill station known for Sunset Point and Dilwara Temples..."
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsCustomMode(false)}
                disabled={customSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={customSubmitting}
                disabled={customSubmitting}
              >
                Save & Select Destination
              </Button>
            </div>
          </form>
        ) : !selectedCity ? (
          /* Mode 2: Search & Select City */
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-300">
              1. Search City (Local & Global GeoNames)
            </label>
            <div className="relative">
              <Input
                placeholder="Search city name, e.g. Udaipur, Tokyo, New York..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>

            {searching ? (
              <div className="py-8 text-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-400 mb-2" />
                <span className="text-xs">Searching global destination database...</span>
              </div>
            ) : cities.length === 0 ? (
              <div className="py-6 text-center space-y-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                <p className="text-xs text-slate-400">
                  No destinations found matching "{searchTerm}".
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCustomMode(true)}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Custom Destination
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                  {cities.map((city, idx) => (
                    <div
                      key={city._id || `ext_${city.externalId || idx}`}
                      onClick={() => handleSelectCity(city)}
                      className="p-3 bg-slate-950 border border-slate-800 hover:border-indigo-500 rounded-xl cursor-pointer transition-all flex items-center space-x-3 group relative overflow-hidden"
                    >
                      <img
                        src={city.image || defaultCityImage}
                        alt={city.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = defaultCityImage;
                        }}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-slate-900"
                      />
                      <div className="truncate flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-slate-200 text-sm group-hover:text-indigo-400 truncate">
                            {city.name}
                          </h4>
                          {city.source && (
                            <span className="text-[9px] uppercase font-semibold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                              {city.source}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                          <span className="truncate">
                            {city.country}
                            {city.region ? `, ${city.region}` : ""}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom CTA to Add Custom Destination */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
                  <span className="text-slate-400">Can't find your destination?</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCustomMode(true)}
                    className="text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Custom Destination
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Mode 3: Selected City Form & Dates */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedCity.image || defaultCityImage}
                  alt={selectedCity.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div>
                  <h4 className="font-bold text-white text-sm">
                    {selectedCity.name}, {selectedCity.country}
                  </h4>
                  <span className="text-xs text-indigo-300 capitalize">
                    {selectedCity.region || selectedCity.source || "Destination"}
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCity(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Change Destination
              </Button>
            </div>

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
                Destination Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Hotel reservation, travel tips, landmarks to visit..."
                rows={2}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all text-sm"
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
                Add Destination
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default AddDestinationModal;
