import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  PlusCircle,
  Calendar,
  DollarSign,
  MapPin,
  Compass,
  Clock,
  Sparkles,
  Share2,
  Lock,
  Eye,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import API from "../../services/api";
import ItineraryStopCard from "../../components/itinerary/ItineraryStopCard";
import AddDestinationModal from "../../components/itinerary/AddDestinationModal";
import EditStopModal from "../../components/itinerary/EditStopModal";
import AddActivityModal from "../../components/itinerary/AddActivityModal";
import EditActivityModal from "../../components/itinerary/EditActivityModal";
import ShareTripModal from "../../components/sharing/ShareTripModal";
import VisibilityBadge from "../../components/sharing/VisibilityBadge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import ErrorMessage from "../../components/common/ErrorMessage";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const TripDetails = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorCode, setErrorCode] = useState(null);

  // Modal States
  const [isAddStopOpen, setIsAddStopOpen] = useState(false);
  const [stopToEdit, setStopToEdit] = useState(null);
  const [stopForActivity, setStopForActivity] = useState(null);
  const [activityToEdit, setActivityToEdit] = useState(null); // { stopId, entry }
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const fetchTripDetails = async () => {
    setLoading(true);
    setError(null);
    setErrorCode(null);
    try {
      const res = await API.get(`/trips/${tripId}`);
      if (res.data.success) {
        setTrip(res.data.data);
      }
    } catch (err) {
      const status = err.response?.status;
      setErrorCode(status);
      setError(
        err.response?.data?.message || err.message || "Failed to load trip details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tripId) {
      fetchTripDetails();
    }
  }, [tripId]);

  // Determine ownership safely
  const isOwner =
    user &&
    trip &&
    (typeof trip.owner === "object"
      ? trip.owner._id === user._id
      : trip.owner === user._id);

  // --- Stop Operations ---
  const handleAddStop = async (stopData) => {
    try {
      const res = await API.post(`/trips/${tripId}/stops`, stopData);
      if (res.data.success) {
        setTrip(res.data.data);
        return true;
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add destination");
      return false;
    }
  };

  const handleUpdateStop = async (stopId, stopData) => {
    try {
      const res = await API.put(`/trips/${tripId}/stops/${stopId}`, stopData);
      if (res.data.success) {
        setTrip(res.data.data);
        return true;
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update stop");
      return false;
    }
  };

  const handleDeleteStop = async (stop) => {
    if (!window.confirm(`Remove ${stop.city?.name || "destination"} from itinerary?`)) {
      return;
    }
    try {
      const res = await API.delete(`/trips/${tripId}/stops/${stop._id}`);
      if (res.data.success) {
        setTrip(res.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete stop");
    }
  };

  const handleReorderStops = async (newStops) => {
    const stopIds = newStops.map((s) => s._id);
    // Optimistic UI update
    setTrip((prev) => ({ ...prev, stops: newStops }));

    try {
      const res = await API.put(`/trips/${tripId}/stops/reorder`, { stopIds });
      if (res.data.success) {
        setTrip(res.data.data);
      }
    } catch (err) {
      alert("Failed to save new order. Refreshing...");
      fetchTripDetails();
    }
  };

  const handleMoveUp = (index) => {
    if (index === 0 || !trip?.stops) return;
    const newStops = [...trip.stops];
    const temp = newStops[index - 1];
    newStops[index - 1] = newStops[index];
    newStops[index] = temp;
    handleReorderStops(newStops);
  };

  const handleMoveDown = (index) => {
    if (!trip?.stops || index === trip.stops.length - 1) return;
    const newStops = [...trip.stops];
    const temp = newStops[index + 1];
    newStops[index + 1] = newStops[index];
    newStops[index] = temp;
    handleReorderStops(newStops);
  };

  // --- Activity Operations ---
  const handleAddActivity = async (stopId, activityData) => {
    try {
      const res = await API.post(
        `/trips/${tripId}/stops/${stopId}/activities`,
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
        `/trips/${tripId}/stops/${stopId}/activities/${activityEntryId}`,
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
        `/trips/${tripId}/stops/${stopId}/activities/${activityEntryId}`
      );
      if (res.data.success) {
        setTrip(res.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove activity");
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen label="Loading trip itinerary..." />;
  }

  // 403 Forbidden Access Denied State
  if (errorCode === 403) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-6">
        <div className="p-4 bg-rose-500/10 text-rose-400 rounded-full w-16 h-16 mx-auto flex items-center justify-center border border-rose-500/20 shadow-xl">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Private Trip
          </h2>
          <p className="text-sm text-slate-400">
            You don't have permission to view this trip. The owner has set its visibility to private.
          </p>
        </div>
        <div className="flex items-center justify-center space-x-3 pt-2">
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
          <Button onClick={() => navigate("/trips")}>
            Back to My Trips
          </Button>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <ErrorMessage
          message={error || "Trip not found"}
          onRetry={fetchTripDetails}
        />
        <div className="text-center mt-4">
          <Button variant="outline" onClick={() => navigate("/trips")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Return to My Trips
          </Button>
        </div>
      </div>
    );
  }

  const stops = trip.stops || [];
  const totalActivitiesCount = stops.reduce(
    (sum, s) => sum + (s.selectedActivities?.length || 0),
    0
  );

  let durationDays = 1;
  if (trip.startDate && trip.endDate) {
    const diff = Math.abs(new Date(trip.endDate) - new Date(trip.startDate));
    durationDays = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => navigate("/trips")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to My Trips
        </Button>

        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsShareModalOpen(true)}
          >
            <Share2 className="w-4 h-4 mr-1.5" /> Share Trip
          </Button>

          {isOwner && (
            <Button onClick={() => setIsAddStopOpen(true)}>
              <PlusCircle className="w-4 h-4 mr-2" /> Add Destination
            </Button>
          )}
        </div>
      </div>

      {/* Non-owner Viewer Context Banner */}
      {!isOwner && (
        <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-xl flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span>Viewing shared trip created by another GlobeTrotter user. (Read-Only Mode)</span>
          </div>
          <VisibilityBadge visibility={trip.visibility} />
        </div>
      )}

      {/* Trip Cover Banner & Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="h-48 sm:h-64 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden">
          {trip.coverPhoto ? (
            <img
              src={trip.coverPhoto}
              alt={trip.name}
              className="w-full h-full object-cover opacity-60"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-20 text-indigo-400">
              <Compass className="w-24 h-24" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

          {/* Visibility Badge */}
          <div className="absolute top-4 right-4">
            <VisibilityBadge visibility={trip.visibility} />
          </div>

          <div className="absolute bottom-6 left-6 right-6 space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
              {trip.name}
            </h1>
            {trip.description && (
              <p className="text-sm text-slate-300 max-w-2xl line-clamp-2">
                {trip.description}
              </p>
            )}
          </div>
        </div>

        {/* Trip Metadata Stats Bar */}
        <div className="p-4 sm:p-6 bg-slate-900 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-1">Dates</span>
            <span className="font-bold text-slate-200 flex items-center">
              <Calendar className="w-3.5 h-3.5 text-indigo-400 mr-1.5 flex-shrink-0" />
              {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
            </span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-1">Duration & Destinations</span>
            <span className="font-bold text-slate-200 flex items-center">
              <MapPin className="w-3.5 h-3.5 text-indigo-400 mr-1.5 flex-shrink-0" />
              {durationDays} Days • {stops.length} Cities
            </span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-1">Activities Scheduled</span>
            <span className="font-bold text-slate-200 flex items-center">
              <Clock className="w-3.5 h-3.5 text-indigo-400 mr-1.5 flex-shrink-0" />
              {totalActivitiesCount} Activities
            </span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-1">Target Budget</span>
            <span className="font-bold text-emerald-400 flex items-center">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400 mr-1 flex-shrink-0" />
              {trip.budgetLimit > 0 ? `$${trip.budgetLimit.toLocaleString()}` : "Not Set"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Itinerary Timeline Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Compass className="w-5 h-5 text-indigo-400" />
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {isOwner ? "Itinerary Builder" : "Itinerary Schedule"}
            </h2>
          </div>
          {isOwner && (
            <span className="text-xs text-slate-400">
              Reorder destinations with up/down arrows
            </span>
          )}
        </div>

        {stops.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title={isOwner ? "Your itinerary is empty" : "No itinerary destinations"}
            description={
              isOwner
                ? "Add your first destination city to start scheduling daily stops and activities."
                : "This shared trip has no destination stops added yet."
            }
            actionLabel={isOwner ? "Add Destination" : undefined}
            onAction={isOwner ? () => setIsAddStopOpen(true) : undefined}
          />
        ) : (
          <div className="pt-2">
            {stops.map((stop, idx) => (
              <ItineraryStopCard
                key={stop._id}
                stop={stop}
                index={idx}
                totalStops={stops.length}
                isOwner={isOwner}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onEditStop={(s) => setStopToEdit(s)}
                onDeleteStop={handleDeleteStop}
                onAddActivity={(s) => setStopForActivity(s)}
                onEditActivity={(stopId, entry) =>
                  setActivityToEdit({ stopId, entry })
                }
                onRemoveActivity={handleRemoveActivity}
              />
            ))}
          </div>
        )}
      </section>

      {/* Modals */}
      {isOwner && (
        <>
          <AddDestinationModal
            isOpen={isAddStopOpen}
            onClose={() => setIsAddStopOpen(false)}
            onAddStop={handleAddStop}
            tripDates={{ startDate: trip.startDate, endDate: trip.endDate }}
          />

          <EditStopModal
            isOpen={!!stopToEdit}
            onClose={() => setStopToEdit(null)}
            stop={stopToEdit}
            onUpdateStop={handleUpdateStop}
          />

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
        </>
      )}

      <ShareTripModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        trip={trip}
        isOwner={isOwner}
        onUpdateVisibility={(updatedTrip) => setTrip(updatedTrip)}
      />
    </div>
  );
};

export default TripDetails;
