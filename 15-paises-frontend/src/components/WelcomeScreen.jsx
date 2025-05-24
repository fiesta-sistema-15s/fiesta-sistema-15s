import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import CountryData from './CountryData';
import '../styles/WelcomeScreen.css';
import Flag from 'react-world-flags';
import { CountryFlagEmoji } from './CountryFlagEmoji';
;

// const BOARDING_SOUND = '/sounds/boarding.mp3';
// const WELCOME_MESSAGES = [
//   "Bienvenido al vuelo 20vr25-2405 con destino a {country}",
//   "Pasajero con destino a {country}, bienvenido a bordo del vuelo 20vr25-2405",
//   "Iniciando embarque del vuelo 20vr25-2405 hacia {country}"
// ];

const WELCOME_MESSAGES = [
  "¡Pasajero VIP abordando el vuelo 20vr25-2405 directo a {country}! 🛫🌍",
  "Atención, atención: el vuelo 20vr25-2405 rumbo a {country} está recibiendo a su invitado estrella ⭐",
  "Bienvenido al vuelo internacional 20vr25-2405 con destino a {country}, ¡prepárate para despegar a una noche inolvidable!",
  "¡El vuelo 20vr25-2405 está por despegar hacia {country}! Ajusta tu cinturón, que esta fiesta despega fuerte 🎉✈️",
  "📢 Último llamado, embarcando al vuelo 20vr25-2405 hacia {country}. ¡La aventura comienza ahora!",
  "Pasajero especial en puerta, tu vuelo 20vr25-2405 hacia {country} ya está listo. ¡Bon voyage!",
  "Desde el corazón del planeta, despegamos con estilo hacia {country}. Vuelo 20vr25-2405, ¡subite que empieza el viaje!",
];



const API_URL_WS = import.meta.env.VITE_URL_BACKEND_WS;

function WelcomeScreen() {
  const [currentGuest, setCurrentGuest] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const queueRef = useRef([]);
  const processingRef = useRef(false);

  useEffect(() => {
    const socket = io(API_URL_WS, {
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    socket.on('connect', () => console.log('Socket conectado'));
    socket.on('connect_error', err => console.error('Error de socket:', err));

    socket.on('displayWelcome', (guestData) => {
      const newGuest = {
        ...guestData,
        flightNumber: guestData.flightNumber || `TW-${Math.floor(Math.random() * 9000) + 1000}`
      };
      queueRef.current.push(newGuest);
      processQueue(); // intento procesar si no hay nadie en pantalla
    });

    return () => socket.disconnect();
  }, []);

  const processQueue = () => {
    if (processingRef.current || queueRef.current.length === 0) return;

    const nextGuest = queueRef.current.shift();
    if (!nextGuest) return;

    processingRef.current = true;
    setCurrentGuest(nextGuest);
    setShowAnimation(true);

    // const audio = new Audio(BOARDING_SOUND);
    // audio.play().catch(err => console.error('Error reproduciendo audio:', err));

    setTimeout(() => {
      setShowAnimation(false);
      processingRef.current = false;
      // intentamos mostrar el próximo invitado
      setTimeout(() => {
        processQueue();
      }, 200); // leve pausa entre animaciones
    }, 6000); // duración de la animación actual
  };

  if (!currentGuest || !showAnimation) {
    return (
      <div className="welcome-screen idle">
        <div className="world-map"></div>
        <div className="idle-message">
        <h1>¡Despegue Inminente Hacia la Fiesta Mundial de Virginia! 🚀</h1>
        <p>Abrochénse los cinturones, porque los invitados más especiales del planeta están por aterrizar...</p>
          <div className="airplane-animation">✈️</div>
        </div>
      </div>
    );
  }

  const flightNumber = currentGuest.flightNumber;
  const messageTemplate = WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)];
  const welcomeMessage = messageTemplate
    .replace('{flight}', flightNumber)
    .replace('{country}', currentGuest.country);

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
          <div className="flight-number">Vuelo 20vr25-2405</div>
          <div className="boarding-pass">BOARDING PASS</div>
        </div>

        <div className="guest-welcome">
          <h1>{currentGuest.name}</h1>
          <div className="country-info">
            <CountryFlagEmoji code={currentGuest.country} width={"60px"}/>
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
