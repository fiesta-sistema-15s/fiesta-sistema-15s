import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import Stats from '../components/Stats';
import SearchBar from '../components/SearchBar';
import GuestTable from '../components/GuestTable';
import Pagination from '../components/Pagination';
import '../styles/AdminPanel.css';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_URL_BACKEND;
const API_URL_WS = import.meta.env.VITE_URL_BACKEND_WS;
const PAGE_SIZE = 10;

function AdminPanel() {
  const [allGuests, setAllGuests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({ total: 0, attended: 0, pending: 0 });

  useEffect(() => {
    let isMounted = true;

    const fetchAllGuests = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/guests`);
        if (isMounted) {
          setAllGuests(response.data || []);
        }
      } catch (error) {
        console.error("Error al obtener invitados:", error);
        if (isMounted) setAllGuests([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAllGuests();

    const socket = io(API_URL_WS, {
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    socket.on('connect', () => console.log('Socket conectado'));
    socket.on('connect_error', error => console.error('Error de socket:', error.message));
    socket.on('guestUpdated', () => {
      setAllGuests(current => {
        const attended = current.filter(g => g.attended).length;
        setStats({
          total: current.length,
          attended,
          pending: current.length - attended,
        });
        return current;
      });
    });

    return () => {
      isMounted = false;
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const attended = allGuests.filter(g => g.attended).length;
    setStats({
      total: allGuests.length,
      attended,
      pending: allGuests.length - attended,
    });
  }, [allGuests]);

  const filteredGuests = useMemo(() => {
    return searchTerm
      ? allGuests.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()) || g.country.toLowerCase().includes(searchTerm.toLowerCase()))
      : allGuests;
  }, [allGuests, searchTerm]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredGuests.length / PAGE_SIZE)), [filteredGuests]);

  const displayedGuests = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredGuests.slice(start, start + PAGE_SIZE);
  }, [filteredGuests, currentPage]);

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // const handleCheckIn = useCallback(async (guestId) => {
  //   const updated = allGuests.map(g => g._id === guestId ? { ...g, attended: true } : g);
  //   setAllGuests(updated);

  //   try {
  //     await axios.patch(`${API_URL}/guests/${guestId}/checkin`);
  //   } catch (err) {
  //     console.error("Error en check-in:", err);
  //     alert("Error al registrar llegada. Revirtiendo.");
  //     setAllGuests(prev => prev.map(g => g._id === guestId ? { ...g, attended: false } : g));
  //   }
  // }, [allGuests]);

  const handleCheckIn = useCallback(async (guestId) => {
    const guest = allGuests.find(g => g._id === guestId);
    if (!guest) return;
  
    const result = await Swal.fire({
      title: `¿Confirmar llegada de ${guest.name}?`,
      text: "Esta acción marcará al invitado como asistente.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, registrar llegada',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#704741',
      cancelButtonColor: '#db9e95',
    });
  
    if (!result.isConfirmed) return;
  
    const updated = allGuests.map(g => g._id === guestId ? { ...g, attended: true } : g);
    setAllGuests(updated);
  
    try {
      await axios.patch(`${API_URL}/guests/${guestId}/checkin`);
      Swal.fire({
        title: '¡Listo!',
        text: 'La llegada fue registrada con éxito.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error en check-in:", err);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo registrar la llegada. Intenta nuevamente.',
        icon: 'error',
      });
      setAllGuests(prev => prev.map(g => g._id === guestId ? { ...g, attended: false } : g));
    }
  }, [allGuests]);
  

  return (
    <div className="admin-panel">
      <header>
        <h1>🌎 Sistema de Registro - Evento de Viajes 🌍</h1>
      </header>

      <Stats {...stats} />

      <SearchBar
        searchTerm={searchTerm}
        onChange={handleSearchInputChange}
        onClear={() => setSearchTerm('')}
      />

      <div className="results-container">
        {loading ? (
          <p>Cargando invitados...</p>
        ) : allGuests.length === 0 ? (
          <p className="no-results">No hay invitados registrados.</p>
        ) : displayedGuests.length > 0 ? (
          <>
            <GuestTable guests={displayedGuests} onCheckIn={handleCheckIn} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              goToPage={setCurrentPage}
            />
          </>
        ) : (
          <p className="no-results">
            {searchTerm ? 'No se encontraron invitados con ese nombre.' : 'No hay invitados para mostrar.'}
          </p>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;


