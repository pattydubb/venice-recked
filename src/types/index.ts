// Transaction Types
export interface BaseTransaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  notes?: string;
  matchStatus: 'matched' | 'potential' | 'unmatched';
  matchGroup?: string; // ID of the match group this transaction belongs to
}

export interface BankTransaction extends BaseTransaction {
  source: 'bank';
  uniqueIdentifier: string; // Based on date and amount
  bankAccount?: string;
  checkNumber?: string;
}

export interface GLTransaction extends BaseTransaction {
  source: 'gl';
  glAccount?: string;
  reference?: string;
  department?: string;
  class?: string;
  // Can be modified/adjusted
  isModified?: boolean;
  originalAmount?: number;
}

export type Transaction = BankTransaction | GLTransaction;

// Match Group Types
export interface MatchGroup {
  id: string;
  bankTransactionIds: string[];
  glTransactionIds: string[];
  status: 'auto' | 'manual' | 'confirmed' | 'rejected';
  createdAt: string;
  updatedAt: string;
  notes?: string;
  // Total amounts for verification
  bankTotal: number;
  glTotal: number;
  // Whether this is a balanced match (bank total = GL total)
  isBalanced: boolean;
}

// File and Import Types
export interface FileMapping {
  fileName: string;
  sourceType: 'bank' | 'gl';
  dateColumn: string;
  amountColumn: string;
  descriptionColumn: string;
  // Additional optional column mappings
  [key: string]: string;
}

export interface ImportTemplate {
  id: string;
  name: string;
  sourceType: 'bank' | 'gl';
  bankAccount?: string;
  glAccount?: string;
  mappings: {
    dateColumn: string;
    amountColumn: string;
    descriptionColumn: string;
    // Additional mappings
    [key: string]: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Reconciliation Project Types
export interface ReconciliationProject {
  id: string;
  name: string;
  periodStart?: string;
  periodEnd?: string;
  status: 'draft' | 'in_progress' | 'completed';
  bankAccount?: string;
  createdAt: string;
  updatedAt: string;
  bankFileCount: number;
  glFileCount: number;
  bankTransactionCount: number;
  glTransactionCount: number;
  matchedTransactionCount: number;
  matchRate: number; // Percentage of matched transactions
  lastActivity?: string;
}

// Report Types
export interface ReconciliationReport {
  id: string;
  projectId: string;
  name: string;
  generatedAt: string;
  matchRate: number;
  summary: {
    totalBankTransactions: number;
    totalGLTransactions: number;
    matchedTransactions: number;
    unmatchedBankTransactions: number;
    unmatchedGLTransactions: number;
    bankTotal: number;
    glTotal: number;
    difference: number;
  };
}
