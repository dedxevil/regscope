import type { ComplianceStatus } from '../types';
import { MOCK_PRODUCTS } from '../constants';
import type { Product } from '../types';

// A function to simulate network latency
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- MOCK API LAYER ---

/**
 * Fetches the list of ingredients for a given product.
 * @returns A promise that resolves to an array of ingredient names and the company.
 */
export const fetchProductIngredients = async (productName: string): Promise<{ company: Product['company'], ingredients: string[] }> => {
    await sleep(400 + Math.random() * 300);

    const product = MOCK_PRODUCTS.find(p => p.name.toLowerCase() === productName.toLowerCase());

    if (!product) {
        throw new Error(`Product "${productName}" not found in our database.`);
    }

    return { company: product.company, ingredients: product.ingredients };
};


/**
 * Fetches a simple Yes/No compliance status for an ingredient in a country.
 * @returns A promise that resolves to a mock ComplianceStatus.
 */
export const fetchSimpleComplianceStatus = async (ingredientName: string, countryName: string): Promise<ComplianceStatus> => {
    // Simulate a short, variable network delay for fetching table rows
    await sleep(50 + Math.random() * 200);

    // TODO: Replace this mock logic with a real API call
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

    // --- Helper functions for randomization ---
    const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    const pickSome = <T>(arr: T[], count: number): T[] => {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    };

    // --- Data Pools for Randomization ---
    const statuses = [
        "**Compliant** - Permitted for use without restrictions.",
        "**Restricted** - Requires specific labeling and dosage limitations.",
        "**Non-Compliant** - Banned for use in wellness products."
    ];
    const authorities = ["National Health Authority (NHA)", "Federal Wellness Board (FWB)", "Dietary Supplement Commission (DSC)", "Agency for Therapeutic Goods (ATG)"];
    const acts = ["Wellness and Supplements Act of 2019", "Food and Drug Safety Modernization Act of 2022", "Herbal Product Purity Act of 2018", "Consumer Health Protection Law of 2020"];
    const classifications = ["Traditional Herbal Product", "Dietary Ingredient", "Novel Food Supplement", "Listed Complementary Medicine"];
    const allIssues = [
        "*   **Dosage Limits:** The maximum recommended daily dosage must not exceed **250mg**.",
        "*   **Marketing Claims:** Cannot be marketed with claims of treating or curing specific diseases.",
        "*   **Novel Food Status:** New extraction methods may require a '**Novel Food**' application.",
        "*   **Registration:** The product must be registered in the **National Herbal Product Database**.",
        "*   **Purity Standards:** Must meet a purity standard of **95%** as verified by third-party labs.",
        "*   **Allergen Labeling:** Must explicitly state if processed in a facility with common allergens."
    ];
    const allRecommendations = [
        "*   Ensure product packaging clearly states the daily dosage and does not make prohibited medical claims.",
        "*   Submit the product for registration with the relevant national authority.",
        "*   Consult with a local regulatory expert to review marketing materials before launch.",
        "*   Conduct a final lab analysis to confirm purity standards before market entry.",
        "*   Update packaging to include the latest allergen information as per local guidelines."
    ];

    // --- Build the Randomized Report ---
    const randomStatus = pickRandom(statuses);
    const randomIssues = pickSome(allIssues, Math.floor(Math.random() * 2) + 3).join('\n'); // 3 to 4 issues
    const randomRecommendations = pickSome(allRecommendations, Math.floor(Math.random() * 2) + 2).join('\n'); // 2 to 3 recommendations

    const mockReport = `
### OVERALL COMPLIANCE STATUS
**STATUS:** ${randomStatus}

### SUMMARY OF REGULATIONS
In **${countryName}**, ingredients like "**${ingredientName}**" are regulated by the **${pickRandom(authorities)}** under the **${pickRandom(acts)}**. It is classified as a '**${pickRandom(classifications)}**'.

### POTENTIAL ISSUES & VIOLATIONS
${randomIssues}

### RECOMMENDATIONS
${randomRecommendations}
    `;

    return mockReport.trim();
};

/**
 * Fetches a detailed summary for a given ingredient.
 * @returns A promise that resolves to a mock summary string.
 */
export const fetchIngredientSummary = async (ingredientName: string): Promise<string> => {
    await sleep(300);

    return `**${ingredientName}** is a key component in traditional wellness practices, primarily recognized for its adaptogenic properties. It is commonly sourced from sustainable farms in Southeast Asia. Our formulation utilizes a proprietary cold-press extraction method to ensure maximum purity and potency. From a regulatory standpoint, it is classified as a dietary supplement in major markets but is under review as a novel food in the European Union due to the unique extraction process. This requires careful monitoring of labeling and marketing claims to avoid being classified as an unauthorized medicinal product.`;
};