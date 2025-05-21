import React from 'react';
import CountryData from './CountryData';
import '../styles/AdminPanel.css';
import { CountryFlagEmoji } from './CountryFlagEmoji';

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
              <div className='country-table'>
                <CountryFlagEmoji code={guest.country}/>
                <span>{guest.country}</span>
              </div>
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
