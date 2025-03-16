# Recked - Intelligent Bank Reconciliation Tool

Recked is a powerful, AI-enhanced bank reconciliation tool designed for the Venice.ai accounting platform. It streamlines the process of matching transactions between bank statements and general ledgers with intelligent algorithms and an intuitive user interface.

## Features

- **Smart Transaction Matching**: Automatically match transactions based on amounts, dates, and descriptions
- **Flexible Matching Combinations**: Support for 1:1, 1:N, N:1, and N:M transaction matching
- **Interactive Interface**: Intuitive drag-and-drop functionality for manual matching
- **Comprehensive Reporting**: Generate detailed reconciliation reports with audit trails
- **Seamless Integration**: Works as a standalone app linked with the Venice.ai Accounting Portal

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Authentication**: Integration with Venice.ai authentication (Clerk)
- **Data Processing**: Efficient algorithms for transaction matching and validation

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Venice.ai account

### Development Setup
```bash
# Clone the repository
git clone https://github.com/pattydubb/venice-recked.git
cd venice-recked

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start the development server
npm run dev
```

## Project Status

This project is currently in active development. Check back for updates!

## License

[MIT](LICENSE)
