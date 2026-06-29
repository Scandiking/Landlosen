<script lang="ts">
    import { getContext } from 'svelte';
    import { countryTranslations } from '$lib/translations/countries.ts';
    import { describeLoadError } from '$lib/errors.ts';
    import { Progressbar } from "flowbite-svelte";
    import { sineOut } from "svelte/easing";
    import type { Writable } from 'svelte/store';


    type Country = {
        cca3: string;
        name: { common: string };
        flags: { svg: string };
        translations?: { nob?: { common: string } };
        population?: number;
        region: string;
    };

    const lang = getContext<Writable<'no' | 'en'>>('lang');
    const countries = getContext<Writable<Country[]>>('countries');
    const loadError = getContext<Writable<string | null>>('loadError');
    const retryLoad = getContext<() => Promise<void>>('retryLoad');


    let currentPage = 1;
    let itemsPerPage = 20;

    // Laster så lenge listen er tom og ingen feil er oppstått.
    $: loading = $countries.length === 0 && !$loadError;
    $: errorInfo = $loadError ? describeLoadError($loadError, $lang) : null;
    $: filteredCountries = $countries; // Vis alle land
    $: totalPages = Math.ceil(filteredCountries.length / itemsPerPage);
    $: paginatedCountries = filteredCountries.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

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

    function changePage(page) {
        if (page >= 1 && page <= totalPages) {
            currentPage = page;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

</script>


<div class="container">
    {#if loading}
        <div class="text-center py-16">
            <Progressbar labelOutside={$lang==='no' ? 'Laster land og strand...' : 'Discovering countries...'} animate precision={2} tweenDuration={1500} easing={sineOut}/>
        </div>

    {:else if errorInfo}
        <div class="error-box" role="alert">
            <h2>{errorInfo.title}</h2>
            <p>{errorInfo.message}</p>
            <button class="retry-btn" on:click={() => retryLoad()}>
                {$lang === 'no' ? 'Prøv igjen' : 'Try again'}
            </button>
        </div>

    {:else}
        <p class="results-info">
            {$lang === 'no'
                ? `Viser ${filteredCountries.length} land (side ${currentPage} av ${totalPages})`
                : `Showing ${filteredCountries.length} countries (page ${currentPage} of ${totalPages})`
            }
        </p>

        <div class="country-grid">

                {#each paginatedCountries as country, i (country.cca3)}
                    <a
                       href="/land/{country.cca3}"
                       class="country-card"
                    >
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

<!-- Do not remove :global(.dark) despite IDE saying them not being used. They ARE in fact being used. -->
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



    .pagination button:hover:not(:disabled) {
        background: #f3f4f6;
        border-color: #9ca3af;
        transform: translateY(-2px);
        transition: transform 0.2s, background 0.2s, border-color 0.2s;
    }

    :global(.dark) .pagination button:hover:not(:disabled) {
        background: #374151;
        border-color: #4b5563;
        transform: translateY(-2px);
        transition: transform 0.2s, background 0.2s, border-color 0.2s;
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

    .error-box {
        max-width: 640px;
        margin: 4rem auto;
        padding: 2rem;
        text-align: center;
        background: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: 12px;
    }

    :global(.dark) .error-box {
        background: #2a1414;
        border-color: #7f1d1d;
    }

    .error-box h2 {
        font-size: 1.375rem;
        font-weight: 600;
        margin-bottom: 0.75rem;
        color: #b91c1c;
    }

    :global(.dark) .error-box h2 {
        color: #fca5a5;
    }

    .error-box p {
        color: #4b5563;
        line-height: 1.6;
        margin-bottom: 1.5rem;
    }

    :global(.dark) .error-box p {
        color: #d1d5db;
    }

    .retry-btn {
        padding: 0.6rem 1.5rem;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        cursor: pointer;
        transition: background 0.2s;
    }

    .retry-btn:hover {
        background: #2563eb;
    }


</style>

