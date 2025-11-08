import type { Ingredient, Country, IngredientType, IngredientStatus, Product, User, RegulatoryDocument } from './types';

export const COUNTRIES: Country[] = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'JP', name: 'Japan' },
    { code: 'AU', name: 'Australia' },
    { code: 'BR', name: 'Brazil' },
    { code: 'IN', name: 'India' },
    { code: 'CN', name: 'China' },
    { code: 'MX', name: 'Mexico' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' },
    { code: 'RU', name: 'Russia' },
    { code: 'KR', name: 'South Korea' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'SE', name: 'Sweden' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'SG', name: 'Singapore' },
];

export const USERS: User[] = [
  { email: 'admin@graviq.ai', role: 'admin', name: 'Jobby David', title: 'Administrator' },
  { email: 'product-manager@graviq.ai', role: 'product_manager', name: 'Ben Carter', title: 'Product Manager' },
  { email: 'compliance@graviq.ai', role: 'compliance_manager', name: 'Chloe Davis', title: 'Compliance Manager' },
  { email: 'logistics@graviq.ai', role: 'logistics', name: 'David Evans', title: 'Logistics' },
];

export const MOCK_PRODUCTS: Product[] = [
  // Himalaya Wellness
  { name: 'Liv. 52 DS', company: 'Himalaya Wellness', ingredients: ['Himsra (Capparis spinosa)', 'Kasani (Cichorium intybus)', 'Mandur bhasma', 'Kakamachi (Solanum nigrum)', 'Arjuna (Terminalia arjuna)', 'Licorice (Glycyrrhiza glabra)'], status: 'Non-Compliant' },
  { name: 'Septilin', company: 'Himalaya Wellness', ingredients: ['Guggulu (Balsamodendron mukul)', 'Guduchi (Tinospora cordifolia)', 'Manjishtha (Rubia cordifolia)', 'Amalaki (Emblica officinalis)', 'Shigru (Moringa pterygosperma)'], status: 'Requires Review' },
  { name: 'Purifying Neem Face Wash', company: 'Himalaya Wellness', ingredients: ['Neem (Azadirachta indica)', 'Turmeric (Curcuma longa)', 'Vetiver (Vetiveria zizanioides)', 'Salicylic Acid'], status: 'Compliant' },
  { name: 'Cystone', company: 'Himalaya Wellness', ingredients: ['Shilapushpa (Didymocarpus pedicellata)', 'Pasanabheda (Saxifraga ligulata)', 'Gokshura (Tribulus terrestris)'], status: 'Compliant' },
  { name: 'Gasex Tablet', company: 'Himalaya Wellness', ingredients: ['Sunthi (Zingiber officinale)', 'Triphala', 'Vidanga (Embelia ribes)'], status: 'Requires Review' },
  { name: 'Rumalaya Forte', company: 'Himalaya Wellness', ingredients: ['Shallaki (Boswellia serrata)', 'Guggul (Commiphora wightii)'], status: 'Non-Compliant' },
  { name: 'Mentat', company: 'Himalaya Wellness', ingredients: ['Brahmi (Bacopa monnieri)', 'Ashwagandha (Withania somnifera)', 'Mandukaparni (Centella asiatica)'], status: 'Compliant' },
];

