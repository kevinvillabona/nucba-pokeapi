const cardsContainer = document.getElementById("cards");
const loader = document.querySelector(".pokeball");
const baseURL = "https://pokeapi.co/api/v2/pokemon/";

// se define isFetching para activarla cuando estemos haciendo una llamada. Y un objeto que va a almacenar la siguiente llamada a la api, en un principio va a ser null porque todavia no hicimos ninguna llamada
let isFetching = false;

const nextURL = {
  next: null,
};

const renderPokemon = (pokemon) => {
  const { id, name, sprites, height, weight, types } = pokemon;
  const bgColor = (types.length) > 1 ? 
  `${types[1].type.name}` 
  : `${types[0].type.name}` ;
  return `
  <div class="poke" style="background-image: linear-gradient(to bottom, rgba(255,255,255,0), var(--${bgColor})), url(assets/img/bg/Type_Background_${types[0].type.name}.webp)">
  <p class="id-poke">#${id}</p>
  <img src="${sprites.other.home.front_default}" alt="${name}" />
          <h2>${name.replace(/\b\w/g, l => l.toUpperCase())}</h2>
          <span class="exp">EXP. BASE: ${pokemon.base_experience}</span>
          <div class="poke-card"></div>
          <div class="poke-info">
            <div class="info border-r">
              ${weight / 10}kg
              <p class="sub">PESO</p>
            </div>
            ${types
              .map((tipo) => {
                return `<div class="info">
                <img src="assets/img/icons/${tipo.type.name}.png" alt="${tipo.type.name}-icon" class="tipo-icon" />
                <p class="sub">${tipo.type.name.toUpperCase()}</p>
              </div>`;
              })
              .join("")}
            <div class="info border-l">
              ${height / 10}m
              <p class="sub">ALTURA</p>
            </div>
          </div>
          <span class="border-t"></span>
          <p class="info-adicional">Región: ${id<152? "Kanto" : id<252 ? "Johto": id<387 ? "Hoenn": id<494 ? "Sinnoh": id<650 ? "Teselia": id<722 ? "Kalos": id<810 ? "Alola": id<906 ? "Galar": "Otras"}</p>

  </div>
  `;
};


// renderizar las cards
const renderPokemonList = (pokeList) => {
  const cards = pokeList
    .map((pokemon) => {
      return renderPokemon(pokemon);
    })
    .join("");
  cardsContainer.innerHTML += cards;
};

// se traen los datos
const fetchPokemons = async () => {
  const res = await fetch(`${baseURL}?limit=8&offset=0`);
  const data = await res.json();
  return data;
};

const loadAndPrint = (pokemonList) => {
  loader.classList.add("show");
  setTimeout(() => {
    loader.classList.remove("show");
    renderPokemonList(pokemonList);
    isFetching = false;
  }, 1000);
};

const init = () => {
  window.addEventListener("DOMContentLoaded", async () => {
    let { next, results } = await fetchPokemons();

    nextURL.next = next;

    const URLS = results.map((pokemon) => pokemon.url);
    const infoPokemones = await Promise.all(
      URLS.map(async (url) => {
        const nextPokemons = await fetch(url);
        return await nextPokemons.json();
      })
    );

    renderPokemonList(infoPokemones);
  });

  //boton de "cargar mas" que aparezca solo la primera vez para pantallas mayores
  
  window.addEventListener("scroll", async () => {
    //const { scrollTop, clientHeight, scrollHeight } = document.documentElement;

    //const bottom = scrollTop + clientHeight >= scrollHeight - 1;

   const m = .1;

   const bottom = m > document.documentElement.scrollHeight - window.scrollY - window.innerHeight

    if (bottom && !isFetching) {
      isFetching = true;
      const nextPokemons = await fetch(nextURL.next);
      const { next, results } = await nextPokemons.json();
      nextURL.next = next;

      const URLS = results.map((pokemon) => pokemon.url);

      const infoPokemons = await Promise.all(
        URLS.map(async (url) => {
          const nextPokemons = await fetch(url);
          return await nextPokemons.json();
        })
      );

      loadAndPrint(infoPokemons);
    }
  });
};

init();
