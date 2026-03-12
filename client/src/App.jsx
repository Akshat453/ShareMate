import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from './store/authStore';
import Navbar from './components/ui/Navbar';
import PrivateRoute from './components/ui/PrivateRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import CreateEvent from './pages/CreateEvent';
import Listings from './pages/Listings';
import ListingDetail from './pages/ListingDetail';
import CreateListing from './pages/CreateListing';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MapView from './pages/MapView';
import Chat from './pages/Chat';
import Leaderboard from './pages/Leaderboard';
import SquadFeed from './pages/SquadFeed';
import CreateSquad from './pages/CreateSquad';
import SquadDetail from './pages/SquadDetail';
import MySquads from './pages/MySquads';
import NotFound from './pages/NotFound';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/create" element={<PrivateRoute><CreateEvent /></PrivateRoute>} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/listings/create" element={<PrivateRoute><CreateListing /></PrivateRoute>} />
        <Route path="/listings/:id" element={<ListingDetail />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/squad" element={<SquadFeed />} />
        <Route path="/squad/create" element={<PrivateRoute><CreateSquad /></PrivateRoute>} />
        <Route path="/squad/my" element={<PrivateRoute><MySquads /></PrivateRoute>} />
        <Route path="/squad/:id" element={<SquadDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const { fetchUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
    }
  }, []);

  return (
    <BrowserRouter>
      <Navbar />
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
