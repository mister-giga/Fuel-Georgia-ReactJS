import Company from "../models/Company";
import PricePoint from "../models/PricePoint";

const baseUrl = "https://raw.githubusercontent.com/mister-giga/Fuel-Georgia/main";
const getUrl = (route:string):string => `${baseUrl}/${route}`;

export function GetCompanyLogoUrl(companyKey:string){
    return getUrl(`blob/${companyKey}.png`);
}

async function getAsync<T> (route:string):Promise<T> {
    const url = getUrl(route);
    const response = await fetch(url);
    if(!response.ok){
        throw new Error('მოხდა შეცდომა');
    }
    const data = await response.json();
    return data;
}

export function GetCompaniesAsync() {
    return getAsync<Company[]>("data/companies.json");
}

export function GetLocationsAsync(companyKey:string){
    return getAsync<Location[]>(`data/${companyKey}/locations.json`);
}

export function GetPriceChangesAsync(companyKey:string, fuelKey:string){
    return getAsync<PricePoint[]>(`data/${companyKey}/priceChanges/${fuelKey}.json`);
}