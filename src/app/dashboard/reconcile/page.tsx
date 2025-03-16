'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { v4 as uuidv4 } from 'uuid'
import { 
  PlusIcon, 
  ArrowPathIcon, 
  DocumentTextIcon,
  ChevronRightIcon,
  BeakerIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'

import useReconciliationStore from '@/store/reconciliationStore'
import { ReconciliationProject } from '@/types'

export default function ReconciliationPage() {
  const [recentProjects, setRecentProjects] = useState<ReconciliationProject[]>([
    {
      id: 'demo-1',
      name: 'March 2025 Reconciliation',
      periodStart: '2025-03-01',
      periodEnd: '2025-03-31',
      status: 'in_progress',
      bankAccount: 'Main Operating Account',
      createdAt: '2025-03-10T12:00:00Z',
      updatedAt: '2025-03-15T09:30:00Z',
      bankFileCount: 1,
      glFileCount: 1,
      bankTransactionCount: 143,
      glTransactionCount: 167,
      matchedTransactionCount: 132,
      matchRate: 92.3,
      lastActivity: '2025-03-15T09:30:00Z'
    },
    {
      id: 'demo-2',
      name: 'February 2025 Reconciliation',
      periodStart: '2025-02-01',
      periodEnd: '2025-02-29',
      status: 'completed',
      bankAccount: 'Main Operating Account',
      createdAt: '2025-02-10T14:20:00Z',
      updatedAt: '2025-02-18T16:45:00Z',
      bankFileCount: 1,
      glFileCount: 2,
      bankTransactionCount: 118,
      glTransactionCount: 132,
      matchedTransactionCount: 114,
      matchRate: 96.6,
      lastActivity: '2025-02-18T16:45:00Z'
    }
  ])
  
  const setCurrentProject = useReconciliationStore(state => state.setCurrentProject)
  
  const createNewProject = () => {
    // In a real application, this would save to a database first
    const newProject: ReconciliationProject = {
      id: uuidv4(),
      name: `New Reconciliation - ${format(new Date(), 'MMM yyyy')}`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      bankFileCount: 0,
      glFileCount: 0,
      bankTransactionCount: 0,
      glTransactionCount: 0,
      matchedTransactionCount: 0,
      matchRate: 0
    }
    
    // Set as current project in the store
    setCurrentProject(newProject)
    
    // Navigate to the new reconciliation page
    window.location.href = `/dashboard/reconcile/new`
  }
  
  // In a real app, this would fetch from an API
  useEffect(() => {
    // Simulating API fetch
    const fetchProjects = () => {
      // We're using the mock data already defined above
      // In a real app, you'd fetch from an API here
    }
    
    fetchProjects()
  }, [])
  
  // Helper function to format dates
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A'
    return format(new Date(dateString), 'MMM d, yyyy')
  }
  
  // Helper function to format dates with time
  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return 'N/A'
    return format(new Date(dateString), 'MMM d, yyyy h:mm a')
  }
  
  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reconciliations</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create, manage and view your bank reconciliations
          </p>
        </div>
        
        <button
          type="button"
          onClick={createNewProject}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Reconciliation
        </button>
      </div>
      
      {/* Recent reconciliations */}
      <div className="bg-white shadow overflow-hidden rounded-md mb-8">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Recent Reconciliations</h2>
          <Link 
            href="/dashboard/reconcile/all" 
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View all
          </Link>
        </div>
        
        <div className="border-t border-gray-200">
          <ul role="list" className="divide-y divide-gray-200">
            {recentProjects.length === 0 ? (
              <li className="px-4 py-5 sm:px-6 text-center text-gray-500">
                No reconciliations found. Create your first one!
              </li>
            ) : (
              recentProjects.map((project) => (
                <li key={project.id} className="hover:bg-gray-50">
                  <Link 
                    href={`/dashboard/reconcile/${project.id}`} 
                    className="block"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="truncate">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-primary-600 truncate">
                              {project.name}
                            </p>
                            <div className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              project.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : project.status === 'in_progress'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}>
                              {project.status === 'completed' 
                                ? 'Completed' 
                                : project.status === 'in_progress'
                                  ? 'In Progress'
                                  : 'Draft'
                              }
                            </div>
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            {project.bankAccount && (
                              <>
                                <span className="truncate">{project.bankAccount}</span>
                                <span className="mx-1">•</span>
                              </>
                            )}
                            
                            {project.periodStart && project.periodEnd && (
                              <span className="truncate">
                                {formatDate(project.periodStart)} - {formatDate(project.periodEnd)}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="ml-2 flex flex-col text-right">
                            <div className="flex items-center">
                              <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                                <div 
                                  className="h-full rounded-full bg-primary-600" 
                                  style={{ width: `${project.matchRate}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-500">{project.matchRate.toFixed(1)}%</span>
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                              Last activity: {formatDateTime(project.lastActivity)}
                            </div>
                          </div>
                          <ChevronRightIcon className="h-5 w-5 text-gray-400 ml-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
      
      {/* Information tiles */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <ArrowPathIcon className="h-6 w-6 text-primary-600" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    How It Works
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <p className="mb-2">
                      Recked automates the bank reconciliation process by matching transactions
                      between your bank statements and general ledger.
                    </p>
                    <Link
                      href="/dashboard/help/how-it-works"
                      className="text-primary-600 hover:text-primary-800 font-medium"
                    >
                      Learn more
                    </Link>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <DocumentTextIcon className="h-6 w-6 text-primary-600" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Supported File Formats
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <ul className="list-disc pl-5 mb-2 space-y-1">
                      <li>Excel files (.xlsx, .xls)</li>
                      <li>CSV files (.csv)</li>
                      <li>Bank exports (most major banks)</li>
                    </ul>
                    <Link
                      href="/dashboard/help/file-formats"
                      className="text-primary-600 hover:text-primary-800 font-medium"
                    >
                      View examples
                    </Link>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <QuestionMarkCircleIcon className="h-6 w-6 text-primary-600" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Need Help?
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <p className="mb-2">
                      Get help with file imports, column mapping, and transaction matching.
                    </p>
                    <Link
                      href="/dashboard/help"
                      className="text-primary-600 hover:text-primary-800 font-medium block mb-1"
                    >
                      View documentation
                    </Link>
                    <a
                      href="mailto:support@venice.ai"
                      className="text-primary-600 hover:text-primary-800 font-medium"
                    >
                      Contact support
                    </a>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
