import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Calendar, Users, FileText, Activity, TrendingUp } from "lucide-react";

interface VotingEvent {
  id: string;
  title: string;
  status: string;
  total_votes: number;
  created_at: string;
  start_time: string;
  end_time: string;
}

interface PetitionEvent {
  id: string;
  title: string;
  status: string;
  current_signatures: number;
  target_signatures: number;
  created_at: string;
  start_time: string;
  end_time: string;
}

interface Transaction {
  id: string;
  transaction_hash: string;
  transaction_type: string;
  created_at: string;
  block_number: number;
}

interface Participant {
  id: string;
  created_at: string;
  vote_option?: string;
  comment?: string;
  profiles?: {
    full_name: string;
    wallet_address: string;
  };
}

const Admin = () => {
  const [votingEvents, setVotingEvents] = useState<VotingEvent[]>([]);
  const [petitionEvents, setPetitionEvents] = useState<PetitionEvent[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<'voting' | 'petition'>('voting');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();

    // Setup realtime subscriptions for auto-updates
    const votingChannel = supabase
      .channel('voting_events_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'voting_events' }, () => {
        fetchAdminData();
      })
      .subscribe();

    const petitionChannel = supabase
      .channel('petition_events_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'petition_events' }, () => {
        fetchAdminData();
      })
      .subscribe();

    const votesChannel = supabase
      .channel('votes_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, () => {
        fetchAdminData();
      })
      .subscribe();

    const signaturesChannel = supabase
      .channel('signatures_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'petition_signatures' }, () => {
        fetchAdminData();
      })
      .subscribe();

    const transactionsChannel = supabase
      .channel('transactions_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blockchain_transactions' }, () => {
        fetchAdminData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(votingChannel);
      supabase.removeChannel(petitionChannel);
      supabase.removeChannel(votesChannel);
      supabase.removeChannel(signaturesChannel);
      supabase.removeChannel(transactionsChannel);
    };
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // Fetch events
      const { data: eventsData, error: eventsError } = await supabase.functions.invoke('admin', {
        body: { action: 'events' }
      });

      if (eventsError) throw eventsError;

      setVotingEvents(eventsData?.voting || []);
      setPetitionEvents(eventsData?.petitions || []);

      // Fetch transactions
      const { data: txData, error: txError } = await supabase.functions.invoke('admin', {
        body: { action: 'transactions' }
      });

      if (txError) throw txError;
      setTransactions(txData?.transactions || []);

    } catch (error: any) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async (eventId: string, eventType: 'voting' | 'petition') => {
    try {
      const { data, error } = await supabase.functions.invoke('admin', {
        body: { action: 'participants', eventId, eventType }
      });

      if (error) throw error;
      setParticipants(data?.participants || []);
      setSelectedEvent(eventId);
      setSelectedEventType(eventType);
    } catch (error: any) {
      console.error('Error fetching participants:', error);
      toast.error('Failed to load participants');
    }
  };

  const deleteEvent = async (eventId: string, eventType: 'voting' | 'petition') => {
    if (!confirm(`Are you sure you want to delete this ${eventType} event?`)) return;
    
    try {
      const { error } = await supabase.functions.invoke('admin', {
        body: { action: 'delete-event', eventId, eventType }
      });

      if (error) throw error;
      toast.success('Event deleted successfully');
      fetchAdminData();
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      completed: "secondary",
      draft: "outline",
      cancelled: "destructive"
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-deep-navy via-deep-navy/95 to-deep-navy/90 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-neon-cyan">Loading admin dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-deep-navy via-deep-navy/95 to-deep-navy/90 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neon-cyan mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage events, view participants, and track blockchain transactions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-deep-navy/50 border-neon-cyan/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Voting Events</CardTitle>
              <Calendar className="h-4 w-4 text-neon-cyan" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neon-cyan">{votingEvents.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-deep-navy/50 border-neon-magenta/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Petitions</CardTitle>
              <FileText className="h-4 w-4 text-neon-magenta" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neon-magenta">{petitionEvents.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-deep-navy/50 border-electric-purple/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Votes Cast</CardTitle>
              <Users className="h-4 w-4 text-electric-purple" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-electric-purple">
                {votingEvents.reduce((sum, e) => sum + e.total_votes, 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-deep-navy/50 border-neon-cyan/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Blockchain Transactions</CardTitle>
              <Activity className="h-4 w-4 text-neon-cyan" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neon-cyan">{transactions.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="voting" className="space-y-4">
          <TabsList className="bg-deep-navy/50 border border-neon-cyan/20">
            <TabsTrigger value="voting">Voting Events</TabsTrigger>
            <TabsTrigger value="petitions">Petitions</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            {selectedEvent && <TabsTrigger value="participants">Participants</TabsTrigger>}
          </TabsList>

          {/* Voting Events Tab */}
          <TabsContent value="voting">
            <Card className="bg-deep-navy/50 border-neon-cyan/20">
              <CardHeader>
                <CardTitle className="text-neon-cyan">Voting Events</CardTitle>
                <CardDescription>All voting events in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total Votes</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>End Time</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {votingEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.title}</TableCell>
                        <TableCell>{getStatusBadge(event.status)}</TableCell>
                        <TableCell>{event.total_votes}</TableCell>
                        <TableCell>{formatDate(event.start_time)}</TableCell>
                        <TableCell>{formatDate(event.end_time)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <button
                              onClick={() => fetchParticipants(event.id, 'voting')}
                              className="text-neon-cyan hover:underline text-sm"
                            >
                              View
                            </button>
                            <button
                              onClick={() => deleteEvent(event.id, 'voting')}
                              className="text-red-500 hover:underline text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Petitions Tab */}
          <TabsContent value="petitions">
            <Card className="bg-deep-navy/50 border-neon-magenta/20">
              <CardHeader>
                <CardTitle className="text-neon-magenta">Petition Events</CardTitle>
                <CardDescription>All petition campaigns in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Signatures</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {petitionEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.title}</TableCell>
                        <TableCell>{getStatusBadge(event.status)}</TableCell>
                        <TableCell>{event.current_signatures}</TableCell>
                        <TableCell>{event.target_signatures}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-neon-magenta"
                                style={{
                                  width: `${Math.min(100, (event.current_signatures / event.target_signatures) * 100)}%`
                                }}
                              />
                            </div>
                            <span className="text-xs">
                              {Math.round((event.current_signatures / event.target_signatures) * 100)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <button
                              onClick={() => fetchParticipants(event.id, 'petition')}
                              className="text-neon-magenta hover:underline text-sm"
                            >
                              View
                            </button>
                            <button
                              onClick={() => deleteEvent(event.id, 'petition')}
                              className="text-red-500 hover:underline text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card className="bg-deep-navy/50 border-electric-purple/20">
              <CardHeader>
                <CardTitle className="text-electric-purple">Blockchain Transactions</CardTitle>
                <CardDescription>Recent blockchain transaction history</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction Hash</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Block Number</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-mono text-xs">
                          {tx.transaction_hash.substring(0, 16)}...
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{tx.transaction_type}</Badge>
                        </TableCell>
                        <TableCell>{tx.block_number.toLocaleString()}</TableCell>
                        <TableCell>{formatDate(tx.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Participants Tab */}
          {selectedEvent && (
            <TabsContent value="participants">
              <Card className="bg-deep-navy/50 border-neon-cyan/20">
                <CardHeader>
                  <CardTitle className="text-neon-cyan">
                    {selectedEventType === 'voting' ? 'Voters' : 'Signatories'}
                  </CardTitle>
                  <CardDescription>Participants for selected event</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Wallet Address</TableHead>
                        {selectedEventType === 'voting' && <TableHead>Vote Option</TableHead>}
                        {selectedEventType === 'petition' && <TableHead>Comment</TableHead>}
                        <TableHead>Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {participants.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>{p.profiles?.full_name || 'Anonymous'}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {p.profiles?.wallet_address?.substring(0, 16) || 'N/A'}...
                          </TableCell>
                          {selectedEventType === 'voting' && <TableCell>{p.vote_option}</TableCell>}
                          {selectedEventType === 'petition' && <TableCell>{p.comment || '-'}</TableCell>}
                          <TableCell>{formatDate(p.created_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;