import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BrowserProvider } from "ethers";

interface UserProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  login_method: string | null;
  wallet_address: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  walletAddress: string | null;
  userProfile: UserProfile | null;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithWallet: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const navigate = useNavigate();

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, username, login_method, wallet_address')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setUserProfile(data);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUserProfile(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return { error };
      }

      toast.success("Account created successfully!");
      navigate("/");
      return { error: null };
    } catch (error: any) {
      toast.error(error.message);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return { error };
      }

      toast.success("Signed in successfully!");
      navigate("/");
      return { error: null };
    } catch (error: any) {
      toast.error(error.message);
      return { error };
    }
  };

  const signInWithWallet = async () => {
    try {
      if (typeof (window as any).ethereum === 'undefined') {
        toast.error('Please install MetaMask to use wallet login');
        return { error: new Error('MetaMask not found') };
      }

      const provider = new BrowserProvider((window as any).ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];
      
      if (!address) {
        throw new Error('No wallet address found');
      }

      setWalletAddress(address);

      // Create a message to sign
      const message = `Sign this message to authenticate with BlockTrust AI\n\nWallet: ${address}\nTimestamp: ${Date.now()}`;
      
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);

      // Use wallet address as a unique identifier for authentication
      // In production, verify signature on backend
      const { error } = await supabase.auth.signInWithPassword({
        email: `${address.toLowerCase()}@wallet.blocktrust.local`,
        password: signature.substring(0, 32), // Use part of signature as password
      });

      if (error) {
        // If user doesn't exist, create account
        const { error: signUpError } = await supabase.auth.signUp({
          email: `${address.toLowerCase()}@wallet.blocktrust.local`,
          password: signature.substring(0, 32),
          options: {
            data: {
              full_name: `Wallet ${address.substring(0, 6)}...${address.substring(38)}`,
              wallet_address: address,
            },
          },
        });

        if (signUpError) {
          toast.error(signUpError.message);
          return { error: signUpError };
        }
      }

      toast.success("Connected with wallet successfully!");
      navigate("/");
      return { error: null };
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect wallet');
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setWalletAddress(null);
      toast.success("Signed out successfully!");
      navigate("/auth");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, walletAddress, userProfile, signUp, signIn, signInWithWallet, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
