// sqlQuery.js
// Módulo para consultas SQL usando sql.js (SQLite en memoria)
// Carga datos desde la API de Rick and Morty y permite ejecutar consultas SQL desde el navegador

let db;
let SQL;

// Inicializa la base de datos SQLite
async function initDatabase() {
  const sqlPromise = window.initSqlJs({
    locateFile: (file) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`,
  });

  SQL = await sqlPromise;
  db = new SQL.Database();
  document.getElementById("sqlStatus").innerText = "✅ Base de datos SQLite lista.";
}

// Cargar datos desde la API de Rick and Morty
async function loadData() {
  document.getElementById("sqlStatus").innerText = "Cargando datos desde la API...";
  const response = await fetch("https://rickandmortyapi.com/api/character");
  const data = await response.json();

  db.run(`DROP TABLE IF EXISTS personajes;`);
  db.run(`
    CREATE TABLE IF NOT EXISTS personajes (
      id INTEGER PRIMARY KEY,
      nombre TEXT,
      estado TEXT,
      especie TEXT,
      tipo TEXT,
      genero TEXT,
      origen TEXT,
      ubicacion TEXT,
      imagen TEXT,
      creado TEXT
    );
  `);

  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO personajes 
    (id, nombre, estado, especie, tipo, genero, origen, ubicacion, imagen, creado)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `);

  for (const p of data.results) {
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
  }

  insertStmt.free();
  document.getElementById("sqlStatus").innerText = "✅ Datos cargados correctamente.";
}

// Ejecutar consulta SQL escrita por el usuario
function runSQL() {
  const sql = document.getElementById("queryInput").value.trim(); // corregido
  if (!sql) {
    alert("Por favor, escribe una consulta SQL.");
    return;
  }

  try {
    const res = db.exec(sql);

    if (res.length === 0) {
      document.getElementById("sqlResults").innerHTML =
        "<p>Consulta ejecutada correctamente (sin resultados).</p>";
      return;
    }

    const result = res[0];
    const columns = result.columns;
    const values = result.values;

    let html = "<table border='1' cellspacing='0' cellpadding='4'><tr>";
    columns.forEach(col => (html += `<th>${col}</th>`));
    html += "</tr>";

    values.forEach(row => {
  html += "<tr>";
  row.forEach((cell, i) => {
    const colName = columns[i].toLowerCase();

    // Si la columna es "imagen" o contiene una URL de imagen, mostrar la imagen
    if (colName.includes("imagen") || (typeof cell === "string" && cell.startsWith("https://"))) {
      html += `<td><img src="${cell}" alt="imagen" width="80" height="80" style="border-radius:8px; box-shadow:0 2px 6px rgba(0,0,0,0.2);"></td>`;
    } else {
      html += `<td>${cell}</td>`;
    }
  });
  html += "</tr>";
});

    html += "</table>";

    document.getElementById("sqlResults").innerHTML = html;
  } catch (e) {
    document.getElementById("sqlResults").innerHTML = `<p style="color:red;">Error: ${e.message}</p>`;
  }
}

// Asignar eventos a botones principales
document.addEventListener("DOMContentLoaded", async () => {
  await initDatabase();

  document.getElementById("btnLoadData").addEventListener("click", loadData);
  document.getElementById("btnRunSql").addEventListener("click", runSQL);
});

// Botones de consultas de ejemplo
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("sql-example")) {
    const query = e.target.getAttribute("data-query");
    document.getElementById("queryInput").value = query; // corregido
    runSQL();
  }
});




