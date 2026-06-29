// Oversetter feilkoder fra API-laget (countries.ts) til brukervennlige meldinger.
// Hver melding har en kort tittel og en forklaring sluttbruker forstår.

type Lang = 'no' | 'en';

export type FriendlyError = {
    title: string;
    message: string;
};

export function describeLoadError(code: string, lang: Lang): FriendlyError {
    const isRateLimit = code === 'rate_limit';
    const isTimeout = code === 'timeout';
    const isNotFound = code === 'not_found' || code === 'http_404';

    if (lang === 'en') {
        if (isNotFound) {
            return {
                title: 'Country not found',
                message:
                    'We could not find a country matching this address. The link may be wrong or outdated.'
            };
        }
        if (isRateLimit) {
            return {
                title: 'Too many requests',
                message:
                    'The country data service is busy and has temporarily blocked further requests (rate limit). This usually clears up on its own — please wait a minute and try again.'
            };
        }
        if (isTimeout) {
            return {
                title: 'The service is taking too long',
                message:
                    'We tried to load the country data but the service did not respond in time. It may be busy or your connection may be slow. Please try again.'
            };
        }
        return {
            title: 'Could not load country data',
            message:
                'We could not reach the service we get country information from (restcountries.com). It may be down or your internet connection may be unavailable. Please check your connection and try again.'
        };
    }

    // Norsk (standard)
    if (isNotFound) {
        return {
            title: 'Fant ikke landet',
            message:
                'Vi fant ingen land som passer denne adressen. Lenken kan være feil eller utdatert.'
        };
    }
    if (isRateLimit) {
        return {
            title: 'For mange forespørsler',
            message:
                'Tjenesten vi henter landdata fra er travel og har midlertidig blokkert flere forespørsler (en forespørselsgrense er nådd). Dette løser seg vanligvis av seg selv — vent et minutt og prøv igjen.'
        };
    }
    if (isTimeout) {
        return {
            title: 'Tjenesten bruker for lang tid',
            message:
                'Vi prøvde å laste landdataene, men tjenesten svarte ikke i tide. Den kan være travel, eller forbindelsen din kan være treg. Prøv igjen.'
        };
    }
    return {
        title: 'Kunne ikke laste landdata',
        message:
            'Vi fikk ikke kontakt med tjenesten vi henter landinformasjon fra (restcountries.com). Den kan være nede, eller internettforbindelsen din er utilgjengelig. Sjekk forbindelsen og prøv igjen.'
    };
}
