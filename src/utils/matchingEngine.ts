import { v4 as uuidv4 } from 'uuid';
import { 
  BankTransaction, 
  GLTransaction, 
  MatchGroup, 
  Transaction 
} from '@/types';
import Fuse from 'fuse.js';
import { differenceInDays, parseISO } from 'date-fns';

/**
 * Find exact matches based on amount
 */
export const findExactMatches = (
  bankTransactions: BankTransaction[],
  glTransactions: GLTransaction[]
): MatchGroup[] => {
  // Create a map of GL transactions by amount
  const glByAmount: Record<string, GLTransaction[]> = {};
  
  glTransactions.forEach(glTx => {
    // Skip already matched transactions
    if (glTx.matchStatus !== 'unmatched') return;
    
    const amountKey = glTx.amount.toFixed(2);
    if (!glByAmount[amountKey]) {
      glByAmount[amountKey] = [];
    }
    glByAmount[amountKey].push(glTx);
  });
  
  // Find 1:1 exact matches
  const exactMatches: MatchGroup[] = [];
  const matchedBankIds = new Set<string>();
  const matchedGlIds = new Set<string>();
  
  bankTransactions.forEach(bankTx => {
    // Skip already matched transactions
    if (bankTx.matchStatus !== 'unmatched') return;
    
    const amountKey = bankTx.amount.toFixed(2);
    const potentialMatches = glByAmount[amountKey];
    
    if (potentialMatches && potentialMatches.length === 1) {
      const glTx = potentialMatches[0];
      
      // Skip if already matched in this run
      if (matchedGlIds.has(glTx.id)) return;
      
      // Create a match group
      const matchGroup: MatchGroup = {
        id: uuidv4(),
        bankTransactionIds: [bankTx.id],
        glTransactionIds: [glTx.id],
        status: 'auto',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        bankTotal: bankTx.amount,
        glTotal: glTx.amount,
        isBalanced: true
      };
      
      exactMatches.push(matchGroup);
      matchedBankIds.add(bankTx.id);
      matchedGlIds.add(glTx.id);
    }
  });
  
  // Find multi-transaction matches (1:N, N:1, N:M)
  bankTransactions.forEach(bankTx => {
    // Skip already matched transactions
    if (bankTx.matchStatus !== 'unmatched' || matchedBankIds.has(bankTx.id)) return;
    
    const amountKey = bankTx.amount.toFixed(2);
    const potentialMatches = glByAmount[amountKey];
    
    // Skip if no potential GL matches with the same amount
    if (!potentialMatches || potentialMatches.length === 0) return;
    
    // Filter out already matched GL transactions
    const availableMatches = potentialMatches.filter(
      tx => tx.matchStatus === 'unmatched' && !matchedGlIds.has(tx.id)
    );
    
    if (availableMatches.length > 0) {
      // Create a match group with a 1:N relationship
      const glIds = availableMatches.map(tx => tx.id);
      const glTotal = availableMatches.reduce((sum, tx) => sum + tx.amount, 0);
      
      const matchGroup: MatchGroup = {
        id: uuidv4(),
        bankTransactionIds: [bankTx.id],
        glTransactionIds: glIds,
        status: 'auto',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        bankTotal: bankTx.amount,
        glTotal,
        isBalanced: Math.abs(bankTx.amount - glTotal) < 0.01 // Allow for minor rounding differences
      };
      
      exactMatches.push(matchGroup);
      matchedBankIds.add(bankTx.id);
      glIds.forEach(id => matchedGlIds.add(id));
    }
  });
  
  return exactMatches;
};

/**
 * Find potential matches based on fuzzy matching of amounts, dates, and descriptions
 */
