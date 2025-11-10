# BlockTrust AI

A Web 3.0 Blockchain-as-a-Service platform for secure voting, petitions, and surveys with AI-powered assistance.

## 🚀 Features

- **Blockchain Templates**: Reusable smart contract templates for voting, petitions, and surveys
- **Multi-Chain Support**: Deploy to Ethereum Sepolia, Polygon Mumbai, and other EVM chains
- **IPFS Integration**: Decentralized storage for event metadata and results
- **AI Chatbot**: Intelligent assistant for platform guidance and support
- **Real-time Dashboard**: Monitor blockchain transactions and event status
- **Secure Authentication**: Role-based access control with JWT
- **Template Management**: Create, deploy, and manage blockchain events dynamically

## 📋 Prerequisites

- Node.js 18+ and npm/bun
- Hardhat for smart contract development
- Supabase account (or Lovable Cloud)
- RPC endpoints for target networks (Alchemy, Infura, or public RPCs)
- Private key for contract deployment (test wallets only!)

## 🛠️ Installation

```bash
# Clone and install dependencies
git clone <repository-url>
cd blocktrust-ai
npm install

# Install Hardhat dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Setup environment variables
cp .env.example .env
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file with the following:

```env
# Frontend (Vite)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key

# Backend / Smart Contracts
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_API_KEY
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
AMOY_RPC_URL=https://rpc-amoy.polygon.technology
DEPLOYER_PRIVATE_KEY=your_test_wallet_private_key

# API Keys for verification (optional)
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
COINMARKETCAP_API_KEY=your_cmc_api_key

# IPFS (for metadata storage)
WEB3_STORAGE_TOKEN=your_web3_storage_token
```

⚠️ **Security Warning**: Never commit private keys or sensitive data. Use test wallets only for development.

## 🧪 Running Tests

```bash
# Run all Hardhat tests
npx hardhat test

# Run specific test file
npx hardhat test test/VotingTemplate.test.ts

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run with coverage
npx hardhat coverage
```

## 📦 Smart Contract Deployment

### Deploy to Hardhat Local Network

```bash
# Start local node
npx hardhat node

# Deploy contracts (in another terminal)
npx hardhat run scripts/deploy.ts --network localhost
```

### Deploy to Sepolia Testnet

```bash
# Deploy all contracts
npx hardhat run scripts/deploy.ts --network sepolia

# Deploy specific contract
npx hardhat run scripts/deploy-voting.ts --network sepolia
npx hardhat run scripts/deploy-petition.ts --network sepolia
```

### Deploy to Polygon Mumbai

```bash
npx hardhat run scripts/deploy.ts --network mumbai
```

### Verify Contracts on Etherscan

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

## 🗄️ Database

The platform uses Supabase (via Lovable Cloud) with the following key tables:

### Core Tables

- **event_templates** - Template definitions for voting, petitions, surveys
- **contract_deployments** - Deployed contract addresses and metadata
- **voting_events** - Active voting events
- **petition_events** - Active petition campaigns  
- **votes** - Individual vote records
- **petition_signatures** - Petition signatures
- **blockchain_transactions** - Transaction logs
- **ipfs_objects** - IPFS content references

See `DATABASE_SCHEMA.md` for complete schema documentation.

**Data Storage**: All data is stored in Supabase PostgreSQL with Row-Level Security (RLS) enabled. Blockchain contracts store hashes and references, while detailed data lives in the database for fast querying.

## 🌐 Frontend Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Key Routes

- `/` - Home page with hero and features
- `/templates` - View and create event templates
- `/deployments` - View deployed contracts
- `/platform` - Main platform dashboard
- `/documentation` - API and contract docs
- `/auth` - Authentication pages

## 📡 Backend API

### Edge Functions

#### Template Manager (`/template-manager`)

```bash
# Create template
POST /template-manager?action=create-template

# Deploy contract
POST /template-manager?action=deploy-contract

# List templates
GET /template-manager?action=list-templates
```

#### IPFS Storage (`/ipfs`)

```bash
# Upload to IPFS
POST /ipfs?action=upload

# Retrieve from IPFS
GET /ipfs?action=retrieve&cid=QmXxx...
```

#### Voting & Petitions

See `/voting` and `/petition` edge functions for event management APIs.

## 🔐 Security

### Smart Contract Security

- OpenZeppelin audited libraries
- Role-based access control
- Reentrancy protection
- Duplicate vote/signature prevention

### Backend Security

- Row Level Security (RLS) on all tables
- JWT authentication
- Service role key server-side only
- Input validation and rate limiting

### Production Checklist

- [ ] Use hardware wallet/HSM for deployments
- [ ] Enable 2FA on admin accounts
- [ ] Rotate API keys regularly
- [ ] Monitor contract events
- [ ] Regular security audits
- [ ] Multi-sig for contract admin

## 📚 Documentation

- [Smart Contracts](./README_BLOCKCHAIN.md) - Detailed contract docs
- [Database Schema](./DATABASE_SCHEMA.md) - Complete DB structure
- [API Reference](#) - Visit `/documentation` in app

## 🏗️ Architecture

```
Frontend (React + TypeScript)
    ↓
Supabase Edge Functions (API)
    ↓
Supabase PostgreSQL Database
    ↓
Blockchain Layer (Ethereum/Polygon)
    ↓
IPFS Storage (Metadata)
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📄 License

MIT License

## 🆘 Support

- Documentation: `/documentation` route
- GitHub Issues: Create an issue
- Email: support@blocktrust.ai

## 🎯 Roadmap

- [ ] Multi-signature admin
- [ ] Layer 2 scaling (Optimism, Arbitrum)
- [ ] Mobile app
- [ ] Advanced analytics
- [ ] Quadratic voting
- [ ] Zero-knowledge proofs
- [ ] Contract upgrades

---

**Project URL**: https://lovable.dev/projects/f1feb8fc-4add-4c9b-9a18-1f68eea6f904
