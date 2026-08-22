import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon, Compass, MapPin, Clock, Plus } from "lucide-react";
import API from "../../services/api";
import DateNavigator from "../../components/calendar/DateNavigator";
import DayView from "../../components/calendar/DayView";
import TimelineView from "../../components/calendar/TimelineView";
import AddActivityModal from "../../components/itinerary/AddActivityModal";
import EditActivityModal from "../../components/itinerary/EditActivityModal";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import ErrorMessage from "../../components/common/ErrorMessage";

// Date-only helper to generate YYYY-MM-DD array without UTC offset shifts
const getDaysArray = (startDateStr, endDateStr) => {
  if (!startDateStr || !endDateStr) return [];
  const dates = [];
  const [sY, sM, sD] = startDateStr.split("T")[0].split("-").map(Number);
  const [eY, eM, eD] = endDateStr.split("T")[0].split("-").map(Number);

  let curr = new Date(sY, sM - 1, sD);
  const end = new Date(eY, eM - 1, eD);

  while (curr <= end) {
    const year = curr.getFullYear();
    const month = String(curr.getMonth() + 1).padStart(2, "0");
    const day = String(curr.getDate()).padStart(2, "0");
    dates.push(`${year}-${month}-${day}`);
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
};

const formatDateOnly = (dateVal) => {
  if (!dateVal) return "";
  const dStr = typeof dateVal === "string" ? dateVal.split("T")[0] : dateVal.toISOString().split("T")[0];
  return dStr;
};

const CalendarPage = () => {
  const navigate = useNavigate();

  // Trips State
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState("");
  const [tripsLoading, setTripsLoading] = useState(true);
  const [tripsError, setTripsError] = useState(null);

  // Selected Trip Details State
  const [trip, setTrip] = useState(null);
  const [tripLoading, setTripLoading] = useState(false);
  const [tripError, setTripError] = useState(null);

  // Navigation & View State
  const [viewMode, setViewMode] = useState("day"); // "day" | "timeline"
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // Modals State
  const [stopForActivity, setStopForActivity] = useState(null);
  const [activityToEdit, setActivityToEdit] = useState(null); // { stopId, entry }

  // Fetch Trips
  const fetchTrips = async () => {
    setTripsLoading(true);
    setTripsError(null);
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
      setTripsError(
        err.response?.data?.message || err.message || "Failed to load trips"
      );
    } finally {
      setTripsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  // Fetch Trip Itinerary on selectedTripId change
  const fetchTripItinerary = async (tripId) => {
    if (!tripId) return;
    setTripLoading(true);
    setTripError(null);
    try {
      const res = await API.get(`/trips/${tripId}`);
      if (res.data.success) {
        setTrip(res.data.data);
        setSelectedDayIndex(0);
      }
    } catch (err) {
      setTripError(
        err.response?.data?.message || "Failed to load trip itinerary"
      );
    } finally {
      setTripLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTripId) {
      fetchTripItinerary(selectedTripId);
    }
  }, [selectedTripId]);

  // Compute Days & Maps
  const days = trip ? getDaysArray(trip.startDate, trip.endDate) : [];
  const stops = trip?.stops || [];

  // Map dayStr -> activeStop
  const stopsMap = {};
  // Map dayStr -> [ { entry, stopId, city } ]
  const dayActivitiesMap = {};

  days.forEach((dayStr) => {
    stopsMap[dayStr] = null;
    dayActivitiesMap[dayStr] = [];
  });

  stops.forEach((stop) => {
    const arrStr = formatDateOnly(stop.arrivalDate);
    const depStr = formatDateOnly(stop.departureDate);

    // Populate active stop for dates within stop range
    days.forEach((dayStr) => {
      if (arrStr && depStr && dayStr >= arrStr && dayStr <= depStr) {
        if (!stopsMap[dayStr]) {
          stopsMap[dayStr] = stop;
        }
      }

      // Populate scheduled activities
      (stop.selectedActivities || []).forEach((actEntry) => {
        const schedStr = formatDateOnly(actEntry.scheduledDate);
        if (schedStr === dayStr) {
          dayActivitiesMap[dayStr].push({
            entry: actEntry,
            stopId: stop._id,
            city: stop.city,
          });
        }
      });
    });
  });

  // Sort activities chronologically by scheduledTime per day
  Object.keys(dayActivitiesMap).forEach((dayStr) => {
    dayActivitiesMap[dayStr].sort((a, b) => {
      const timeA = a.entry.scheduledTime || "";
      const timeB = b.entry.scheduledTime || "";
      return timeA.localeCompare(timeB);
    });
  });

  // Activity Handlers
  const handleAddActivity = async (stopId, activityData) => {
    try {
      const res = await API.post(
        `/trips/${selectedTripId}/stops/${stopId}/activities`,
        activityData
      );
      if (res.data.success) {
        setTrip(res.data.data);
        return true;
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add activity");
      return false;
    }
  };

  const handleUpdateActivity = async (stopId, activityEntryId, activityData) => {
    try {
      const res = await API.put(
        `/trips/${selectedTripId}/stops/${stopId}/activities/${activityEntryId}`,
        activityData
      );
      if (res.data.success) {
        setTrip(res.data.data);
        return true;
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update activity");
      return false;
    }
  };

  const handleRemoveActivity = async (stopId, activityEntryId) => {
    try {
      const res = await API.delete(
        `/trips/${selectedTripId}/stops/${stopId}/activities/${activityEntryId}`
      );
      if (res.data.success) {
        setTrip(res.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove activity");
    }
  };

  const currentDayStr = days[selectedDayIndex] || "";
  const activeStopForSelectedDay = stopsMap[currentDayStr];
  const dayActivitiesForSelectedDay = dayActivitiesMap[currentDayStr] || [];

  return (
    <div className="space-y-6">
      {/* Top Header & Trip Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Trip Calendar & Timeline
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Visualize your daily travel schedule, city stops, and scheduled activities.
          </p>
        </div>

        {trips.length > 0 && (
          <div className="flex items-center space-x-3">
            <select
              value={selectedTripId}
              onChange={(e) => setSelectedTripId(e.target.value)}
              className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 font-semibold focus:outline-none focus:border-indigo-500 text-sm max-w-xs"
            >
              {trips.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>

            {/* View Switcher */}
            <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("day")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "day"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Day View
              </button>
              <button
                onClick={() => setViewMode("timeline")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "timeline"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Timeline
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Viewport */}
      {tripsLoading ? (
        <LoadingSpinner label="Loading saved trips..." />
      ) : tripsError ? (
        <ErrorMessage message={tripsError} onRetry={fetchTrips} />
      ) : trips.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="No trips available"
          description="Create a trip to build your interactive calendar schedule."
          actionLabel="Create a Trip"
          onAction={() => navigate("/create-trip")}
        />
      ) : tripLoading ? (
        <LoadingSpinner label="Loading trip itinerary schedule..." />
      ) : tripError ? (
        <ErrorMessage
          message={tripError}
          onRetry={() => fetchTripItinerary(selectedTripId)}
        />
      ) : stops.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No itinerary yet"
          description="Add destination cities to your trip itinerary to start populating your daily calendar."
          actionLabel="Open Trip Itinerary"
          onAction={() => navigate(`/trips/${selectedTripId}`)}
        />
      ) : (
        <div className="space-y-6">
          {/* Day View */}
          {viewMode === "day" && (
            <div className="space-y-6">
              <DateNavigator
                days={days}
                currentIndex={selectedDayIndex}
                onChangeIndex={(idx) => setSelectedDayIndex(idx)}
                onResetToStart={() => setSelectedDayIndex(0)}
              />

              <DayView
                dayStr={currentDayStr}
                activeStop={activeStopForSelectedDay}
                dayActivities={dayActivitiesForSelectedDay}
                onEditActivity={(stopId, entry) =>
                  setActivityToEdit({ stopId, entry })
                }
                onRemoveActivity={handleRemoveActivity}
                onAddActivity={(stop) => setStopForActivity(stop)}
              />
            </div>
          )}

          {/* Timeline View */}
          {viewMode === "timeline" && (
            <TimelineView
              days={days}
              stopsMap={stopsMap}
              dayActivitiesMap={dayActivitiesMap}
              onEditActivity={(stopId, entry) =>
                setActivityToEdit({ stopId, entry })
              }
              onRemoveActivity={handleRemoveActivity}
              onAddActivity={(stop) => setStopForActivity(stop)}
            />
          )}
        </div>
      )}

      {/* Modals */}
      <AddActivityModal
        isOpen={!!stopForActivity}
        onClose={() => setStopForActivity(null)}
        stop={stopForActivity}
        onAddActivity={handleAddActivity}
      />

      <EditActivityModal
        isOpen={!!activityToEdit}
        onClose={() => setActivityToEdit(null)}
        stopId={activityToEdit?.stopId}
        selectedActivityEntry={activityToEdit?.entry}
        onUpdateActivity={handleUpdateActivity}
      />
    </div>
  );
};

export default CalendarPage;
