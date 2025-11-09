import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import ContentList from './components/ContentList';
import VideoPlayer from './components/VideoPlayer';
import AdminDashboard from './components/AdminDashboard';
import SubscriptionPlans from './components/SubscriptionPlans';
import PrivateRoute from './components/PrivateRoute';

export default function App() {
	// plain JS (no JSX) to avoid Vite import-analysis errors for .js files
	return React.createElement(
		Provider,
		{ store },
		React.createElement(
			Router,
			null,
			React.createElement(Routes, null,
				React.createElement(Route, { path: "/", element: React.createElement(ContentList) }),
				React.createElement(Route, { path: "/watch/:id", element: React.createElement(PrivateRoute, null, React.createElement(VideoPlayer)) }),
				React.createElement(Route, { path: "/subscribe", element: React.createElement(SubscriptionPlans) }),
				React.createElement(Route, { path: "/admin", element: React.createElement(PrivateRoute, { adminOnly: true }, React.createElement(AdminDashboard)) })
			)
		)
	);
}
