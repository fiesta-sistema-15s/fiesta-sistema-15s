import React from 'react';
import '../styles/AdminPanel.css';

function Stats({ total, attended, pending }) {
  return (
    <div className="stats-container">
      <div className="stat-box">
        <h3>Total Invitados</h3>
        <p>{total}</p>
      </div>
      <div className="stat-box">
        <h3>Asistentes</h3>
        <p>{attended}</p>
      </div>
      <div className="stat-box">
        <h3>Pendientes</h3>
        <p>{pending}</p>
      </div>
    </div>
  );
}

export default Stats;
