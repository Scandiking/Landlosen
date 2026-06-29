// Maks tid vi venter på svar før vi gir opp (ms). Hindrer evig "Laster..."-tilstand.
const REQUEST_TIMEOUT = 12000;

// fetch med tidsavbrudd. Kaster Error med en stabil "kode" som UI oversetter til
// brukervennlig tekst. Koder: 'timeout' | 'rate_limit' | 'network' | 'http_<status>'
async function fetchJson(url: string) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    let response: Response;
    try {
        response = await fetch(url, { signal: controller.signal });
    } catch (e) {
        // AbortError = tidsavbrudd, alt annet = nettverk/CORS/DNS osv.
        if (e instanceof DOMException && e.name === 'AbortError') {
            throw new Error('timeout');
        }
        throw new Error('network');
    } finally {
        clearTimeout(timer);
    }

    if (!response.ok) {
        // 429 = for mange forespørsler (API-grense). 5xx = tjeneste nede.
        if (response.status === 429) {
            throw new Error('rate_limit');
        }
        throw new Error(`http_${response.status}`);
    }

    return response.json();
}

export async function getAllCountries() {
    return fetchJson(
        'https://restcountries.com/v3.1/independent?status=true&fields=name,capital,population,region,subregion,flags,cca2,cca3,languages,area'
    );
}

export async function getCountryByCode(code: string) {
    const data = await fetchJson(
        `https://restcountries.com/v3.1/alpha/${code}?fields=name,capital,population,region,subregion,flags,cca2,cca3,languages,area,borders,maps,timezones`
    );
    return data[0];
}
