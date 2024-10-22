document.getElementById('pokemonName').addEventListener('input', function() {
    let input = this.value.toLowerCase();
    let suggestions = document.getElementById('suggestions');
    suggestions.innerHTML = ''; 
    if (input === '') {
        suggestions.style.display = 'none';
        return;
    }

    fetch('https://pokeapi.co/api/v2/pokemon?limit=1000')
    .then(response => response.json())
    .then(data => {
        let filteredPokemon = data.results.filter(pokemon => pokemon.name.includes(input));
        
        if (filteredPokemon.length > 0) {
            suggestions.style.display = 'block';
        } else {
            suggestions.style.display = 'none'; 
        }

        filteredPokemon.forEach(pokemon => {
            let div = document.createElement('div');
            div.textContent = pokemon.name;
            div.addEventListener('click', function() {
                document.getElementById('pokemonName').value = pokemon.name;
                suggestions.innerHTML = ''; 
                suggestions.style.display = 'none'; 
            });
            suggestions.appendChild(div);
        });
    });
});

document.getElementById('pokedexForm').addEventListener('submit', function(event) {
    event.preventDefault();
    let pokemonNameInput = document.getElementById('pokemonName');
    let pokemonName = pokemonNameInput.value.toLowerCase();

    if (pokemonName === '') {
        document.getElementById('pokemonDisplay').innerHTML = '<p>Please enter a Pokemon name!</p>';
        return;
    }

    pokemonName = pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1);
    pokemonNameInput.value = pokemonName;

    
    
    fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Pokemon not found');
        }
        return response.json();
    })
    .then(data => {
        let imageUrl = data.sprites.front_default;
        document.getElementById('pokemonDisplay').innerHTML = `
            <img src="${imageUrl}" alt="${data.name}">
        `;
    })
    .catch(error => {
        document.getElementById('pokemonDisplay').innerHTML = `<p>${error.message}</p>`;
    });
});
