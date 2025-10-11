// benchmarkWeb.js (DINÁMICO)
// Mide rendimiento real (tiempos y tamaño) sin afectar el resto de la app.
// Reemplaza tu benchmarkWeb.js actual por este archivo.

(async () => {
  // Config
  const SAMPLES = 3; // cuántas peticiones por endpoint (ajusta si quieres más)
  const endpoints = [
    { name: "Lambda", url: "https://rickandmortyapi.com/api/character?page=1" },
    { name: "Kappa", url: "https://rickandmortyapi.com/api/location?page=1" },
    { name: "API", url: "https://rickandmortyapi.com/api/episode?page=1" },
  ];

  // Helpers estadísticos
  function median(arr) {
    if (!arr.length) return 0;
    const s = [...arr].sort((a,b)=>a-b);
    const mid = Math.floor(s.length/2);
    return s.length % 2 ? s[mid] : (s[mid-1]+s[mid])/2;
  }
  function p95(arr) {
    if (!arr.length) return 0;
    const s = [...arr].sort((a,b)=>a-b);
    const idx = Math.ceil(0.95 * s.length) - 1;
    return s[Math.max(0, Math.min(idx, s.length-1))];
  }
  function avg(arr) {
    if (!arr.length) return 0;
    return arr.reduce((a,b)=>a+b,0)/arr.length;
  }

  // Medir un endpoint N veces: devuelve objeto con métricas
  async function measureEndpoint(url, samples = 3) {
    const tiempos = [];
    let lastSize = 0;
    for (let i=0;i<samples;i++){
      const inicio = performance.now();
      try {
        const res = await fetch(url, { cache: "no-store" }); // no cache para medir real
        const json = await res.json();
        const fin = performance.now();
        const tiempo = fin - inicio;
        tiempos.push(Number(tiempo.toFixed(2)));
        lastSize = JSON.stringify(json).length;
      } catch (err) {
        // en caso de error, registra un valor alto y continúa
        tiempos.push(99999);
        lastSize = 0;
        console.error("Error midiendo", url, err);
      }
    }
    return {
      url,
      muestras: tiempos,
      p50: Number(median(tiempos).toFixed(2)),
      p95: Number(p95(tiempos).toFixed(2)),
      avg: Number(avg(tiempos).toFixed(2)),
      sizeBytes: lastSize
    };
  }

  // Actualiza la tabla HTML #tabla-benchmark con los resultados
  function updateTable(results) {
    const tbody = document.getElementById("tabla-benchmark");
    if (!tbody) return;
    tbody.innerHTML = "";
    for (const r of results) {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${r.name}</td>
        <td>p50: ${r.p50} ms<br>p95: ${r.p95} ms<br>avg: ${r.avg} ms</td>
        <td>${r.sizeBytes} bytes</td>
      `;
      tbody.appendChild(fila);
    }
  }

  // Dibuja/actualiza gráfico en #graficoBenchmark (Chart.js)
  let chartInstance = null;
  function updateChart(results) {
    const ctx = document.getElementById("graficoBenchmark");
    if (!ctx) return;
    const labels = results.map(r => r.name);
    const data = results.map(r => r.avg);
    if (chartInstance) {
      chartInstance.data.labels = labels;
      chartInstance.data.datasets[0].data = data;
      chartInstance.update();
      return;
    }
    chartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Tiempo promedio (ms)",
          data,
          backgroundColor: ["#42a5f5", "#66bb6a", "#ffca28"],
          borderColor: "#333",
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        animation: { duration: 900, easing: "easeOutQuart" },
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: "ms" } }
        }
      }
    });
  }

  // Indicador de estado en la página (crea si no existe)
  function ensureStatusEl() {
    let el = document.getElementById("benchmarkStatus");
    if (!el) {
      el = document.createElement("div");
      el.id = "benchmarkStatus";
      el.style.margin = "8px 0";
      const tabla = document.querySelector("table");
      tabla.parentNode.insertBefore(el, tabla);
    }
    return el;
  }

  // Ejecuta el benchmark completo
  async function runBenchmark(samples = SAMPLES) {
    const statusEl = ensureStatusEl();
    statusEl.innerText = "Ejecutando benchmark... (esto puede tardar unos segundos)";
    const results = [];
    for (const ep of endpoints) {
      statusEl.innerText = `Midiendo ${ep.name} (${ep.url}) ...`;
      const metrics = await measureEndpoint(ep.url, samples);
      results.push(Object.assign({name: ep.name}, metrics));
    }
    statusEl.innerText = "Benchmark finalizado.";
    updateTable(results);
    updateChart(results);
    return results;
  }

  // Crear botón "Re-ejecutar benchmark" sin tocar el HTML existente
  function ensureRunButton() {
    let btn = document.getElementById("btnRunBenchmark");
    if (btn) return btn;
    btn = document.createElement("button");
    btn.id = "btnRunBenchmark";
    btn.innerText = " Re-ejecutar benchmark";
    btn.style.margin = "8px";
    // insertarlo encima de la tabla (si existe tabla)
    const tabla = document.querySelector("table");
    if (tabla && tabla.parentNode) tabla.parentNode.insertBefore(btn, tabla);
    else document.body.insertBefore(btn, document.body.firstChild);
    btn.addEventListener("click", () => runBenchmark());
    return btn;
  }

  // Inicialización: espera a que Chart esté disponible (ya lo cargas en index)
  function waitForChartThenInit() {
    if (typeof Chart === "undefined") {
      // reintentar en 200ms si Chart.js aún no cargó
      setTimeout(waitForChartThenInit, 200);
      return;
    }
    ensureRunButton();
    // Ejecutar una vez al cargar (no rompe nada existente)
    runBenchmark();
  }

  // Arranca
  waitForChartThenInit();

})();
