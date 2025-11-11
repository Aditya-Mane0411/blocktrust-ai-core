# Admin Dashboard & Event Management

Complete guide for administrators to manage the BlockTrust AI platform, create events, and monitor blockchain transactions.

## Table of Contents

1. [Admin Access](#admin-access)
2. [Admin Dashboard](#admin-dashboard)
3. [Creating Events](#creating-events)
4. [Managing Templates](#managing-templates)
5. [Monitoring Transactions](#monitoring-transactions)
6. [API Reference](#api-reference)

---

## Admin Access

### Obtaining Admin Role

By default, new users are assigned the "voter" role. To grant admin privileges:

```sql
-- Connect to your Supabase database and run:
INSERT INTO public.user_roles (user_id, role)
VALUES ('<user-id-uuid>', 'admin');
```

### Verifying Admin Access

The system uses a security definer function to check admin status:

```sql
SELECT public.has_role('<user-id-uuid>', 'admin'::app_role);
-- Returns true if user has admin role
```

### Admin Navigation

Once logged in as an admin, access the admin dashboard via:
- Navigation menu: Click "Admin" button
- Direct URL: `/admin`

---

## Admin Dashboard

The admin dashboard provides a comprehensive overview of platform activity.

### Dashboard Sections

#### 1. **Statistics Overview**
- Total voting events
- Total petitions
- Total votes cast
- Blockchain transactions count

#### 2. **Voting Events Tab**
- List all voting events (active, completed, draft)
- View event details
- Monitor vote counts
- Access participant lists

#### 3. **Petitions Tab**
- List all petition campaigns
- Track signature progress
- Monitor completion percentage
- View signatory details

#### 4. **Transactions Tab**
- Blockchain transaction history
- Transaction types and hashes
- Block numbers and timestamps
- Real-time transaction monitoring

#### 5. **Participants Tab** (Dynamic)
- Appears when viewing event details
- Lists all voters or signatories
- Shows wallet addresses
- Displays timestamps and choices

### Dashboard Features

```typescript
// Fetch admin data
const { data } = await supabase.functions.invoke('admin?action=events');

// View participants for specific event
const { data } = await supabase.functions.invoke(
  'admin?action=participants&eventId=<id>&eventType=voting'
);

// Get transaction history
const { data } = await supabase.functions.invoke('admin?action=transactions');
```

---

## Creating Events

### Using Templates

1. **Click "Create New Voting Event" or "Create New Petition"**
2. **Select a Template**:
   - Choose from pre-configured templates
   - Templates include default settings and configurations
3. **Configure Event Details**:
   - Title and description
   - Voting options (for voting events)
   - Target signatures (for petitions)
   - Start and end times
4. **Submit**: Event is created and blockchain transaction is logged

### Voting Event Creation

```typescript
// Example: Create voting event from template
const { data } = await supabase.functions.invoke('admin?action=create-voting', {
  method: 'POST',
  body: {
    title: "Board Election 2025",
    description: "Annual board member election",
    options: ["Candidate A", "Candidate B", "Candidate C"],
    start_time: "2025-01-15T09:00:00Z",
    end_time: "2025-01-30T17:00:00Z",
    template_id: "<template-uuid>"
  }
});
```

### Petition Creation

```typescript
// Example: Create petition from template
const { data } = await supabase.functions.invoke('admin?action=create-petition', {
  method: 'POST',
  body: {
    title: "Community Park Initiative",
    description: "Petition for new community park",
    target_signatures: 1000,
    start_time: "2025-01-15T09:00:00Z",
    end_time: "2025-03-15T23:59:59Z",
    template_id: "<template-uuid>"
  }
});
```

### Event Lifecycle

1. **Draft**: Initial creation state (optional)
2. **Active**: Event is live and accepting participation
3. **Completed**: Event end time reached
4. **Cancelled**: Admin-cancelled event

---

## Managing Templates

### Available Template Types

#### Voting Templates
- **General Election**: Multi-candidate elections
- **Yes/No Poll**: Simple binary decisions
- **Board Election**: Organization board elections

#### Petition Templates
- **Community Petition**: Standard petitions (1,000 target)
- **Policy Change Request**: Large-scale petitions (5,000 target)
- **Local Initiative**: Small community petitions (500 target)

#### Survey Templates
- **Customer Feedback**: Satisfaction surveys
- **Employee Survey**: Internal feedback collection

### Creating Custom Templates

```sql
-- Insert custom template
INSERT INTO public.event_templates (name, type, description, config, created_by)
VALUES (
  'Custom Voting Template',
  'voting',
  'Description of your custom template',
  '{"min_candidates": 2, "max_candidates": 5, "allow_abstain": true}'::jsonb,
  '<admin-user-id>'
);
```

### Template Configuration Options

#### Voting Template Config
```json
{
  "min_candidates": 2,
  "max_candidates": 10,
  "allow_abstain": true,
  "require_verification": true,
  "max_duration_days": 30
}
```

#### Petition Template Config
```json
{
  "default_target": 1000,
  "allow_comments": true,
  "require_verification": true,
  "max_duration_days": 60
}
```

---

## Monitoring Transactions

### Blockchain Transaction Types

- **voting_event_created**: New voting event initiated
- **vote_cast**: Individual vote recorded
- **petition_created**: New petition launched
- **petition_signed**: Petition signature recorded
- **contract_deployed**: Smart contract deployment
- **ipfs_upload**: Metadata stored on IPFS

### Transaction Details

Each transaction includes:
- **Hash**: Unique 64-character hex identifier
- **Type**: Transaction category
- **Block Number**: Simulated block height
- **Timestamp**: Creation time
- **Related ID**: Link to event/action
- **User ID**: Initiating user
- **Data**: Additional metadata (JSONB)

### Querying Transactions

```sql
-- Get all transactions for a specific event
SELECT * FROM blockchain_transactions
WHERE related_id = '<event-id>'
ORDER BY created_at DESC;

-- Get transactions by type
SELECT * FROM blockchain_transactions
WHERE transaction_type = 'vote_cast'
ORDER BY created_at DESC
LIMIT 100;

-- Get user's transaction history
SELECT * FROM blockchain_transactions
WHERE user_id = '<user-id>'
ORDER BY created_at DESC;
```

---

## API Reference

### Admin Endpoints

All admin endpoints require authentication and admin role verification.

#### GET /admin?action=events
Fetch all voting and petition events.

**Response:**
```json
{
  "voting": [...],
  "petitions": [...]
}
```

#### GET /admin?action=participants
Get participants for specific event.

**Query Parameters:**
- `eventId`: Event UUID
- `eventType`: 'voting' or 'petition'

**Response:**
```json
{
  "participants": [
    {
      "id": "uuid",
      "created_at": "timestamp",
      "vote_option": "option" (voting only),
      "comment": "text" (petition only),
      "profiles": {
        "full_name": "string",
        "wallet_address": "string"
      }
    }
  ]
}
```

#### GET /admin?action=transactions
Fetch blockchain transaction history.

**Query Parameters:**
- `limit`: Maximum records (default: 50)

**Response:**
```json
{
  "transactions": [
    {
      "id": "uuid",
      "transaction_hash": "0x...",
      "transaction_type": "string",
      "block_number": 123456,
      "created_at": "timestamp",
      "data": {}
    }
  ]
}
```

#### POST /admin?action=create-voting
Create new voting event from template.

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "options": ["option1", "option2"],
  "start_time": "ISO8601",
  "end_time": "ISO8601",
  "template_id": "uuid"
}
```

#### POST /admin?action=create-petition
Create new petition from template.

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "target_signatures": 1000,
  "start_time": "ISO8601",
  "end_time": "ISO8601",
  "template_id": "uuid"
}
```

---

## Security Considerations

### Role-Based Access Control

```typescript
// Admin check in edge functions
const { data: roles } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', user.id);

const isAdmin = roles?.some(r => r.role === 'admin');
if (!isAdmin) {
  return new Response(JSON.stringify({ error: 'Admin access required' }), {
    status: 403
  });
}
```

### RLS Policies

Admin-specific RLS policies ensure:
- Only admins can create voting events
- Only admins can manage templates
- Admins can view all events regardless of status
- Admins can delete or modify events

### Best Practices

1. **Audit Logging**: All admin actions generate blockchain transactions
2. **Principle of Least Privilege**: Grant admin only when necessary
3. **Regular Review**: Periodically audit admin user list
4. **Multi-Factor Authentication**: Enable 2FA for admin accounts
5. **Separation of Duties**: Use different admin accounts for different functions

---

## Troubleshooting

### Common Issues

#### "Admin access required" Error
- Verify user has admin role in `user_roles` table
- Check JWT token is valid and not expired
- Ensure `has_role` function exists and is properly configured

#### Template Selection Not Working
- Verify templates exist: `SELECT * FROM event_templates WHERE is_active = true`
- Check template type matches event type (voting/petition)
- Ensure template creator has proper permissions

#### Participant List Empty
- Confirm event has received votes/signatures
- Verify RLS policies allow reading from `votes` or `petition_signatures`
- Check event ID is correct

---

## Next Steps

- [Deploy Smart Contracts](./README_BLOCKCHAIN.md)
- [Configure IPFS Storage](./README_BLOCKCHAIN.md#ipfs-integration)
- [Set Up Production Environment](./README.md#deployment)
- [API Documentation](./docs/API.md)

For support, contact: dev@blocktrust.ai