'use client'

import { useState, useEffect } from 'react'
import { FileMapping } from '@/types'

interface ColumnMapperProps {
  headers: string[];
  onMappingComplete: (mapping: FileMapping) => void;
  sourceType: 'bank' | 'gl';
  fileName: string;
  savedMappings?: FileMapping[];
}

export default function ColumnMapper({
  headers,
  onMappingComplete,
  sourceType,
  fileName,
  savedMappings = []
}: ColumnMapperProps) {
  const [mapping, setMapping] = useState<Record<string, string>>({
    dateColumn: '',
    amountColumn: '',
    descriptionColumn: '',
  })
  
  const [saveMappingName, setSaveMappingName] = useState('')
  const [showSaveMapping, setShowSaveMapping] = useState(false)
  
  // Additional fields based on source type
  const additionalFields = sourceType === 'bank' 
    ? [
        { key: 'bankAccount', label: 'Bank Account' },
        { key: 'checkNumber', label: 'Check Number' },
      ]
    : [
        { key: 'glAccount', label: 'GL Account' },
        { key: 'reference', label: 'Reference' },
        { key: 'department', label: 'Department' },
        { key: 'class', label: 'Class' },
      ]
  
  // Try to auto-detect and suggest mappings
  useEffect(() => {
    const suggestions = {
      dateColumn: findBestMatch(['date', 'transaction date', 'trans date', 'post date'], headers),
      amountColumn: findBestMatch(['amount', 'sum', 'transaction amount', 'debit', 'credit'], headers),
      descriptionColumn: findBestMatch(['description', 'memo', 'narrative', 'details', 'note'], headers),
    }
    
    // Add suggestions for additional fields
    additionalFields.forEach(field => {
      switch (field.key) {
        case 'bankAccount':
          suggestions[field.key] = findBestMatch(['account', 'bank account', 'acct'], headers)
          break
          
        case 'checkNumber':
          suggestions[field.key] = findBestMatch(['check', 'check no', 'check number', 'cheque'], headers)
          break
          
        case 'glAccount':
          suggestions[field.key] = findBestMatch(['account', 'gl account', 'gl', 'account code'], headers)
          break
          
        case 'reference':
          suggestions[field.key] = findBestMatch(['reference', 'ref', 'ref no', 'transaction id'], headers)
          break
          
        case 'department':
          suggestions[field.key] = findBestMatch(['department', 'dept', 'cost center'], headers)
          break
          
        case 'class':
          suggestions[field.key] = findBestMatch(['class', 'category', 'segment'], headers)
          break
      }
    })
    
    setMapping(suggestions)
  }, [headers, additionalFields])
  
  // Find the best matching header from a list of possible names
  const findBestMatch = (possibleNames: string[], availableHeaders: string[]): string => {
    // Check for exact matches first
    for (const name of possibleNames) {
      const exactMatch = availableHeaders.find(
        header => header.toLowerCase() === name.toLowerCase()
      )
      if (exactMatch) return exactMatch
    }
    
    // Then check for partial matches
    for (const name of possibleNames) {
      const partialMatch = availableHeaders.find(
        header => header.toLowerCase().includes(name.toLowerCase())
      )
      if (partialMatch) return partialMatch
    }
    
    return ''
  }
  
  const handleSelectChange = (field: string, value: string) => {
    setMapping(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  const handleSubmit = () => {
    // Validate required fields
    if (!mapping.dateColumn || !mapping.amountColumn || !mapping.descriptionColumn) {
      alert('Date, Amount and Description columns are required')
      return
    }
    
    // Create full mapping with fileName and sourceType
    const fullMapping: FileMapping = {
      fileName,
      sourceType,
      ...mapping
    }
    
    onMappingComplete(fullMapping)
  }
  
  const handleSaveMapping = () => {
    if (!saveMappingName.trim()) {
      alert('Please enter a name for this mapping template')
      return
    }
    
    // TODO: Save the mapping template to your storage
    console.log('Saving mapping template:', saveMappingName, mapping)
    
    // Reset and hide the save form
    setSaveMappingName('')
    setShowSaveMapping(false)
  }
  
  const loadSavedMapping = (savedMapping: FileMapping) => {
    setMapping({
      dateColumn: savedMapping.dateColumn,
      amountColumn: savedMapping.amountColumn,
      descriptionColumn: savedMapping.descriptionColumn,
      ...Object.fromEntries(
        // Copy over additional fields if they exist in the saved mapping
        additionalFields.map(field => [
          field.key, 
          savedMapping[field.key] || ''
        ])
      )
    })
  }
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Map Columns for {sourceType === 'bank' ? 'Bank Statement' : 'General Ledger'}
      </h2>
      
      {savedMappings.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Load a saved template
          </label>
          <div className="flex flex-wrap gap-2">
            {savedMappings.map((savedMapping, index) => (
              <button
                key={index}
                type="button"
                onClick={() => loadSavedMapping(savedMapping)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {savedMapping.fileName}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        {/* Required fields */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Column*
            </label>
            <select
              value={mapping.dateColumn}
              onChange={(e) => handleSelectChange('dateColumn', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              required
            >
              <option value="">Select column</option>
              {headers.map((header) => (
                <option key={header} value={header}>
                  {header}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount Column*
            </label>
            <select
              value={mapping.amountColumn}
              onChange={(e) => handleSelectChange('amountColumn', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              required
            >
              <option value="">Select column</option>
              {headers.map((header) => (
                <option key={header} value={header}>
                  {header}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description Column*
            </label>
            <select
              value={mapping.descriptionColumn}
              onChange={(e) => handleSelectChange('descriptionColumn', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              required
            >
              <option value="">Select column</option>
              {headers.map((header) => (
                <option key={header} value={header}>
                  {header}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Additional fields based on source type */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {additionalFields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              <select
                value={mapping[field.key] || ''}
                onChange={(e) => handleSelectChange(field.key, e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="">Select column (optional)</option>
                {headers.map((header) => (
                  <option key={header} value={header}>
                    {header}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 flex justify-between">
        <div>
          {!showSaveMapping ? (
            <button
              type="button"
              onClick={() => setShowSaveMapping(true)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Save as Template
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={saveMappingName}
                onChange={(e) => setSaveMappingName(e.target.value)}
                placeholder="Template name"
                className="block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={handleSaveMapping}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowSaveMapping(false)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        
        <button
          type="button"
          onClick={handleSubmit}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
