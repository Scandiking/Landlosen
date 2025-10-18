<script>
    import { onMount, getContext } from 'svelte';
    import { getAllCountries } from '$lib/api/countries.js';
    import { countryTranslations } from '$lib/translations/countries';

    const searchTerm = getContext('searchTerm');
    const lang = getContext('lang');

    let countries = [];
    let filteredCountries = [];
    let loading = true;
    let error = null;

    let currentPage = 1;
    let itemsPerPage = 20;

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

    function getCountryName(country) {
        if ($lang === 'no') {
            if (country.translations?.nob?.common) {
                return country.translations.nob.common;
            }
            if (countryTranslations[country.name.common]) {
                return countryTranslations[country.name.common];
            }
        }
        return country.name.common;
    }

    $: {
        filteredCountries = countries.filter(country => {
            const countryName = getCountryName(country);
            return countryName
                .toLowerCase()
                .includes($searchTerm.toLowerCase());
        });
        currentPage = 1;
    }

    function changePage(page) {
        if (page >= 1 && page <= totalPages) {
            currentPage = page;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
</script>

<div class="container">
    {#if loading}
        <p>{$lang === 'no' ? 'Laster land...' : 'Loading countries...'}</p>
    {:else if error}
        <p class="error">{$lang === 'no' ? 'Feil' : 'Error'}: {error}</p>
    {:else}
        <p class="results-info">
            {$lang === 'no'
                ? `Viser ${filteredCountries.length} land (side ${currentPage} av ${totalPages})`
                : `Showing ${filteredCountries.length} countries (page ${currentPage} of ${totalPages})`
            }
        </p>

        <div class="country-grid">
            {#each paginatedCountries as country}
                <a href="/land/{country.cca3}" class="country-card">
                    <img src={country.flags.svg} alt="{getCountryName(country)} flagg" />
                    <h3>{getCountryName(country)}</h3>
                    <p>👥 {country.population?.toLocaleString($lang === 'no' ? 'nb-NO' : 'en-US') || ($lang === 'no' ? 'Ukjent' : 'Unknown')}</p>
                    <p>🌍 {country.region}</p>
                </a>
            {/each}
        </div>

        <div class="pagination">
            <button
                    on:click={() => changePage(currentPage - 1)}
                    disabled={currentPage === 1}
            >
                {$lang === 'no' ? '←' : '←'}
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
                {$lang === 'no' ? '→' : '→'}
            </button>
        </div>
    {/if}
</div>

<style>
    .container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 2rem;
    }

    .results-info {
        text-align: center;
        margin-bottom: 2rem;
        color: #6b7280;
        font-size: 1.125rem;
    }

    :global(.dark) .results-info {
        color: #9ca3af;
    }

    .country-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.5rem;
        margin-bottom: 3rem;
    }

    .country-card {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        text-decoration: none;
        transition: transform 0.2s, box-shadow 0.2s;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        border: 1px solid #e5e7eb;
    }

    :global(.dark) .country-card {
        background: #1f2937;
        border-color: #374151;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }

    .country-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 20px rgba(0,0,0,0.15);
    }

    :global(.dark) .country-card:hover {
        border-color: #93c5fd;
        box-shadow: 0 8px 8px rgba(50,50,50,0.5);
    }

    .country-card img {
        width: 100%;
        height: 180px;
        object-fit: cover;
        border-radius: 8px;
        margin-bottom: 1rem;
    }

    .country-card h3 {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 0.75rem;
        color: #111827;
    }

    :global(.dark) .country-card h3 {
        color: #f3f4f6;
    }

    .country-card p {
        color: #6b7280;
        margin: 0.25rem 0;
    }

    :global(.dark) .country-card p {
        color: #9ca3af;
    }

    .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
    }

    .pagination button {
        padding: 0.5rem 1rem;
        border: 1px solid #d1d5db;
        background: white;
        color: #374151;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
    }

    :global(.dark) .pagination button {
        background: #1f2937;
        border-color: #374151;
        color: #e5e7eb;
    }

    .pagination button:hover:not(:disabled) {
        background: #f3f4f6;
        border-color: #9ca3af;
    }

    :global(.dark) .pagination button:hover:not(:disabled) {
        background: #374151;
        border-color: #4b5563;
    }

    .pagination button.active {
        background: #3b82f6;
        color: white;
        border-color: #3b82f6;
    }

    :global(.dark) .pagination button.active {
        background: #2563eb;
        border-color: #2563eb;
    }

    .pagination button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .pagination span {
        color: #6b7280;
        padding: 0 0.5rem;
    }

    :global(.dark) .pagination span {
        color: #9ca3af;
    }

    .error {
        color: #ef4444;
        text-align: center;
        padding: 2rem;
    }

    :global(.dark) .error {
        color: #f87171;
    }
</style>

