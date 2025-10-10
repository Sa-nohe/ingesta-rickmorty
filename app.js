document.addEventListener("DOMContentLoaded", () => {

  // ---------- Tabs ----------
  const tabs = document.querySelectorAll(".tab-btn");
  const contents = document.querySelectorAll(".tab-content");

  tabs.forEach(tab => {
      tab.addEventListener("click", () => {
          tabs.forEach(t => t.classList.remove("active"));
          contents.forEach(c => c.classList.remove("active"));

          tab.classList.add("active");
          document.getElementById(tab.dataset.tab).classList.add("active");
      });
  });

  // ---------- Rick & Morty ----------
  const characterContainer = document.getElementById("characterContainer");
  let characters = []; // variable global para búsqueda

  async function getCharacters() {
      try {
          const response = await fetch("https://rickandmortyapi.com/api/character");
          const data = await response.json();
          characters = data.results;
          displayCharacters(characters);
      } catch (error) {
          console.error("Error cargando personajes:", error);
      }
  }

  function displayCharacters(list) {
      characterContainer.innerHTML = "";
      list.forEach(c => {
          const card = document.createElement("div");
          card.classList.add("card-character");
          card.innerHTML = `
              <img src="${c.image}" alt="${c.name}">
              <h3>${c.name}</h3>
              <p>Status: ${c.status}</p>
          `;
          card.addEventListener("click", () => openModal(c));
          characterContainer.appendChild(card);
      });
  }

  // ---------- Modal ----------
  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modalImg");
  const modalName = document.getElementById("modalName");
  const modalStatus = document.getElementById("modalStatus");
  const modalSpecies = document.getElementById("modalSpecies");
  const modalGender = document.getElementById("modalGender");
  const modalLocation = document.getElementById("modalLocation");
  const closeModal = document.getElementById("closeModal");

  function openModal(character) {
      modal.style.display = "block";
      modalImg.src = character.image;
      modalName.textContent = character.name;
      modalStatus.textContent = `Status: ${character.status}`;
      modalSpecies.textContent = `Especie: ${character.species}`;
      modalGender.textContent = `Género: ${character.gender}`;
      modalLocation.textContent = `Ubicación: ${character.location.name}`;
  }

  closeModal.onclick = () => modal.style.display = "none";
  window.onclick = (e) => { if(e.target == modal) modal.style.display = "none"; }

  // ---------- Búsqueda ----------
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = characters.filter(c => c.name.toLowerCase().includes(query));
      displayCharacters(filtered);
  });

  getCharacters();

  // ---------- Comparativa Lambda/Kappa ----------
  const btnComparativa = document.getElementById("btnComparativa");
  const cardsContainer = document.getElementById("cardsContainer");

  btnComparativa.addEventListener("click", async () => {
      cardsContainer.innerHTML = "";
      try {
          const lambdaData = await fetch("lambda.json").then(r => r.json());
          const kappaData = await fetch("kappa.json").then(r => r.json());

          cardsContainer.appendChild(createCard(lambdaData, "Lambda"));
          cardsContainer.appendChild(createCard(kappaData, "Kappa"));
      } catch (error) {
          console.error("Error comparativa:", error);
          alert("No se pudo cargar la comparativa");
      }
  });

  function createCard(data, tipo) {
      const card = document.createElement("div");
      card.classList.add("card-architecture");
      card.innerHTML = `
          <h2>${tipo}</h2>
          <p>${data.descripcion}</p>
          <h3>Ventajas:</h3>
          <ul>${data.ventajas.map(v => `<li>${v}</li>`).join("")}</ul>
          <h3>Desventajas:</h3>
          <ul>${data.desventajas.map(d => `<li>${d}</li>`).join("")}</ul>
      `;
      return card;
  }

});