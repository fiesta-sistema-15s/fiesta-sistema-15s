import React from 'react';
import CountryData from './CountryData';
import '../styles/AdminPanel.css';

function GuestTable({ guests, onCheckIn }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>País / Mesa</th>
          <th>Estado</th>
          <th>Acción</th>
        </tr>
      </thead>
      <tbody>
        {guests.map(guest => (
          <tr key={guest._id} className={guest.attended ? 'attended' : ''}>
            <td>{guest.name}</td>
            <td>
              {CountryData[guest.country]?.flag || '🏳️'} {guest.country} (Mesa {guest.table})
            </td>
            <td>
              {guest.attended ? (
                <span className="status attended">Asistió</span>
              ) : (
                <span className="status pending">Pendiente</span>
              )}
            </td>
            <td>
              {!guest.attended && (
                <button className="check-in-btn" onClick={() => onCheckIn(guest._id)}>
                  Registrar Llegada
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default GuestTable;
