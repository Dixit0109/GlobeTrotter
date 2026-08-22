import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Compass } from "lucide-react";
import API from "../../services/api";
import TripCard from "../../components/trips/TripCard";
import DeleteTripModal from "../../components/trips/DeleteTripModal";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import ErrorMessage from "../../components/common/ErrorMessage";

const Trips = () => {
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Delete modal state
  const [tripToDelete, setTripToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const fetchTrips = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get("/trips");
      if (res.data.success) {
        setTrips(res.data.data || []);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to load trips"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!tripToDelete) return;

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const res = await API.delete(`/trips/${tripToDelete._id}`);
      if (res.data.success) {
        setTrips((prev) => prev.filter((t) => t._id !== tripToDelete._id));
        setTripToDelete(null);
      }
    } catch (err) {
      setDeleteError(
        err.response?.data?.message || "Failed to delete trip. Please try again."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // Sort trips: Upcoming first (nearest start date), then past trips
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sortedTrips = [...trips].sort((a, b) => {
    const dateA = a.startDate ? new Date(a.startDate) : new Date(0);
    const dateB = b.startDate ? new Date(b.startDate) : new Date(0);
    return dateA - dateB;
  });

  const upcomingTrips = sortedTrips.filter((t) => {
    if (!t.endDate) return true;
    return new Date(t.endDate) >= today;
  });

  const pastTrips = sortedTrips.filter((t) => {
    if (!t.endDate) return false;
    return new Date(t.endDate) < today;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            My Trips
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage your travel itineraries, stop schedules, and trip budgets.
          </p>
        </div>

        <Button onClick={() => navigate("/create-trip")}>
          <PlusCircle className="w-4 h-4 mr-2" /> Plan a Trip
        </Button>
      </div>

      {deleteError && <ErrorMessage message={deleteError} />}

      {/* Main Content Area */}
      {loading ? (
        <LoadingSpinner label="Loading your trips..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchTrips} />
      ) : trips.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No trips yet"
          description="Start planning your next adventure by creating a new travel itinerary."
          actionLabel="Plan Your First Trip"
          onAction={() => navigate("/create-trip")}
        />
      ) : (
        <div className="space-y-8">
          {/* Upcoming Trips */}
          {upcomingTrips.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Upcoming Trips ({upcomingTrips.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingTrips.map((trip) => (
                  <TripCard
                    key={trip._id}
                    trip={trip}
                    onDelete={(t) => setTripToDelete(t)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Past Trips */}
          {pastTrips.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-lg font-bold text-slate-300 tracking-tight">
                Past Trips ({pastTrips.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastTrips.map((trip) => (
                  <TripCard
                    key={trip._id}
                    trip={trip}
                    onDelete={(t) => setTripToDelete(t)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteTripModal
        isOpen={!!tripToDelete}
        onClose={() => setTripToDelete(null)}
        onConfirm={handleDeleteConfirm}
        trip={tripToDelete}
        loading={deleteLoading}
      />
    </div>
  );
};

export default Trips;
