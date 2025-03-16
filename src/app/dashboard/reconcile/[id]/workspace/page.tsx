'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeftIcon,
  ArrowsRightLeftIcon,
  DocumentTextIcon, 
  ChevronDownIcon,
  ChevronUpIcon,
  FilterIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  PlusIcon,
  XMarkIcon,
  ChartBarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

import useReconciliationStore from '@/store/reconciliationStore'
import { BankTransaction, GLTransaction, MatchGroup } from '@/types'
import { getReconciliationStats } from '@/utils/matchingEngine'

import TransactionCard from '@/components/TransactionCard'
import MatchGroupComponent from '@/components/MatchGroup'

interface WorkspacePageProps {
  params: { id: string }
}

export default function WorkspacePage({ params }: WorkspacePageProps) {
  const router = useRouter()
  const { id } = params
  
  // UI state
  const [isLoading, setIsLoading] = useState(true)
  const [activeView, setActiveView] = useState<'auto' | 'manual' | 'all'>('auto')
  const [bankSearch, setBankSearch] = useState('')
  const [glSearch, setGLSearch] = useState('')
  const [bankFilter, setBankFilter] = useState<'all' | 'matched' | 'unmatched'>('all')
  const [glFilter, setGLFilter] = useState<'all' | 'matched' | 'unmatched'>('all')
  const [showStats, setShowStats] = useState(true)
  const [showMatched, setShowMatched] = useState(true)
  const [showUnmatched, setShowUnmatched] = useState(true)
  const [selectedBankTxIds, setSelectedBankTxIds] = useState<string[]>([])
  const [selectedGLTxIds, setSelectedGLTxIds] = useState<string[]>([])
  
  // Store state
  const { 
    currentProject, 
    bankTransactions, 
    glTransactions, 
    matchGroups,
    runAutomaticMatching,
    createMatchGroup,
    updateMatchGroup,
    confirmMatchGroup,
    rejectMatchGroup,
    addTransactionNote
  } = useReconciliationStore()
  
  // Calculate statistics
  const stats = getReconciliationStats(bankTransactions, glTransactions, matchGroups)
  
  // Check if we have data and redirect if not
  useEffect(() => {
    if (!currentProject || currentProject.id !== id) {
      // No current project or wrong project, redirect
      router.push('/dashboard/reconcile')
      return
    }
    
    if (bankTransactions.length === 0 || glTransactions.length === 0) {
      // No transactions loaded, redirect to new reconciliation
      router.push(`/dashboard/reconcile/${id}`)
      return
    }
    
    setIsLoading(false)
  }, [currentProject, bankTransactions, glTransactions, id, router])
  
  // Filter bank transactions based on search and filters
  const filteredBankTransactions = bankTransactions.filter(tx => {
    // Search filter
    if (bankSearch && !tx.description.toLowerCase().includes(bankSearch.toLowerCase())) {
      return false
    }
    
    // Status filter
    if (bankFilter === 'matched' && tx.matchStatus === 'unmatched') {
      return false
    }
    if (bankFilter === 'unmatched' && tx.matchStatus !== 'unmatched') {
      return false
    }
    
    return true
  })
  
  // Filter GL transactions based on search and filters
  const filteredGLTransactions = glTransactions.filter(tx => {
    // Search filter
    if (glSearch && !tx.description.toLowerCase().includes(glSearch.toLowerCase())) {
      return false
    }
    
    // Status filter
    if (glFilter === 'matched' && tx.matchStatus === 'unmatched') {
      return false
    }
    if (glFilter === 'unmatched' && tx.matchStatus !== 'unmatched') {
      return false
    }
    
    return true
  })
  
  // Filter match groups based on active view
  const filteredMatchGroups = matchGroups.filter(group => {
    if (activeView === 'auto' && group.status !== 'auto') {
      return false
    }
    if (activeView === 'manual' && group.status !== 'manual') {
      return false
    }
    
    // Filter based on show matched/unmatched
    if (!showMatched && group.status === 'confirmed') {
      return false
    }
    if (!showUnmatched && group.status !== 'confirmed') {
      return false
    }
    
    return true
  })
  
  // Handle transaction selection (bank)
  const handleBankTxSelect = (id: string) => {
    if (selectedBankTxIds.includes(id)) {
      setSelectedBankTxIds(prev => prev.filter(txId => txId !== id))
    } else {
      setSelectedBankTxIds(prev => [...prev, id])
    }
  }
  
  // Handle transaction selection (GL)
  const handleGLTxSelect = (id: string) => {
    if (selectedGLTxIds.includes(id)) {
      setSelectedGLTxIds(prev => prev.filter(txId => txId !== id))
    } else {
      setSelectedGLTxIds(prev => [...prev, id])
    }
  }
  
  // Create match from selected transactions
  const createMatchFromSelection = () => {
    if (selectedBankTxIds.length === 0 || selectedGLTxIds.length === 0) {
      toast.error('Please select at least one bank transaction and one GL transaction')
      return
    }
    
    createMatchGroup(selectedBankTxIds, selectedGLTxIds)
    
    // Clear selection
    setSelectedBankTxIds([])
    setSelectedGLTxIds([])
    
    toast.success('Match group created successfully')
  }
  
  // Handle adding a note to a transaction
  const handleAddNote = (id: string, note: string) => {
    addTransactionNote(id, note)
    toast.success('Note added successfully')
  }
  
  // Run auto matching again
  const handleRunAutoMatching = () => {
    runAutomaticMatching()
    toast.success('Automatic matching completed')
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-4">
          <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg font-medium text-gray-900">Loading...</span>
        </div>
      </div>
    )
  }
  
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => router.push('/dashboard/reconcile')}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Reconciliations
        </button>
        
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">
          {currentProject?.name}
        </h1>
        
        <p className="mt-1 text-sm text-gray-500">
          Reconciliation Workspace
        </p>
      </div>
      
      {/* Stats Section */}
      {showStats && (
        <div className="bg-white shadow rounded-lg p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Reconciliation Summary</h2>
            <button
              type="button"
              onClick={() => setShowStats(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500">Bank Transactions</div>
              <div className="mt-1 flex items-center">
                <div className="text-2xl font-semibold text-gray-900">{stats.totalBankTransactions}</div>
                <div className="ml-2 text-sm text-gray-500">
                  <div>Matched: {stats.matchedBankTransactions}</div>
                  <div>Unmatched: {stats.unmatchedBankTransactions}</div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500">GL Transactions</div>
              <div className="mt-1 flex items-center">
                <div className="text-2xl font-semibold text-gray-900">{stats.totalGLTransactions}</div>
                <div className="ml-2 text-sm text-gray-500">
                  <div>Matched: {stats.matchedGLTransactions}</div>
                  <div>Unmatched: {stats.unmatchedGLTransactions}</div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500">Bank Total</div>
              <div className="mt-1 flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(stats.bankTotal)}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Unmatched: {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(stats.unmatchedBankTotal)}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500">GL Total</div>
              <div className="mt-1 flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(stats.glTotal)}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Unmatched: {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(stats.unmatchedGLTotal)}
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-500">Difference</div>
                <div className={`text-xl font-bold ${Math.abs(stats.difference) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(stats.difference)}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Match Rate</div>
                <div className="flex items-center">
                  <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                    <div 
                      className="h-full rounded-full bg-primary-600" 
                      style={{ width: `${stats.matchedRate}%` }}
                    />
                  </div>
                  <span className="text-xl font-bold text-primary-600">{stats.matchedRate.toFixed(1)}%</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleRunAutoMatching}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <ArrowsRightLeftIcon className="h-4 w-4 mr-1" />
                  Run Auto-Match
                </button>
                
                <button
                  type="button"
                  onClick={() => router.push(`/dashboard/reconcile/${id}/report`)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <DocumentTextIcon className="h-4 w-4 mr-1" />
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Bank Transactions */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
            <h3 className="text-base font-medium text-gray-900">Bank Transactions</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">{filteredBankTransactions.length} items</span>
              {selectedBankTxIds.length > 0 && (
                <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  {selectedBankTxIds.length} selected
                </span>
              )}
            </div>
          </div>
          
          {/* Search and Filters */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex mb-2">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  value={bankSearch}
                  onChange={(e) => setBankSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Search transactions..."
                />
              </div>
              
              <div className="ml-2">
                <select
                  value={bankFilter}
                  onChange={(e) => setBankFilter(e.target.value as any)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="all">All</option>
                  <option value="matched">Matched</option>
                  <option value="unmatched">Unmatched</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Bank total: {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(stats.bankTotal)}
              </div>
              
              {selectedBankTxIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedBankTxIds([])}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear selection
                </button>
              )}
            </div>
          </div>
          
          {/* Transaction List */}
          <div className="overflow-y-auto h-[calc(100vh-400px)]">
            <div className="p-4 space-y-2">
              {filteredBankTransactions.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No transactions match your filters
                </div>
              ) : (
                filteredBankTransactions.map(transaction => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    onClick={() => handleBankTxSelect(transaction.id)}
                    onAddNote={handleAddNote}
                    isSelected={selectedBankTxIds.includes(transaction.id)}
                    draggable={true}
                  />
                ))
              )}
            </div>
          </div>
        </div>
        
        {/* Middle Column - Match Groups */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
            <h3 className="text-base font-medium text-gray-900">Match Groups</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">{filteredMatchGroups.length} matches</span>
              
              {/* View selector */}
              <div className="relative inline-block text-left">
                <select
                  value={activeView}
                  onChange={(e) => setActiveView(e.target.value as any)}
                  className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md"
                >
                  <option value="all">All Matches</option>
                  <option value="auto">Auto Matches</option>
                  <option value="manual">Manual Matches</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Controls */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <input
                    id="show-matched"
                    type="checkbox"
                    checked={showMatched}
                    onChange={() => setShowMatched(!showMatched)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="show-matched" className="ml-2 block text-sm text-gray-900">
                    Show Matched
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="show-unmatched"
                    type="checkbox"
                    checked={showUnmatched}
                    onChange={() => setShowUnmatched(!showUnmatched)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="show-unmatched" className="ml-2 block text-sm text-gray-900">
                    Show Unmatched
                  </label>
                </div>
              </div>
              
              <button
                type="button"
                onClick={createMatchFromSelection}
                disabled={selectedBankTxIds.length === 0 || selectedGLTxIds.length === 0}
                className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white ${
                  selectedBankTxIds.length === 0 || selectedGLTxIds.length === 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                }`}
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Create Match
              </button>
            </div>
          </div>
          
          {/* Match Groups List */}
          <div className="overflow-y-auto h-[calc(100vh-400px)]">
            <div className="p-4 space-y-4">
              {filteredMatchGroups.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No match groups to display
                </div>
              ) : (
                filteredMatchGroups.map(group => (
                  <MatchGroupComponent
                    key={group.id}
                    matchGroup={group}
                    bankTransactions={bankTransactions}
                    glTransactions={glTransactions}
                    onConfirm={confirmMatchGroup}
                    onReject={rejectMatchGroup}
                    onEdit={(groupId) => {
                      // Find the group
                      const group = matchGroups.find(g => g.id === groupId);
                      if (group) {
                        // Set selections
                        setSelectedBankTxIds(group.bankTransactionIds);
                        setSelectedGLTxIds(group.glTransactionIds);
                        
                        // Reject the old group
                        rejectMatchGroup(groupId);
                        
                        toast.success('Group ready for editing. Modify selections and create a new match.');
                      }
                    }}
                    onAddNote={handleAddNote}
                  />
                ))
              )}
            </div>
          </div>
        </div>
        
        {/* Right Column - GL Transactions */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
            <h3 className="text-base font-medium text-gray-900">GL Transactions</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">{filteredGLTransactions.length} items</span>
              {selectedGLTxIds.length > 0 && (
                <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  {selectedGLTxIds.length} selected
                </span>
              )}
            </div>
          </div>
          
          {/* Search and Filters */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex mb-2">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  value={glSearch}
                  onChange={(e) => setGLSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Search transactions..."
                />
              </div>
              
              <div className="ml-2">
                <select
                  value={glFilter}
                  onChange={(e) => setGLFilter(e.target.value as any)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="all">All</option>
                  <option value="matched">Matched</option>
                  <option value="unmatched">Unmatched</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                GL total: {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(stats.glTotal)}
              </div>
              
              {selectedGLTxIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedGLTxIds([])}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear selection
                </button>
              )}
            </div>
          </div>
          
          {/* Transaction List */}
          <div className="overflow-y-auto h-[calc(100vh-400px)]">
            <div className="p-4 space-y-2">
              {filteredGLTransactions.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No transactions match your filters
                </div>
              ) : (
                filteredGLTransactions.map(transaction => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    onClick={() => handleGLTxSelect(transaction.id)}
                    onAddNote={handleAddNote}
                    isSelected={selectedGLTxIds.includes(transaction.id)}
                    draggable={true}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats toggle button */}
      {!showStats && (
        <button
          type="button"
          onClick={() => setShowStats(true)}
          className="fixed bottom-4 right-4 inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <ChartBarIcon className="h-6 w-6" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
