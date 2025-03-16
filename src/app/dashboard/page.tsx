'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { ArrowTrendingUpIcon, DocumentTextIcon, ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export default function Dashboard() {
  const { user } = useUser()
  const [recentProjects, setRecentProjects] = useState([
    { id: 'demo-1', name: 'March 2025 Reconciliation', date: '2025-03-10', status: 'In Progress', matchRate: 92 },
    { id: 'demo-2', name: 'February 2025 Reconciliation', date: '2025-02-15', status: 'Completed', matchRate: 97 },
    { id: 'demo-3', name: 'January 2025 Reconciliation', date: '2025-01-12', status: 'Completed', matchRate: 95 },
  ])

  const stats = [
    { name: 'Total Reconciliations', value: 12, icon: DocumentTextIcon },
    { name: 'Average Match Rate', value: '94%', icon: CheckCircleIcon },
    { name: 'Active Projects', value: 1, icon: ArrowPathIcon },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {user?.firstName || 'User'}</h1>
        <p className="mt-1 text-sm text-gray-500">Here's an overview of your bank reconciliation activity</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                  <stat.icon className="h-6 w-6 text-primary-600" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stat.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent projects */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Recent Reconciliations</h2>
          <Link href="/dashboard/reconcile/new" className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            New Reconciliation
          </Link>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <div className="overflow-hidden overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match Rate</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentProjects.map((project) => (
                  <tr key={project.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{project.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{project.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        project.status === 'Completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full h-2 bg-gray-200 rounded-full mr-2">
                          <div 
                            className="h-full rounded-full bg-primary-600" 
                            style={{ width: `${project.matchRate}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-500">{project.matchRate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/dashboard/reconcile/${project.id}`} className="text-primary-600 hover:text-primary-900 mr-4">
                        View
                      </Link>
                      {project.status !== 'Completed' && (
                        <Link href={`/dashboard/reconcile/${project.id}`} className="text-primary-600 hover:text-primary-900">
                          Continue
                        </Link>
                      )}
                      {project.status === 'Completed' && (
                        <Link href={`/dashboard/reports/${project.id}`} className="text-primary-600 hover:text-primary-900">
                          Report
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick tips */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Quick Tips</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Make the most of your reconciliation tool</p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Multi-Transaction Matching</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                Use drag and drop to create groups of transactions that should be matched together. This is useful for payments that were split across multiple GL entries.
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Transaction Notes</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                Add notes to any transaction by clicking the note icon. These notes will be included in your reconciliation reports.
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Saving Templates</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                Save your column mappings as templates to speed up future reconciliations with the same file formats.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
