import type { ComplianceStatus } from '../types';

// A function to simulate network latency
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- MOCK API LAYER ---
// This file contains all the data fetching logic for the application.
// Currently, it uses mock data to simulate API responses.
//
// TO CONNECT TO A REAL BACKEND:
// Replace the logic inside each function with your actual API calls
// using `fetch`, `axios`, or any other library.

/**
 * Fetches a simple Yes/No compliance status for an ingredient in a country.
 * @returns A promise that resolves to a mock ComplianceStatus.
 */
export const fetchSimpleComplianceStatus = async (ingredientName: string, countryName: string): Promise<ComplianceStatus> => {
    // Simulate a short, variable network delay for fetching table rows
    await sleep(50 + Math.random() * 200);

    // TODO: Replace this mock logic with a real API call
    // Example:
    // const response = await fetch(`/api/compliance/status?ingredient=${ingredientName}&country=${countryName}`);
    // if (!response.ok) return 'Error';
    // const data = await response.json();
    // return data.status;

    if (ingredientName.toLowerCase().includes('error')) {
        return 'Error';
    }

    const statuses: ComplianceStatus[] = ['Compliant', 'Non-Compliant', 'Requires Review'];
    return statuses[Math.floor(Math.random() * statuses.length)];
};

/**
 * Fetches a detailed compliance report for an ingredient in a country.
 * @returns A promise that resolves to a mock report string in markdown format.
 */
export const fetchComplianceInfo = async (ingredientName: string, countryName:string): Promise<string> => {
    await sleep(500 + Math.random() * 500);

    // TODO: Replace this mock logic with a real API call
    // Example:
    // const response = await fetch(`/api/compliance/report?ingredient=${ingredientName}&country=${countryName}`);
    // if (!response.ok) return 'Failed to load detailed report.';
    // const data = await response.json();
    // return data.report;

    const mockReport = `
### OVERALL COMPLIANCE STATUS
**STATUS:** **Restricted** - Requires specific labeling and dosage limitations.

### SUMMARY OF REGULATIONS
In **${countryName}**, ingredients like "**${ingredientName}**" are regulated by the **National Health Authority (NHA)** under the **Wellness and Supplements Act of 2019**. It is classified as a '**Traditional Herbal Product**'.

### POTENTIAL ISSUES & VIOLATIONS
*   **Dosage Limits:** The maximum recommended daily dosage must not exceed **250mg**.
*   **Marketing Claims:** Cannot be marketed with claims of treating or curing specific diseases.
*   **Novel Food Status:** New extraction methods may require a '**Novel Food**' application to the NHA.
*   **Registration:** The product must be registered in the **National Herbal Product Database**.

### RECOMMENDATIONS
*   Ensure product packaging clearly states the daily dosage and does not make prohibited medical claims.
*   Submit the product for registration with the NHA.
*   Consult with a local regulatory expert to review marketing materials before launch in **${countryName}**.
    `;

    return mockReport.trim();
};

/**
 * Fetches a detailed summary for a given ingredient.
 * @returns A promise that resolves to a mock summary string.
 */
export const fetchIngredientSummary = async (ingredientName: string): Promise<string> => {
    await sleep(300);

    // TODO: Replace this mock logic with a real API call
    // Example:
    // const response = await fetch(`/api/ingredients/summary?name=${ingredientName}`);
    // if (!response.ok) return 'Failed to load summary.';
    // const data = await response.json();
    // return data.summary;

    return `**${ingredientName}** is a key component in traditional wellness practices, primarily recognized for its adaptogenic properties. It is commonly sourced from sustainable farms in Southeast Asia. Our formulation utilizes a proprietary cold-press extraction method to ensure maximum purity and potency. From a regulatory standpoint, it is classified as a dietary supplement in major markets but is under review as a novel food in the European Union due to the unique extraction process. This requires careful monitoring of labeling and marketing claims to avoid being classified as an unauthorized medicinal product.`;
};
