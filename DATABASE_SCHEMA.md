# BlockTrust AI - Database Schema Documentation

## Overview
BlockTrust AI uses **Lovable Cloud (PostgreSQL)** as its primary database, storing all application data, user information, voting/petition events, and blockchain transaction records.

---

## Database Tables

### 1. **profiles**
Stores user profile information.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key, references auth.users |
| `full_name` | text | User's full name |
| `wallet_address` | text | Blockchain wallet address (optional) |
| `created_at` | timestamp | Account creation timestamp |
| `updated_at` | timestamp | Last profile update timestamp |

**RLS Policies:**
- Users can view all profiles
- Users can update their own profile
- Users can insert their own profile

---

### 2. **user_roles**
Implements role-based access control (RBAC).

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | References profiles(id) |
| `role` | app_role | Enum: 'admin', 'voter', 'petitioner' |
| `created_at` | timestamp | Role assignment timestamp |

**RLS Policies:**
- Only admins can manage roles
- All users can view roles

**Security:** Uses `has_role()` function to prevent recursive RLS issues.

---

### 3. **voting_events**
Stores blockchain-based voting events.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `title` | text | Voting event title |
| `description` | text | Event description |
| `options` | jsonb | Array of voting options |
| `start_time` | timestamp | Event start time |
| `end_time` | timestamp | Event end time |
| `status` | event_status | Enum: 'draft', 'active', 'completed', 'cancelled' |
| `total_votes` | integer | Total number of votes cast |
| `blockchain_hash` | text | IPFS/blockchain transaction hash |
| `created_by` | uuid | Admin who created the event |
| `created_at` | timestamp | Creation timestamp |
| `updated_at` | timestamp | Last update timestamp |

**RLS Policies:**
- Admins can create, update, and delete voting events
- Anyone can view active voting events
- Creators can view their own draft events

---

### 4. **votes**
Stores individual vote records.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `voting_event_id` | uuid | References voting_events(id) |
| `user_id` | uuid | References profiles(id) |
| `vote_option` | text | Selected voting option |
| `blockchain_hash` | text | Transaction hash on blockchain |
| `created_at` | timestamp | Vote timestamp |

**RLS Policies:**
- Voters can cast votes (must have 'voter' role)
- Users can view their own votes
- Admins can view all votes

**Triggers:**
- `increment_vote_count()`: Automatically increments `total_votes` in `voting_events`

---

### 5. **petition_events**
Stores blockchain-based petition campaigns.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `title` | text | Petition title |
| `description` | text | Petition description |
| `start_time` | timestamp | Campaign start time |
| `end_time` | timestamp | Campaign end time |
| `status` | event_status | Enum: 'draft', 'active', 'completed', 'cancelled' |
| `target_signatures` | integer | Target number of signatures |
| `current_signatures` | integer | Current number of signatures |
| `blockchain_hash` | text | IPFS/blockchain transaction hash |
| `created_by` | uuid | Petitioner who created it |
| `created_at` | timestamp | Creation timestamp |
| `updated_at` | timestamp | Last update timestamp |

**RLS Policies:**
- Petitioners and admins can create petitions
- Anyone can view active petitions
- Creators and admins can update petitions

---

### 6. **petition_signatures**
Stores individual petition signatures.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `petition_id` | uuid | References petition_events(id) |
| `user_id` | uuid | References profiles(id) |
| `comment` | text | Optional signature comment |
| `blockchain_hash` | text | Transaction hash on blockchain |
| `created_at` | timestamp | Signature timestamp |

**RLS Policies:**
- Users can sign petitions
- Anyone can view all signatures

**Triggers:**
- `increment_signature_count()`: Automatically increments `current_signatures` in `petition_events`

---

### 7. **blockchain_transactions**
Logs all blockchain-related transactions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `transaction_hash` | text | Blockchain transaction hash |
| `transaction_type` | text | Type: 'vote', 'petition', 'contract_deployment' |
| `block_number` | bigint | Block number on blockchain |
| `related_id` | uuid | Related event/vote/petition ID |
| `user_id` | uuid | User who initiated transaction |
| `data` | jsonb | Additional transaction metadata |
| `created_at` | timestamp | Transaction timestamp |

