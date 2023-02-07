const container = document.getElementById("container");
const form = document.getElementById("form");
const input = document.querySelector(".input");
const loader = document.querySelector(".pokeball");
const baseURL = "https://pokeapi.co/api/v2/pokemon/";
const cargarBtn = document.getElementById("cargar");

// se define isFetching para activarla cuando estemos haciendo una llamada. Y un objeto que va a almacenar la siguiente llamada a la api, en un principio va a ser null porque todavia no hicimos ninguna llamada
let isFetching = false;

const nextURL = {
  next: null,
};

const renderPokemon = (pokemon) => {
  const { id, name, sprites, height, weight, types } = pokemon;
  const bgColor =
    types.length > 1 ? `${types[1].type.name}` : `${types[0].type.name}`;
  const sprite = !sprites.other.home.front_default
    ? `${sprites.other["official-artwork"].front_default}`
    : `${sprites.other.home.front_default}`;
  return `
    <div class="poke" style="background-image: linear-gradient(to bottom, rgba(255,255,255,0), var(--${bgColor})), url(assets/img/bg/Type_Background_${
    types[0].type.name
  }.webp)">
    <p class="id-poke">#${id}</p>
    <img src="${sprite}" alt="${name}" />
            <h2>${name.replace(/\b\w/g, (l) => l.toUpperCase())}</h2>
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
                  <img src="assets/img/icons/${tipo.type.name}.png" alt="${
                    tipo.type.name
                  }-icon" class="tipo-icon" />
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
            <p class="info-adicional">Región: ${
              id < 152
                ? "Kanto"
                : id < 252
                ? "Johto"
                : id < 387
                ? "Hoenn"
                : id < 494
                ? "Sinnoh"
                : id < 650
                ? "Teselia"
                : id < 722
                ? "Kalos"
                : id < 810
                ? "Alola"
                : id < 899
                ? "Galar"
                : id < 906
                ? "Hisui"
                : "Otra"
            }</p>
  
    </div>
    `;
};

// se traen los datos del pokemon a buscar
const fetchPokemonSearched = async (id) => {
  try {
    const res = await fetch(`${baseURL + id}`);
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
};

// se traen los datos de los pokemon al scrollear
const fetchPokemonAll = async () => {
  try {
    const res = await fetch(`${baseURL}?limit=8&offset=0`);
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
};

const loadAndPrint = (pokemonList) => {
  loader.classList.add("show");
  setTimeout(() => {
    loader.classList.remove("show");
    renderPokemonList(pokemonList);
    isFetching = false;
  }, 1000);
};

//distintos casos de muestra del container
const emptyContainer = () => {
  // container.innerHTML= `
  // <h2 style="margin-top: 2rem;">Por favor, ingrese un número.</h2>
  // `
  // cargarBtn.classList.add("hidden");
  location.reload();
};

const renderResult = async (pokemon) => {
  const newPk = await pokemon;
  if (!newPk) {
    container.innerHTML = `
        <h2 style="color:red; margin-top: 2rem;">Ningún Pokémon coincide con tu búsqueda.</h2>
        `;
  } else {
    container.innerHTML = renderPokemon(newPk);
  }
};

// renderizar las cards
const renderPokemonList = (pokeList) => {
  const cards = pokeList
    .map((pokemon) => {
      return renderPokemon(pokemon);
    })
    .join("");
  container.innerHTML += cards;
};

const search = (e) => {
  // cargarBtn.classList.add("hidden");
  cargarBtn.remove();
  loader.remove();
  isFetching = true;
  e.preventDefault();
  const inputVal = input.value.toLowerCase().trim();
  if (!inputVal) {
    emptyContainer();
  }
  const poke = fetchPokemonSearched(inputVal);
  renderResult(poke);
};

const nextPokemons = async () => {
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
};

const init = () => {
  form.addEventListener("submit", search);
  window.addEventListener("DOMContentLoaded", async () => {
    let { next, results } = await fetchPokemonAll();

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

  window.addEventListener("scroll", async () => {
    //por alguna razon, el siguiente codigo no funciona en mobile
    // const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
    // const bottom = scrollTop + clientHeight >= scrollHeight - 1;

    const m = 0.1;
    // const bottom = m > document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
     const bottom = m > document.querySelector("main").scrollHeight - window.scrollY - window.innerHeight;
    if (bottom && !isFetching) {
      // cargarBtn.classList.add("hidden");
       cargarBtn.remove();
       nextPokemons();
    }
  });
};


init();