export const MOCK_REGULATORY_DOCUMENTS: RegulatoryDocument[] = [
    { id: 'doc1', name: 'W3C_Dummy_Test.pdf', country: COUNTRIES[3], status: 'Ready', uploadedAt: '2025-10-26', size: '2.3MB', fileUrl: 'https://corsproxy.io/?https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { id: 'doc2', name: 'US_FDA_Dietary_Supplements_Guidelines.pdf', country: COUNTRIES[0], status: 'Ready', uploadedAt: '2025-10-22', size: '1.8MB', fileUrl: '' },
    { id: 'doc3', name: 'Japan_Food_Sanitation_Law_Update_2023.docx', country: COUNTRIES[5], status: 'Training', uploadedAt: '2025-11-01', size: '850KB', fileUrl: '' },
    { id: 'doc4', name: 'Canada_NHP_Regulations_SOR-2003.pdf', country: COUNTRIES[1], status: 'Ready', uploadedAt: '2025-09-15', size: '3.1MB', fileUrl: '' },
    { id: 'doc5', name: 'Brazil_ANVISA_Food_Supplements.pdf', country: COUNTRIES[7], status: 'Uploaded', uploadedAt: '2025-11-05', size: '1.2MB', fileUrl: '' },
    { id: 'doc6', name: 'Australia_TGA_Listed_Medicines.pdf', country: COUNTRIES[6], status: 'Uploaded', uploadedAt: '2025-11-06', size: '2.5MB', fileUrl: '' },
];


const totalCountries = COUNTRIES.length;

// --- MOCK INGREDIENT GENERATION ---
// Create a definitive, unique list of all ingredients from the products.
const allProductIngredients = MOCK_PRODUCTS.flatMap(p => p.ingredients);
const uniqueIngredientNames = Array.from(new Set(allProductIngredients));

// Helper to determine ingredient type based on keywords.
const getIngredientType = (name: string): IngredientType => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('shilajeet') || lowerName.includes('bhasma')) {
        return 'Mineral Pitch';
    }
    if (['emulsifier', 'stabiliser', 'preservative', 'acid', 'glycol', 'biocides', 'fungicides', 'carbonate', 'dioxide', 'cyclamate', 'lecithin'].some(term => lowerName.includes(term))) {
        return 'Processed Herb';
    }
    return 'Herbal Extract';
};

// Helper for a deterministic initial status to ensure the dashboard shows a realistic mix.
const getInitialIngredientStatus = (name: string): IngredientStatus => {
    const lowerName = name.toLowerCase();
    
    // High-risk ingredients, likely Non-Compliant somewhere.
    const nonCompliantKeywords = [
        'mentha', 'guggulu', 'ephedra', 'lead carbonate', 'cyclamate', 'salicylic acid', 'mandur bhasma', 'kasani'
    ];
    if (nonCompliantKeywords.some(keyword => lowerName.includes(keyword))) {
        return 'Non-Compliant';
    }

    // Medium-risk ingredients, often requiring review.
    const reviewKeywords = [
        'shilajeet', 'ashwagandha', 'guduchi', 'neem', 'crystalline silica', 'licorice', 'arjuna', 'biocides', 'shigru'
    ];
    if (reviewKeywords.some(keyword => lowerName.includes(keyword))) {
        return 'Requires Review';
    }
    
    // Fallback for others to create variety, biased towards compliant.
    const seed = lowerName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const fallbackStatuses: IngredientStatus[] = ['Compliant', 'Compliant', 'Requires Review', 'Compliant', 'Unchecked'];
    return fallbackStatuses[seed % fallbackStatuses.length];
};

// Generate the MOCK_INGREDIENTS list from the definitive product ingredient list.
export const MOCK_INGREDIENTS: Ingredient[] = uniqueIngredientNames.map((name, index) => {
    // Find a product this ingredient belongs to for a better description.
    const productExample = MOCK_PRODUCTS.find(p => p.ingredients.includes(name));
    const description = productExample 
        ? `An ingredient used in products like "${productExample.name}".`
        : 'A wellness product ingredient.';
        
    return {
        id: index + 1,
        name: name,
        description: description,
        status: getInitialIngredientStatus(name), // Use the deterministic status function
        type: getIngredientType(name),
        checkedCountries: Math.floor(Math.random() * totalCountries),
        totalCountries: totalCountries,
        flaggedCount: Math.floor(Math.random() * 25), // Increased potential flagged count
    };
});


export const MOCK_COUNTRY_COMPLIANCE_DATA = [
    { country: 'USA', compliant: 18, nonCompliant: 2, review: 3 },
    { country: 'EU', compliant: 15, nonCompliant: 5, review: 3 },
    { country: 'Japan', compliant: 20, nonCompliant: 1, review: 2 },
    { country: 'India', compliant: 22, nonCompliant: 0, review: 1 },
    { country: 'Brazil', compliant: 12, nonCompliant: 8, review: 3 },
    { country: 'China', compliant: 10, nonCompliant: 10, review: 3 },
];

export const MOCK_TREND_DATA = [
    { month: 'Jan', nonCompliant: 8 },
    { month: 'Feb', nonCompliant: 10 },
    { month: 'Mar', nonCompliant: 7 },
    { month: 'Apr', nonCompliant: 9 },
    { month: 'May', nonCompliant: 11 },
    { month: 'Jun', nonCompliant: 12 },
];