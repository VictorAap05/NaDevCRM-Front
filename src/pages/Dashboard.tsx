import React from 'react';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  if (!user) return null;

  return (
    <div className="dash-root">
      <Navbar user={user} />

      <div className="page-content">
        <h1 className="page-title">
          Bienvenida al <em>CRM</em>
        </h1>
      </div>
    </div>
  );
};

export default Dashboard;