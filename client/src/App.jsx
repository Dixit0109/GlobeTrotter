import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import Trips from "./pages/trips/Trips";
import CreateTrip from "./pages/trips/CreateTrip";
import Discover from "./pages/discovery/Discover";
import Budget from "./pages/budget/Budget";
import CalendarPage from "./pages/itinerary/Calendar";
import Profile from "./pages/profile/Profile";

import TripDetails from "./pages/trips/TripDetails";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/trips" element={<Trips />} />
              <Route path="/trips/:tripId" element={<TripDetails />} />
              <Route path="/create-trip" element={<CreateTrip />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/budget" element={<Budget />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Redirect / to /dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
