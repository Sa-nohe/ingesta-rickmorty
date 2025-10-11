// benchmark/benchmark.js
const axios = require("axios");
const { performance } = require("perf_hooks");

const endpoints = {
  lambda: "https://rickandmortyapi.com/api/character?page=1",
  kappa: "https://rickandmortyapi.com/api/location?page=1",
  api: "https://rickandmortyapi.com/api/episode?page=1",
};

async function medirRendimiento(nombre, url) {
  const inicio = performance.now();
  const response = await axios.get(url);
  const fin = performance.now();

  const tiempo = (fin - inicio).toFixed(2);
  const tamaño = JSON.stringify(response.data).length;

  console.log(`\n📊 Benchmark: ${nombre}`);
  console.log(`⏱️  Tiempo de respuesta: ${tiempo} ms`);
  console.log(`📦  Tamaño de datos: ${tamaño} bytes`);
}

(async () => {
  console.log("🚀 Iniciando benchmark de arquitecturas...\n");
  for (const [nombre, url] of Object.entries(endpoints)) {
    await medirRendimiento(nombre, url);
  }
})();
