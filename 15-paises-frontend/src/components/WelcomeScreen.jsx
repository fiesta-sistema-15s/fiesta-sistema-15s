import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import CountryData from './CountryData';
import '../styles/WelcomeScreen.css';

// Sonidos
const BOARDING_SOUND = '/sounds/boarding.mp3';
const WELCOME_MESSAGES = [
  "Bienvenido al vuelo {flight} con destino a {country}",
  "Pasajero con destino a {country}, bienvenido a bordo del vuelo {flight}",
  "Iniciando embarque del vuelo {flight} hacia {country}"
];

function WelcomeScreen() {
  const [currentGuest, setCurrentGuest] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  
  useEffect(() => {
    const socket = io('http://localhost:5000', {
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });
    
    socket.on('connect', () => {
      console.log('Conectado al servidor Socket.io');
      setSocketConnected(true);
    });
    
    socket.on('connect_error', (error) => {
      console.error('Error de conexión Socket.io:', error);
      setSocketConnected(false);
    });
    
    socket.on('displayWelcome', (guestData) => {
      try {
        // Reproducir sonido
        const audio = new Audio(BOARDING_SOUND);
        audio.play().catch(err => console.error('Error reproduciendo audio:', err));
        
        // Mostrar animación
        setCurrentGuest({
          ...guestData,
          flightNumber: guestData.flightNumber || `TW-${Math.floor(Math.random() * 9000) + 1000}`
        });
        setShowAnimation(true);
        
        // Ocultar después de 10 segundos
        setTimeout(() => {
          setShowAnimation(false);
        }, 10000);
      } catch (error) {
        console.error('Error al procesar invitado:', error);
      }
    });
    
    return () => {
      console.log('Desconectando socket...');
      socket.disconnect();
    };
  }, []); // Dependencias vacías para que se ejecute solo una vez
  
  // Si no hay invitado o la animación está oculta
  if (!currentGuest || !showAnimation) {
    return (
      <div className="welcome-screen idle">
        <div className="world-map"></div>
        <div className="idle-message">
          <h1>Bienvenidos a nuestro evento mundial</h1>
          <p>Esperando llegada de invitados...</p>
          <div className="airplane-animation">✈️</div>
        </div>
      </div>
    );
  }
  
  // Seleccionar mensaje aleatorio
  const messageTemplate = WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)];
  // Asegurarse de que flightNumber existe
  const flightNumber = currentGuest.flightNumber || `TW-${Math.floor(Math.random() * 9000) + 1000}`;
  const welcomeMessage = messageTemplate
    .replace('{flight}', flightNumber)
    .replace('{country}', currentGuest.country);
  
  // Obtener datos del país
  const countryInfo = CountryData[currentGuest.country] || {
    flag: '🏳️',
    bgImage: '/images/default-country.jpg'
  };
  
  return (
    <div 
      className="welcome-screen active" 
      style={{ 
        backgroundImage: countryInfo.bgImage ? `url(${countryInfo.bgImage})` : 'none' 
      }}
    >
      <div className="welcome-content">
        <div className="flight-info">
          <div className="flight-number">Vuelo {flightNumber}</div>
          <div className="boarding-pass">BOARDING PASS</div>
        </div>
        
        <div className="guest-welcome">
          <h1>{currentGuest.name}</h1>
          <div className="country-info">
            <span className="country-flag">{countryInfo.flag}</span>
            <span className="country-name">{currentGuest.country}</span>
          </div>
          <p className="welcome-message">{welcomeMessage}</p>
        </div>
        
        <div className="airplane-icon">✈️</div>
      </div>
    </div>
  );
}

export default WelcomeScreen;