<script>
    import { onMount } from 'svelte';
    import { getAllCountries } from '$lib/api/countries';

    /** @type {any[]} */
    let countries = [];
    /** @type {any[]} */
    let filteredCountries = [];
    let loading = true;
    /** @type {string | null} */
    let error = null;

    // Paginering
    let currentPage = 1;
    let itemsPerPage = 20;

    // Søk og filter
    let searchTerm = '';
    let minPopulation = 0;
    let maxPopulation = 2000000000;

    $: totalPages = Math.ceil(filteredCountries.length / itemsPerPage);
    $: paginatedCountries = filteredCountries.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    onMount(async () => {
        try {
            countries = await getAllCountries();
            filteredCountries = countries;
            loading = false;
        } catch (e) {
            error = e instanceof Error ? e.message : 'Ukjent feil';
            loading = false;
        }
    });

    function filterCountries() {
        filteredCountries = countries.filter(country => {
            const matchesSearch = country.name.common
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
            const population = country.population || 0;
            const matchesPopulation = population >= minPopulation && population <= maxPopulation;
            return matchesSearch && matchesPopulation;
        });
        currentPage = 1;
    }

    /**
     * @param {number} page
     */
    function changePage(page) {
        if (page >= 1 && page <= totalPages) {
            currentPage = page;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    $: {
        searchTerm;
        minPopulation;
        maxPopulation;
        filterCountries();
    }
</script>

<div class="container">

    {#if loading}
        <p>Laster land...</p>
    {:else if error}
        <p class="error">Feil: {error}</p>
    {:else}
        <div class="filters">
            <input
                    type="text"
                    placeholder="Søk etter land..."
                    bind:value={searchTerm}
            />

            <div class="population-filter">
                <label>
                    Min befolkning:
                    <input
                            type="number"
                            bind:value={minPopulation}
                            min="0"
                    />
                </label>
                <label>
                    Max befolkning:
                    <input
                            type="number"
                            bind:value={maxPopulation}
                            min="0"
                    />
                </label>
            </div>
        </div>

        <p class="results-info">
            Viser {filteredCountries.length} land (side {currentPage} av {totalPages})
        </p>

        <div class="country-grid">
            {#each paginatedCountries as country}
                <a href="/land/{country.cca3}" class="country-card">
                    <img src={country.flags.svg} alt="{country.name.common} flagg" />
                    <h3>{country.name.common}</h3>
                    <p>👥 {country.population?.toLocaleString('nb-NO') || 'Ukjent'}</p>
                    <p>🌍 {country.region}</p>
                </a>
            {/each}
        </div>

        <div class="pagination">
            <button
                    on:click={() => changePage(currentPage - 1)}
                    disabled={currentPage === 1}
            >
                ← Forrige
            </button>

            {#each Array(totalPages) as _, i}
                {#if i + 1 === 1 || i + 1 === totalPages || Math.abs(i + 1 - currentPage) <= 2}
                    <button
                            class:active={currentPage === i + 1}
                            on:click={() => changePage(i + 1)}
                    >
                        {i + 1}
                    </button>
                {:else if i + 1 === currentPage - 3 || i + 1 === currentPage + 3}
                    <span>...</span>
                {/if}
            {/each}

            <button
                    on:click={() => changePage(currentPage + 1)}
                    disabled={currentPage === totalPages}
            >
                Neste →
            </button>
        </div>
    {/if}
</div>

<style>
    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }

    h1 {
        text-align: center;
        margin-bottom: 2rem;
    }

    .filters {
        margin-bottom: 2rem;
    }

    .filters input[type="text"] {
        width: 100%;
        padding: 0.75rem;
        font-size: 1rem;
        margin-bottom: 1rem;
        box-sizing: border-box;
    }

    .population-filter {
        display: flex;
        gap: 1rem;
    }

    .population-filter label {
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .population-filter input {
        width: 100%;
        padding: 0.5rem;
        margin-top: 0.25rem;
        box-sizing: border-box;
    }

    .results-info {
        text-align: center;
        margin-bottom: 1rem;
        color: #666;
    }

    .country-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
    }

    .country-card {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 1rem;
        text-decoration: none;
        color: inherit;
        transition: transform 0.2s, box-shadow 0.2s;
    }

    .country-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .country-card img {
        width: 100%;
        height: 150px;
        object-fit: cover;
        border-radius: 4px;
        margin-bottom: 0.5rem;
    }

    .country-card h3 {
        margin: 0.5rem 0;
    }

    .country-card p {
        margin: 0.25rem 0;
        font-size: 0.9rem;
        color: #666;
    }

    .pagination {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        flex-wrap: wrap;
        align-items: center;
    }

    .pagination button {
        padding: 0.5rem 1rem;
        border: 1px solid #ddd;
        background: white;
        cursor: pointer;
        border-radius: 4px;
    }

    .pagination button:hover:not(:disabled) {
        background: #f0f0f0;
    }

    .pagination button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .pagination button.active {
        background: #007bff;
        color: white;
        border-color: #007bff;
    }

    .pagination span {
        padding: 0.5rem;
    }

    .error {
        color: red;
        text-align: center;
    }
</style>
