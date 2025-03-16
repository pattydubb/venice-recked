'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface FileUploaderProps {
  onFileAccepted: (file: File) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  label?: string;
  helperText?: string;
  multiple?: boolean;
}

export default function FileUploader({
  onFileAccepted,
  accept = {
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'text/csv': ['.csv']
  },
  maxSize = 5242880, // 5MB
  label = 'Upload File',
  helperText = 'Drag and drop an Excel or CSV file here, or click to browse',
  multiple = false
}: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length) {
      const selectedFile = acceptedFiles[0]
      setFile(selectedFile)
      onFileAccepted(selectedFile)
    }
  }, [onFileAccepted])
  
  const { 
    getRootProps, 
    getInputProps, 
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false, // Force single file upload
    onDropRejected: (rejections) => {
      const rejection = rejections[0]
      
      if (rejection.errors[0].code === 'file-too-large') {
        toast.error(`File is too large. Maximum size is ${maxSize / 1024 / 1024}MB.`)
      } else if (rejection.errors[0].code === 'file-invalid-type') {
        toast.error('Unsupported file type. Please upload an Excel or CSV file.')
      } else {
        toast.error('Invalid file. Please try again.')
      }
    }
  })
  
  const removeFile = () => {
    setFile(null)
  }
  
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      
      {!file && (
        <div 
          {...getRootProps()} 
          className={`dropzone ${
            isDragActive ? 'active border-primary-500' : 'border-gray-300'
          } ${isDragReject ? 'border-red-500 bg-red-50' : ''}`}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center justify-center text-center p-6">
            <ArrowUpTrayIcon className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-1">{helperText}</p>
            <p className="text-xs text-gray-500">
              Supported formats: .xlsx, .xls, .csv
            </p>
            
            {isDragAccept && (
              <p className="text-sm font-medium text-primary-600 mt-2">
                Drop to upload
              </p>
            )}
            
            {isDragReject && (
              <p className="text-sm font-medium text-red-600 mt-2">
                Invalid file type
              </p>
            )}
          </div>
        </div>
      )}
      
      {file && (
        <div className="border border-gray-300 rounded-lg p-4 mt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-primary-100 p-2 rounded-md">
                <ArrowUpTrayIcon className="h-5 w-5 text-primary-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={removeFile}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
