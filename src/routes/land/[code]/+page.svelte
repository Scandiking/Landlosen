<script lang="ts">
    import { page } from '$app/stores';
    import { onMount, getContext } from 'svelte';
    import type { Writable } from 'svelte/store';
    import { countryTranslations } from '$lib/translations/countries.ts';
    import { languageTranslations} from "$lib/translations/languages.ts";
    import { currencyTranslations} from "$lib/translations/currencies.ts";
    import { regionTranslations } from "$lib/translations/regions.ts";
    import { subregionTranslations } from "$lib/translations/subregions.ts";
    import { countryOfficialTranslations } from "$lib/translations/countries_official.ts";
    import {Progressbar} from "flowbite-svelte";
    import {sineOut} from "svelte/easing";

    const lang = getContext<Writable<'no' | 'en'>>('lang');

    interface Country {
        name: {
            common: string;
            official: string;
        };
        translations?: {
            nob?: {
                common: string;
                official: string;
            };
        };
        flags: {
            svg: string;
        };
        capital?: string[];
        region: string;
        subregion?: string;
        population: number;
        area: number;
        languages?: Record<string, string>;
        currencies?: Record<string, { name: string; symbol: string }>;
        timezones?: string[];
        maps?: {
            googleMaps: string;
        };
    }

    let country: Country | null = null;
    let loading = true;
    let error: string | null = null;

    onMount(async () => {
        try {
            const code = $page.params.code;
            const response = await fetch(`https://restcountries.com/v3.1/alpha/${code}`);
            if (!response.ok) throw new Error($lang === 'no' ? 'Fant ikke landet' : 'Country not found');
            const data = await response.json();
            country = data[0];
            loading = false;
        } catch (e) {
            error = e instanceof Error ? e.message : 'Unknown error';
            loading = false;
        }
    });



    // Hjelpefunksjon for å oversette vanlige navn
    $: displayedName = (() => {
        if (!country) return '';
        if ($lang === 'no') {
            const fromMap = countryTranslations[country.name.common];
            if (fromMap) return fromMap;
        }
        return country.name.common;
    })();

    // Hjelpefunksjon for å oversette offisielle navn
    $: displayedOfficial = (() => {
        if (!country) return '';
        if ($lang === 'no') {
            const fromMap = countryOfficialTranslations[country.name.official];
            if (fromMap) return fromMap;
        }
        return country.name.official;
    })();

    // Hjelpefunksjon for å oversette språknavn (Engelsk -> norsk)
    function translateLanguage(name: string): string {
        return $lang === 'no' && languageTranslations[name] ? languageTranslations[name] : name;
    }

    // Hjelpefunksjon for å oversette valutanavn (Engelsk -> norsk)
    function translateCurrency(name: string): string {
        return $lang === 'no' && currencyTranslations[name] ? currencyTranslations[name] : name;
    }

    // Hjelpefunksjon for å oversette regionnavn
    $: translateRegion = (name: string) =>
        $lang === 'no' && regionTranslations[name] ? regionTranslations[name] : name;

    //Hjelpefunksjon for å oversette underregionnavn
    $: translateSubregion = (name: string) =>
        $lang === 'no' && subregionTranslations[name] ? subregionTranslations[name] : name;


    const translations = {
        no: {
            backToList: '← Tilbake til listen',
            capital: 'Hovedstad',
            region: 'Region',
            subregion: 'Underregion',
            population: 'Befolkning',
            area: 'Areal',
            languages: 'Språk',
            currencies: 'Valuta',
            timezones: 'Tidssoner',
            openMaps: 'Åpne i Google Maps',
            unknown: 'Ukjent'
        },
        en: {
            backToList: '← Back to list',
            capital: 'Capital',
            region: 'Region',
            subregion: 'Subregion',
            population: 'Population',
            area: 'Area',
            languages: 'Languages',
            currencies: 'Currencies',
            timezones: 'Timezones',
            openMaps: 'Open in Google Maps',
            unknown: 'Unknown'
        }
    } as const;

    $: t = translations[$lang];
</script>

