import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import { BankTransaction, GLTransaction, FileMapping } from '@/types';
import { format, parse, isValid } from 'date-fns';

/**
 * Parse an Excel or CSV file and convert it to transaction data
 */
export const parseTransactionFile = async (
  file: File,
  mapping: FileMapping,
  sourceType: 'bank' | 'gl'
): Promise<BankTransaction[] | GLTransaction[]> => {
  try {
    // Read the file as an array buffer
    const buffer = await file.arrayBuffer();
    
    // Parse the workbook
    const workbook = XLSX.read(buffer, { type: 'array' });
    
    // Assume first sheet if not specified
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Get header row and find column indices
    const headers = data[0] as string[];
    const dateColumnIndex = headers.findIndex(h => h === mapping.dateColumn);
    const amountColumnIndex = headers.findIndex(h => h === mapping.amountColumn);
    const descriptionColumnIndex = headers.findIndex(h => h === mapping.descriptionColumn);
    
    // Validate required columns exist
    if (dateColumnIndex === -1 || amountColumnIndex === -1 || descriptionColumnIndex === -1) {
      throw new Error('Required columns not found in file');
    }
    
    // Process rows (skip header row)
    const transactions = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i] as any[];
      
      // Skip empty rows
      if (!row || row.length === 0) continue;
      
      // Extract values
      const rawDate = row[dateColumnIndex];
      const rawAmount = row[amountColumnIndex];
      const description = row[descriptionColumnIndex] || 'No description';
      
      // Parse date (handle various formats)
      let parsedDate;
      if (typeof rawDate === 'string') {
        // Try common date formats
        const dateFormats = ['MM/dd/yyyy', 'yyyy-MM-dd', 'MM-dd-yyyy', 'dd/MM/yyyy'];
        for (const format of dateFormats) {
          const attemptParse = parse(rawDate, format, new Date());
          if (isValid(attemptParse)) {
            parsedDate = attemptParse;
            break;
          }
        }
      } else if (rawDate instanceof Date) {
        parsedDate = rawDate;
      }
      
      // Skip row if date couldn't be parsed
      if (!parsedDate) continue;
      
      // Format date consistently
      const date = format(parsedDate, 'yyyy-MM-dd');
      
      // Parse amount (handle currency symbols, parentheses for negatives, etc.)
      let amount: number;
      if (typeof rawAmount === 'number') {
        amount = rawAmount;
      } else {
        // Remove currency symbols, commas, and handle parentheses for negative values
        const amountStr = String(rawAmount)
          .replace(/[$,£€]/g, '')
          .trim();
        
        if (amountStr.startsWith('(') && amountStr.endsWith(')')) {
          // Negative amount in parentheses
          amount = -parseFloat(amountStr.slice(1, -1));
        } else {
          amount = parseFloat(amountStr);
        }
      }
      
      // Skip row if amount couldn't be parsed
      if (isNaN(amount)) continue;
      
      // Create transaction object based on source type
      const id = uuidv4();
      
      if (sourceType === 'bank') {
        // Create unique identifier for bank transactions (date + amount)
        const uniqueIdentifier = `${date}-${amount.toFixed(2)}`;
        
        const transaction: BankTransaction = {
          id,
          source: 'bank',
          date,
          amount,
          description,
          uniqueIdentifier,
          matchStatus: 'unmatched',
        };
        
        // Add additional mapped fields if available
        if (mapping.bankAccount) {
          transaction.bankAccount = mapping.bankAccount;
        }
        
        // Add check number if available
        const checkNumberField = Object.entries(mapping).find(([key, value]) => 
          key.toLowerCase().includes('check') && value && headers.includes(value)
        );
        
        if (checkNumberField) {
          const checkColIndex = headers.findIndex(h => h === checkNumberField[1]);
          if (checkColIndex !== -1 && row[checkColIndex]) {
            transaction.checkNumber = String(row[checkColIndex]);
          }
        }
        
        transactions.push(transaction);
        
      } else {
        // GL Transaction
        const transaction: GLTransaction = {
          id,
          source: 'gl',
          date,
          amount,
          description,
          matchStatus: 'unmatched',
        };
        
        // Map additional GL fields if available
        const glAccountField = Object.entries(mapping).find(([key, value]) => 
          key.toLowerCase().includes('account') && value && headers.includes(value)
        );
        
        if (glAccountField) {
          const accountColIndex = headers.findIndex(h => h === glAccountField[1]);
          if (accountColIndex !== -1 && row[accountColIndex]) {
            transaction.glAccount = String(row[accountColIndex]);
          }
        }
        
        // Map reference field if available
        const referenceField = Object.entries(mapping).find(([key, value]) => 
          (key.toLowerCase().includes('reference') || key.toLowerCase().includes('ref')) && 
          value && headers.includes(value)
        );
        
        if (referenceField) {
          const refColIndex = headers.findIndex(h => h === referenceField[1]);
          if (refColIndex !== -1 && row[refColIndex]) {
            transaction.reference = String(row[refColIndex]);
          }
        }
        
        // Map department field if available
        const deptField = Object.entries(mapping).find(([key, value]) => 
          key.toLowerCase().includes('department') && value && headers.includes(value)
        );
        
        if (deptField) {
          const deptColIndex = headers.findIndex(h => h === deptField[1]);
          if (deptColIndex !== -1 && row[deptColIndex]) {
            transaction.department = String(row[deptColIndex]);
          }
        }
        
        // Map class field if available
        const classField = Object.entries(mapping).find(([key, value]) => 
          key.toLowerCase().includes('class') && value && headers.includes(value)
        );
        
        if (classField) {
          const classColIndex = headers.findIndex(h => h === classField[1]);
          if (classColIndex !== -1 && row[classColIndex]) {
            transaction.class = String(row[classColIndex]);
          }
        }
        
        transactions.push(transaction);
      }
    }
    
    return transactions;
    
  } catch (error) {
    console.error('Error parsing file:', error);
    throw error;
  }
};

/**
 * Get column headers from an Excel or CSV file
 */
export const getFileHeaders = async (file: File): Promise<string[]> => {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Return the first row as headers
    if (data.length > 0) {
      return data[0] as string[];
    }
    
    return [];
  } catch (error) {
    console.error('Error getting file headers:', error);
    throw error;
  }
};
