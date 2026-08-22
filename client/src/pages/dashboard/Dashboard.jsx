import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Compass, PlusCircle, Globe, RefreshCw, Sparkles, Wallet } from "lucide-react";
import API from "../../services/api";
import WelcomeSection from "../../components/dashboard/WelcomeSection";
import QuickActions from "../../components/dashboard/QuickActions";
import TripPreviewCard from "../../components/dashboard/TripPreviewCard";
import DestinationCard from "../../components/dashboard/DestinationCard";
import BudgetHighlightCard from "../../components/dashboard/BudgetHighlightCard";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";

const Dashboard = () => {
  const navigate = useNavigate();

  // Trips State
  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [tripsError, setTripsError] = useState(null);

  // Cities State
  const [cities, setCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [citiesError, setCitiesError] = useState(null);

  // Budget Data Map ({ [tripId]: budgetData })
  const [budgetMap, setBudgetMap] = useState({});

  // Fetch Trips
  const fetchTrips = async () => {
    setTripsLoading(true);
    setTripsError(null);
    try {
      const res = await API.get("/trips");
      if (res.data.success) {
        const fetchedTrips = res.data.data || [];
        setTrips(fetchedTrips);

        // Fetch budget information for top 3 relevant trips
        const topTrips = fetchedTrips.slice(0, 3);
        topTrips.forEach(async (trip) => {
          try {
            const bRes = await API.get(`/trips/${trip._id}/budget`);
            if (bRes.data.success) {
              setBudgetMap((prev) => ({
                ...prev,
                [trip._id]: bRes.data.data,
              }));
            }
          } catch (err) {
            // Silently ignore single budget fetch error
          }
        });
      }
    } catch (err) {
      setTripsError(
        err.response?.data?.message || err.message || "Failed to load trips"
      );
    } finally {
      setTripsLoading(false);
    }
  };

  // Fetch Popular Destinations
  const fetchCities = async () => {
    setCitiesLoading(true);
    setCitiesError(null);
    try {
      const res = await API.get("/cities?sort=popularity&limit=6");
      if (res.data.success) {
        setCities(res.data.data || []);
      }
    } catch (err) {
      setCitiesError(
        err.response?.data?.message || err.message || "Failed to load destinations"
      );
    } finally {
      setCitiesLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
    fetchCities();
  }, []);

  // Separate upcoming vs past trips
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

  const recentTrips = sortedTrips.filter((t) => {
    if (!t.endDate) return false;
    return new Date(t.endDate) < today;
  });

  const displayUpcoming = upcomingTrips.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* 1. Welcome Greeting Banner */}
      <WelcomeSection />

      {/* 2. Quick Action Buttons */}
      <QuickActions />

      {/* 3. Main Dashboard Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Upcoming & Recent Trips */}
        <div className="lg:col-span-2 space-y-8">
          {/* Upcoming Trips Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Compass className="w-5 h-5 text-indigo-400" />
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Upcoming Trips
                </h3>
              </div>
              {trips.length > 0 && (
                <button
                  onClick={() => navigate("/trips")}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  View All Trips ({trips.length}) &rarr;
                </button>
              )}
            </div>

            {tripsLoading ? (
              <LoadingSpinner label="Loading your travel plans..." />
            ) : tripsError ? (
              <ErrorMessage message={tripsError} onRetry={fetchTrips} />
            ) : trips.length === 0 ? (
              // Empty State for New Users
              <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
                <div className="p-3 bg-indigo-600/10 text-indigo-400 rounded-full w-fit mx-auto border border-indigo-500/20">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-white">
                  Your next adventure starts here
                </h4>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  You haven't created any trips yet. Start planning your personalized itinerary with daily activities and budget tracking.
                </p>
                <Button
                  onClick={() => navigate("/create-trip")}
                  className="inline-flex items-center"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Plan Your First Trip
                </Button>
              </div>
            ) : displayUpcoming.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayUpcoming.map((trip) => (
                  <TripPreviewCard key={trip._id} trip={trip} />
                ))}
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-900/40 border border-slate-800/80 rounded-xl">
                <p className="text-sm text-slate-400">
                  No upcoming trips scheduled.
                </p>
              </div>
            )}
          </section>

          {/* Recent / Completed Trips Section */}
          {recentTrips.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Past Adventures
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recentTrips.slice(0, 2).map((trip) => (
                  <TripPreviewCard key={trip._id} trip={trip} />
                ))}
              </div>
            </section>
          )}

          {/* Popular Destinations Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-indigo-400" />
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Popular Destinations
                </h3>
              </div>
              <button
                onClick={() => navigate("/discover")}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Explore Destinations &rarr;
              </button>
            </div>

            {citiesLoading ? (
              <LoadingSpinner label="Fetching top destinations..." />
            ) : citiesError ? (
              <ErrorMessage message={citiesError} onRetry={fetchCities} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {cities.map((city) => (
                  <DestinationCard key={city._id} city={city} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right 1 Column: Budget Highlights & Summary Sidebar */}
        <div className="space-y-6">
          <section className="space-y-4">
            <div className="flex items-center space-x-2">
              <Wallet className="w-5 h-5 text-indigo-400" />
              <h3 className="text-xl font-bold text-white tracking-tight">
                Budget Highlights
              </h3>
            </div>

            {tripsLoading ? (
              <LoadingSpinner label="Calculating trip budgets..." />
            ) : displayUpcoming.length > 0 ? (
              <div className="space-y-3">
                {displayUpcoming.map((trip) => (
                  <BudgetHighlightCard
                    key={trip._id}
                    tripName={trip.name}
                    budgetData={budgetMap[trip._id]}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <div className="text-center py-4 space-y-2">
                  <p className="text-xs text-slate-400">
                    Create a trip with a budget limit to track live expenses here.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/create-trip")}
                  >
                    Start a Trip
                  </Button>
                </div>
              </Card>
            )}
          </section>

          {/* Quick Travel Tip Widget */}
          <Card
            title="GlobeTrotter Tip"
            subtitle="Hackathon Travel Planning"
            className="bg-gradient-to-br from-slate-900 to-indigo-950/40"
          >
            <p className="text-xs text-slate-300 leading-relaxed">
              Combine multi-city stops with realistic budget limits to keep your itinerary organized and stress-free.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
