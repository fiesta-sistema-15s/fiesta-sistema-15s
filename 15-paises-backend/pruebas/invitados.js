import axios from 'axios';
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:5000'; // Cambiar si usás otro host/puerto
const EXCEL_PATH = "C:/Users/Usuario/Desktop/LISTA_DE_INVITADOS_MESAS_para_convertir.xlsx"

// Leer Excel y convertir a JSON
const readExcelGuests = () => {
  const workbook = XLSX.readFile(EXCEL_PATH);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const guests = rawData.map(row => {
    const apellido = row[0]?.toString().trim();
    const nombre = row[1]?.toString().trim();
    const pais = row[2]?.toString().trim();

    if (!apellido || !nombre || !pais) return null;

    return {
      name: `${nombre} ${apellido}`,
      country: pais,
      table: 0,
    };
  }).filter(g => g !== null);

  return guests;
};

// Enviar los invitados a la API
const sendGuestsToAPI = async (guests) => {
  try {
    console.log(`Enviando ${guests.length} invitados a la API...`);

    // await axios.delete(`${API_URL}/api/guests`);
    for (let i = 0; i < guests.length; i++) {
      const guest = guests[i];
      console.log(`Enviando invitado ${i + 1}: ${guest.name} (${guest.country})`);
      await axios.post(`${API_URL}/api/guests`, guest);
      if ((i + 1) % 50 === 0) console.log(`${i + 1} enviados...`);
    }

    console.log('✅ Todos los invitados fueron cargados exitosamente.');
  } catch (error) {
    console.error('❌ Error al enviar invitados:', error.message);
  }
};

const main = async () => {
  const guests = readExcelGuests();
  await sendGuestsToAPI(guests);
};

main();
