let currentIndex = -1;
let filteredPokemon = [];

document.getElementById('pokemonName').addEventListener('input', function () {
    let input = this.value.toLowerCase();
    let suggestions = document.getElementById('suggestions');
    suggestions.innerHTML = '';
    currentIndex = -1;

    if (input === '') {
        suggestions.style.display = 'none';
        return;
    }

    fetch('https://pokeapi.co/api/v2/pokemon?limit=1000')
        .then(response => response.json())
        .then(data => {
            filteredPokemon = data.results.filter(pokemon => pokemon.name.includes(input));

            suggestions.style.display = filteredPokemon.length > 0 ? 'block' : 'none';

            filteredPokemon.forEach((pokemon, index) => {
                let div = document.createElement('div');
                div.textContent = pokemon.name;
                div.addEventListener('click', function () {
                    document.getElementById('pokemonName').value = pokemon.name;
                    suggestions.innerHTML = '';
                    suggestions.style.display = 'none';
                });
                suggestions.appendChild(div);
            });
        });
});

document.getElementById('pokemonName').addEventListener('keydown', function (event) {
    let suggestions = document.getElementById('suggestions').children;

    if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (currentIndex < suggestions.length - 1) {
            currentIndex++;
            updateSuggestionHighlight(suggestions);
        }
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (currentIndex > 0) {
            currentIndex--;
            updateSuggestionHighlight(suggestions);
        }
    } else if (event.key === 'Enter') {
        event.preventDefault();
        if (currentIndex >= 0 && currentIndex < suggestions.length) {
            document.getElementById('pokemonName').value = suggestions[currentIndex].textContent;
        }
        document.getElementById('suggestions').innerHTML = '';
        document.getElementById('suggestions').style.display = 'none';
        document.getElementById('pokedexForm').dispatchEvent(new Event('submit'));
    }
});

function updateSuggestionHighlight(suggestions) {
    Array.from(suggestions).forEach((suggestion, index) => {
        suggestion.style.backgroundColor = index === currentIndex ? '#ddd' : '';
        if (index === currentIndex) {
            suggestion.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    });
}

document.getElementById('pokedexForm').addEventListener('submit', function (event) {
    event.preventDefault();
    let pokemonNameInput = document.getElementById('pokemonName');
    let pokemonName = pokemonNameInput.value.trim().toLowerCase();

    if (pokemonName === '') {
        document.getElementById('pokemonDisplay').innerHTML = `<p>Please enter a Pokémon name.</p>`;
        return;
    }

    pokemonName = pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1);
    pokemonNameInput.value = pokemonName;

    fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Pokémon not found');
            }
            return response.json();
        })
        .then(data => {
            let imageUrl = data.sprites.front_default;
            if (!imageUrl) {
                throw new Error('Image not available for this Pokémon.');
            }

            let typesHtml = data.types.map(typeInfo => {
                let typeName = typeInfo.type.name.charAt(0).toUpperCase() + typeInfo.type.name.slice(1);
                return `<span class="type-${typeInfo.type.name}">${typeName}</span>`;
            }).join(' ');

            let statsMap = {
                'hp': 'HP:',
                'attack': 'ATK:',
                'defense': 'DEF:',
                'special-attack': 'SPA:',
                'special-defense': 'SPD:',
                'speed': 'SPE:'
            };

            let statsHtml = data.stats.map(stat => {
                let statValue = stat.base_stat;
                let statName = statsMap[stat.stat.name];
                let color = getStatColor(statValue);
                return `
                    <div class="stat-bar">
                        <span class="stat-name">${statName}</span>
                        <span class="stat-value">${statValue}</span>
                        <div class="stat-progress-container">
                            <div class="stat-progress" style="width: ${Math.min(statValue, 150)}px; background-color: ${color};"></div>
                        </div>
                    </div>
                `;
            }).join('');

            document.getElementById('pokemonDisplay').innerHTML = `
                <img src="${imageUrl}" alt="${data.name}">
                <p><strong>Type(s):</strong> ${typesHtml}</p>
                <div class="stats-section">
                    ${statsHtml}
                </div>
            `;
        })
        .catch(error => {
            document.getElementById('pokemonDisplay').innerHTML = `<p>${error.message}</p>`;
        });
});

function getStatColor(value) {
    if (value <= 59) return '#f34444';
    if (value <= 88) return '#ffdd57';
    if (value <= 129) return '#a0e515';
    if (value <= 130) return '#23cd5e';
    return '#00c2b8';
}
