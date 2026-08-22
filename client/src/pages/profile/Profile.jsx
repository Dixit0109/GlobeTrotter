import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import API from "../../services/api";
import ProfileHeader from "../../components/profile/ProfileHeader";
import ProfileStats from "../../components/profile/ProfileStats";
import AccountInfoCard from "../../components/profile/AccountInfoCard";
import SavedDestinationsCard from "../../components/profile/SavedDestinationsCard";
import SecurityCard from "../../components/profile/SecurityCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();

  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [tripsError, setTripsError] = useState(null);

  const fetchTripsForStats = async () => {
    setTripsLoading(true);
    setTripsError(null);
    try {
      const res = await API.get("/trips");
      if (res.data.success) {
        setTrips(res.data.data || []);
      }
    } catch (err) {
      setTripsError(
        err.response?.data?.message || err.message || "Failed to load trip statistics"
      );
    } finally {
      setTripsLoading(false);
    }
  };

  useEffect(() => {
    fetchTripsForStats();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (authLoading) {
    return <LoadingSpinner fullScreen label="Loading user profile..." />;
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <ErrorMessage message="User context unavailable. Please log in again." />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Profile Header */}
      <ProfileHeader user={user} />

      {/* Profile Statistics */}
      {tripsLoading ? (
        <LoadingSpinner label="Calculating travel statistics..." />
      ) : tripsError ? (
        <ErrorMessage message={tripsError} onRetry={fetchTripsForStats} />
      ) : (
        <ProfileStats trips={trips} />
      )}

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Account Details & Saved Destinations */}
        <div className="space-y-8">
          <AccountInfoCard user={user} />
          <SavedDestinationsCard savedDestinations={user.savedDestinations} />
        </div>

        {/* Right Column: Security & Session */}
        <div className="space-y-8">
          <SecurityCard onLogout={handleLogout} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