export const findPotentialMatches = (
  bankTransactions: BankTransaction[],
  glTransactions: GLTransaction[]
): MatchGroup[] => {
  // Create potential matches only for unmatched transactions
  const unmatchedBank = bankTransactions.filter(tx => tx.matchStatus === 'unmatched');
  const unmatchedGL = glTransactions.filter(tx => tx.matchStatus === 'unmatched');
  
  if (unmatchedBank.length === 0 || unmatchedGL.length === 0) return [];
  
  const potentialMatches: MatchGroup[] = [];
  
  // Configure Fuse.js for fuzzy matching on descriptions
  const fuseOptions = {
    includeScore: true,
    keys: ['description'],
    threshold: 0.4 // Lower threshold means more strict matching
  };
  
  const fuse = new Fuse(unmatchedGL, fuseOptions);
  
  // Check each unmatched bank transaction
  unmatchedBank.forEach(bankTx => {
    // First, find GL transactions with similar amounts (within 1%)
    const similarAmountGLs = unmatchedGL.filter(glTx => {
      const amountDiff = Math.abs(bankTx.amount - glTx.amount) / Math.abs(bankTx.amount);
      return amountDiff < 0.01; // Within 1% difference
    });
    
    if (similarAmountGLs.length === 0) return;
    
    // Next, look for transactions with close dates (within 5 days)
    const dateMatchedGLs = similarAmountGLs.filter(glTx => {
      const bankDate = parseISO(bankTx.date);
      const glDate = parseISO(glTx.date);
      return Math.abs(differenceInDays(bankDate, glDate)) <= 5;
    });
    
    // If we have date matches, prioritize those, otherwise use amount matches
    const candidateGLs = dateMatchedGLs.length > 0 ? dateMatchedGLs : similarAmountGLs;
    
    // Now, look for description similarity
    const descriptionResults = fuse.search(bankTx.description);
    
    // Filter matching results to only include GL transactions that are in our candidate list
    const candidateResults = descriptionResults.filter(result => 
      candidateGLs.some(glTx => glTx.id === result.item.id)
    );
    
    if (candidateResults.length > 0) {
      // Sort by score (lower is better)
      candidateResults.sort((a, b) => (a.score || 1) - (b.score || 1));
      
      // Take the top match
      const bestMatch = candidateResults[0].item;
      
      // Create a potential match group
      const matchGroup: MatchGroup = {
        id: uuidv4(),
        bankTransactionIds: [bankTx.id],
        glTransactionIds: [bestMatch.id],
        status: 'auto',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        bankTotal: bankTx.amount,
        glTotal: bestMatch.amount,
        isBalanced: Math.abs(bankTx.amount - bestMatch.amount) < 0.01
      };
      
      potentialMatches.push(matchGroup);
    }
  });
  
  return potentialMatches;
};

/**
 * Apply match groups to transactions
 */
export const applyMatchGroups = (
  bankTransactions: BankTransaction[],
  glTransactions: GLTransaction[],
  matchGroups: MatchGroup[]
): { bankTransactions: BankTransaction[], glTransactions: GLTransaction[] } => {
  // Create maps for efficient lookup
  const bankMap = new Map(bankTransactions.map(tx => [tx.id, tx]));
  const glMap = new Map(glTransactions.map(tx => [tx.id, tx]));
  
  // Apply each match group
  matchGroups.forEach(group => {
    const matchStatus = group.status === 'confirmed' ? 'matched' : 'potential';
    
    // Update bank transactions
    group.bankTransactionIds.forEach(id => {
      const tx = bankMap.get(id);
      if (tx) {
        tx.matchStatus = matchStatus;
        tx.matchGroup = group.id;
      }
    });
    
    // Update GL transactions
    group.glTransactionIds.forEach(id => {
      const tx = glMap.get(id);
      if (tx) {
        tx.matchStatus = matchStatus;
        tx.matchGroup = group.id;
      }
    });
  });
  
  return {
    bankTransactions: Array.from(bankMap.values()),
    glTransactions: Array.from(glMap.values())
  };
};

/**
 * Get transaction totals and stats
 */
export const getReconciliationStats = (
  bankTransactions: BankTransaction[],
  glTransactions: GLTransaction[],
  matchGroups: MatchGroup[]
) => {
  const bankTotal = bankTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const glTotal = glTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  
  const unmatchedBankTransactions = bankTransactions.filter(tx => tx.matchStatus === 'unmatched');
  const unmatchedGLTransactions = glTransactions.filter(tx => tx.matchStatus === 'unmatched');
  const potentiallyMatchedBankTransactions = bankTransactions.filter(tx => tx.matchStatus === 'potential');
  const potentiallyMatchedGLTransactions = glTransactions.filter(tx => tx.matchStatus === 'potential');
  const matchedBankTransactions = bankTransactions.filter(tx => tx.matchStatus === 'matched');
  const matchedGLTransactions = glTransactions.filter(tx => tx.matchStatus === 'matched');
  
  const unmatchedBankTotal = unmatchedBankTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const unmatchedGLTotal = unmatchedGLTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  
  const matchedRate = bankTransactions.length > 0
    ? (matchedBankTransactions.length / bankTransactions.length) * 100
    : 0;
  
  return {
    bankTotal,
    glTotal,
    difference: bankTotal - glTotal,
    totalBankTransactions: bankTransactions.length,
    totalGLTransactions: glTransactions.length,
    unmatchedBankTransactions: unmatchedBankTransactions.length,
    unmatchedGLTransactions: unmatchedGLTransactions.length,
    potentiallyMatchedBankTransactions: potentiallyMatchedBankTransactions.length,
    potentiallyMatchedGLTransactions: potentiallyMatchedGLTransactions.length,
    matchedBankTransactions: matchedBankTransactions.length,
    matchedGLTransactions: matchedGLTransactions.length,
    unmatchedBankTotal,
    unmatchedGLTotal,
    matchGroups: matchGroups.length,
    matchedRate
  };
};
