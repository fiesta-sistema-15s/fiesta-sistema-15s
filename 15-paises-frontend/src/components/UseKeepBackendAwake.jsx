import { useEffect } from 'react';

const API_URL = import.meta.env.VITE_URL_BACKEND;

const useKeepBackendAwake = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`${API_URL}/guests/ping`)
        .then(() => console.log('Ping enviado para mantener el backend despierto'))
        .catch(err => console.error('Error en el ping:', err));
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
};

export default useKeepBackendAwake;
