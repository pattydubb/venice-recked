'use client'

import { useState } from 'react'
import { BankTransaction, GLTransaction } from '@/types'
import { PencilIcon, DocumentTextIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { format, parseISO } from 'date-fns'

interface TransactionCardProps {
  transaction: BankTransaction | GLTransaction;
  onClick?: () => void;
  onAddNote?: (id: string, note: string) => void;
  isSelected?: boolean;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
}

export default function TransactionCard({
  transaction,
  onClick,
  onAddNote,
  isSelected = false,
  draggable = false,
  onDragStart
}: TransactionCardProps) {
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [noteText, setNoteText] = useState(transaction.notes || '')
  
  const handleAddNote = () => {
    if (onAddNote) {
      onAddNote(transaction.id, noteText)
      setShowNoteInput(false)
    }
  }
  
  // Format date for display
  const displayDate = transaction.date 
    ? format(parseISO(transaction.date), 'MMM d, yyyy')
    : 'No date';
    
  // Format amount for display with currency symbol
  const displayAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(transaction.amount);
  
  // Determine status color and text
  let statusColor = '';
  let statusText = '';
  
  switch (transaction.matchStatus) {
    case 'matched':
      statusColor = 'bg-green-500';
      statusText = 'Matched';
      break;
    case 'potential':
      statusColor = 'bg-yellow-500';
      statusText = 'Potential Match';
      break;
    default:
      statusColor = 'bg-gray-300';
      statusText = 'Unmatched';
  }
  
  // Set card class based on match status and selection
  const cardClass = `transaction-card cursor-pointer ${
    transaction.matchStatus === 'matched' 
      ? 'transaction-matched' 
      : transaction.matchStatus === 'potential' 
        ? 'transaction-potential-match' 
        : 'transaction-unmatched'
  } ${isSelected ? 'ring-2 ring-primary-500' : ''}`;
  
  return (
    <div 
      className={cardClass}
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      data-transaction-id={transaction.id}
      data-transaction-type={transaction.source}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <span className={`match-indicator ${
            transaction.matchStatus === 'matched' 
              ? 'matched' 
              : transaction.matchStatus === 'potential' 
                ? 'potential' 
                : 'unmatched'
          }`}></span>
          <span className="text-xs text-gray-500">{statusText}</span>
        </div>
        
        <div className="flex space-x-1">
          {transaction.notes && (
            <button 
              className="text-gray-400 hover:text-gray-600"
              onClick={(e) => {
                e.stopPropagation();
                setShowNoteInput(true);
              }}
            >
              <DocumentTextIcon className="h-4 w-4" />
            </button>
          )}
          
          <button 
            className="text-gray-400 hover:text-gray-600"
            onClick={(e) => {
              e.stopPropagation();
              setShowNoteInput(true);
            }}
          >
            <PencilIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="flex justify-between items-baseline">
        <div className="text-sm font-medium">{displayDate}</div>
        <div className={`text-sm font-semibold ${
          transaction.amount < 0 ? 'text-red-600' : 'text-green-600'
        }`}>
          {displayAmount}
        </div>
      </div>
      
      <div className="text-sm text-gray-600 mt-1 line-clamp-2">
        {transaction.description}
      </div>
      
      {/* Source specific fields */}
      {transaction.source === 'bank' && (
        <div className="text-xs text-gray-500 mt-1">
          {transaction.bankAccount && (
            <div>Account: {transaction.bankAccount}</div>
          )}
          {transaction.checkNumber && (
            <div>Check: {transaction.checkNumber}</div>
          )}
        </div>
      )}
      
      {transaction.source === 'gl' && (
        <div className="text-xs text-gray-500 mt-1">
          {transaction.glAccount && (
            <div>Account: {transaction.glAccount}</div>
          )}
          {transaction.reference && (
            <div>Ref: {transaction.reference}</div>
          )}
          {transaction.department && (
            <div>Dept: {transaction.department}</div>
          )}
          {transaction.class && (
            <div>Class: {transaction.class}</div>
          )}
        </div>
      )}
      
      {/* Note display */}
      {transaction.notes && !showNoteInput && (
        <div className="mt-2 p-2 bg-gray-50 rounded-md text-xs text-gray-600">
          {transaction.notes}
        </div>
      )}
      
      {/* Note input */}
      {showNoteInput && (
        <div className="mt-2" onClick={(e) => e.stopPropagation()}>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="w-full text-xs p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={2}
            placeholder="Add a note..."
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
    </div>
  )
}
