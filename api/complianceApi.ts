import type { ComplianceStatus } from '../types';
import { MOCK_PRODUCTS, COUNTRIES } from '../constants';
import type { Product } from '../types';

// A function to simulate network latency
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- MOCK API LAYER ---

/**
 * A function to create a deterministic but varied compliance status.
 * This ensures that the mock data is consistent across the application.
 */
const getDeterministicStatus = (ingredientName: string, countryName: string): ComplianceStatus => {
    const ing = ingredientName.toLowerCase();
    const country = countryName.toLowerCase();

    // Specific rules for non-compliance
    if (ing.includes('mentha') && (country.includes('united states') || country.includes('canada'))) {
        return 'Non-Compliant';
    }
    if (ing.includes('guggulu') && (country.includes('germany') || country.includes('france'))) {
        return 'Non-Compliant';
    }
     if (ing.includes('cocoa mass') && country.includes('japan')) {
        return 'Non-Compliant';
    }
     if (ing.includes('ashwagandha') && country.includes('denmark')) { // A real-world example
        return 'Non-Compliant';
    }
    if (ing.includes('licorice') && country.includes('france')) {
        return 'Non-Compliant';
    }
    if (ing.includes('salicylic acid') && (country.includes('canada') || country.includes('japan'))) {
        return 'Non-Compliant';
    }
    if (ing.includes('cyclamate') && country.includes('united states')) {
        return 'Non-Compliant';
    }
    if (ing.includes('lead carbonate') && !country.includes('russia')) { // Banned in most places
        return 'Non-Compliant';
    }
    if (ing.includes('ephedra') && (country.includes('united states') || country.includes('canada'))) {
        return 'Non-Compliant';
    }
    if (ing.includes('shigru') && (country.includes('germany') || country.includes('france') || country.includes('italy') || country.includes('spain'))) {
        return 'Non-Compliant';
    }
    if (ing.includes('kasani') && (country.includes('japan') || country.includes('south korea'))) {
        return 'Non-Compliant';
    }
    if (ing.includes('arjuna') && (country.includes('australia') || country.includes('united kingdom'))) {
        return 'Non-Compliant';
    }
    if (ing.includes('emulsifier (471)') && country.includes('canada')) {
        return 'Non-Compliant';
    }
    if (ing.includes('titanium dioxide') && (country.includes('france') || country.includes('germany'))) {
        return 'Non-Compliant';
    }
    if (ing.includes('kaolin') && (country.includes('brazil') || country.includes('mexico'))) {
        return 'Non-Compliant';
    }
    if (ing.includes('pippali') && country.includes('united kingdom')) {
        return 'Non-Compliant';
    }
    if (ing.includes('guduchi') && (country.includes('united states') || country.includes('australia'))) {
        return 'Non-Compliant';
    }
    if (ing.includes('mandur bhasma') && (country.includes('germany') || country.includes('france') || country.includes('italy') || country.includes('spain'))) {
        return 'Non-Compliant';
    }


    // Specific rules for requires review
    if (ing.includes('crystalline silica') || ing.includes('fungicides') || ing.includes('biocides')) {
        return 'Requires Review';
    }
    if (ing.includes('neem') && !country.includes('india')) {
        return 'Requires Review';
    }

    // Default compliant for some common, safe ingredients
    if (ing.includes('honey') || ing.includes('turmeric') || ing.includes('sugar') || ing.includes('water')) {
        return 'Compliant';
    }
    
    // Fallback to a seeded "random" for variety but consistency
    const seed = ing.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + 
                 country.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const statuses: ComplianceStatus[] = ['Compliant', 'Compliant', 'Compliant', 'Requires Review', 'Compliant']; // Make compliant most likely
    return statuses[seed % statuses.length];
};


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

    // Use the deterministic function to ensure consistency
    return getDeterministicStatus(ingredientName, countryName);
};

/**
 * Fetches a detailed compliance report for an ingredient in a country.
 * @returns A promise that resolves to a mock report string in markdown format.
 */
export const fetchComplianceInfo = async (ingredientName: string, countryName:string): Promise<string> => {
    await sleep(500 + Math.random() * 500);

    // --- Get deterministic status first ---
    const status = getDeterministicStatus(ingredientName, countryName);

    // --- Helper functions for randomization ---
    const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    const pickSome = <T>(arr: T[], count: number): T[] => {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    };

    // --- Data Pools for Randomization ---
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
    
    const sourceTitles = [
        "National Health Authority - Public Register of Herbal Ingredients",
        "Federal Wellness Board - Dietary Supplement Guidelines",
        "Consumer Health Protection Act, Section 12b",
        "Agency for Therapeutic Goods - Permitted Substance List",
        "Official Journal of Food Safety, Vol. 42",
        "National Pharmacopoeia - Monograph on Botanical Extracts"
    ];

    const countryCode = COUNTRIES.find(c => c.name === countryName)?.code.toLowerCase() || 'xx';

    // Create realistic-looking but fake source links
    const createSourceLink = (title: string) => {
        const domainParts = title.toLowerCase().replace(/[^a-z\s]/g, '').split(' ').slice(0, 3);
        const domain = `https://www.${domainParts.join('-')}.gov.${countryCode}`;
        const path = `/${ingredientName.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '')}/guideline-${Math.floor(Math.random() * 1000)}.pdf`;
        return `* [${title}](${domain}${path})`;
    };
    
    const randomSources = pickSome(sourceTitles, Math.floor(Math.random() * 2) + 2) // 2 to 3 sources
        .map(createSourceLink)
        .join('\n');

    // --- Build the Report based on the deterministic status ---
    let statusLine: string;
    let issues: string;
    let recommendations: string;

    switch (status) {
        case 'Compliant':
            statusLine = "**Compliant** - Permitted for use without restrictions.";
            issues = "*   No significant issues were found based on current regulations.";
            recommendations = "*   Standard market-entry procedures are recommended. No special action is required.";
            break;
        case 'Non-Compliant':
            statusLine = "**Non-Compliant** - Banned for use in wellness products.";
            issues = pickSome(allIssues.filter(i => !i.includes("Dosage")), 2).join('\n');
            recommendations = `*   **Cease distribution** of this product in ${countryName} immediately.\n*   Consult legal counsel regarding product recall procedures.`;
            break;
        case 'Requires Review':
            statusLine = "**Restricted** - Requires specific labeling and dosage limitations.";
            issues = pickSome(allIssues, 3).join('\n');
            recommendations = pickSome(allRecommendations, 2).join('\n');
            break;
        default: // Error case
            return "### ERROR\nCould not retrieve compliance data for this ingredient. Please try again later.";
    }


    const mockReport = `
### OVERALL COMPLIANCE STATUS
**STATUS:** ${statusLine}

### SUMMARY OF REGULATIONS
In **${countryName}**, ingredients like "**${ingredientName}**" are regulated by the **${pickRandom(authorities)}** under the **${pickRandom(acts)}**. It is classified as a '**${pickRandom(classifications)}**'.

### POTENTIAL ISSUES & VIOLATIONS
${issues}

### RECOMMENDATIONS
${recommendations}

### SOURCES
${randomSources}
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