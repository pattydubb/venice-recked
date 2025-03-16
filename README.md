# Recked - Intelligent Bank Reconciliation Tool for Venice.ai

![Recked Logo](https://via.placeholder.com/800x200?text=Recked+by+Venice.ai)

Recked is a powerful, AI-enhanced bank reconciliation tool designed for the Venice.ai accounting platform. It streamlines the process of matching transactions between bank statements and general ledgers with intelligent algorithms and an intuitive user interface.

## Features

- **Smart Transaction Matching**: Automatically match transactions based on amounts, dates, and descriptions
- **Flexible Matching Combinations**: Support for 1:1, 1:N, N:1, and N:M transaction matching
- **Interactive Interface**: Intuitive drag-and-drop functionality for manual matching
- **Comprehensive Reporting**: Generate detailed reconciliation reports with audit trails
- **Seamless Integration**: Works as a standalone app linked with the Venice.ai Accounting Portal

## Demo

Recked provides a streamlined workflow for bank reconciliation:

1. **Upload Files**: Import your bank statement and general ledger files (Excel, CSV)
2. **Map Columns**: Identify which columns contain dates, amounts, and descriptions
3. **Auto-Match**: Let our intelligent algorithm find matching transactions
4. **Resolve Differences**: Easily identify and resolve unmatched transactions
5. **Generate Reports**: Create detailed reconciliation reports for your records

## Technology Stack

- **Frontend**: React, TypeScript, Next.js, Tailwind CSS
- **State Management**: Zustand
- **File Processing**: SheetJS (xlsx), csv-parse
- **Matching Algorithm**: Custom fuzzy matching with Fuse.js
- **Authentication**: Clerk

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Venice.ai account (for integration)

### Installation

```bash
# Clone the repository
git clone https://github.com/pattydubb/venice-recked.git
cd venice-recked

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Clerk API keys

# Start the development server
npm run dev
```

The application will be available at http://localhost:3000.

## Project Structure

```
venice-recked/
├── public/                # Static assets
├── src/
│   ├── app/               # Next.js app router pages
│   ├── components/        # Reusable UI components
│   ├── store/             # Zustand store for state management
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── .env.example           # Example environment variables
├── next.config.js         # Next.js configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── package.json           # Project dependencies
```

## Key Components

1. **FileUploader**: Handles file uploads with drag-and-drop functionality
2. **ColumnMapper**: Maps columns from uploaded files to required fields
3. **TransactionCard**: Displays individual transactions with their details
4. **MatchGroup**: Shows grouped transactions and matching status
5. **ReconciliationStore**: State management for the reconciliation process

## Usage Notes

### Supported File Formats

Recked supports the following file formats:
- Excel files (.xlsx, .xls)
- CSV files (.csv)
- Exports from most major banking and accounting software

### Column Mapping

The following fields are required for reconciliation:
- **Date**: Transaction date
- **Amount**: Transaction amount (positive for credits, negative for debits)
- **Description**: Transaction description or reference

Additional fields that can enhance matching:
- Bank Account Number
- Check Number
- GL Account Code
- Reference Number
- Department/Class codes

### Matching Logic

Recked uses a multi-step matching process:
1. **Exact Amount Matching**: First identifies transactions with identical amounts
2. **Multi-Transaction Matching**: Finds combinations of transactions that sum to the same amount
3. **Fuzzy Matching**: Uses description and date proximity to suggest potential matches

## Production Deployment

For production deployment, build the optimized version:

```bash
npm run build
npm start
```

Or deploy directly to Vercel:

```bash
npx vercel
```

## Integration with Venice.ai

Recked is designed to integrate seamlessly with the Venice.ai accounting platform:

### Authentication

Recked uses Clerk for authentication, which can be configured to use the same authentication provider as your Venice.ai portal. This allows for single sign-on capabilities.

### Portal Integration

To integrate Recked with the Venice.ai portal:

1. Add Recked to your application list in the Venice Portal:
   - In the Venice Portal admin, navigate to Application Management
   - Add a new application with the URL of your deployed Recked instance
   - Set the appropriate icon and description

2. Configure callback URLs in Clerk:
   - In your Clerk dashboard, add the Venice Portal domain to your allowed redirect URLs
   - Configure the sign-in and sign-up callbacks to return to the Venice Portal

### Data Integration

Recked can be configured to directly access accounting data from Venice:

1. Set the `NEXT_PUBLIC_VENICE_API_URL` in your environment variables
2. Configure API authentication using the Venice API keys
3. Use the data import/export features to synchronize reconciliation status

## Customization

### Styling

The application uses Tailwind CSS for styling. To customize the appearance:

1. Modify the `tailwind.config.js` file to update colors, fonts, and other theme options
2. Edit the global CSS in `src/app/globals.css` for application-wide styles

### White-Labeling

To white-label Recked for your organization:

1. Update the logo and branding in the application
2. Modify the color scheme in `tailwind.config.js`
3. Update application name and meta information in `src/app/layout.tsx`

## Security

Recked takes security seriously:

- All data processing happens client-side; no financial data is sent to external servers
- Authentication is handled by Clerk, a secure authentication provider
- No sensitive data is stored in local storage or cookies
- HTTPS is required for all production deployments

## Contributing

We welcome contributions to Recked! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See the [contributing guidelines](CONTRIBUTING.md) for more details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- The Venice.ai team for their support and integration
- The open-source community for the amazing libraries and tools
- All contributors who have helped make Recked better

## Support

For support, please contact:
- Email: support@venice.ai
- Website: https://venice.ai/support
- GitHub Issues: For bug reports and feature requests
