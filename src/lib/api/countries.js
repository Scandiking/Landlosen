const BASE_URL = 'https://restcountries.com/v3.1';

/**
 * @returns {Promise<any[]>}
 */
export async function getAllCountries() {
    try {
        // Bruk independent-endepunktet som ikke krever fields
        const response = await fetch(`${BASE_URL}/independent?status=true`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Hentet', data.length, 'land');
        return data;
    } catch (error) {
        console.error('Feil ved henting av land:', error);
        throw error;
    }
}

/**
 * @param {string} name
 * @returns {Promise<any[]>}
 */
export async function getCountryByName(name) {
    const response = await fetch(`${BASE_URL}/name/${name}`);
    if (!response.ok) throw new Error('Fant ikke landet');
    return response.json();
}