<div class="container">
    <a href="/" class="back-link">{t.backToList}</a>

    {#if loading}
        <div class="text-center py-16">
            <Progressbar labelOutside={$lang==='no' ? 'Laster land og strand...' : 'Discovering countries...'} animate precision={2} tweenDuration={1500} easing={sineOut}/>
        </div>
    {:else if error}
        <p class="error">{error}</p>
    {:else if country}

        <div class="max-w-4xl mx-auto">
            <!-- Flag and Names Section -->
            <div class="flex flex-col items-center mb-8">
                <img
                        src={country.flags.svg}
                        alt="{displayedName} {$lang === 'no' ? 'flagg' : 'flag'}"
                        class="flag mb-4 shadow-xl"
                />
                <h1 class="text-4xl font-bold mb-2 dark:text-white text-center">{displayedName}</h1>
                <h2 class="text-xl text-gray-600 dark:text-gray-400 text-center">{displayedOfficial}</h2>
            </div>

            <!-- Details Section - 2 Columns -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="info-item">
                    <strong>{t.region}:</strong>
                    <span>{translateRegion(country.region)}</span>
                </div>

                <div class="info-item">
                    <strong>{t.subregion}:</strong>
                    <span>{country.subregion ? translateSubregion(country.subregion) : t.unknown}</span>
                </div>

                <div class="info-item">
                    <strong>{t.capital}:</strong>
                    <span>{country.capital?.[0] || t.unknown}</span>
                </div>

                <div class="info-item">
                    <strong>{t.population}:</strong>
                    <span>{country.population?.toLocaleString($lang === 'no' ? 'nb-NO' : 'en-US')}</span>
                </div>

                <div class="info-item">
                    <strong>{t.area}:</strong>
                    <span>{country.area?.toLocaleString($lang === 'no' ? 'nb-NO' : 'en-US')} km²</span>
                </div>

                <div class="info-item">
                    <strong>{t.languages}:</strong>
                    <span>
                        {#if country.languages}
                            {Object.values(country.languages)
                                .map(l => translateLanguage(l) || t.unknown)
                                .join(', ')}
                        {:else}
                            {t.unknown}
                        {/if}
                    </span>
                </div>

                <div class="info-item">
                    <strong>{t.currencies}:</strong>
                    <span>
                        {#if country.currencies}
                            {Object.entries(country.currencies)
                                .map(([code, c]) => {
                                    const name = translateCurrency(c.name) || t.unknown;
                                    return `${name} (${c.symbol ?? ''})`;
                                })
                                .join(', ')}
                        {:else}
                            {t.unknown}
                        {/if}
                    </span>
                </div>

                <div class="info-item">
                    <strong>{t.timezones}:</strong>
                    <span>{country.timezones?.join(', ')}</span>
                </div>

                {#if country.maps?.googleMaps}
                    <div class="text-left">
                        <a href={country.maps.googleMaps} target="_blank" class="map-link">
                            {t.openMaps}
                        </a>
                    </div>
                {/if}
            </div>


        </div>

    {/if}
</div>

<style>
    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }

    .back-link {
        display: inline-block;
        margin-bottom: 2rem;
        color: #3b82f6;
        text-decoration: none;
        transition: color 0.2s;
    }

    .back-link:hover {
        color: #2563eb;
    }

    :global(.dark) .back-link {
        color: #60a5fa;
    }

    :global(.dark) .back-link:hover {
        color: #93c5fd;
    }

    .flag {
        width: 100%;
        max-width: 500px;
        height: auto;
        border-radius: 8px;
        box-shadow: 0 10px 15px rgba(0,0,0,0.25);
    }

    :global(.dark) .flag {
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }

    .info-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .info-item strong {
        color: #6b7280;
        font-weight: 600;
        font-size: 0.875rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    :global(.dark) .info-item strong {
        color: #9ca3af;
    }

    .info-item span {
        color: #111827;
        font-size: 1.125rem;
    }

    :global(.dark) .info-item span {
        color: #f3f4f6;
    }

    .map-link {
        display: inline-block;
        padding: 0.75rem 0.75rem;
        color: #60a5fa;
        border: 1px solid #60a5fa;
        border-radius: 8px;
        font-weight: 500;
        text-decoration: none;
        transition: background 0.2s, opacity 0.2s, box-shadow 0.2s;
    }

    .map-link:hover {
        background: #60a5fa;
        color: #fff;
        box-shadow: rgba(0, 0, 0, 0.15) 0px 2px 2px 1px;
        transition: translate-y-2px, background 0.2s, opacity 0.2s;
    }

    :global(.dark) .map-link {
        background: #2563eb;
        color: #fff;
    }

    :global(.dark) .map-link:hover {
        background: #2563eb;
        border: 1px solid #93c5fd;
        box-shadow: #93c5fd 0px 2px 2px 1px;
        transition: translate-y-2px, background 0.2s, opacity 0.2s;
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

