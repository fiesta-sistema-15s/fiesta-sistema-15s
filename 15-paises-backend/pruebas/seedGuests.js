import axios from 'axios';
import { faker } from '@faker-js/faker';




const API_URL = 'http://localhost:5000'; // Ajustá si lo necesitas

const TOTAL_GUESTS = 800;
const COUNTRIES = ['Argentina', 'Brasil', 'Chile', 'Uruguay', 'Colombia', 'Paraguay', 'Perú', 'México', 'España', 'Italia'];

const generateGuest = () => {
  return {
    name: faker.person.fullName(),
    country: faker.helpers.arrayElement(COUNTRIES),
    table: faker.number.int({ min: 1, max: 40 }),
    attended: false,
  };
};

const seedGuests = async () => {
  try {
    console.log(`Generando ${TOTAL_GUESTS} invitados...`);
    const guests = Array.from({ length: TOTAL_GUESTS }, generateGuest);

    for (let i = 0; i < guests.length; i++) {
      const guest = guests[i];
      await axios.post(`${API_URL}/api/guests`, guest);
      if ((i + 1) % 50 === 0) console.log(`${i + 1} invitados creados...`);
    }

    console.log('Todos los invitados fueron cargados exitosamente.');
  } catch (error) {
    console.error('Error al crear invitados:', error.message);
  }
};

seedGuests();
