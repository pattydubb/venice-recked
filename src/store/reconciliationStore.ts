import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { 
  BankTransaction, 
  GLTransaction, 
  MatchGroup, 
  ReconciliationProject, 
  ImportTemplate 
} from '@/types';
import { 
  findExactMatches, 
  findPotentialMatches, 
  applyMatchGroups 
} from '@/utils/matchingEngine';

interface ReconciliationState {
  // Current reconciliation project
  currentProject: ReconciliationProject | null;
  
  // Transaction data
  bankTransactions: BankTransaction[];
  glTransactions: GLTransaction[];
  matchGroups: MatchGroup[];
  
  // Import templates
  importTemplates: ImportTemplate[];
  
  // UI state
  isLoading: boolean;
  activeView: 'upload' | 'map' | 'match' | 'review';
  
  // Actions
  setCurrentProject: (project: ReconciliationProject) => void;
  addBankTransactions: (transactions: BankTransaction[]) => void;
  addGLTransactions: (transactions: GLTransaction[]) => void;
  runAutomaticMatching: () => void;
  createMatchGroup: (bankIds: string[], glIds: string[]) => void;
  updateMatchGroup: (groupId: string, bankIds: string[], glIds: string[]) => void;
  confirmMatchGroup: (groupId: string) => void;
  rejectMatchGroup: (groupId: string) => void;
  addTransactionNote: (id: string, note: string) => void;
  setActiveView: (view: 'upload' | 'map' | 'match' | 'review') => void;
  resetReconciliation: () => void;
}

