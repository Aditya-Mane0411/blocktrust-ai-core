# Launch Platform Button

## Overview

The **Launch Platform** button is the primary call-to-action (CTA) on the BlockTrust AI homepage. It serves as the main entry point for users to access the full platform features and begin using blockchain-based voting, petition, and survey tools.

## Location

- **Homepage Hero Section**: Prominently displayed in the hero area of the landing page
- **Navigation**: Available in the main navigation bar for quick access from any page

## Functionality

### Current Implementation

The Launch Platform button currently routes users to the main platform interface at `/platform`.

### What Happens When Clicked

1. **For Unauthenticated Users**:
   - Redirected to the authentication page (`/auth`)
   - Prompted to sign up or log in
   - After successful authentication, redirected to the platform dashboard

2. **For Authenticated Users**:
   - Direct access to the main platform dashboard
   - View active voting events, petitions, and surveys
   - Access to role-specific features based on user permissions

## Platform Features (Post-Login)

Once logged in via the Launch Platform button, users gain access to:

### For All Users (Voter Role)
- **View Active Events**: Browse and participate in active voting events
- **Sign Petitions**: View and sign petition campaigns
- **Participate in Surveys**: Complete surveys and provide feedback
- **View Results**: See real-time results for completed events
- **Profile Management**: Update profile information and wallet address

### For Petition Creators
- **Create Petitions**: Launch new petition campaigns
- **Manage Petitions**: Track signatures and engagement
- **View Analytics**: Access detailed analytics for petition campaigns

### For Administrators
- **Create Events**: Launch voting events, petitions, and surveys
- **Template Management**: Create and manage event templates
- **User Management**: Manage user roles and permissions
- **Admin Dashboard**: Access comprehensive analytics and transaction history
- **Blockchain Management**: Deploy contracts and manage blockchain integrations

## Technical Details

### Route Configuration
```typescript
// App.tsx
<Route path="/platform" element={<Index />} />
<Route path="/auth" element={<Auth />} />
<Route path="/admin" element={<Admin />} />
```

### Authentication Flow
```typescript
// Protected route logic
const { user, loading } = useAuth();

if (loading) return <LoadingSpinner />;
if (!user) return <Navigate to="/auth" />;

return <PlatformDashboard />;
```

### Button Component
```tsx
<Button 
  size="lg"
  className="bg-gradient-to-r from-neon-cyan to-electric-purple"
  onClick={() => navigate('/platform')}
>
  Launch Platform
  <ArrowRight className="ml-2" />
</Button>
```

## User Journey

### New User Flow
1. Click **Launch Platform**
2. Redirected to authentication page
3. Create account with email and password
4. Verify email (if required)
5. Complete profile setup
6. Receive default "voter" role
7. Redirected to platform dashboard
8. Begin participating in events

### Returning User Flow
1. Click **Launch Platform**
2. If already logged in → Direct access to dashboard
3. If logged out → Login page → Dashboard

## Security Considerations

- All platform features require authentication
- Role-based access control (RBAC) enforces permissions
- JWT tokens manage session state
- Row-level security (RLS) protects database access
- Admin functions require explicit admin role verification

## API Endpoints Used

After clicking Launch Platform and authenticating, the platform makes calls to:

- `GET /api/voting` - Fetch active voting events
- `GET /api/petition` - Fetch active petitions
- `GET /api/templates` - Fetch available templates
- `GET /api/blockchain-status` - Fetch blockchain transaction status
- `POST /api/voting?action=vote` - Cast votes
- `POST /api/petition?action=sign` - Sign petitions

## Environment Variables

The Launch Platform button functionality depends on:

```env
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_PUBLISHABLE_KEY=<your-publishable-key>
```

## Future Enhancements

Planned improvements for the Launch Platform experience:

1. **Onboarding Tour**: Guided walkthrough for new users
2. **Quick Actions**: Immediate access to most common tasks
3. **Personalized Dashboard**: Role-specific landing pages
4. **Recent Activity**: Show user's recent interactions
5. **Notifications**: Display important updates and deadlines
6. **Wallet Integration**: Direct MetaMask connection flow
7. **Progressive Web App**: Install as desktop/mobile app

## Troubleshooting

### Button Not Working
- Check browser console for JavaScript errors
- Verify authentication service is running
- Ensure environment variables are configured
- Clear browser cache and cookies

### Redirect Loop
- Check for conflicting authentication states
- Verify token expiration settings
- Clear localStorage and retry

### Access Denied
- Verify user role permissions
- Check RLS policies in database
- Ensure user has completed profile setup

## Related Documentation

- [Authentication System](./authentication.md)
- [User Roles & Permissions](./roles-permissions.md)
- [Platform Dashboard](./platform-dashboard.md)
- [Admin Dashboard](./admin-dashboard.md)

## Support

For issues with the Launch Platform button or platform access:
- Email: support@blocktrust.ai
- Discord: BlockTrust AI Community
- GitHub Issues: [Report Bug](https://github.com/blocktrust-ai/platform/issues)