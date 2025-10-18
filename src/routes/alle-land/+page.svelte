<script>
    import { onMount } from 'svelte';
    import { getAllCountries } from '$lib/api/countries';
    import { Card, Input, Select, Button, Pagination } from 'flowbite-svelte';
    import { SearchOutline } from 'flowbite-svelte-icons';
    import { getContext } from 'svelte';

    /** @type {any[]} */
    let countries = [];
    let loading = true;
    let searchTerm = '';
    /** @type {string | null} */
    let error = null;

    let currentPage = 1;
    let itemsPerPage = 20;
    let sortBy = 'name';
    let sortOrder = 'asc';

    let itemsPerPageOptions = [
        {value: 10, name: '10 per side' },
        {value: 20, name: '20 per side' },
        {value: 50, name: '50 per side' },
        {value: 100, name: '100 per side' },
    ];


    $: if (itemsPerPage) {
        currentPage = 1;
    }

    $: filteredCountries = countries.filter(country =>
        country.name.common.toLowerCase().includes(searchTerm.toLowerCase())
    );

    $: sortedCountries = [...filteredCountries].sort((a, b) => {
        let compareA, compareB;

        switch(sortBy) {
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
                compareA = a.region || '';
                compareB = b.region || '';
                break;
            default:
                return 0;
        }

        if (typeof compareA === 'string') {
            const result = compareA.localeCompare(compareB, 'nb-NO');
            return sortOrder === 'asc' ? result : -result;
        } else {
            return sortOrder === 'asc' ? compareA - compareB : compareB - compareA;
        }
    });

    $: pages = Array.from({length: totalPages }, (_, i) => ({
        name: (i + 1).toString(),
        active: i + 1 === currentPage
    }));

    $: totalPages = Math.ceil(sortedCountries.length / itemsPerPage);

    $: paginatedCountries = sortedCountries.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    $: if (itemsPerPage) currentPage = 1;
    $: if (searchTerm || sortBy || sortOrder) currentPage = 1;

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

    const lang = getContext('lang');

    const previous = () => {
        if (currentPage > 1) {
            currentPage -= 1;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const next = () => {
        if (currentPage < totalPages) {
            currentPage += 1;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    let sortOptions = [
        { value: 'name', name: '📝 Navn' },
        { value: 'population', name: '👥 Befolkning' },
        { value: 'area', name: '📏 Areal' },
        { value: 'region', name: '🌍 Region' }
    ];

    let orderOptions = [
        { value: 'asc', name: '↑ Stigende' },
        { value: 'desc', name: '↓ Synkende' }
    ];

    let perPageOptions = [
        { value: 10, name: '10 per side' },
        { value: 20, name: '20 per side' },
        { value: 50, name: '50 per side' },
        { value: 100, name: '100 per side' },
        { value: 220, name: 'Alle land på én side' },
    ];

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
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">Alle land</h1>
    </div>

    {#if loading}
        <div class="text-center py-16">
            <p class="text-gray-600">Laster land...</p>
        </div>
    {:else if error}
        <Card class="text-center max-w-2xl mx-auto">
            <p class="text-red-600 mb-4">❌ Feil: {error}</p>
            <Button href="/">← Tilbake til forsiden</Button>
        </Card>
    {:else}
        <!-- Wikipedia-style two-column layout -->
        <div class="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-2">

            <!-- MAIN SECTION - Country List (like Wikipedia article content) -->
            <main class="min-w-0">
                <!-- Stats -->
                <div class="mb-4">
                    <span class="text-2xl font-semibold text-gray-900 dark:text-white">
                        {sortedCountries.length} land
                        {#if sortedCountries.length !== countries.length}
                            <span class="text-base font-normal text-gray-500">av {countries.length}</span>
                        {/if}
                    </span>
                    {#if totalPages > 1}
                        <span class="block text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Side {currentPage} / {totalPages}
                        </span>
                    {/if}
                </div>

                <!-- Country List -->
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
                                        {country.name.common}
                                    </h3>
                                    <div class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                        <span class="font-medium">{country.region}</span>
                                        {#if country.capital?.[0]}
                                            <span class="text-gray-400">•</span>
                                            <span>Hovedstad: {country.capital[0]}</span>
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

                <!-- Pagination -->
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
            </main>

            <!-- SIDEBAR - Search and Filters (like Wikipedia infobox) -->
            <aside class="lg:order-last">
                <div class="lg:sticky lg:top-20 p-1">
                    <Card class="bg-gray-50 dark:bg-gray-800">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                            Søk og filtrer
                        </h3>

                        <div class="space-y-4">
                            <!-- Search -->
                            <div>
                                <label for="search" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Søk
                                </label>
                                <Input
                                        id="search"
                                        placeholder="Søk..."
                                        bind:value={searchTerm}
                                        size="sm"
                                >
                                    <SearchOutline slot="left" class="w-4 h-4" />
                                </Input>
                            </div>

                            <!-- Sort By -->
                            <div>
                                <label for="sortBy" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Sorter etter
                                </label>
                                <Select id="sortBy" items={sortOptions} bind:value={sortBy} size="sm" />
                            </div>

                            <!-- Sort Order -->
                            <div>
                                <label for="sortOrder" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Rekkefølge
                                </label>
                                <Select id="sortOrder" items={orderOptions} bind:value={sortOrder} size="sm" />
                            </div>

                            <!-- Items Per Page -->
                            <div>
                                <label for="perPage" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Vis per side
                                </label>
                                <Select id="perPage" items={perPageOptions} bind:value={itemsPerPage} size="sm" />
                            </div>
                        </div>
                    </Card>
                </div>
            </aside>
        </div>
    {/if}
</div>

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

</style>
