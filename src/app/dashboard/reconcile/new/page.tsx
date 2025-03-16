'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeftIcon,
  ArrowRightIcon,
  CloudArrowUpIcon,
  TableCellsIcon,
  ArrowsRightLeftIcon,
  DocumentCheckIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

import useReconciliationStore from '@/store/reconciliationStore'
import { getFileHeaders, parseTransactionFile } from '@/utils/fileParser'
import { FileMapping } from '@/types'

import FileUploader from '@/components/FileUploader'
import ColumnMapper from '@/components/ColumnMapper'

export default function NewReconciliationPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [activeTab, setActiveTab] = useState<'bank' | 'gl'>('bank')
  
  // File state
  const [bankFile, setBankFile] = useState<File | null>(null)
  const [glFile, setGLFile] = useState<File | null>(null)
  const [bankHeaders, setBankHeaders] = useState<string[]>([])
  const [glHeaders, setGLHeaders] = useState<string[]>([])
  const [bankMapping, setBankMapping] = useState<FileMapping | null>(null)
  const [glMapping, setGLMapping] = useState<FileMapping | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Store state and actions
  const { 
    currentProject,
    addBankTransactions,
    addGLTransactions,
    runAutomaticMatching,
    setActiveView,
  } = useReconciliationStore()
  
  // Load project details
  useEffect(() => {
    if (!currentProject) {
      // No current project, redirect back to reconcile page
      router.push('/dashboard/reconcile')
    }
  }, [currentProject, router])
  
  // Handle bank file upload
  const handleBankFileUpload = async (file: File) => {
    setBankFile(file)
    try {
      const headers = await getFileHeaders(file)
      setBankHeaders(headers)
    } catch (error) {
      console.error('Error reading bank file:', error)
      toast.error('Error reading file. Please check the format and try again.')
    }
  }
  
  // Handle GL file upload
  const handleGLFileUpload = async (file: File) => {
    setGLFile(file)
    try {
      const headers = await getFileHeaders(file)
      setGLHeaders(headers)
    } catch (error) {
      console.error('Error reading GL file:', error)
      toast.error('Error reading file. Please check the format and try again.')
    }
  }
  
  // Handle bank column mapping
  const handleBankMappingComplete = (mapping: FileMapping) => {
    setBankMapping(mapping)
    
    // Switch to GL tab if we don't have that uploaded yet
    if (!glFile) {
      setActiveTab('gl')
    } else if (glMapping) {
      // We have both mappings complete, go to next step
      setStep(2)
    }
  }
  
  // Handle GL column mapping
  const handleGLMappingComplete = (mapping: FileMapping) => {
    setGLMapping(mapping)
    
    // If bank mapping is also complete, go to next step
    if (bankMapping) {
      setStep(2)
    } else {
      // Otherwise switch to bank tab
      setActiveTab('bank')
    }
  }
  
  // Process files and run matching
  const processFiles = async () => {
    if (!bankFile || !bankMapping || !glFile || !glMapping) {
      toast.error('Please upload and map both bank and GL files')
      return
    }
    
    setIsProcessing(true)
    
    try {
      // Parse bank transactions
      const bankTransactions = await parseTransactionFile(bankFile, bankMapping, 'bank')
      
      // Parse GL transactions
      const glTransactions = await parseTransactionFile(glFile, glMapping, 'gl')
      
      // Add transactions to store
      addBankTransactions(bankTransactions)
      addGLTransactions(glTransactions)
      
      // Run automatic matching
      runAutomaticMatching()
      
      // Set active view to match
      setActiveView('match')
      
      // Navigate to reconciliation workspace
      toast.success('Files processed successfully!')
      router.push(`/dashboard/reconcile/${currentProject?.id}/workspace`)
    } catch (error) {
      console.error('Error processing files:', error)
      toast.error('Error processing files. Please check the format and try again.')
    } finally {
      setIsProcessing(false)
    }
  }
  
  // Tabs for file upload
  const tabs = [
    { name: 'Bank Statement', key: 'bank', icon: CloudArrowUpIcon },
    { name: 'General Ledger', key: 'gl', icon: TableCellsIcon },
  ]
  
  // Steps for the process
  const steps = [
    { id: 1, name: 'Upload Files', icon: CloudArrowUpIcon },
    { id: 2, name: 'Match Transactions', icon: ArrowsRightLeftIcon },
    { id: 3, name: 'Review & Finalize', icon: DocumentCheckIcon },
  ]
  
  if (!currentProject) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }
  
  return (
    <div>
      <div className="mb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back
        </button>
        
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">
          {currentProject.name}
        </h1>
        
        <p className="mt-1 text-sm text-gray-500">
          Upload and map your bank statement and general ledger files
        </p>
      </div>
      
      {/* Progress Steps */}
      <nav aria-label="Progress" className="mb-8">
        <ol className="flex items-center">
          {steps.map((stepItem, stepIdx) => (
            <li 
              key={stepItem.id} 
              className={`${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} relative`}
            >
              <div className="flex items-center">
                <div 
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    step === stepItem.id
                      ? 'bg-primary-600'
                      : step > stepItem.id
                        ? 'bg-primary-900'
                        : 'bg-gray-200'
                  }`}
                >
                  <stepItem.icon 
                    className={`h-6 w-6 ${
                      step >= stepItem.id ? 'text-white' : 'text-gray-500'
                    }`} 
                    aria-hidden="true" 
                  />
                </div>
                <div className="ml-4">
                  <p 
                    className={`text-sm font-medium ${
                      step >= stepItem.id ? 'text-primary-900' : 'text-gray-500'
                    }`}
                  >
                    Step {stepItem.id}
                  </p>
                  <p 
                    className={`text-sm ${
                      step >= stepItem.id ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {stepItem.name}
                  </p>
                </div>
              </div>
              
              {stepIdx !== steps.length - 1 && (
                <div className="absolute left-0 top-6 hidden h-0.5 w-full sm:block">
                  <div 
                    className={`h-0.5 ${
                      step > stepItem.id ? 'bg-primary-600' : 'bg-gray-200'
                    }`} 
                  />
                </div>
              )}
            </li>
          ))}
        </ol>
      </nav>
      
      {/* Step 1: Upload and Map Files */}
      {step === 1 && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="sm:hidden">
              <select
                id="tabs"
                name="tabs"
                className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as 'bank' | 'gl')}
              >
                {tabs.map((tab) => (
                  <option key={tab.key} value={tab.key}>
                    {tab.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="hidden sm:block">
              <nav className="flex" aria-label="Tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as 'bank' | 'gl')}
                    className={`
                      ${activeTab === tab.key
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                      whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center
                    `}
                  >
                    <tab.icon className="h-5 w-5 mr-2" />
                    {tab.name}
                    
                    {/* Show check mark if mapped */}
                    {((tab.key === 'bank' && bankMapping) || 
                      (tab.key === 'gl' && glMapping)) && (
                      <svg 
                        className="ml-2 h-5 w-5 text-green-500" 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>
          
          <div className="p-6">
            {/* Bank tab content */}
            {activeTab === 'bank' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Upload Bank Statement
                </h3>
                
                {!bankFile && (
                  <FileUploader
                    onFileAccepted={handleBankFileUpload}
                    label="Upload Bank Statement"
                    helperText="Drag and drop your bank statement file, or click to browse"
                  />
                )}
                
                {bankFile && bankHeaders.length > 0 && !bankMapping && (
                  <ColumnMapper
                    headers={bankHeaders}
                    onMappingComplete={handleBankMappingComplete}
                    sourceType="bank"
                    fileName={bankFile.name}
                    savedMappings={[]}
                  />
                )}
                
                {bankMapping && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">Bank file mapped successfully</h3>
                        <div className="mt-2 text-sm text-green-700">
                          <p>Date column: <strong>{bankMapping.dateColumn}</strong></p>
                          <p>Amount column: <strong>{bankMapping.amountColumn}</strong></p>
                          <p>Description column: <strong>{bankMapping.descriptionColumn}</strong></p>
                        </div>
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => setBankMapping(null)}
                            className="text-sm font-medium text-green-800 hover:text-green-700"
                          >
                            Edit mapping
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* GL tab content */}
            {activeTab === 'gl' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Upload General Ledger
                </h3>
                
                {!glFile && (
                  <FileUploader
                    onFileAccepted={handleGLFileUpload}
                    label="Upload General Ledger"
                    helperText="Drag and drop your general ledger file, or click to browse"
                  />
                )}
                
                {glFile && glHeaders.length > 0 && !glMapping && (
                  <ColumnMapper
                    headers={glHeaders}
                    onMappingComplete={handleGLMappingComplete}
                    sourceType="gl"
                    fileName={glFile.name}
                    savedMappings={[]}
                  />
                )}
                
                {glMapping && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">GL file mapped successfully</h3>
                        <div className="mt-2 text-sm text-green-700">
                          <p>Date column: <strong>{glMapping.dateColumn}</strong></p>
                          <p>Amount column: <strong>{glMapping.amountColumn}</strong></p>
                          <p>Description column: <strong>{glMapping.descriptionColumn}</strong></p>
                        </div>
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => setGLMapping(null)}
                            className="text-sm font-medium text-green-800 hover:text-green-700"
                          >
                            Edit mapping
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={processFiles}
                disabled={!bankMapping || !glMapping || isProcessing}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                  !bankMapping || !glMapping || isProcessing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                }`}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    Run Automatic Matching
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Step 2: Explanation of next steps */}
      {step === 2 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Ready to Process Files
          </h3>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">What happens next?</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>When you click the button below, Recked will:</p>
                  <ol className="list-decimal pl-5 mt-2 space-y-1">
                    <li>Process both your bank statement and general ledger files</li>
                    <li>Run automatic matching algorithms to find matching transactions</li>
                    <li>Present the results in an interactive workspace</li>
                  </ol>
                  <p className="mt-2">You'll be able to review matches, resolve any unmatched transactions, and generate a final reconciliation report.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Files
            </button>
            
            <button
              type="button"
              onClick={processFiles}
              disabled={isProcessing}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                isProcessing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
              }`}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  Process Files and Continue
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