**RLS Policies:**
- System can insert transactions
- All users can view blockchain transactions

---

### 8. **event_templates** (New)
Stores reusable event templates for admins.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `name` | text | Template name |
| `type` | text | Template type: 'voting', 'petition', 'survey' |
| `description` | text | Template description |
| `config` | jsonb | Template configuration (options, rules, etc.) |
| `created_by` | uuid | Admin who created template |
| `is_active` | boolean | Whether template is available |
| `created_at` | timestamp | Creation timestamp |
| `updated_at` | timestamp | Last update timestamp |

**RLS Policies:**
- Admins can create, update, and delete templates
- All authenticated users can view active templates

---

### 9. **contract_deployments** (New)
Tracks smart contract deployments.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `template_id` | uuid | References event_templates(id) |
| `contract_address` | text | Deployed contract address |
| `network_id` | text | Network: 'sepolia', 'mumbai', 'amoy' |
| `deployer_id` | uuid | Admin who deployed |
| `deployment_params` | jsonb | Deployment parameters |
| `block_number` | bigint | Deployment block number |
| `status` | text | Status: 'deployed', 'verified', 'failed' |
| `created_at` | timestamp | Deployment timestamp |

**RLS Policies:**
- Admins can create and manage deployments
- All users can view deployment information

---

## Database Functions

### `has_role(_user_id uuid, _role app_role)`
Security definer function to check user roles without triggering recursive RLS.

### `handle_new_user()`
Trigger function that:
- Creates profile for new users
- Assigns default 'voter' role

### `increment_vote_count()`
Trigger function that increments `total_votes` when a vote is cast.

### `increment_signature_count()`
Trigger function that increments `current_signatures` when a petition is signed.

### `handle_updated_at()`
Trigger function that automatically updates `updated_at` timestamp on row changes.

---

## Enums

### `app_role`
- `admin`: Full system access
- `voter`: Can participate in voting
- `petitioner`: Can create petitions

### `event_status`
- `draft`: Event is being configured
- `active`: Event is live
- `completed`: Event has ended
- `cancelled`: Event was cancelled

---

## Data Storage Flow

### Voting Flow:
1. Admin creates voting event → `voting_events`
2. User casts vote → `votes`
3. Vote count incremented → `voting_events.total_votes`
4. Transaction logged → `blockchain_transactions`
5. Results stored on IPFS → `voting_events.blockchain_hash`

### Petition Flow:
1. Petitioner creates petition → `petition_events`
2. User signs petition → `petition_signatures`
3. Signature count incremented → `petition_events.current_signatures`
4. Transaction logged → `blockchain_transactions`
5. Petition data stored on IPFS → `petition_events.blockchain_hash`

### Template Deployment Flow:
1. Admin creates template → `event_templates`
2. Admin deploys contract → `contract_deployments`
3. Deployment logged → `blockchain_transactions`
4. Contract address stored → `contract_deployments.contract_address`

---

## Security Features

✅ **Row-Level Security (RLS)** enabled on all tables  
✅ **Role-based access control** via `user_roles` table  
✅ **Security definer functions** prevent recursive RLS issues  
✅ **JWT authentication** for all API endpoints  
✅ **Automatic timestamps** for audit trails  
✅ **Foreign key constraints** maintain data integrity  

---

## IPFS Integration

Blockchain data and event metadata are stored on **IPFS via Pinata**:
- Voting results
- Petition signatures
- Event configurations
- Contract deployment records

IPFS hashes are stored in `blockchain_hash` columns for immutable data verification.

---

## Backup & Recovery

- **Lovable Cloud** provides automatic backups
- Point-in-time recovery available
- Data can be exported via Supabase dashboard
- Migration files tracked in `supabase/migrations/`

---

## Performance Optimizations

- Indexes on frequently queried columns (user_id, event_id, status)
- JSONB columns for flexible schema
- Automatic vacuum and analyze
- Connection pooling via Supabase

---

This schema provides a secure, scalable foundation for BlockTrust AI's blockchain-as-a-service platform.
