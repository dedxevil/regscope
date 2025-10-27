// This service layer acts as a facade for the API.
// It imports the actual data-fetching functions from the API layer
// and exports them for the rest of the application to use.
// This separation allows for adding business logic or data transformation here
// without touching the UI components or the raw API calls.

import {
    fetchSimpleComplianceStatus as apiFetchSimpleComplianceStatus,
    fetchComplianceInfo as apiFetchComplianceInfo,
    fetchIngredientSummary as apiFetchIngredientSummary
} from '../api/complianceApi';

import type { ComplianceStatus } from '../types';

export const fetchSimpleComplianceStatus = (ingredientName: string, countryName: string): Promise<ComplianceStatus> => {
    return apiFetchSimpleComplianceStatus(ingredientName, countryName);
};

export const fetchComplianceInfo = (ingredientName: string, countryName: string): Promise<string> => {
    return apiFetchComplianceInfo(ingredientName, countryName);
};

export const fetchIngredientSummary = (ingredientName: string): Promise<string> => {
    return apiFetchIngredientSummary(ingredientName);
};
