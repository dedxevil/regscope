// FIX: Removed self-import of `ComplianceStatus` and `Product` which conflicted with local declarations.

export type IngredientType = 'Herbal Extract' | 'Mineral Pitch' | 'Processed Herb';

export type IngredientStatus = 'Compliant' | 'Requires Review' | 'Non-Compliant' | 'Unchecked';

export interface Ingredient {
  id: number;
  name: string;
  description: string;
  status: IngredientStatus;
  type: IngredientType;
  checkedCountries: number;
  totalCountries: number;
  flaggedCount: number;
}

export interface Country {
  code: string;
  name: string;
}

export interface Product {
  name: string;
  company: 'Himalaya Wellness' | 'Unilever Icecream' | 'Asian Paints' | 'Dabur';
  ingredients: string[];
}

export interface ComplianceResult {
  country: string;
  report: string;
}

export type ComplianceStatus = 'Compliant' | 'Non-Compliant' | 'Requires Review' | 'Error';

export interface CountryComplianceStatus {
  country: Country;
  status: ComplianceStatus;
}

// --- New Role and User Types ---
export type UserRole = 'admin' | 'product_manager' | 'compliance_manager' | 'logistics';

export interface User {
  email: string;
  role: UserRole;
  name: string;
  title: string;
}

// --- New Document Management Types ---
export type DocumentStatus = 'Uploaded' | 'Training' | 'Ready' | 'Error';

export interface RegulatoryDocument {
  id: string;
  name: string;
  country: Country;
  status: DocumentStatus;
  uploadedAt: string;
  size: string;
  fileUrl: string; // URL for mock PDFs or Object URL for uploaded ones
  file?: File; // The actual file object for new uploads
}


// --- Chat Widget Types ---
export interface ChatMessageContentPart {
  type: 'text';
  text: {
    value: string;
  };
}

export type ReportStatus = 'Compliant' | 'Non-Compliant' | 'Requires Review';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: ChatMessageContentPart[];
  created_at: number;
  metadata?: {
    is_product_report?: boolean;
    report_data?: {
      productName: string;
      countryName: string;
      overallStatus: ReportStatus | 'Error' | 'Loading';
      results: Array<{ name: string; status: ReportStatus | 'Error' }>;
    };
    [key: string]: any;
  }
}

export interface Thread {
    id: string;
    object: string;
    created_at: number;
    metadata: Record<string, unknown>;
}

export type RunStatus =
  | 'queued'
  | 'in_progress'
  | 'requires_action'
  | 'cancelling'
  | 'cancelled'
  | 'failed'
  | 'completed'
  | 'expired';

export interface Run {
  id: string;
  thread_id: string;
  status: RunStatus;
}

// --- App Navigation Types ---
export type AppView = 'dashboard' | 'product_search' | 'library' | 'settings';
