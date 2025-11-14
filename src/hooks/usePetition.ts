import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Petition {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  status: string;
  current_signatures: number;
  target_signatures: number;
  blockchain_hash: string | null;
  created_at: string;
}

export const usePetition = () => {
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPetitions = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("petition");

      if (error) throw error;
      setPetitions(data.petitions || []);
    } catch (error: any) {
      console.error("Error fetching petitions:", error);
      toast.error("Failed to load petitions");
    } finally {
      setLoading(false);
    }
  };

  const createPetition = async (petitionData: {
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    target_signatures?: number;
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke("petition", {
        body: { action: "create", ...petitionData },
      });

      if (error) throw error;
      toast.success("Petition created successfully!");
      await fetchPetitions();
      return data.petition;
    } catch (error: any) {
      console.error("Error creating petition:", error);
      toast.error(error.message || "Failed to create petition");
      throw error;
    }
  };

  const signPetition = async (petitionId: string, comment?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("petition", {
        body: {
          action: "sign",
          petition_id: petitionId,
          comment,
        },
      });

      if (error) throw error;
      toast.success("Petition signed successfully!");
      await fetchPetitions();
      return data.signature;
    } catch (error: any) {
      console.error("Error signing petition:", error);
      toast.error(error.message || "Failed to sign petition");
      throw error;
    }
  };

  useEffect(() => {
    fetchPetitions();
  }, []);

  return { petitions, loading, createPetition, signPetition, refetch: fetchPetitions };
};
