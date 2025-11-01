# BlockTrust AI - Blockchain Integration Guide

## Overview
This document explains the blockchain architecture, smart contract templates, and deployment process for BlockTrust AI's decentralized voting and petition platform.

---

## Smart Contract Architecture

### 1. **VotingTemplate.sol**
Configurable voting contract supporting multiple simultaneous elections.

**Features:**
- ✅ Template-based event creation
- ✅ Configurable voting options
- ✅ Time-bound voting periods
- ✅ Role-based access (admin, voters)
- ✅ One vote per address
- ✅ IPFS metadata storage
- ✅ Vote result transparency

**Key Functions:**
```solidity
createVotingEvent(title, description, options, startTime, endTime, ipfsHash)
castVote(eventId, optionIndex)
authorizeVoter(voterAddress)
finalizeEvent(eventId, resultsIpfsHash)
getResults(eventId)
```

---

### 2. **PetitionTemplate.sol**
Configurable petition contract for signature collection campaigns.

**Features:**
- ✅ Template-based petition creation
- ✅ Target signature goals
- ✅ Time-bound campaigns
- ✅ Signature comments
- ✅ One signature per address
- ✅ IPFS metadata storage
- ✅ Progress tracking

**Key Functions:**
```solidity
createPetition(title, description, targetSignatures, startTime, endTime, ipfsHash)
signPetition(petitionId, comment)
authorizeSigner(signerAddress)
finalizePetition(petitionId, resultsIpfsHash)
hasReachedTarget(petitionId)
```

---

### 3. **SurveyTemplate.sol**
Configurable survey contract for collecting structured feedback.

**Features:**
- ✅ Multiple question types
- ✅ Multiple choice and open-ended questions
- ✅ Time-bound surveys
- ✅ Anonymous responses
- ✅ IPFS result storage
- ✅ Aggregated analytics

**Key Functions:**
```solidity
createSurvey(title, description, startTime, endTime, ipfsHash)
addQuestion(surveyId, questionText, options, isMultipleChoice)
submitResponse(surveyId, answers)
finalizeSurvey(surveyId, resultsIpfsHash)
```

---

## Deployment Process

### Prerequisites

1. **Install Dependencies:**
```bash
npm install
# or
yarn install
```

2. **Set Up Environment Variables:**
Copy `.env.example` to `.env` and configure:
```bash
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=your_testnet_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_key
```

3. **Get Testnet ETH/MATIC:**
- **Sepolia Faucet:** https://sepoliafaucet.com
- **Mumbai Faucet:** https://mumbaifaucet.com
- **Amoy Faucet:** https://faucet.polygon.technology

---

### Compile Contracts

```bash
npm run compile
```

This generates:
- ABI files in `artifacts/contracts/`
- TypeChain type definitions
- Deployment artifacts

---

### Test Contracts Locally

```bash
npm run test:contracts
```

Runs Hardhat test suite with gas reporting.

---

### Deploy to Testnet

#### Deploy All Contracts (Voting + Petition + Survey):
```bash
# Sepolia Testnet
npm run deploy:sepolia

# Polygon Mumbai Testnet
npm run deploy:mumbai

# Polygon Amoy Testnet (Mumbai replacement)
npm run deploy:amoy
```

#### Deploy Individual Contracts:
```bash
# Voting only
npx hardhat run scripts/deploy-voting.ts --network sepolia

# Petition only
npx hardhat run scripts/deploy-petition.ts --network sepolia
```

---

### Verify Contracts on Etherscan

After deployment, verify contracts for transparency:

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

Verification is automatically attempted during deployment if `ETHERSCAN_API_KEY` is set.

---

## IPFS Integration

### Why IPFS?
- **Immutable Storage:** Event metadata, vote results, and petition signatures
- **Decentralized:** No single point of failure
- **Cost-Effective:** Cheaper than storing large data on-chain
- **Verifiable:** IPFS hashes stored on blockchain for verification

### Setup Pinata (IPFS Provider)

1. **Sign up:** https://pinata.cloud (free tier available)
2. **Get API Keys:** Dashboard → API Keys → New Key
3. **Add to Supabase Secrets:**
   - `PINATA_API_KEY`
   - `PINATA_SECRET_API_KEY`

### Using IPFS in Edge Functions

```typescript
// Upload event data to IPFS
const response = await supabase.functions.invoke('ipfs', {
  body: {
    action: 'upload',
    data: eventData,
    metadata: {
      name: 'voting-event-123',
      type: 'voting',
      description: 'Presidential Election 2024'
    }
  }
});

const ipfsHash = response.data.ipfsHash;
// Store ipfsHash in database and smart contract
```

### Retrieve from IPFS

```typescript
const response = await supabase.functions.invoke('ipfs?action=retrieve&hash=' + ipfsHash);
const eventData = response.data.data;
```

---

## Template Management System

### Admin Dashboard Features

Admins can manage blockchain templates through the `template-manager` edge function:

