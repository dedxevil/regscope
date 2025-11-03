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
  { name: 'Liv. 52 DS', company: 'Himalaya Wellness', ingredients: ['Himsra (Capparis spinosa)', 'Kasani (Cichorium intybus)', 'Mandur bhasma', 'Kakamachi (Solanum nigrum)', 'Arjuna (Terminalia arjuna)'], status: 'Compliant' },
  { name: 'Septilin', company: 'Himalaya Wellness', ingredients: ['Guggulu (Balsamodendron mukul)', 'Guduchi (Tinospora cordifolia)', 'Manjishtha (Rubia cordifolia)', 'Amalaki (Emblica officinalis)', 'Shigru (Moringa pterygosperma)'], status: 'Compliant' },
  { name: 'Purifying Neem Face Wash', company: 'Himalaya Wellness', ingredients: ['Neem (Azadirachta indica)', 'Turmeric (Curcuma longa)', 'Vetiver (Vetiveria zizanioides)'], status: 'Requires Review' },
  
  // Unilever Icecream (Kwality Wall's)
  { name: 'Cornetto Double Chocolate', company: 'Unilever Icecream', ingredients: ['Milk Solids', 'Sugar', 'Cocoa Solids', 'Palm Oil', 'Liquid Glucose', 'Emulsifier (471)', 'Stabilisers (410, 412, 407)', 'Wheat Flour'], status: 'Compliant' },
  { name: 'Magnum Classic', company: 'Unilever Icecream', ingredients: ['Reconstituted Skimmed Milk', 'Sugar', 'Cocoa Butter', 'Cocoa Mass', 'Coconut Oil', 'Glucose Syrup', 'Whey Solids (Milk)', 'Butteroil (Milk)', 'Emulsifiers (E471, Soya Lecithin, E476)', 'Vanilla Bean Pieces'], status: 'Non-Compliant' },

  // Asian Paints (Treating as chemical products for demo)
  { name: 'Royale Aspira', company: 'Asian Paints', ingredients: ['Pure Acrylic Polymer Emulsion', 'Titanium Dioxide', 'Crystalline Silica', 'Propylene Glycol', 'Fungicides', 'Water'], status: 'Requires Review' },
  { name: 'Tractor Emulsion', company: 'Asian Paints', ingredients: ['Styrene Acrylic Emulsion', 'Titanium Dioxide', 'Calcium Carbonate', 'Kaolin', 'Biocides'], status: 'Compliant' },

  // Dabur
  { name: 'Dabur Chyawanprash', company: 'Dabur', ingredients: ['Amla (Emblica officinalis)', 'Ashwagandha (Withania somnifera)', 'Pippali (Piper longum)', 'Shatavari (Asparagus racemosus)', 'Bilva (Aegle marmelos)', 'Ghee', 'Honey'], status: 'Compliant' },
  { name: 'Dabur Honey', company: 'Dabur', ingredients: ['Honey'], status: 'Compliant' },
  { name: 'Pudin Hara Pearls', company: 'Dabur', ingredients: ['Mentha Piperita (Pudina Satva)', 'Mentha Spicata (Pudina Satva)'], status: 'Non-Compliant' }
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

const ingredientData: { name: string; product: string; type: IngredientType }[] = [
  { name: 'Meshashringi (Gymnema sylvestre) leaf extract', product: 'Meshashringi Metabolic Wellness', type: 'Herbal Extract' },
  { name: 'Balsamodendron Mukul', product: 'Septilin', type: 'Herbal Extract' },
  { name: 'Tinospora cordifolia', product: 'Septilin', type: 'Herbal Extract' },
  { name: 'Rubia cordifolia', product: 'Septilin', type: 'Herbal Extract' },
  { name: 'Emblica officinalis', product: 'Septilin', type: 'Herbal Extract' },
  { name: 'Moringa plerygosperma', product: 'Septilin', type: 'Herbal Extract' },
  { name: 'Glycyrrhiza glabre', product: 'Septilin', type: 'Herbal Extract' },
  { name: 'Bael tree (stem bark)', product: 'HeartCare', type: 'Herbal Extract' },
  { name: 'Malay bush beech (stem bark)', product: 'HeartCare', type: 'Herbal Extract' },
  { name: 'Oroxylum (stem bark)', product: 'HeartCare', type: 'Herbal Extract' },
  { name: 'Fragrant padri tree (stem bark)', product: 'HeartCare', type: 'Herbal Extract' },
  { name: 'Tribulus (whole plant)', product: 'HeartCare', type: 'Herbal Extract' },
  { name: 'Arjuna (bark)', product: 'HeartCare', type: 'Herbal Extract' },
  { name: 'Ashwagandha (root)', product: 'HeartCare', type: 'Herbal Extract' },
  { name: 'Shilajeet (mineral pitch)', product: 'HeartCare', type: 'Mineral Pitch' },
  { name: 'Chebulic myrobalan (fruit rind)', product: 'HeartCare', type: 'Herbal Extract' },
  { name: 'Cowhage / Velvet Bean', product: 'Tentex Forte', type: 'Processed Herb' },
  { name: 'Kapikachchu', product: 'Tentex Forte', type: 'Processed Herb' },
  { name: 'Shilajeet', product: 'Tentex Forte', type: 'Mineral Pitch' },
  { name: 'Small Caltrops', product: 'Tentex Forte', type: 'Processed Herb' },
  { name: 'Gokshura', product: 'Tentex Forte', type: 'Processed Herb' },
  { name: 'Garcinia', product: 'Ayurslim', type: 'Herbal Extract' },
  { name: 'Gymnema', product: 'Ayurslim', type: 'Herbal Extract' },
];

// FIX: Use the explicit IngredientStatus type for the statuses array.
const statuses: IngredientStatus[] = ['Compliant', 'Requires Review', 'Non-Compliant', 'Unchecked'];

export const MOCK_INGREDIENTS: Ingredient[] = ingredientData.map((ing, index) => ({
    id: index + 1,
    name: ing.name,
    description: `An ingredient in the "${ing.product}" wellness product line.`,
    status: statuses[index % statuses.length],
    type: ing.type,
    checkedCountries: Math.floor(Math.random() * totalCountries),
    totalCountries: totalCountries,
    flaggedCount: Math.floor(Math.random() * 15),
}));

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