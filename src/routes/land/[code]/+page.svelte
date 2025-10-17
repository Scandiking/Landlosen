<script>
    import { page } from '$app/stores';
    import { onMount } from 'svelte';

    let country = null;
    let loading = true;
    let error = null;

    onMount(async () => {
        try {
            const code = $page.params.code;
            const response = await fetch(`https://restcountries.com/v3.1/alpha/${code}`);
            if (!response.ok) throw new Error('Fant ikke landet');
            const data = await response.json();
            country = data[0];
            loading = false;
        } catch (e) {
            error = e.message;
            loading = false;
        }
    });
</script>

<div class="container">
    <a href="/" class="back-link">← Tilbake til listen</a>

    {#if loading}
        <p>Laster...</p>
    {:else if error}
        <p class="error">{error}</p>
    {:else if country}
        <div class="country-detail">
            <img src={country.flags.svg} alt="{country.name.common} flagg" class="flag" />

            <h1>{country.name.common}</h1>
            <h2>{country.name.official}</h2>

            <div class="info-grid">
                <div class="info-item">
                    <strong>Hovedstad:</strong>
                    <span>{country.capital?.[0] || 'Ukjent'}</span>
                </div>

                <div class="info-item">
                    <strong>Region:</strong>
                    <span>{country.region}</span>
                </div>

                <div class="info-item">
                    <strong>Subregion:</strong>
                    <span>{country.subregion || 'Ukjent'}</span>
                </div>

                <div class="info-item">
                    <strong>Befolkning:</strong>
                    <span>{country.population?.toLocaleString('nb-NO')}</span>
                </div>

                <div class="info-item">
                    <strong>Areal:</strong>
                    <span>{country.area?.toLocaleString('nb-NO')} km²</span>
                </div>

                <div class="info-item">
                    <strong>Språk:</strong>
                    <span>{Object.values(country.languages || {}).join(', ')}</span>
                </div>

                <div class="info-item">
                    <strong>Valuta:</strong>
                    <span>
                        {Object.values(country.currencies || {})
                            .map(c => `${c.name} (${c.symbol})`)
                            .join(', ')}
                    </span>
                </div>

                <div class="info-item">
                    <strong>Tidssoner:</strong>
                    <span>{country.timezones?.join(', ')}</span>
                </div>
            </div>

            {#if country.maps?.googleMaps}
                <a href={country.maps.googleMaps} target="_blank" class="map-link">
                    🗺️ Åpne i Google Maps
                </a>
            {/if}
        </div>
    {/if}
</div>

<style>
    .container {
        max-width: 900px;
        margin: 0 auto;
        padding: 2rem;
    }

    .back-link {
        display: inline-block;
        margin-bottom: 2rem;
        color: #007bff;
        text-decoration: none;
    }

    .back-link:hover {
        text-decoration: underline;
    }

    .country-detail {
        text-align: center;
    }

    .flag {
        width: 100%;
        max-width: 500px;
        height: auto;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        margin-bottom: 2rem;
    }

    h1 {
        margin: 1rem 0 0.5rem;
    }

    h2 {
        color: #666;
        font-weight: normal;
        margin: 0 0 2rem;
    }

    .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        text-align: left;
        margin: 2rem 0;
    }

    .info-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .info-item strong {
        color: #333;
    }

    .info-item span {
        color: #666;
    }

    .map-link {
        display: inline-block;
        margin-top: 2rem;
        padding: 0.75rem 1.5rem;
        background: #007bff;
        color: white;
        text-decoration: none;
        border-radius: 4px;
    }

    .map-link:hover {
        background: #0056b3;
    }

    .error {
        color: red;
        text-align: center;
    }
</style>
