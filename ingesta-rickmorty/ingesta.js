const axios = require('axios');

// URL de la API de Rick & Morty
const API_URL = 'https://rickandmortyapi.com/api/character';

async function obtenerPersonajes() {
  try {
    const response = await axios.get(API_URL);
    const personajes = response.data.results;

    console.log('Personajes obtenidos:');
    personajes.forEach((p) => {
      console.log(`${p.id} - ${p.name} (${p.species})`);
    });
  } catch (error) {
    console.error('Error al obtener los datos:', error.message);
  }
}

// Ejecutar función
obtenerPersonajes();

