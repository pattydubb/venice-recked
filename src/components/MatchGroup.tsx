'use client'

import { useState } from 'react'
import { MatchGroup as MatchGroupType, BankTransaction, GLTransaction } from '@/types'
import { CheckCircleIcon, XCircleIcon, PencilIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import TransactionCard from './TransactionCard'

interface MatchGroupProps {
  matchGroup: MatchGroupType;
  bankTransactions: BankTransaction[];
  glTransactions: GLTransaction[];
  onConfirm: (groupId: string) => void;
  onReject: (groupId: string) => void;
  onEdit: (groupId: string) => void;
  onAddNote?: (id: string, note: string) => void;
}

export default function MatchGroup({
  matchGroup,
  bankTransactions,
  glTransactions,
  onConfirm,
  onReject,
  onEdit,
  onAddNote
}: MatchGroupProps) {
  const [expanded, setExpanded] = useState(false)
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [noteText, setNoteText] = useState(matchGroup.notes || '')
  
  // Get matched bank transactions
  const matchedBankTxs = bankTransactions.filter(tx => 
    matchGroup.bankTransactionIds.includes(tx.id)
  );
  
  // Get matched GL transactions
  const matchedGLTxs = glTransactions.filter(tx => 
    matchGroup.glTransactionIds.includes(tx.id)
  );
  
  // Calculate totals for display
  const bankTotal = matchedBankTxs.reduce((sum, tx) => sum + tx.amount, 0);
  const glTotal = matchedGLTxs.reduce((sum, tx) => sum + tx.amount, 0);
  const isBalanced = Math.abs(bankTotal - glTotal) < 0.01;
  
  // Format amounts for display
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  const handleAddNote = () => {
    // TODO: Implement adding notes to match groups
    setShowNoteInput(false);
  };
  
  // Determine status badge color and text
  let statusColor = '';
  let statusText = '';
  
  switch (matchGroup.status) {
    case 'confirmed':
      statusColor = 'bg-green-100 text-green-800';
      statusText = 'Confirmed';
      break;
    case 'manual':
      statusColor = 'bg-blue-100 text-blue-800';
      statusText = 'Manual';
      break;
    case 'rejected':
      statusColor = 'bg-red-100 text-red-800';
      statusText = 'Rejected';
      break;
    default:
      statusColor = 'bg-yellow-100 text-yellow-800';
      statusText = 'Auto-Match';
  }
  
  return (
    <div className={`border rounded-lg shadow-sm mb-4 ${
      isBalanced ? 'border-green-200' : 'border-yellow-200'
    }`}>
      <div className="p-4">
        {/* Match group header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3">
          {/* Match type and balance status */}
          <div className="flex items-center mb-2 sm:mb-0">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor} mr-2`}>
              {statusText}
            </span>
            
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isBalanced ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {isBalanced ? 'Balanced' : 'Unbalanced'}
            </span>
          </div>
          
          {/* Action buttons */}
          <div className="flex space-x-2">
            <button
              className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? 'Collapse' : 'Expand'}
            </button>
            
            {matchGroup.status !== 'confirmed' && matchGroup.status !== 'rejected' && (
              <>
                <button
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  onClick={() => onConfirm(matchGroup.id)}
                >
                  <CheckCircleIcon className="mr-1 h-3 w-3" />
                  Confirm
                </button>
                
                <button
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  onClick={() => onReject(matchGroup.id)}
                >
                  <XCircleIcon className="mr-1 h-3 w-3" />
                  Reject
                </button>
                
                <button
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={() => onEdit(matchGroup.id)}
                >
                  <PencilIcon className="mr-1 h-3 w-3" />
                  Edit
                </button>
              </>
            )}
            
            <button
              className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={() => setShowNoteInput(!showNoteInput)}
            >
              <DocumentTextIcon className="mr-1 h-3 w-3" />
              Note
            </button>
          </div>
        </div>
        
        {/* Match summary */}
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
          <div>
            <p className="text-sm text-gray-500">Bank</p>
            <p className="text-sm font-medium">{matchedBankTxs.length} transaction{matchedBankTxs.length !== 1 ? 's' : ''}</p>
            <p className={`text-sm font-bold ${bankTotal < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatAmount(bankTotal)}
            </p>
          </div>
          
          <div className="text-gray-400">
            {matchedBankTxs.length === 1 && matchedGLTxs.length === 1 
              ? '1:1 Match'
              : matchedBankTxs.length === 1 
                ? '1:N Match'
                : matchedGLTxs.length === 1
                  ? 'N:1 Match'
                  : 'N:M Match'
            }
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-500">GL</p>
            <p className="text-sm font-medium">{matchedGLTxs.length} transaction{matchedGLTxs.length !== 1 ? 's' : ''}</p>
            <p className={`text-sm font-bold ${glTotal < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatAmount(glTotal)}
            </p>
          </div>
        </div>
        
        {/* Difference if not balanced */}
        {!isBalanced && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800 flex justify-between">
              <span>Difference:</span> 
              <span className="font-medium">{formatAmount(bankTotal - glTotal)}</span>
            </p>
          </div>
        )}
        
        {/* Note input */}
        {showNoteInput && (
          <div className="mt-3">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="w-full text-sm p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={2}
              placeholder="Add a note to this match group..."
            />
            <div className="flex justify-end space-x-2 mt-1">
              <button
                className="text-xs text-gray-600 hover:text-gray-800"
                onClick={() => setShowNoteInput(false)}
              >
                Cancel
              </button>
              <button
                className="text-xs text-primary-600 hover:text-primary-800 flex items-center"
                onClick={handleAddNote}
              >
                <CheckCircleIcon className="h-3 w-3 mr-1" />
                Save
              </button>
            </div>
          </div>
        )}
        
        {/* Note display */}
        {matchGroup.notes && !showNoteInput && (
          <div className="mt-3 p-2 bg-gray-50 rounded-md text-sm text-gray-600">
            {matchGroup.notes}
          </div>
        )}
        
        {/* Expanded content showing the transactions */}
        {expanded && (
          <div className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Bank transactions */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Bank Transactions</h4>
                <div className="space-y-2">
                  {matchedBankTxs.map(tx => (
                    <TransactionCard
                      key={tx.id}
                      transaction={tx}
                      onAddNote={onAddNote}
                    />
                  ))}
                </div>
              </div>
              
              {/* GL transactions */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">GL Transactions</h4>
                <div className="space-y-2">
                  {matchedGLTxs.map(tx => (
                    <TransactionCard
                      key={tx.id}
                      transaction={tx}
                      onAddNote={onAddNote}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
