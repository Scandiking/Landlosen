export async function getAllCountries() {
    const response = await fetch(
        'https://restcountries.com/v3.1/independent?status=true&fields=name,capital,population,region,subregion,flags,cca2,cca3,languages,area'
    );
    if (!response.ok) {
        throw new Error(`Failed to fetch countries: ${response.status}`);
    }
    return response.json();
}

export async function getCountryByCode(code: string) {
    const response = await fetch(
        `https://restcountries.com/v3.1/alpha/${code}?fields=name,capital,population,region,subregion,flags,cca2,cca3,languages,area,borders,maps,timezones`
    );
    if (!response.ok) {
        throw new Error(`Failed to fetch country: ${response.status}`);
    }
    const data = await response.json();
    return data[0];
}
