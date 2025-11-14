import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Shield, BookOpen, User, LogOut, Wallet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "./ui/badge";

export const Navigation = () => {
  const { user, userProfile, signOut } = useAuth();

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">BlockTrust AI</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/templates">
              <Button variant="ghost" size="sm">Templates</Button>
            </Link>
            <Link to="/admin">
              <Button variant="ghost" size="sm">Admin</Button>
            </Link>
            <Link to="/documentation">
              <Button variant="ghost" size="sm">
                <BookOpen className="h-4 w-4 mr-2" />
                Docs
              </Button>
            </Link>
          </div>

          {/* Auth / CTA Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{userProfile?.username || userProfile?.full_name || 'User'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col gap-1">
                      <p className="font-medium">{userProfile?.full_name || 'User'}</p>
                      {userProfile?.username && (
                        <p className="text-xs text-muted-foreground">@{userProfile.username}</p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled className="flex items-center gap-2">
                    {userProfile?.login_method === 'wallet' ? (
                      <>
                        <Wallet className="h-4 w-4" />
                        <span className="text-xs">Wallet Login</span>
                      </>
                    ) : (
                      <>
                        <User className="h-4 w-4" />
                        <span className="text-xs">Email Login</span>
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="outline" size="sm">Sign In</Button>
                </Link>
                <Link to="/platform">
                  <Button size="sm">Launch Platform</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
