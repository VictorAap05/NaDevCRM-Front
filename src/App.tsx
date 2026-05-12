<<<<<<< HEAD
import React from 'react';
import AppRoutes from './routes/AppRoutes';
import './styles/global.css';

function App() {
  return <AppRoutes />;
=======
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Si entran a la raíz '/', los mandamos al login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
>>>>>>> 1a4b0616a2f3bf69cc14df0c685b96bc0a836875
}

export default App;