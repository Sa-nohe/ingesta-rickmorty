async function medirRendimiento(nombre, url) {
  const inicio = performance.now();
  const response = await fetch(url);
  const data = await response.json();
  const fin = performance.now();

  const tiempo = (fin - inicio).toFixed(2);
  const tamaño = JSON.stringify(data).length;

  return { nombre, tiempo, tamaño };
}

async function ejecutarBenchmark() {
  const endpoints = [
    { nombre: "Lambda", url: "https://rickandmortyapi.com/api/character?page=1" },
    { nombre: "Kappa", url: "https://rickandmortyapi.com/api/location?page=1" },
    { nombre: "API", url: "https://rickandmortyapi.com/api/episode?page=1" },
  ];

  const resultados = [];
  for (const ep of endpoints) {
    try {
      const r = await medirRendimiento(ep.nombre, ep.url);
      resultados.push(r);
    } catch (error) {
      console.error("Error con", ep.nombre, error);
    }
  }

  mostrarTabla(resultados);
  mostrarGrafico(resultados);
}

function mostrarTabla(resultados) {
  const tbody = document.getElementById("tabla-benchmark");
  tbody.innerHTML = "";

  resultados.forEach(r => {
    const fila = `
      <tr>
        <td>${r.nombre}</td>
        <td>${r.tiempo}</td>
        <td>${r.tamaño}</td>
      </tr>
    `;
    tbody.innerHTML += fila;
  });
}

function mostrarGrafico(resultados) {
  const ctx = document.getElementById("graficoBenchmark").getContext("2d");

  const nombres = resultados.map(r => r.nombre);
  const tiempos = resultados.map(r => parseFloat(r.tiempo));

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: nombres,
      datasets: [
        {
          label: "Tiempo de respuesta (ms)",
          data: tiempos,
          backgroundColor: ["#42a5f5", "#66bb6a", "#ffca28"],
          borderColor: "#333",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true, position: "top" },
        title: {
          display: true,
          text: "Comparativa de rendimiento por arquitectura",
          font: { size: 16 },
        },
      },
      animation: {
        duration: 1200,
        easing: "easeOutBounce",
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Milisegundos" },
        },
      },
    },
  });
}

window.addEventListener("load", ejecutarBenchmark);