#### Create Template
```typescript
const response = await supabase.functions.invoke('template-manager?action=create-template', {
  method: 'POST',
  body: {
    name: 'Municipal Voting Template',
    type: 'voting',
    description: 'Template for city-wide elections',
    config: {
      maxOptions: 10,
      votingDuration: 7 * 24 * 60 * 60, // 7 days
      requireVerification: true
    }
  }
});
```

#### Deploy Contract from Template
```typescript
const response = await supabase.functions.invoke('template-manager?action=deploy-contract', {
  method: 'POST',
  body: {
    templateId: 'template-uuid',
    networkId: 'sepolia',
    contractParams: {
      title: '2024 City Council Election',
      options: ['Candidate A', 'Candidate B', 'Candidate C'],
      startTime: 1704067200, // Unix timestamp
      endTime: 1704672000
    }
  }
});
```

#### List Deployed Contracts
```typescript
const response = await supabase.functions.invoke('template-manager?action=list-deployments');
const deployments = response.data.deployments;
```

---

## Network Configuration

### Supported Networks

| Network | Chain ID | Type | Use Case |
|---------|----------|------|----------|
| Hardhat | 31337 | Local | Development & Testing |
| Sepolia | 11155111 | Testnet | Ethereum testing |
| Mumbai | 80001 | Testnet | Polygon testing (deprecated) |
| Amoy | 80002 | Testnet | Polygon testing (new) |

### RPC Endpoints

**Infura:** https://infura.io  
**Alchemy:** https://alchemy.com  
**Public RPCs:** https://chainlist.org

---

## Gas Optimization

### Contract Optimizations
- ✅ Efficient storage patterns (mapping over arrays)
- ✅ Batch operations (authorizeVoters)
- ✅ Events for off-chain indexing
- ✅ View functions for free reads

### Deployment Cost Estimates

| Contract | Sepolia ETH | Mumbai MATIC |
|----------|-------------|--------------|
| VotingTemplate | ~0.015 ETH | ~0.05 MATIC |
| PetitionTemplate | ~0.012 ETH | ~0.04 MATIC |
| SurveyTemplate | ~0.018 ETH | ~0.06 MATIC |

*Prices vary with gas costs*

---

## Security Features

### Smart Contract Security
- ✅ OpenZeppelin patterns
- ✅ Access control (onlyAdmin, onlyAuthorizedVoter)
- ✅ Reentrancy protection
- ✅ Time-bound validation
- ✅ Input validation
- ✅ Event logging

### Backend Security
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ Rate limiting
- ✅ Input sanitization
- ✅ CORS configuration

---

## Testing

### Run Contract Tests
```bash
npm run test:contracts
```

### Gas Reporting
```bash
REPORT_GAS=true npm run test:contracts
```

### Coverage Report
```bash
npm run coverage
```

---

## Production Deployment

### Mainnet Deployment Checklist

- [ ] Audit smart contracts (Trail of Bits, OpenZeppelin)
- [ ] Configure mainnet RPC endpoints
- [ ] Fund deployer wallet with sufficient gas
- [ ] Update frontend contract addresses
- [ ] Set up monitoring (Tenderly, Etherscan alerts)
- [ ] Configure IPFS production settings
- [ ] Test on testnet with production data
- [ ] Deploy with multi-sig wallet (Gnosis Safe)
- [ ] Verify contracts on Etherscan
- [ ] Update documentation

---

## Monitoring & Analytics

### Blockchain Explorer Links

After deployment, track contracts at:

- **Sepolia:** https://sepolia.etherscan.io
- **Mumbai:** https://mumbai.polygonscan.com
- **Amoy:** https://amoy.polygonscan.com

### Event Indexing

Smart contracts emit events for:
- Voting event creation
- Vote casting
- Petition creation
- Petition signing
- Contract deployment

Index events using:
- The Graph Protocol
- Moralis
- Alchemy Notify

---

## Troubleshooting

### Common Issues

**"Insufficient funds for gas"**
- Get testnet tokens from faucets
- Check wallet balance

**"Contract verification failed"**
- Ensure constructor args match
- Use same Solidity version
- Check API key configuration

**"Transaction reverted"**
- Check voting period (must be active)
- Verify user authorization
- Ensure no duplicate votes

**"IPFS upload failed"**
- Verify Pinata API keys
- Check rate limits
- Use simulate-upload for testing

---

## Resources

- **Hardhat Docs:** https://hardhat.org/docs
- **Ethers.js:** https://docs.ethers.org
- **OpenZeppelin:** https://docs.openzeppelin.com/contracts
- **Pinata IPFS:** https://docs.pinata.cloud
- **Polygon Docs:** https://docs.polygon.technology

---

## Next Steps

1. ✅ Deploy contracts to testnet
2. ✅ Configure IPFS integration
3. ✅ Test template deployment
4. ✅ Integrate frontend with contracts
5. ⏳ Audit contracts for mainnet
6. ⏳ Set up event monitoring
7. ⏳ Deploy to mainnet

---

**BlockTrust AI** - Decentralized Governance Made Simple 🚀
