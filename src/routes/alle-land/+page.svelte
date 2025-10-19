<script lang="ts">
    // Kjører kode når komponenten lastes/mountes
    import { onMount } from 'svelte';
    // Henter data om land
    import { getAllCountries } from '$lib/api/countries.js';
    // Henter UI-elementer fra Flowbite-UI-biblioteket
    import {Card, Input, Select, Button, Progressbar} from 'flowbite-svelte';
    import { sineOut } from 'svelte/easing';
    // Henter søkeikon
    import { SearchOutline } from 'flowbite-svelte-icons';
    // Deler data mellom komponenter (for system/lyst/mørkt tema her)
    import { getContext } from 'svelte';
    import { page } from '$app/stores';

    // Importere norske egenbryggede oversettelser
    import { countryOfficialTranslations } from "$lib/translations/countries_official.ts";
    import { countryTranslations } from "$lib/translations/countries.ts";
    import { regionTranslations } from "$lib/translations/regions.ts";

    // Importere datatype Writable, for å lagre en/no i
    import type { Writable } from "svelte/store";

    // Lang er nå Writable store, $lang vil være typed som 'no'|'en'
    const lang = getContext<Writable<'no' | 'en'>>('lang');

    const translations = {
        no: {
            searchAndFilter: 'Søk og filtrer',
            search: 'Søk',
            searchPlaceholder: 'Søk...',
            sortBy: 'Sorter etter',
            order: 'Rekkefølge',
            perPage: 'Vis per side'
        },
        en: {
            searchAndFilter: 'Search and Filter',
            search: 'Search',
            searchPlaceholder: 'Search...',
            sortBy: 'Sort by',
            order: 'Order',
            perPage: 'Show per page'
        }
    };

    // Opprette liste for landene
    let countries = [];
    // Vise innlastings-elementer når ting lastes, for å fortelle bruker at "joda, PC-en jobber, den har ikke fryst"
    let loading = true;
    // Søk er i utgangspunktet tomt, og viser derfor alle land i pagineringen
    let searchTerm = '';

    // "Unsette" feilmelding, om ikke null, f.eks string, vises feilmelding uansett. Misvisende.
    let error = null;

    // Starte på side 1
    let currentPage = 1;
    // Vise 20 land per side i utgangspunktet
    let itemsPerPage = 20;
    // Sortere på landenes navn i utgangspunktet
    let sortBy = 'name';
    // Sortere på navn stigende (alfabetisk)
    let sortOrder = 'asc';

    // Ikke vis filter-kortet på mobil viewport i utgangspunkt
    let showFilters = false;

    // Sorteringsmuligheter
    $: sortOptions = [
        { value: 'name', name: $lang === 'no' ? 'Navn' : 'Name' },
        { value: 'population', name: $lang === 'no' ? 'Befolkning' : 'Population' },
        { value: 'area', name: $lang === 'no' ? 'Areal' : 'Area' },
        { value: 'region', name: $lang === 'no' ? 'Region' : 'Region' }
    ];

    // Stigende eller synkende sortering på resultater
    $: orderOptions = [
        { value: 'asc', name: $lang === 'no' ? '↑ Stigende' : '↑ Ascending' },
        { value: 'desc', name: $lang === 'no' ? '↓ Synkende' : '↓ Descending' }
    ];

    // Hvor mange treff per side
    $: perPageOptions = [
        { value: 10, name: $lang === 'no' ? '10 per side' : '10 per page' },
        { value: 20, name: $lang === 'no' ? '20 per side' : '20 per page' },
        { value: 50, name: $lang === 'no' ? '50 per side' : '50 per page' },
        { value: 100, name: $lang === 'no' ? '100 per side' : '100 per page' },
        { value: 220, name: $lang === 'no' ? 'Alle land på én side' : 'All countries on one page' },
    ];

    // Tilbakestille til første side når itemsPerPage endres
    $: if (itemsPerPage) {
        currentPage = 1;
    }

    // Filtrere på land etter searchTerm, uavhengig av små og store bokstaver, engelsk eller norsk
    $: filteredCountries = countries.filter(country => {
        const enName = country.name.common.toLowerCase();
        const official = country.name.official;
        const noName = (countryOfficialTranslations[official] ?? '').toLowerCase();
        const enRegion = country.region.toLowerCase();
        const noRegion = ($lang === 'no' ? regionTranslations[country.region] : country.region).toLowerCase();
        const term = searchTerm.toLowerCase();
        return enName.includes(term) || noName.includes(term) || enRegion.includes(term) || noRegion.includes(term)
    });


    // JavaScript krever to-element-sammenligning for sort().
    // $ kjører reaktivt, ...filteredCountries kopierer array før sortering for å unngå mutasjon av utgangspunktet
    $: sortedCountries = [...filteredCountries].sort((a, b) => {
        let compareA, compareB;
        // Sortere hvilken egenskap det skal sorteres på
        switch(sortBy) {
            // Om det er "name", hentes verdien for hvert land ut
            case 'name':
                compareA = a.name.common;
                compareB = b.name.common;
                break;
            case 'population':
                compareA = a.population || 0;
                compareB = b.population || 0;
                break;
            case 'area':
                compareA = a.area || 0;
                compareB = b.area || 0;
                break;
            case 'region':
                compareA = $lang === 'no' && regionTranslations[a.region]
                    ? regionTranslations[a.region]
                    : a.region;
                compareB = $lang === 'no' && regionTranslations[b.region]
                    ? regionTranslations[b.region]
                    : b.region;
                break;
            default:
                return 0;
        }


        // Sjekke om sortere tekst
        if (typeof compareA === 'string') {
            // Sammenligner norsk tekst
            const result = compareA.localeCompare(compareB, 'nb-NO');
            // Returnerer resultat stigende eller synkende
            return sortOrder === 'asc' ? result : -result;
            // Ellers (tall)
        } else {
            // Resulterer resultat stigende eller synkende for tall
            return sortOrder === 'asc' ? compareA - compareB : compareB - compareA;
        }
    });

    // Oppdatere reaktivt når sortedCountries eller itemsPerPage endres. Runde til nærmeste hele side for å unngå "side 3,77"
    $: totalPages = Math.ceil(sortedCountries.length / itemsPerPage);

    // Bestemme hvilke land som vises på currentPage
    $: paginatedCountries = sortedCountries.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Sette reaktivt til første side etter ny setting av itemsPerpage, searchTerm, osv.
    $: if (itemsPerPage || searchTerm || sortBy || sortOrder) currentPage = 1;

    $: t = translations[$lang];

    // Les fra URL i stedet for kontekst
    $: searchFromUrl = $page.url.searchParams.get('search') || '';

    // Kjøre ved mount i DOM
    onMount(async () => {
        try {
            countries = await getAllCountries();
            loading = false;
        } catch (e) {
            console.error('Kunne ikke laste land:', e);
            error = e instanceof Error ? e.message : 'Ukjent feil';
            loading = false;
        }
    });



    // Sette vindu til toppen av siden ved ny innlasting av side
    function changePage(page) {
        if (page >= 1 && page <= totalPages) {
            currentPage = page;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
</script>


<div class="max-w-screen-2xl mx-auto px-4 py-6">
    <!-- Header -->
    <div class="mb-8 text-left">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">{$lang==='no' ? 'Alle land' : 'All countries'}</h1>
    </div>

    {#if loading}
        <div class="text-center py-16">
            <Progressbar labelOutside={$lang==='no' ? 'Laster land og strand...' : 'Discovering countries...'} animate precision={2} tweenDuration={1500} easing={sineOut}/>
        </div>
    {:else if error}
        <Card class="text-center max-w-2xl mx-auto">
            <p class="text-red-600 mb-4">Feil: {error}</p>
            <Button href="/">← Tilbake til forsiden</Button>
        </Card>
    {:else}

        <div class="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-2">

            <main class="min-w-0 pb-10 lg:pb-0">

                <div class="mb-4">
                    <span class="text-2xl font-semibold text-gray-900 dark:text-white">
                        {sortedCountries.length} {$lang==='no'?'land':'countries'}
                        {#if sortedCountries.length !== countries.length}
                            <span class="text-base font-normal text-gray-500">av {countries.length}</span>
                        {/if}
                    </span>
                    {#if totalPages > 1}
                        <span class="block text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {$lang==='no'?'Side':'Page'} {currentPage} / {totalPages}
                        </span>
                    {/if}
                </div>


                <div class="space-y-3 mb-8">
                    {#each paginatedCountries as country, index}
                        <Card
                                href="/land/{country.cca3}"

                                class="!max-w-none hover:shadow-lg transition-all duration-200 hover:scale-[1.002] hover:border-primary-500 cursor-pointer"
                        >
                            <div class="flex items-center gap-4">
                                <span class="text-lg font-bold text-gray-400 min-w-[50px] text-right">
                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                </span>
                                <img
                                        src={country.flags.svg}
                                        alt="{country.name.common} flagg"
                                        class="w-20 h-14 object-cover rounded border border-gray-200 shadow-sm"
                                />
                                <div class="flex-1 min-w-0">
                                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-1">

                                        {$lang === 'no' && countryTranslations[country.name.common]
                                            ? countryTranslations[country.name.common]
                                            : country.name.common}

                                    </h3>

                                    <div class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                        <span class="font-medium">
                                            {$lang === 'no' && regionTranslations[country.region]
                                                ? regionTranslations[country.region]
                                                : country.region}
                                        </span>

                                        {#if country.capital?.[0]}
                                            <span class="text-gray-400">•</span>
                                            <span>{$lang==='no'?'Hovedstad':'Capital'}: {country.capital[0]}</span>
                                        {/if}
                                    </div>
                                </div>
                                <div class="hidden md:flex flex-col items-end gap-2 text-sm text-gray-600 dark:text-gray-400 min-w-[180px]">
                                    <div class="flex items-center gap-2">
                                        <span class="font-medium">👥</span>
                                        <span>{country.population?.toLocaleString('nb-NO')}</span>
                                    </div>
                                    {#if country.area}
                                        <div class="flex items-center gap-2">
                                            <span class="font-medium">📏</span>
                                            <span>{country.area.toLocaleString('nb-NO')} km²</span>
                                        </div>
                                    {/if}
                                </div>
                            </div>
                        </Card>
                    {/each}
                </div>


<!-- =========================================================================== -->
<!-- Programmatisk pagingering                                                   -->
<!-- =========================================================================== -->
                <div class="pagination">

                    <!-- Tilbakeknapp -->
                    <button
                            on:click={() => changePage(currentPage - 1)}
                            disabled={currentPage === 1}
                    >
                        ←
                    </button>

                    <!-- Iterer loop over n sider -->
                    {#each Array(totalPages) as _, i}
                        <!-- Viser side 1, siste side og de som er +2 fra current side. Er du på side 5, ser du 1, 5, 6, 7, siste. -->
                        {#if i + 1 === 1 || i + 1 === totalPages || Math.abs(i + 1 - currentPage) <= 2}
                            <!-- Knapp for de nevnte sidene -->
                            <button
                                    class:active={currentPage === i + 1}
                                    on:click={() => changePage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        <!-- Sette "..." for utelatte sider. Utelatt av UX hensyn, decision fatigue -->
                        {:else if i + 1 === currentPage - 3 || i + 1 === currentPage + 3}
                            <span>...</span>
                        {/if}
                    {/each}

                    <!-- Button for neste side -->
                    <button
                            on:click={() => changePage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                    >
                        →
                    </button>
                </div>
            </main>

<!-- =========================================================================== -->
<!-- Sidebar for søk og filter                                                   -->
<!-- =========================================================================== -->
            <aside class="lg:order-last">
                <!-- Mobile Filter toggle button, sticky to bottom -->
                <button
                        class="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-medium flex items-center justify-between shadow-md border-t border-gray-200 dark:border-gray-700"
                        on:click={() => showFilters = !showFilters}
                >
                    <span>{t.searchAndFilter}</span>
                    <span class="text-xl">{showFilters ? '−' : '+'}</span>
                </button>

                <!-- Filter card, slides up from bottom when open -->
                <div
                        class="lg:sticky lg:top-20 p-1"
                        class:fixed={showFilters}
                        class:bottom-14={showFilters}
                        class:left-0={showFilters}
                        class:right-0={showFilters}
                        class:z-40={showFilters}
                        class:hidden={!showFilters}
                        class:lg:block={true}
                >
                    <Card class="bg-gray-50 dark:bg-gray-800" style="box-shadow: 0 0 15px rgba(0,0,0,0.15);">
                        <div class="max-h-[70vh] overflow-y-auto">
                        <h3 class="hidden lg:block text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                            {t.searchAndFilter}
                        </h3>

                        <div class="space-y-4">
                            <!-- Search -->
                            <div>
                                <label for="search" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    {t.search}
                                </label>
                                <Input
                                        id="search"
                                        placeholder={t.searchPlaceholder}
                                        bind:value={searchTerm}
                                        size="sm"
                                >
                                    <SearchOutline slot="left" class="w-4 h-4" />
                                </Input>
                            </div>

                            <!-- Filters in responsive grid -->
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                                <!-- Sort By -->
                                <div>
                                    <label for="sortBy" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        {t.sortBy}
                                    </label>
                                    <Select id="sortBy" items={sortOptions} bind:value={sortBy} size="sm" />
                                </div>

                                <!-- Sort Order -->
                                <div>
                                    <label for="sortOrder" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        {t.order}
                                    </label>
                                    <Select id="sortOrder" items={orderOptions} bind:value={sortOrder} size="sm" />
                                </div>

                                <!-- Items Per Page -->
                                <div>
                                    <label for="perPage" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        {t.perPage}
                                    </label>
                                    <Select id="perPage" items={perPageOptions} bind:value={itemsPerPage} size="sm" />
                                </div>
                            </div>
                        </div>
                        </div>
                    </Card>
                </div>
            </aside>


        </div>
    {/if}
</div>

<!-- CSS -->
<style>
    .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-top: 2rem;
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

</style>
