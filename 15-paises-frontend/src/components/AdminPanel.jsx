import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import CountryData from './CountryData';
import '../styles/AdminPanel.css';

const API_URL = 'http://localhost:5000/api';

function AdminPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, attended: 0 });
  const [socketConnected, setSocketConnected] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 10; // Número de registros por página

  useEffect(() => {
    // Configurar socket con preferencia por polling para evitar errores de WebSocket
    const socket = io('http://localhost:5000', {
      transports: ['polling', 'websocket'], // Polling primero, WebSocket después
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });
    
    socket.on('connect', () => {
      console.log('AdminPanel: Conectado al servidor Socket.io');
      setSocketConnected(true);
    });
    
    socket.on('connect_error', (error) => {
      console.error('AdminPanel: Error de conexión:', error.message);
      setSocketConnected(false);
    });
    
    // Escuchar eventos de actualización para refrescar datos
    socket.on('guestUpdated', () => {
      fetchStats();
      // Si hay búsqueda activa o se están mostrando todos los invitados, actualizar resultados
      if (searchTerm === '' || searchTerm.length >= 2) {
        handleSearch(currentPage);
      }
    });

    fetchStats();
    
    // Cleanup socket connection on unmount
    return () => {
      console.log('Desconectando socket...');
      socket.disconnect();
    };
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/guests`);
      const guests = response.data;
      setStats({
        total: guests.length,
        attended: guests.filter(guest => guest.attended).length
      });
      
      // Calcular total de páginas
      setTotalPages(Math.ceil(guests.length / PAGE_SIZE));
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleSearch = async (page = 1) => {
    setCurrentPage(page);
    setLoading(true);
    
    try {
      let response;
      
      if (searchTerm === '') {
        // Si el input está vacío, traemos resultados paginados
        response = await axios.get(`${API_URL}/guests/paginated?page=${page}&limit=${PAGE_SIZE}`);
      } else if (searchTerm.length < 2) {
        setSearchResults([]);
        setLoading(false);
        return;
      } else {
        // Búsqueda normal por nombre
        response = await axios.get(`${API_URL}/guests/search?name=${encodeURIComponent(searchTerm)}`);
      }
      
      setSearchResults(response.data.guests || response.data);
      
      // Actualizar total de páginas si se recibe esa información
      if (response.data.totalPages) {
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error("Error searching guests:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Si el input queda vacío, cargar la primera página
    if (value === '') {
      handleSearch(1);
    }
  };

  const handleCheckIn = async (guestId) => {
    try {
      await axios.patch(`${API_URL}/guests/${guestId}/checkin`);
      
      // Update local state
      setSearchResults(prevResults => 
        prevResults.map(guest => 
          guest._id === guestId ? { ...guest, attended: true } : guest
        )
      );
      
      fetchStats();
    } catch (error) {
      console.error("Error checking in guest:", error);
      alert("Hubo un error al registrar la llegada del invitado");
    }
  };

  const renderPagination = () => {
    if (searchTerm !== '' && searchTerm.length >= 2) return null; // No mostrar paginación en búsquedas por nombre
    
    return (
      <div className="pagination">
        <button 
          onClick={() => handleSearch(1)} 
          disabled={currentPage === 1 || loading}
          className="pagination-btn"
        >
          &laquo; Primera
        </button>
        
        <button 
          onClick={() => handleSearch(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className="pagination-btn"
        >
          &lt; Anterior
        </button>
        
        <span className="pagination-info">
          Página {currentPage} de {totalPages}
        </span>
        
        <button 
          onClick={() => handleSearch(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          className="pagination-btn"
        >
          Siguiente &gt;
        </button>
        
        <button 
          onClick={() => handleSearch(totalPages)}
          disabled={currentPage === totalPages || loading}
          className="pagination-btn"
        >
          Última &raquo;
        </button>
      </div>
    );
  };

  return (
    <div className="admin-panel">
      <header>
        <h1>🌎 Sistema de Registro - Evento de Viajes 🌍</h1>
      </header>
      
      <div className="stats-container">
        <div className="stat-box">
          <h3>Total Invitados</h3>
          <p>{stats.total}</p>
        </div>
        <div className="stat-box">
          <h3>Asistentes</h3>
          <p>{stats.attended}</p>
        </div>
        <div className="stat-box">
          <h3>Pendientes</h3>
          <p>{stats.total - stats.attended}</p>
        </div>
      </div>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar invitado por nombre o dejar vacío para ver todos..."
          value={searchTerm}
          onChange={handleSearchInputChange}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch(1)}
        />
        <button onClick={() => handleSearch(1)} disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>
      
      <div className="results-container">
        {searchResults.length > 0 ? (
          <>
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
                {searchResults.map(guest => (
                  <tr key={guest._id} className={guest.attended ? 'attended' : ''}>
                    <td>{guest.name}</td>
                    <td>
                      {CountryData[guest.country]?.flag || '🏳️'} {guest.country} (Mesa {guest.table})
                    </td>
                    <td>
                      {guest.attended ? 
                        <span className="status attended">Asistió</span> : 
                        <span className="status pending">Pendiente</span>
                      }
                    </td>
                    <td>
                      {!guest.attended && (
                        <button 
                          className="check-in-btn"
                          onClick={() => handleCheckIn(guest._id)}
                        >
                          Registrar Llegada
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {renderPagination()}
          </>
        ) : (
          <p className="no-results">
            {searchTerm.length > 0 ? 'No se encontraron invitados con ese nombre' : 'Busca un invitado para comenzar'}
          </p>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;