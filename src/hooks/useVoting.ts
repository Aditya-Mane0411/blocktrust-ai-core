import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VotingEvent {
  id: string;
  title: string;
  description: string;
  options: any;
  start_time: string;
  end_time: string;
  status: string;
  total_votes: number;
  blockchain_hash: string | null;
  created_at: string;
}

export const useVoting = () => {
  const [events, setEvents] = useState<VotingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("voting");

      if (error) throw error;
      setEvents(data.events || []);
    } catch (error: any) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load voting events");
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: {
    title: string;
    description: string;
    options: string[];
    start_time: string;
    end_time: string;
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke("voting", {
        body: { action: "create", ...eventData },
      });

      if (error) throw error;
      toast.success("Voting event created successfully!");
      await fetchEvents();
      return data.event;
    } catch (error: any) {
      console.error("Error creating event:", error);
      toast.error(error.message || "Failed to create voting event");
      throw error;
    }
  };

  const castVote = async (votingEventId: string, voteOption: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("voting", {
        body: {
          action: "vote",
          voting_event_id: votingEventId,
          vote_option: voteOption,
        },
      });

      if (error) throw error;
      toast.success("Vote cast successfully!");
      await fetchEvents();
      return data.vote;
    } catch (error: any) {
      console.error("Error casting vote:", error);
      toast.error(error.message || "Failed to cast vote");
      throw error;
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return { events, loading, createEvent, castVote, refetch: fetchEvents };
};
