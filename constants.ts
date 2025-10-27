
import type { Ingredient, Country, IngredientType, IngredientStatus } from './types';

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