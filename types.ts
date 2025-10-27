
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

export interface ComplianceResult {
  country: string;
  report: string;
}

export type ComplianceStatus = 'Compliant' | 'Non-Compliant' | 'Requires Review' | 'Error';

export interface CountryComplianceStatus {
  country: Country;
  status: ComplianceStatus;
}

// --- Chat Widget Types ---
export interface ChatMessageContentPart {
  type: 'text';
  text: {
    value: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: ChatMessageContentPart[];
  created_at: number;
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
