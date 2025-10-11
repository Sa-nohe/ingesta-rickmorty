// sqlQuery.js
// Usa sql.js para crear una DB SQLite en memoria y poblarla con personajes de la API
// Requiere sql-wasm.js cargado antes de este archivo.

let SQL;               // el módulo sql.js
let db;                // la base de datos en memoria

const STATUS_EL = document.getElementById("sqlStatus");
const RESULTS_EL = document.getElementById("sqlResults");
const INPUT_EL = document.getElementById("sqlInput");
const BTN_RUN = document.getElementById("btnRunSql");
const BTN_LOAD = document.getElementById("btnLoadData");

async function initSqlJsAndDb() {
  STATUS_EL.textContent = "Inicializando motor SQL (WASM)...";
  SQL = await initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}` });
  db = new SQL.Database();
  crearEsquema();
  STATUS_EL.textContent = "Base de datos lista. Carga datos con (Re)Cargar datos desde API.";
}

function crearEsquema() {
  const ddl = `
    CREATE TABLE IF NOT EXISTS personajes (
      id INTEGER PRIMARY KEY,
      name TEXT,
      status TEXT,
      species TEXT,
      type TEXT,
      gender TEXT,
      origin_name TEXT,
      location_name TEXT,
      image TEXT,
      created TEXT
    );
    DELETE FROM personajes; -- limpiar si existe
  `;
  db.run(ddl);
}

async function fetchAllCharacters() {
  STATUS_EL.textContent = "Descargando personajes desde la API...";
  // La API de Rick & Morty paga paginada; hacemos requests secuenciales hasta agotar páginas.
  let url = "https://rickandmortyapi.com/api/character";
  let count = 0;
  try {
    while (url) {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const results = json.results || [];
      // Insertar cada personaje en la DB
      const insertStmt = db.prepare(
        `INSERT OR REPLACE INTO personajes (id, name, status, species, type, gender, origin_name, location_name, image, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`
      );
      db.run("BEGIN TRANSACTION;");
      for (const p of results) {
        insertStmt.run([
          p.id,
          p.name,
          p.status,
          p.species,
          p.type,
          p.gender,
          p.origin?.name || null,
          p.location?.name || null,
          p.image,
          p.created
        ]);
        count++;
      }
      db.run("COMMIT;");
      insertStmt.free();
      // siguiente página
      url = json.info && json.info.next ? json.info.next : null;
    }
    STATUS_EL.textContent = `Datos cargados: ${count} personajes. Puedes ejecutar consultas.`;
  } catch (err) {
    STATUS_EL.textContent = `Error al descargar datos: ${err.message}`;
    console.error(err);
  }
}

function runSql(query) {
  try {
    const start = performance.now();
    const res = db.exec(query); // devuelve array con resultado(s)
    const end = performance.now();
    const duration = (end - start).toFixed(2);
    if (!res || res.length === 0) {
      RESULTS_EL.innerHTML = `<div>Consulta ejecutada en ${duration} ms. (sin filas devueltas)</div>`;
      return;
    }
    // Solo manejamos el primer result set para simplicidad
    const r = res[0];
    renderResultAsTable(r.columns, r.values, duration);
  } catch (err) {
    RESULTS_EL.innerHTML = `<div style="color:#900">Error SQL: ${err.message}</div>`;
  }
}

function renderResultAsTable(columns, values, durationMs) {
  let html = `<div style="margin-bottom:8px;color:#444">Tiempo ejecución: ${durationMs} ms — Filas: ${values.length}</div>`;
  html += `<table style="border-collapse:collapse; width:100%; max-width:1100px;">`;
  // header
  html += `<thead><tr>`;
  for (const c of columns) {
    html += `<th style="padding:8px;background:#1976d2;color:#fff;border:1px solid #ddd;text-align:left">${c}</th>`;
  }
  html += `</tr></thead>`;
  // body
  html += `<tbody>`;
  for (const row of values) {
    html += `<tr>`;
    for (const cell of row) {
      html += `<td style="padding:8px;border:1px solid #eee">${cell === null ? "" : escapeHtml(String(cell))}</td>`;
    }
    html += `</tr>`;
  }
  html += `</tbody></table>`;
  RESULTS_EL.innerHTML = html;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

// eventos UI
BTN_RUN.addEventListener("click", () => {
  const q = INPUT_EL.value.trim();
  if (!q) {
    STATUS_EL.textContent = "Escribe una consulta SQL válida.";
    return;
  }
  STATUS_EL.textContent = "Ejecutando consulta...";
  runSql(q);
});

BTN_LOAD.addEventListener("click", async () => {
  crearEsquema(); // limpiar y crear
  await fetchAllCharacters();
});

// inicializar al cargar la página
window.addEventListener("load", async () => {
  await initSqlJsAndDb();
});
