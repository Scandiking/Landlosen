<!--
Layoutfil.
 -->
<script lang="ts">
    import '../app.css';
    import { fly } from 'svelte/transition';
    import { sineIn, sineOut } from 'svelte/easing';
    import { getContext, setContext, onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { theme } from '$lib/stores/theme';
    import { SunOutline, MoonOutline, DesktopPcOutline } from 'flowbite-svelte-icons';
    import { getAllCountries } from "$lib/api/countries.ts";
    import { countryTranslations } from "$lib/translations/countries.ts";
    import { Progressbar } from 'flowbite-svelte';

    type Country = {
        cca3: string;
        name: { common: string };
        flags: { svg: string };
        translations?: { nob?: { common: string } };
        population?: number;
        region: string;
    };

    let drawerOpen = false;
    let langDropdownOpen = false;
    let searchInput = '';
    let countries: Country[] = [];
    let searchResults: Country[] = [];
    let showDropdown = false;

    const lang = writable('no');
    const countriesStore = writable<Country[]>([]);

    setContext('lang', lang);
    setContext('countries', countriesStore);

    onMount(async () => {
        countries = await getAllCountries();
        countriesStore.set(countries); // Rett variabel
        theme.init();

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if ($theme === 'system') {
                theme.set('system');
            }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    });


    function getCountryName(country: Country) {
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
        if (searchInput.trim()) {
            searchResults = countries
                .filter(c => getCountryName(c).toLowerCase().includes(searchInput.toLowerCase()))
                .slice(0, 10);
            showDropdown = searchResults.length > 0;
        } else {
            showDropdown = false;
        }
    }

    function selectCountry(country: Country) {
        goto(`/land/${country.cca3}`);
        searchInput = '';
        showDropdown = false;
    }

    function toggleDrawer() {
        drawerOpen = !drawerOpen;
    }

    function closeDrawer() {
        drawerOpen = false;
    }

    function toggleLangDropdown() {
        langDropdownOpen = !langDropdownOpen;
    }

    function setLanguage(newLang: 'no' | 'en') {
        $lang = newLang;
        langDropdownOpen = false;
    }

    function cycleTheme() {
        const themes = ['system', 'light', 'dark'] as const;
        const currentIndex = themes.indexOf($theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        theme.set(themes[nextIndex]);
    }

    const languages = {
        no: { name: 'Norsk', flag: '🇳🇴' },
        en: { name: 'English', flag: '🇬🇧' }
    };

    const themeLabels = {
        light: { no: 'Lys', en: 'Light' },
        dark: { no: 'Mørk', en: 'Dark' },
        system: { no: 'System', en: 'System' }
    };
</script>

<!-- Setter min høyde til 100% av skjermhøyde, bakgrunn på største div, lysegrå og mørkegrå for hhv lys og mørkt tema,  -->
<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Klistrer navbar til toppen, og legger navbaren over andre elementer med lavere z-index -->
    <nav class="sticky top-0 bg-white border-gray-200 dark:bg-gray-900 border-b dark:border-gray-700 relative z-30 shadow-lg">
        <!-- Sentrerer annet innhold med et lite mellomrom -->
        <div class="flex items-center justify-between gap-4 px-4 py-3">
            <div class="flex items-center gap-2">
                <!--
                Aria-label for skjermleser
                knapp for å åpne sideskuff
                md-hidden for å kun vise hamburgermeny på mindre skjermer
                -->
                <button
                        on:click={toggleDrawer}
                        aria-label="Open menu"
                        class="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                >
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path>
                    </svg>
                </button>
                <!-- Branding, stil for "logo" -->
                <a href="/" class="text-xl font-semibold whitespace-nowrap dark:text-white">Landlosen</a>
            </div>

            <!-- Søkefelt, skjult på små skjermer med md:block, tilgjengelig via knapp nærmere tommel på alle-land -->


                <div class="flex-1 max-w-md mx-4 md:block relative hidden">
                    <input
                            type="text"
                            bind:value={searchInput}
                            placeholder={$lang === 'no' ? 'Søk etter land...' : 'Search for country...'}
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />

                    {#if showDropdown}
                        <div class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 dark:text-white rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
                            {#each searchResults as country}
                                <button
                                        on:click={() => selectCountry(country)}
                                        class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                                >
                                    <img src={country.flags.svg} alt="" class="w-8 h-6 object-cover rounded" />
                                    <span>{getCountryName(country)}</span>
                                </button>
                            {/each}
                        </div>
                    {/if}
                </div>





            <!--Navbar-meny tilgjengelig på større skjerm ( i stedet for sideskuff) -->
            <div class="flex items-center gap-2">
                <!-- hidden md:flex, vises ikke på mindre skjermer -->
                <div class="hidden md:flex gap-6 mr-4">
                    <a href="/" class="text-gray-900 hover:text-blue-700 dark:text-white dark:hover:text-blue-500">
                        {$lang === 'no' ? 'Hjem' : 'Home'}
                    </a>
                    <a href="/alle-land" class="text-gray-900 hover:text-blue-700 dark:text-white dark:hover:text-blue-500">
                        {$lang === 'no' ? 'Alle land' : 'All countries'}
                    </a>
                </div>

                <!-- Theme Toggle Button ,
                bytter ikon etter tema-kontekst,
                viser ikke labels på mindre skjermer
                -->
                <button
                        on:click={cycleTheme}
                        class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                        title="{themeLabels[$theme][$lang]}"
                >
                    {#if $theme === 'light'}
                        <SunOutline class="w-5 h-5"/>
                        {:else if $theme === 'dark'}
                        <MoonOutline class="w-5 h-5"/>
                        {:else}
                        <DesktopPcOutline class="w-5 h-5"/>
                        {/if}
                    <span class="hidden sm:inline">{themeLabels[$theme][$lang]}</span>
                </button>

                <!-- Language Dropdown -->
                <div class="relative">
                    <button
                            on:click={toggleLangDropdown}
                            class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        <span>{languages[$lang].flag}</span>
                        <span class="hidden sm:inline">{languages[$lang].name}</span>
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                        </svg>
                    </button>

                    <!-- Dropwdown-meny for språkvalg, emoji for flag, fallback landkoder som NO -->
                    {#if langDropdownOpen}
                        <div class="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50">
                            <button
                                    on:click={() => setLanguage('no')}
                                    class="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-t-lg"
                            >
                                <span>🇳🇴</span>
                                <span>Norsk</span>
                            </button>
                            <button
                                    on:click={() => setLanguage('en')}
                                    class="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-b-lg"
                            >
                                <span>🇬🇧</span>
                                <span>English</span>
                            </button>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </nav>

    {#if drawerOpen}
        <button
                on:click={closeDrawer}
                aria-label="Close drawer"
                class="fixed inset-0 bg-gray-900 bg-opacity-50 z-40"
                transition:fly={{ duration: 200 }}
        ></button>

        <div
                class="fixed top-0 left-0 z-50 w-64 h-screen bg-white dark:bg-gray-800 shadow-lg"
                transition:fly={{ x: -320, duration: 200, easing: sineIn }}
        >
            <div class="p-4">
                <div class="flex items-center justify-between mb-6">
                    <h5 class="text-base font-semibold text-gray-500 uppercase dark:text-gray-400">
                        {$lang === 'no' ? 'Meny' : 'Menu'}
                    </h5>
                    <button
                            on:click={closeDrawer}
                            aria-label="Close drawer"
                            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                        </svg>
                    </button>
                </div>

                <nav class="space-y-2">
                    <a
                            href="/"
                            on:click={closeDrawer}
                            class="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                    >
                        <svg class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                        </svg>
                        <span class="ml-3">{$lang === 'no' ? 'Hjem' : 'Home'}</span>
                    </a>

                    <a
                            href="/alle-land"
                            on:click={closeDrawer}
                            class="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                    >
                        <svg class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"></path>
                        </svg>
                        <span class="ml-3">{$lang === 'no' ? 'Alle land' : 'All countries'}</span>
                    </a>
                </nav>
            </div>
        </div>
    {/if}

    <main class="p-4">
        <slot />
    </main>
</div>
