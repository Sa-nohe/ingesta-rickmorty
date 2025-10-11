// benchmarkWeb.js
async function medirRendimiento(nombre, url) {
  const inicio = performance.now();
  const respuesta = await fetch(url);
  const data = await respuesta.json();
  const fin = performance.now();

  const tiempo = (fin - inicio).toFixed(2);
  const tamaño = JSON.stringify(data).length;

  return { nombre, tiempo, tamaño };
}

async function ejecutarBenchmark() {
  const endpoints = {
    Lambda: "https://rickandmortyapi.com/api/character?page=1",
    Kappa: "https://rickandmortyapi.com/api/location?page=1",
    API: "https://rickandmortyapi.com/api/episode?page=1",
  };

  const resultados = [];

  for (const [nombre, url] of Object.entries(endpoints)) {
    const resultado = await medirRendimiento(nombre, url);
    resultados.push(resultado);
  }

  mostrarResultados(resultados);
}

function mostrarResultados(resultados) {
  const tabla = document.getElementById("tabla-benchmark");
  resultados.forEach((r) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${r.nombre}</td>
      <td>${r.tiempo} ms</td>
      <td>${r.tamaño} bytes</td>
    `;
    tabla.appendChild(fila);
  });
}

window.addEventListener("load", ejecutarBenchmark);
