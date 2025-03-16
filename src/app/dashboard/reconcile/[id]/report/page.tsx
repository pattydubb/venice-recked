'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeftIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  EnvelopeIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'

import useReconciliationStore from '@/store/reconciliationStore'
import { getReconciliationStats } from '@/utils/matchingEngine'

interface ReportPageProps {
  params: { id: string }
}

export default function ReportPage({ params }: ReportPageProps) {
  const router = useRouter()
  const { id } = params
  
  const [isLoading, setIsLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState<string[]>(['summary', 'matched', 'unmatched'])
  
  // Store state
  const { 
    currentProject, 
    bankTransactions, 
    glTransactions, 
    matchGroups
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
  
  // Handle expanding/collapsing sections
  const toggleSection = (section: string) => {
    if (expandedSections.includes(section)) {
      setExpandedSections(expandedSections.filter(s => s !== section))
    } else {
      setExpandedSections([...expandedSections, section])
    }
  }
  
  // Format amounts for display
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Get matches and unmatched transactions
  const confirmedMatches = matchGroups.filter(group => group.status === 'confirmed')
  const unmatchedBankTransactions = bankTransactions.filter(tx => tx.matchStatus === 'unmatched')
  const unmatchedGLTransactions = glTransactions.filter(tx => tx.matchStatus === 'unmatched')
  
  // Get current date for report
  const reportDate = format(new Date(), 'MMMM d, yyyy')
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-4">
          <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg font-medium text-gray-900">Generating report...</span>
        </div>
      </div>
    )
  }
  
  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <button
            type="button"
            onClick={() => router.push(`/dashboard/reconcile/${id}/workspace`)}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Workspace
          </button>
          
          <h1 className="text-2xl font-semibold text-gray-900 mt-2">
            {currentProject?.name} - Reconciliation Report
          </h1>
          
          <p className="mt-1 text-sm text-gray-500">
            Generated on {reportDate}
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PrinterIcon className="h-5 w-5 mr-2 text-gray-500" />
            Print
          </button>
          
          <button
            type="button"
            onClick={() => {
              toast.success('Report downloaded successfully')
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2 text-gray-500" />
            Download PDF
          </button>
          
          <button
            type="button"
            onClick={() => {
              toast.success('Report will be sent to your email')
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <EnvelopeIcon className="h-5 w-5 mr-2" />
            Email Report
          </button>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Report Header */}
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Bank Reconciliation</h2>
              <div className="mt-1 flex items-center">
                {currentProject?.bankAccount && (
                  <span className="text-sm text-gray-500">
                    Account: <span className="font-medium">{currentProject.bankAccount}</span>
                  </span>
                )}
                
                {currentProject?.periodStart && currentProject?.periodEnd && (
                  <span className="text-sm text-gray-500 ml-4">
                    Period: <span className="font-medium">
                      {format(new Date(currentProject.periodStart), 'MMM d, yyyy')} - {format(new Date(currentProject.periodEnd), 'MMM d, yyyy')}
                    </span>
                  </span>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-500">Match Rate</div>
              <div className="flex items-center justify-end">
                <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                  <div 
                    className="h-full rounded-full bg-primary-600" 
                    style={{ width: `${stats.matchedRate}%` }}
                  />
                </div>
                <span className="text-lg font-bold text-primary-600">{stats.matchedRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4">
          {/* Summary Section */}
          <div className="mb-6">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('summary')}
            >
              <h3 className="text-lg font-medium text-gray-900">Summary</h3>
              <div>
                {expandedSections.includes('summary') ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </div>
            
            {expandedSections.includes('summary') && (
              <div className="mt-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Bank Statement</h4>
                      <div className="mt-2">
                        <div className="flex justify-between text-sm">
                          <span>Total Transactions:</span>
                          <span className="font-medium">{stats.totalBankTransactions}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span>Matched:</span>
                          <span className="font-medium">{stats.matchedBankTransactions}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span>Unmatched:</span>
                          <span className="font-medium">{stats.unmatchedBankTransactions}</span>
                        </div>
                        
                        <div className="mt-4 pt-2 border-t border-gray-200">
                          <div className="flex justify-between items-baseline">
                            <span className="text-sm font-medium text-gray-500">Total:</span>
                            <span className="text-base font-bold">{formatAmount(stats.bankTotal)}</span>
                          </div>
                          <div className="flex justify-between items-baseline mt-1">
                            <span className="text-sm font-medium text-gray-500">Unmatched:</span>
                            <span className="text-sm">{formatAmount(stats.unmatchedBankTotal)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">General Ledger</h4>
                      <div className="mt-2">
                        <div className="flex justify-between text-sm">
                          <span>Total Transactions:</span>
                          <span className="font-medium">{stats.totalGLTransactions}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span>Matched:</span>
                          <span className="font-medium">{stats.matchedGLTransactions}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span>Unmatched:</span>
                          <span className="font-medium">{stats.unmatchedGLTransactions}</span>
                        </div>
                        
                        <div className="mt-4 pt-2 border-t border-gray-200">
                          <div className="flex justify-between items-baseline">
                            <span className="text-sm font-medium text-gray-500">Total:</span>
                            <span className="text-base font-bold">{formatAmount(stats.glTotal)}</span>
                          </div>
                          <div className="flex justify-between items-baseline mt-1">
                            <span className="text-sm font-medium text-gray-500">Unmatched:</span>
                            <span className="text-sm">{formatAmount(stats.unmatchedGLTotal)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Difference:</span>
                        <span className={`ml-2 text-lg font-bold ${Math.abs(stats.difference) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatAmount(stats.difference)}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Reconciliation Status:</span>
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                          Math.abs(stats.difference) < 0.01 && stats.unmatchedBankTransactions === 0 && stats.unmatchedGLTransactions === 0
                            ? 'bg-green-100 text-green-800'
                            : Math.abs(stats.difference) < 0.01
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {Math.abs(stats.difference) < 0.01 && stats.unmatchedBankTransactions === 0 && stats.unmatchedGLTransactions === 0
                            ? 'Fully Reconciled'
                            : Math.abs(stats.difference) < 0.01
                              ? 'Balanced with Unmatched Items'
                              : 'Unbalanced'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Matched Transactions Section */}
          <div className="mb-6">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('matched')}
            >
              <h3 className="text-lg font-medium text-gray-900">Matched Transactions</h3>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">{confirmedMatches.length} matches</span>
                {expandedSections.includes('matched') ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </div>
            
            {expandedSections.includes('matched') && (
              <div className="mt-4">
                {confirmedMatches.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                    No matched transactions found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Match #
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bank Transactions
                          </th>
                          <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bank Amount
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            GL Transactions
                          </th>
                          <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            GL Amount
                          </th>
                          <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Difference
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {confirmedMatches.map((match, index) => {
                          // Get bank and GL transactions for this match
                          const matchedBankTxs = bankTransactions.filter(tx => 
                            match.bankTransactionIds.includes(tx.id)
                          );
                          
                          const matchedGLTxs = glTransactions.filter(tx => 
                            match.glTransactionIds.includes(tx.id)
                          );
                          
                          const difference = match.bankTotal - match.glTotal;
                          
                          return (
                            <tr key={match.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {index + 1}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                <div className="space-y-1">
                                  {matchedBankTxs.map(tx => (
                                    <div key={tx.id} className="truncate max-w-md">
                                      {tx.description}
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 text-right">
                                {formatAmount(match.bankTotal)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                <div className="space-y-1">
                                  {matchedGLTxs.map(tx => (
                                    <div key={tx.id} className="truncate max-w-md">
                                      {tx.description}
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 text-right">
                                {formatAmount(match.glTotal)}
                              </td>
                              <td className={`px-4 py-3 text-sm text-right ${
                                Math.abs(difference) < 0.01 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {formatAmount(difference)}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Unmatched Transactions Section */}
          <div>
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('unmatched')}
            >
              <h3 className="text-lg font-medium text-gray-900">Unmatched Transactions</h3>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">
                  {unmatchedBankTransactions.length + unmatchedGLTransactions.length} items
                </span>
                {expandedSections.includes('unmatched') ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </div>
            
            {expandedSections.includes('unmatched') && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Unmatched Bank Transactions</h4>
                
                {unmatchedBankTransactions.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg mb-4">
                    No unmatched bank transactions
                  </div>
                ) : (
                  <div className="overflow-x-auto mb-6">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Notes
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {unmatchedBankTransactions.map((tx, index) => (
                          <tr key={tx.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {format(new Date(tx.date), 'MM/dd/yyyy')}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              <div className="truncate max-w-md">
                                {tx.description}
                              </div>
                            </td>
                            <td className={`px-4 py-3 text-sm text-right ${
                              tx.amount < 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {formatAmount(tx.amount)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {tx.notes || ''}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                <h4 className="text-sm font-medium text-gray-500 mb-2">Unmatched GL Transactions</h4>
                
                {unmatchedGLTransactions.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                    No unmatched GL transactions
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Account
                          </th>
                          <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Notes
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {unmatchedGLTransactions.map((tx, index) => (
                          <tr key={tx.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {format(new Date(tx.date), 'MM/dd/yyyy')}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              <div className="truncate max-w-md">
                                {tx.description}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {tx.glAccount || 'N/A'}
                            </td>
                            <td className={`px-4 py-3 text-sm text-right ${
                              tx.amount < 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {formatAmount(tx.amount)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {tx.notes || ''}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
