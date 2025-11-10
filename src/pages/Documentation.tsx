import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Code, Shield, Zap } from "lucide-react";

export default function Documentation() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Documentation</h1>
          <p className="text-muted-foreground">
            Complete guide to building with BlockTrust AI
          </p>
        </div>

        <Tabs defaultValue="getting-started" className="space-y-6">
          <TabsList>
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="api">API Reference</TabsTrigger>
            <TabsTrigger value="smart-contracts">Smart Contracts</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="getting-started" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  <CardTitle>Quick Start</CardTitle>
                </div>
                <CardDescription>Get up and running in minutes</CardDescription>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                <h3>Installation</h3>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <code>{`npm install
npm run dev`}</code>
                </pre>

                <h3>Environment Setup</h3>
                <p>Create a <code>.env</code> file with the following variables:</p>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <code>{`VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
SEPOLIA_RPC_URL=your_rpc_url
MUMBAI_RPC_URL=your_rpc_url
DEPLOYER_PRIVATE_KEY=your_private_key`}</code>
                </pre>

                <h3>Deploy Smart Contracts</h3>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <code>{`npx hardhat run scripts/deploy.ts --network sepolia`}</code>
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  <CardTitle>API Endpoints</CardTitle>
                </div>
                <CardDescription>RESTful API for template management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Create Template</h3>
                  <code className="text-sm bg-muted px-2 py-1 rounded">POST /template-manager?action=create-template</code>
                  <pre className="bg-muted p-4 rounded-lg mt-2 overflow-x-auto">
                    <code>{`{
  "name": "Town Hall Voting",
  "type": "voting",
  "description": "Community decision making",
  "config": {
    "duration": 7,
    "minVotes": 100
  }
}`}</code>
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Deploy Contract</h3>
                  <code className="text-sm bg-muted px-2 py-1 rounded">POST /template-manager?action=deploy-contract</code>
                  <pre className="bg-muted p-4 rounded-lg mt-2 overflow-x-auto">
                    <code>{`{
  "templateId": "uuid",
  "networkId": "sepolia",
  "contractParams": {
    "title": "Budget Approval",
    "options": ["Yes", "No"]
  }
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="smart-contracts" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <CardTitle>Smart Contract Architecture</CardTitle>
                </div>
                <CardDescription>Template-based contract system</CardDescription>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                <h3>VotingTemplate.sol</h3>
                <p>Multi-event voting contract with candidate management and on-chain vote recording.</p>
                <ul>
                  <li>Create multiple voting events</li>
                  <li>Authorize voters</li>
                  <li>Cast votes on-chain</li>
                  <li>Store metadata on IPFS</li>
                </ul>

                <h3>PetitionTemplate.sol</h3>
                <p>Petition management with signature collection and threshold verification.</p>
                <ul>
                  <li>Create petitions with target signatures</li>
                  <li>Collect signatures on-chain</li>
                  <li>Verify threshold achievement</li>
                  <li>Store petition data on IPFS</li>
                </ul>

                <h3>SurveyTemplate.sol</h3>
                <p>Survey and feedback collection with response tracking.</p>
                <ul>
                  <li>Create surveys with multiple questions</li>
                  <li>Collect responses anonymously</li>
                  <li>Store results on IPFS</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <CardTitle>Security Best Practices</CardTitle>
                </div>
                <CardDescription>Keep your deployment secure</CardDescription>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                <h3>Key Management</h3>
                <ul>
                  <li>Never commit private keys to version control</li>
                  <li>Use environment variables for sensitive data</li>
                  <li>Consider hardware wallets for production</li>
                  <li>Implement key rotation policies</li>
                </ul>

                <h3>Smart Contract Security</h3>
                <ul>
                  <li>All contracts use OpenZeppelin audited libraries</li>
                  <li>Role-based access control implemented</li>
                  <li>Reentrancy guards on state-changing functions</li>
                  <li>Events emitted for all critical operations</li>
                </ul>

                <h3>Database Security</h3>
                <ul>
                  <li>Row Level Security (RLS) enabled on all tables</li>
                  <li>Role-based permissions enforced</li>
                  <li>Service role key only used server-side</li>
                  <li>Regular security audits recommended</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
