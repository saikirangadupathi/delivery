import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LoginPage from './loginPage.js';
import Dashboard from './dashboard.js';
import LocationPicker from './locationPicker.js';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={isLoggedIn ? <Navigate to="/location-picker" /> : <LoginPage onLogin={handleLogin} />}
          />
          <Route path="/location-picker" element={<LocationPicker onConfirmLocation={() => {}} />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