const useReconciliationStore = create<ReconciliationState>((set, get) => ({
  // Initial state
  currentProject: null,
  bankTransactions: [],
  glTransactions: [],
  matchGroups: [],
  importTemplates: [],
  isLoading: false,
  activeView: 'upload',
  
  // Actions
  setCurrentProject: (project) => set({ currentProject: project }),
  
  addBankTransactions: (transactions) => {
    set((state) => ({
      bankTransactions: [...state.bankTransactions, ...transactions],
      // Update project stats if we have a current project
      currentProject: state.currentProject 
        ? {
            ...state.currentProject,
            bankTransactionCount: state.bankTransactions.length + transactions.length,
            bankFileCount: state.currentProject.bankFileCount + 1,
            lastActivity: new Date().toISOString()
          } 
        : null
    }));
  },
  
  addGLTransactions: (transactions) => {
    set((state) => ({
      glTransactions: [...state.glTransactions, ...transactions],
      // Update project stats if we have a current project
      currentProject: state.currentProject 
        ? {
            ...state.currentProject,
            glTransactionCount: state.glTransactions.length + transactions.length,
            glFileCount: state.currentProject.glFileCount + 1,
            lastActivity: new Date().toISOString()
          } 
        : null
    }));
  },
  
  runAutomaticMatching: () => {
    set({ isLoading: true });
    
    const state = get();
    const exactMatches = findExactMatches(state.bankTransactions, state.glTransactions);
    
    // Apply exact matches
    const { bankTransactions, glTransactions } = applyMatchGroups(
      state.bankTransactions,
      state.glTransactions,
      exactMatches
    );
    
    // Find potential matches on the updated transaction lists
    const potentialMatches = findPotentialMatches(bankTransactions, glTransactions);
    
    // Apply potential matches
    const finalState = applyMatchGroups(
      bankTransactions,
      glTransactions,
      potentialMatches
    );
    
    // Calculate match rate
    const matchedCount = finalState.bankTransactions.filter(tx => 
      tx.matchStatus === 'matched' || tx.matchStatus === 'potential'
    ).length;
    
    const matchRate = finalState.bankTransactions.length > 0
      ? (matchedCount / finalState.bankTransactions.length) * 100
      : 0;
    
    // Update state with matches and updated transactions
    set({
      bankTransactions: finalState.bankTransactions,
      glTransactions: finalState.glTransactions,
      matchGroups: [...exactMatches, ...potentialMatches],
      isLoading: false,
      // Update project stats
      currentProject: state.currentProject 
        ? {
            ...state.currentProject,
            matchedTransactionCount: matchedCount,
            matchRate,
            lastActivity: new Date().toISOString(),
            status: 'in_progress'
          } 
        : null
    });
  },
  
  createMatchGroup: (bankIds, glIds) => {
    const state = get();
    
    // Calculate totals
    const bankTotal = bankIds.reduce((sum, id) => {
      const tx = state.bankTransactions.find(t => t.id === id);
      return sum + (tx?.amount || 0);
    }, 0);
    
    const glTotal = glIds.reduce((sum, id) => {
      const tx = state.glTransactions.find(t => t.id === id);
      return sum + (tx?.amount || 0);
    }, 0);
    
    // Create new match group
    const newGroup: MatchGroup = {
      id: uuidv4(),
      bankTransactionIds: bankIds,
      glTransactionIds: glIds,
      status: 'manual',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      bankTotal,
      glTotal,
      isBalanced: Math.abs(bankTotal - glTotal) < 0.01
    };
    
    // Apply the new match group
    const { bankTransactions, glTransactions } = applyMatchGroups(
      state.bankTransactions,
      state.glTransactions,
      [newGroup]
    );
    
    // Calculate match rate
    const matchedCount = bankTransactions.filter(tx => 
      tx.matchStatus === 'matched' || tx.matchStatus === 'potential'
    ).length;
    
    const matchRate = bankTransactions.length > 0
      ? (matchedCount / bankTransactions.length) * 100
      : 0;
    
    set({
      bankTransactions,
      glTransactions,
      matchGroups: [...state.matchGroups, newGroup],
      // Update project stats
      currentProject: state.currentProject 
        ? {
            ...state.currentProject,
            matchedTransactionCount: matchedCount,
            matchRate,
            lastActivity: new Date().toISOString()
          } 
        : null
    });
  },
  
  updateMatchGroup: (groupId, bankIds, glIds) => {
    const state = get();
    
    // Find the match group to update
    const groupIndex = state.matchGroups.findIndex(g => g.id === groupId);
    if (groupIndex === -1) return;
    
    // Calculate totals
    const bankTotal = bankIds.reduce((sum, id) => {
      const tx = state.bankTransactions.find(t => t.id === id);
      return sum + (tx?.amount || 0);
    }, 0);
    
    const glTotal = glIds.reduce((sum, id) => {
      const tx = state.glTransactions.find(t => t.id === id);
      return sum + (tx?.amount || 0);
    }, 0);
    
    // Create updated match group
    const updatedGroup: MatchGroup = {
      ...state.matchGroups[groupIndex],
      bankTransactionIds: bankIds,
      glTransactionIds: glIds,
      status: 'manual',
      updatedAt: new Date().toISOString(),
      bankTotal,
      glTotal,
      isBalanced: Math.abs(bankTotal - glTotal) < 0.01
    };
    
    // Reset match status for all transactions in the original group
    let updatedBankTxs = state.bankTransactions.map(tx => {
      if (state.matchGroups[groupIndex].bankTransactionIds.includes(tx.id)) {
        return { ...tx, matchStatus: 'unmatched', matchGroup: undefined };
      }
      return tx;
    });
    
    let updatedGlTxs = state.glTransactions.map(tx => {
      if (state.matchGroups[groupIndex].glTransactionIds.includes(tx.id)) {
        return { ...tx, matchStatus: 'unmatched', matchGroup: undefined };
      }
      return tx;
    });
    
    // Apply the updated match group
    const { bankTransactions, glTransactions } = applyMatchGroups(
      updatedBankTxs,
      updatedGlTxs,
      [updatedGroup]
    );
    
    // Update match groups
    const updatedMatchGroups = [...state.matchGroups];
    updatedMatchGroups[groupIndex] = updatedGroup;
    
    // Calculate match rate
    const matchedCount = bankTransactions.filter(tx => 
      tx.matchStatus === 'matched' || tx.matchStatus === 'potential'
    ).length;
    
    const matchRate = bankTransactions.length > 0
      ? (matchedCount / bankTransactions.length) * 100
      : 0;
    
    set({
      bankTransactions,
      glTransactions,
      matchGroups: updatedMatchGroups,
      // Update project stats
      currentProject: state.currentProject 
        ? {
            ...state.currentProject,
            matchedTransactionCount: matchedCount,
            matchRate,
            lastActivity: new Date().toISOString()
          } 
        : null
    });
  },
  
  confirmMatchGroup: (groupId) => {
    const state = get();
    
    // Find the match group to confirm
    const groupIndex = state.matchGroups.findIndex(g => g.id === groupId);
    if (groupIndex === -1) return;
    
    // Create confirmed match group
    const confirmedGroup: MatchGroup = {
      ...state.matchGroups[groupIndex],
      status: 'confirmed',
      updatedAt: new Date().toISOString()
    };
    
    // Update match groups
    const updatedMatchGroups = [...state.matchGroups];
    updatedMatchGroups[groupIndex] = confirmedGroup;
    
    // Apply the confirmed status to transactions
    const { bankTransactions, glTransactions } = applyMatchGroups(
      state.bankTransactions,
      state.glTransactions,
      [confirmedGroup]
    );
    
    // Calculate match rate
    const matchedCount = bankTransactions.filter(tx => 
      tx.matchStatus === 'matched'
    ).length;
    
    const matchRate = bankTransactions.length > 0
      ? (matchedCount / bankTransactions.length) * 100
      : 0;
    
    set({
      bankTransactions,
      glTransactions,
      matchGroups: updatedMatchGroups,
      // Update project stats
      currentProject: state.currentProject 
        ? {
            ...state.currentProject,
            matchedTransactionCount: matchedCount,
            matchRate,
            lastActivity: new Date().toISOString()
          } 
        : null
    });
  },
  
  rejectMatchGroup: (groupId) => {
    const state = get();
    
    // Find the match group to reject
    const groupIndex = state.matchGroups.findIndex(g => g.id === groupId);
    if (groupIndex === -1) return;
    
    // Get the transactions IDs from the group
    const { bankTransactionIds, glTransactionIds } = state.matchGroups[groupIndex];
    
    // Reset match status for all transactions in the group
    const bankTransactions = state.bankTransactions.map(tx => {
      if (bankTransactionIds.includes(tx.id)) {
        return { ...tx, matchStatus: 'unmatched', matchGroup: undefined };
      }
      return tx;
    });
    
    const glTransactions = state.glTransactions.map(tx => {
      if (glTransactionIds.includes(tx.id)) {
        return { ...tx, matchStatus: 'unmatched', matchGroup: undefined };
      }
      return tx;
    });
    
    // Remove the match group
    const matchGroups = state.matchGroups.filter(g => g.id !== groupId);
    
    // Calculate match rate
    const matchedCount = bankTransactions.filter(tx => 
      tx.matchStatus === 'matched' || tx.matchStatus === 'potential'
    ).length;
    
    const matchRate = bankTransactions.length > 0
      ? (matchedCount / bankTransactions.length) * 100
      : 0;
    
    set({
      bankTransactions,
      glTransactions,
      matchGroups,
      // Update project stats
      currentProject: state.currentProject 
        ? {
            ...state.currentProject,
            matchedTransactionCount: matchedCount,
            matchRate,
            lastActivity: new Date().toISOString()
          } 
        : null
    });
  },
  
  addTransactionNote: (id, note) => {
    const state = get();
    
    // Update note in the appropriate transaction list
    const bankIndex = state.bankTransactions.findIndex(tx => tx.id === id);
    if (bankIndex !== -1) {
      const updatedBankTxs = [...state.bankTransactions];
      updatedBankTxs[bankIndex] = {
        ...updatedBankTxs[bankIndex],
        notes: note
      };
      set({ bankTransactions: updatedBankTxs });
      return;
    }
    
    const glIndex = state.glTransactions.findIndex(tx => tx.id === id);
    if (glIndex !== -1) {
      const updatedGlTxs = [...state.glTransactions];
      updatedGlTxs[glIndex] = {
        ...updatedGlTxs[glIndex],
        notes: note
      };
      set({ glTransactions: updatedGlTxs });
    }
  },
  
  setActiveView: (view) => set({ activeView: view }),
  
  resetReconciliation: () => set({
    bankTransactions: [],
    glTransactions: [],
    matchGroups: [],
    activeView: 'upload'
  })
}));

export default useReconciliationStore;
