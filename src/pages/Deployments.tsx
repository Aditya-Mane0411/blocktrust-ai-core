import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";

interface Deployment {
  id: string;
  contract_address: string;
  network_id: string;
  block_number: number;
  status: string;
  created_at: string;
  event_templates: {
    name: string;
    type: string;
  };
}

export default function Deployments() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeployments();
  }, []);

  const fetchDeployments = async () => {
    try {
      const { data, error } = await supabase
        .from('contract_deployments')
        .select(`
          *,
          event_templates (
            name,
            type
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeployments(data || []);
    } catch (error: any) {
      toast.error("Failed to load deployments");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success("Contract address copied");
  };

  const getExplorerUrl = (network: string, address: string) => {
    const explorers: Record<string, string> = {
      'sepolia': `https://sepolia.etherscan.io/address/${address}`,
      'mumbai': `https://mumbai.polygonscan.com/address/${address}`,
      'polygon': `https://polygonscan.com/address/${address}`,
    };
    return explorers[network] || '#';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Contract Deployments</h1>
          <p className="text-muted-foreground">
            View all deployed smart contracts across networks
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading deployments...</p>
          </div>
        ) : deployments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No deployments found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {deployments.map((deployment) => (
              <Card key={deployment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{deployment.event_templates.name}</CardTitle>
                      <CardDescription>
                        Block #{deployment.block_number}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{deployment.network_id}</Badge>
                      <Badge variant={deployment.status === 'deployed' ? 'default' : 'secondary'}>
                        {deployment.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1">Contract Address</p>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {deployment.contract_address}
                      </code>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyAddress(deployment.contract_address)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(getExplorerUrl(deployment.network_id, deployment.contract_address), '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
