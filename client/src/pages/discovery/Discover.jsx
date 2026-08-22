import React, { useState, useEffect } from "react";
import {
  Globe,
  Search,
  MapPin,
  Star,
  DollarSign,
  Clock,
  Tag,
  Plus,
  Eye,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import API from "../../services/api";
import CityDetailsModal from "../../components/discovery/CityDetailsModal";
import ActivityDetailsModal from "../../components/discovery/ActivityDetailsModal";
import AddCityToTripModal from "../../components/discovery/AddCityToTripModal";
import AddActivityToTripModal from "../../components/discovery/AddActivityToTripModal";
import DestinationImage from "../../components/common/DestinationImage";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import ErrorMessage from "../../components/common/ErrorMessage";

const renderCostIndex = (index) => {
  const count = Math.min(5, Math.max(1, index || 1));
  return "$".repeat(count);
};

const Discover = () => {
  const [activeTab, setActiveTab] = useState("destinations"); // "destinations" | "activities"

  // --- Destinations State ---
  const [cities, setCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [citiesError, setCitiesError] = useState(null);
  const [cityPage, setCityPage] = useState(1);
  const [cityPagination, setCityPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const [cityFilters, setCityFilters] = useState({
    search: "",
    country: "",
    region: "",
    minCostIndex: "",
    maxCostIndex: "",
    sort: "popularity",
  });

  // --- Activities State ---
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activitiesError, setActivitiesError] = useState(null);
  const [actPage, setActPage] = useState(1);
  const [actPagination, setActPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const [actFilters, setActFilters] = useState({
    search: "",
    type: "",
    minCost: "",
    maxCost: "",
    durationRange: "",
    sort: "cost",
  });

  // --- Modals State ---
  const [selectedCityId, setSelectedCityId] = useState(null);
  const [cityDetails, setCityDetails] = useState(null);
  const [cityDetailsLoading, setCityDetailsLoading] = useState(false);

  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [activityDetails, setActivityDetails] = useState(null);
  const [activityDetailsLoading, setActivityDetailsLoading] = useState(false);

  const [cityToAddToTrip, setCityToAddToTrip] = useState(null);
  const [activityToAddToTrip, setActivityToAddToTrip] = useState(null);

  // Fetch Cities
  const fetchCities = async () => {
    setCitiesLoading(true);
    setCitiesError(null);
    try {
      const params = new URLSearchParams();
      params.append("page", cityPage);
      params.append("limit", 8);

      if (cityFilters.search.trim()) params.append("search", cityFilters.search.trim());
      if (cityFilters.country) params.append("country", cityFilters.country);
      if (cityFilters.region) params.append("region", cityFilters.region);
      if (cityFilters.minCostIndex) params.append("minCostIndex", cityFilters.minCostIndex);
      if (cityFilters.maxCostIndex) params.append("maxCostIndex", cityFilters.maxCostIndex);
      if (cityFilters.sort) params.append("sort", cityFilters.sort);

      const res = await API.get(`/cities?${params.toString()}`);
      if (res.data.success) {
        setCities(res.data.data || []);
        if (res.data.pagination) {
          setCityPagination(res.data.pagination);
        }
      }
    } catch (err) {
      setCitiesError(
        err.response?.data?.message || err.message || "Failed to load destinations"
      );
    } finally {
      setCitiesLoading(false);
    }
  };

  // Fetch Activities
  const fetchActivities = async () => {
    setActivitiesLoading(true);
    setActivitiesError(null);
    try {
      const params = new URLSearchParams();
      params.append("page", actPage);
      params.append("limit", 8);

      if (actFilters.search.trim()) params.append("search", actFilters.search.trim());
      if (actFilters.type) params.append("type", actFilters.type);
      if (actFilters.minCost) params.append("minCost", actFilters.minCost);
      if (actFilters.maxCost) params.append("maxCost", actFilters.maxCost);
      if (actFilters.sort) params.append("sort", actFilters.sort);

      if (actFilters.durationRange) {
        if (actFilters.durationRange === "under60") {
          params.append("minDuration", 0);
          params.append("maxDuration", 60);
        } else if (actFilters.durationRange === "60-120") {
          params.append("minDuration", 60);
          params.append("maxDuration", 120);
        } else if (actFilters.durationRange === "120-240") {
          params.append("minDuration", 120);
          params.append("maxDuration", 240);
        } else if (actFilters.durationRange === "240plus") {
          params.append("minDuration", 240);
        }
      }

      const res = await API.get(`/activities?${params.toString()}`);
      if (res.data.success) {
        setActivities(res.data.data || []);
        if (res.data.pagination) {
          setActPagination(res.data.pagination);
        }
      }
    } catch (err) {
      setActivitiesError(
        err.response?.data?.message || err.message || "Failed to load activities"
      );
    } finally {
      setActivitiesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "destinations") {
      fetchCities();
    } else {
      fetchActivities();
    }
  }, [activeTab, cityPage, actPage, cityFilters, actFilters]);

  // Fetch City Details on click
  const handleOpenCityDetails = async (cityId) => {
    setSelectedCityId(cityId);
    setCityDetails(null);
    setCityDetailsLoading(true);
    try {
      const res = await API.get(`/cities/${cityId}`);
      if (res.data.success) {
        setCityDetails(res.data.data);
      }
    } catch (err) {
      alert("Failed to load city details");
    } finally {
      setCityDetailsLoading(false);
    }
  };

  // Fetch Activity Details on click
  const handleOpenActivityDetails = async (actId) => {
    setSelectedActivityId(actId);
    setActivityDetails(null);
    setActivityDetailsLoading(true);
    try {
      const res = await API.get(`/activities/${actId}`);
      if (res.data.success) {
        setActivityDetails(res.data.data);
      }
    } catch (err) {
      alert("Failed to load activity details");
    } finally {
      setActivityDetailsLoading(false);
    }
  };

  // Filter Reset Helpers
  const handleResetCityFilters = () => {
    setCityFilters({
      search: "",
      country: "",
      region: "",
      minCostIndex: "",
      maxCostIndex: "",
      sort: "popularity",
    });
    setCityPage(1);
  };

  const handleResetActFilters = () => {
    setActFilters({
      search: "",
      type: "",
      minCost: "",
      maxCost: "",
      durationRange: "",
      sort: "cost",
    });
    setActPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Top Title & Tab Control */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Discover GlobeTrotter
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Explore world destinations, compare travel costs, and discover top activities.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("destinations")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "destinations"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Destinations
          </button>
          <button
            onClick={() => setActiveTab("activities")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "activities"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Activities Catalog
          </button>
        </div>
      </div>

      {/* ================= DESTINATIONS TAB ================= */}
      {activeTab === "destinations" && (
        <div className="space-y-6">
          {/* Destination Filters Control Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search */}
              <Input
                placeholder="Search city, e.g. Paris..."
                value={cityFilters.search}
                onChange={(e) => {
                  setCityFilters((prev) => ({ ...prev, search: e.target.value }));
                  setCityPage(1);
                }}
              />

              {/* Country */}
              <select
                value={cityFilters.country}
                onChange={(e) => {
                  setCityFilters((prev) => ({ ...prev, country: e.target.value }));
                  setCityPage(1);
                }}
                className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
              >
                <option value="">All Countries</option>
                <option value="India">India</option>
                <option value="France">France</option>
                <option value="Japan">Japan</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="United Arab Emirates">UAE</option>
                <option value="Japan">Japan</option>
                <option value="Italy">Italy</option>
                <option value="Indonesia">Indonesia</option>
              </select>

              {/* Region */}
              <select
                value={cityFilters.region}
                onChange={(e) => {
                  setCityFilters((prev) => ({ ...prev, region: e.target.value }));
                  setCityPage(1);
                }}
                className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
              >
                <option value="">All Regions</option>
                <option value="Asia">Asia</option>
                <option value="Europe">Europe</option>
                <option value="Middle East">Middle East</option>
              </select>

              {/* Cost Index */}
              <select
                value={cityFilters.maxCostIndex}
                onChange={(e) => {
                  setCityFilters((prev) => ({ ...prev, maxCostIndex: e.target.value }));
                  setCityPage(1);
                }}
                className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
              >
                <option value="">Any Cost Index</option>
                <option value="1">Budget ($)</option>
                <option value="3">Moderate ($$$)</option>
                <option value="5">Luxury ($$$$$)</option>
              </select>

              {/* Sort */}
              <select
                value={cityFilters.sort}
                onChange={(e) => {
                  setCityFilters((prev) => ({ ...prev, sort: e.target.value }));
                  setCityPage(1);
                }}
                className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
              >
                <option value="popularity">Sort by Popularity</option>
                <option value="name">Sort by Name</option>
                <option value="costIndex">Sort by Cost</option>
              </select>
            </div>

            {/* Reset Filters button */}
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={handleResetCityFilters}>
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Clear Filters
              </Button>
            </div>
          </div>

          {/* Destination Results */}
          {citiesLoading ? (
            <LoadingSpinner label="Searching destinations..." />
          ) : citiesError ? (
            <ErrorMessage message={citiesError} onRetry={fetchCities} />
          ) : cities.length === 0 ? (
            <EmptyState
              icon={Globe}
              title="No destinations found"
              description="No cities match your active search or filters. Try clearing your filters."
              actionLabel="Clear Filters"
              onAction={handleResetCityFilters}
            />
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {cities.map((city) => (
                  <div
                    key={city._id}
                    className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Image Header */}
                      <div className="relative h-44 bg-slate-950 overflow-hidden">
                        <DestinationImage
                          src={city.image}
                          alt={city.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                        {city.popularity !== undefined && (
                          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center space-x-1 backdrop-blur-sm">
                            <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                            <span>{city.popularity}</span>
                          </div>
                        )}

                        <div className="absolute bottom-2.5 left-3 right-3">
                          <h3 className="text-lg font-bold text-white tracking-tight drop-shadow">
                            {city.name}
                          </h3>
                          <p className="text-xs text-slate-300 flex items-center space-x-1">
                            <MapPin className="w-3 h-3 text-indigo-400" />
                            <span>{city.country}</span>
                          </p>
                        </div>
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">
                            {city.region || "Destination"}
                          </span>
                          <span className="font-bold text-emerald-400">
                            {renderCostIndex(city.costIndex)}
                          </span>
                        </div>
                        {city.description && (
                          <p className="text-xs text-slate-400 line-clamp-2">
                            {city.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="p-4 pt-0 flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenCityDetails(city._id)}
                        className="flex-1 justify-center text-xs"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> Details
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setCityToAddToTrip(city)}
                        className="flex-1 justify-center text-xs"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add to Trip
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {cityPagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <span className="text-xs text-slate-400">
                    Showing Page {cityPagination.page} of {cityPagination.totalPages} ({cityPagination.total} Total Cities)
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={cityPage <= 1}
                      onClick={() => setCityPage((prev) => Math.max(1, prev - 1))}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={cityPage >= cityPagination.totalPages}
                      onClick={() =>
                        setCityPage((prev) =>
                          Math.min(cityPagination.totalPages, prev + 1)
                        )
                      }
                    >
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================= ACTIVITIES TAB ================= */}
      {activeTab === "activities" && (
        <div className="space-y-6">
          {/* Activities Filter Control Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search */}
              <Input
                placeholder="Search activity, e.g. Fort..."
                value={actFilters.search}
                onChange={(e) => {
                  setActFilters((prev) => ({ ...prev, search: e.target.value }));
                  setActPage(1);
                }}
              />

              {/* Category / Type */}
              <select
                value={actFilters.type}
                onChange={(e) => {
                  setActFilters((prev) => ({ ...prev, type: e.target.value }));
                  setActPage(1);
                }}
                className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500 text-sm capitalize"
              >
                <option value="">All Categories</option>
                <option value="sightseeing">Sightseeing</option>
                <option value="food">Food & Dining</option>
                <option value="adventure">Adventure</option>
                <option value="culture">Culture & Heritage</option>
                <option value="nature">Nature & Wildlife</option>
                <option value="shopping">Shopping</option>
                <option value="relaxation">Relaxation</option>
              </select>

              {/* Max Cost */}
              <select
                value={actFilters.maxCost}
                onChange={(e) => {
                  setActFilters((prev) => ({ ...prev, maxCost: e.target.value }));
                  setActPage(1);
                }}
                className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
              >
                <option value="">Any Cost</option>
                <option value="15">Under $15</option>
                <option value="30">Under $30</option>
                <option value="50">Under $50</option>
              </select>

              {/* Duration Range */}
              <select
                value={actFilters.durationRange}
                onChange={(e) => {
                  setActFilters((prev) => ({
                    ...prev,
                    durationRange: e.target.value,
                  }));
                  setActPage(1);
                }}
                className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
              >
                <option value="">Any Duration</option>
                <option value="under60">Under 1 Hour</option>
                <option value="60-120">1 – 2 Hours</option>
                <option value="120-240">2 – 4 Hours</option>
                <option value="240plus">4+ Hours</option>
              </select>

              {/* Sort */}
              <select
                value={actFilters.sort}
                onChange={(e) => {
                  setActFilters((prev) => ({ ...prev, sort: e.target.value }));
                  setActPage(1);
                }}
                className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
              >
                <option value="cost">Sort by Cost (Lowest)</option>
                <option value="duration">Sort by Duration</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>

            {/* Reset Filters button */}
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={handleResetActFilters}>
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Clear Filters
              </Button>
            </div>
          </div>

          {/* Activity Results */}
          {activitiesLoading ? (
            <LoadingSpinner label="Searching activities..." />
          ) : activitiesError ? (
            <ErrorMessage message={activitiesError} onRetry={fetchActivities} />
          ) : activities.length === 0 ? (
            <EmptyState
              icon={Tag}
              title="No activities found"
              description="No activities match your active search or filters. Try clearing your filters."
              actionLabel="Clear Filters"
              onAction={handleResetActFilters}
            />
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {activities.map((act) => {
                  const cityObj = act.city || {};
                  return (
                    <div
                      key={act._id}
                      className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Image Header */}
                        <div className="relative h-40 bg-slate-950 overflow-hidden">
                          {act.image ? (
                            <img
                              src={act.image}
                              alt={act.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-tr from-slate-900 to-indigo-950 flex items-center justify-center opacity-30">
                              <Tag className="w-12 h-12 text-indigo-400" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                          {act.type && (
                            <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600/80 backdrop-blur text-white capitalize">
                              {act.type}
                            </div>
                          )}
                        </div>

                        <div className="p-4 space-y-2">
                          <h3 className="text-base font-bold text-white tracking-tight line-clamp-1 group-hover:text-indigo-400 transition-colors">
                            {act.name}
                          </h3>

                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span className="flex items-center space-x-1 truncate">
                              <MapPin className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                              <span className="truncate">{cityObj.name || "City"}</span>
                            </span>
                            <span className="flex items-center space-x-1 text-slate-400">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span>{act.duration}m</span>
                            </span>
                          </div>

                          {act.description && (
                            <p className="text-xs text-slate-400 line-clamp-2">
                              {act.description}
                            </p>
                          )}

                          <div className="pt-1 text-xs text-emerald-400 font-bold">
                            Est. Cost: ${act.estimatedCost}
                          </div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="p-4 pt-0 flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenActivityDetails(act._id)}
                          className="flex-1 justify-center text-xs"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> Details
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setActivityToAddToTrip(act)}
                          className="flex-1 justify-center text-xs"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" /> Add to Trip
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {actPagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <span className="text-xs text-slate-400">
                    Showing Page {actPagination.page} of {actPagination.totalPages} ({actPagination.total} Total Activities)
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={actPage <= 1}
                      onClick={() => setActPage((prev) => Math.max(1, prev - 1))}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={actPage >= actPagination.totalPages}
                      onClick={() =>
                        setActPage((prev) =>
                          Math.min(actPagination.totalPages, prev + 1)
                        )
                      }
                    >
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <CityDetailsModal
        isOpen={!!selectedCityId}
        onClose={() => setSelectedCityId(null)}
        city={cityDetails}
        onAddToTrip={(city) => setCityToAddToTrip(city)}
      />

      <ActivityDetailsModal
        isOpen={!!selectedActivityId}
        onClose={() => setSelectedActivityId(null)}
        activity={activityDetails}
        onAddToTrip={(act) => setActivityToAddToTrip(act)}
      />

      <AddCityToTripModal
        isOpen={!!cityToAddToTrip}
        onClose={() => setCityToAddToTrip(null)}
        city={cityToAddToTrip}
      />

      <AddActivityToTripModal
        isOpen={!!activityToAddToTrip}
        onClose={() => setActivityToAddToTrip(null)}
        activity={activityToAddToTrip}
      />
    </div>
  );
};

export default Discover;
