import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import Navbar from './components/Navbar.jsx';
import ContentList from './components/ContentList.jsx';
import VideoPlayer from './components/VideoPlayer.jsx';
import SubscriptionPlans from './components/SubscriptionPlans.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import Login from './components/Login.jsx';
import SignUp from './components/SignUp.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import Profile from './components/Profile.jsx';
import AdminAnalytics from './components/AdminAnalytics.jsx';
import AdminContentManager from './components/AdminContentManager.jsx';
import SeriesDetail from './components/SeriesDetail.jsx';
import Footer from './components/Footer.jsx';
import store from './redux/store'; // Adjust the import based on your store file location

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gray-900 text-white">
          <Navbar />
          <main className="container mx-auto px-4 py-6">
            <Routes>
              <Route path="/" element={<ContentList />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/profile" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />
              <Route path="/series/:id" element={
                <PrivateRoute>
                  <SeriesDetail />
                </PrivateRoute>
              } />
              <Route path="/watch/:id" element={
                <PrivateRoute>
                  <VideoPlayer />
                </PrivateRoute>
              } />
              <Route path="/watch/:id/episode/:episodeIndex" element={
                <PrivateRoute>
                  <VideoPlayer />
                </PrivateRoute>
              } />
              <Route path="/subscribe" element={<SubscriptionPlans />} />
              <Route path="/admin" element={
                <PrivateRoute adminOnly>
                  <AdminDashboard />
                </PrivateRoute>
              } />
              <Route path="/admin/analytics" element={
                <PrivateRoute adminOnly>
                  <AdminAnalytics />
                </PrivateRoute>
              } />
              <Route path="/admin/manage-content" element={
                <PrivateRoute adminOnly>
                  <AdminContentManager />
                </PrivateRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </Provider>
  );
}
