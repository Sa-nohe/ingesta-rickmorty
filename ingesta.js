const btnComparar = document.getElementById('btnComparar');
const tablaBody = document.querySelector('#tabla-ingesta tbody');
const cargando = document.getElementById('cargando');

// Función para cargar un JSON local
async function cargarJSON(archivo) {
  const response = await fetch(archivo);
  if (!response.ok) {
    throw new Error(`No se pudo cargar ${archivo}`);
  }
  return await response.json();
}

// Función para crear una fila comparativa
function crearFilaComparativa(lambdaItem, kappaItem) {
  const fila = document.createElement('tr');
  fila.innerHTML = `
    <td>${lambdaItem.Fuente}</td>
    <td>${lambdaItem.Tipo}</td>
    <td class="lambda">${lambdaItem.Tiempo}</td>
    <td class="lambda">${lambdaItem.Memoria}</td>
    <td class="lambda">${lambdaItem.Estado}</td>
    <td class="kappa">${kappaItem.Tiempo}</td>
    <td class="kappa">${kappaItem.Memoria}</td>
    <td class="kappa">${kappaItem.Estado}</td>
  `;
  tablaBody.appendChild(fila);
}

// Evento del botón
btnComparar.addEventListener('click', async () => {
  try {
    cargando.style.display = 'block';
    tablaBody.innerHTML = '';

    const data = await cargarJSON('data.json');
    const lambdaDatos = data.lambda;
    const kappaDatos = data.kappa;

    const maxLength = Math.max(lambdaDatos.length, kappaDatos.length);

    for (let i = 0; i < maxLength; i++) {
      const lambdaItem = lambdaDatos[i] || { Fuente: '-', Tipo: '-', Tiempo: '-', Memoria: '-', Estado: '-' };
      const kappaItem = kappaDatos[i] || { Fuente: '-', Tipo: '-', Tiempo: '-', Memoria: '-', Estado: '-' };
      crearFilaComparativa(lambdaItem, kappaItem);
    }

  } catch (error) {
    alert('Error al cargar los datos: ' + error);
    console.error(error);
  } finally {
    cargando.style.display = 'none';
  }
});
