import { apiRequest, buildApiUrl } from './api';
import type { Country, State, City } from './types';

export const regionsApi = {
  // Search countries
  searchCountries: async (search: string = ''): Promise<Country[]> => {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    const response = await apiRequest(`/regions/countries${params}`);
    const data = await response.json();
    return data.data;
  },

  // Get states by country
  getStatesByCountry: async (countryId: number, search: string = ''): Promise<State[]> => {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    const response = await apiRequest(`/regions/countries/${countryId}/states${params}`);
    const data = await response.json();
    return data.data;
  },

  // Get cities by state
  getCitiesByState: async (stateId: number, search: string = ''): Promise<City[]> => {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    const response = await apiRequest(`/regions/states/${stateId}/cities${params}`);
    const data = await response.json();
    return data.data;
  },

  // Get cities by country (for cases where state is optional)
  getCitiesByCountry: async (countryId: number, search: string = ''): Promise<City[]> => {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    const response = await apiRequest(`/regions/countries/${countryId}/cities${params}`);
    const data = await response.json();
    return data.data;
  },
};
