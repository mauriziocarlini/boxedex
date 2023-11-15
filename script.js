// Global variable to store selected Pokémon name for autocomplete
let selectedPokemon = '';

function openPokemonModal() {
    // Clear the input field when opening the modal
    document.getElementById('pokemonName').value = '';
    document.getElementById('pokemonModal').style.display = 'block';
    document.getElementById('pokemonName').focus(); // Focus the input when the modal is opened

    // Remove the X button from the modal
    document.querySelector('.modal-content .close').style.display = 'none';
}

function closePokemonModal() {
    document.getElementById('pokemonModal').style.display = 'none';
}

// Close the modal when clicking outside of it
document.addEventListener('click', function (event) {
    var modal = document.getElementById('pokemonModal');
    var modalContent = document.querySelector('.modal-content');

    // Check if the click is outside the modal content
    if (event.target === modal) {
        closePokemonModal();
    }
});

async function getPokemonData() {
    // Get the user input (Pokémon name) from the input field
    var pokemonName = selectedPokemon || document.getElementById('pokemonName').value.toLowerCase();

    // Construct the PokeAPI URL for the specified Pokémon
    var apiUrl = `https://pokeapi.co/api/v2/pokemon/${pokemonName}/`;

    try {
        // Make a request to the PokeAPI
        var response = await fetch(apiUrl);
        var data = await response.json();
        // Extract the dex index from the API response
        var dexIndex = data.id;
        // Perform the calculation: divide by 30 and round up
        var calculatedValue = Math.ceil(dexIndex / 30);
        // Calculate the "Spot" variable
        var box = calculatedValue;
        var spot = dexIndex - 30 * box + 30;
        // Calculate the "ROW" variable and round down
        var row = Math.floor((spot - 1) / 6) + 1;
        // Calculate the "COL" variable
        var col = (spot - 1) % 6 + 1;

        // Display the calculated values on the page
        document.getElementById('boxResult').innerText = `BOX ${calculatedValue}`;
        document.getElementById('rowResult').innerText = `Row: ${row}`;
        document.getElementById('colResult').innerText = `Col: ${col}`;
        // Display the pure dex id at the end
        document.getElementById('dexIdResult').innerText = `ID: #${dexIndex}`;
        // Display the grid
        displayGrid(spot, data.sprites.front_default);
        closePokemonModal(); // Close the modal after selecting Pokémon
    } catch (error) {
        // Display an error message if the Pokémon is not found
        document.getElementById('boxResult').innerText = `Error: Pokémon not found`;
        document.getElementById('rowResult').innerText = '';
        document.getElementById('colResult').innerText = '';
        document.getElementById('dexIdResult').innerText = '';
        // Clear the grid on error
        displayGrid();
    }
}

// Function to fetch and update the suggestions based on user input
async function updateSuggestions() {
    var input = document.getElementById('pokemonName');
    var autosuggestDialog = document.getElementById('autosuggestDialog');
    // Fetch the list of Pokémon names from the PokeAPI without limit
    var inputValue = input.value.toLowerCase();

    // Show autosuggest dialog only if the input is active and has at least three characters
    if (document.activeElement === input && inputValue.length >= 1) {
        var apiUrl = `https://pokeapi.co/api/v2/pokemon?limit=3000`;

        // Fetching a higher limit, adjust as needed
        try {
            var response = await fetch(apiUrl);
            var data = await response.json();
            // Clear existing autosuggest dialog
            autosuggestDialog.innerHTML = '';

            // Filter and add suggestions based on user input and dex id
            var hasSuggestions = false; // Flag to check if there are suggestions
            data.results.forEach(function (pokemon) {
                var name = pokemon.name;
                var dexId = pokemon.url.split('/').filter(Boolean).pop();

                // Extract dex id from URL
                if (name.startsWith(inputValue) && dexId <= 2000) {
                    // Create suggestion item for autosuggest dialog
                    var autosuggestItem = document.createElement('div');
                    autosuggestItem.classList.add('autosuggest-item');
                    autosuggestItem.innerHTML = `
                        <img src="${getPokemonSpriteUrl(dexId)}" alt="${name}">
                        ${name}
                    `;
                    // Attach click event to trigger data retrieval
                    autosuggestItem.addEventListener('click', function () {
                        selectedPokemon = name;
                        input.value = selectedPokemon;
                        updateSuggestions(); // Hide autosuggest dialog
                        getPokemonData(); // Simulate submit
                        closePokemonModal(); // Close the modal after selecting Pokémon
                    });
                    autosuggestDialog.appendChild(autosuggestItem);
                    hasSuggestions = true; // Set flag to true if there are suggestions
                }
            });

            // Show autosuggest dialog only if there are suggestions
            if (hasSuggestions) {
                autosuggestDialog.style.display = 'block';
            } else {
                autosuggestDialog.style.display = 'none';
            }
        } catch (error) {
            console.error('Error fetching Pokémon names: ', error);
        }
    } else {
        autosuggestDialog.style.display = 'none'; // Hide autosuggest dialog if conditions not met
    }
}

// Function to get Pokémon sprite URL based on dex id
function getPokemonSpriteUrl(dexId) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dexId}.png`;
}

function displayGrid(selectedSpot, spriteUrl) {
    // Get the table element
    var table = document.getElementById('gridTable');
    // Clear existing rows
    table.innerHTML = '';
    // Create the grid rows and cells
    for (var i = 0; i < 5; i++) {
        var row = table.insertRow(i);
        for (var j = 0; j < 6; j++) {
            var cell = row.insertCell(j);

            // Set background image if the cell number matches the selected spot
            if (selectedSpot !== undefined && i * 6 + j + 1 === selectedSpot) {
                cell.style.backgroundImage = `url(${spriteUrl})`;
            } else {
                // Alternate background color for cells without a sprite
                cell.style.backgroundColor = (i + j) % 2 === 0 ? '#79DDD7' : '#89E5DF';
            }
        }
    }
}

// Function to clear cache and refresh the page
function clearCacheRefreshPage() {
    location.reload(true); // Pass true to force a reload from the server, bypassing the cache
    window.location.reload(true);
}
