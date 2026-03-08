import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { MapPin, Menu, X, User, LogOut, LayoutDashboard, Shield } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <MapPin className="h-7 w-7 text-primary" />
          <span className="font-serif text-xl font-bold text-foreground">Land Marketplace</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          <Link to="/browse" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Browse Lands
          </Link>
          <Link to="/pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Pricing
          </Link>
          {user ? (
            <>
              <Link to="/add-listing">
                <Button size="sm">List Your Land</Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/my-listings")}>
                    <MapPin className="mr-2 h-4 w-4" />
                    My Listings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Log In</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-card p-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link to="/browse" onClick={() => setMobileOpen(false)} className="text-sm font-medium">Browse Lands</Link>
            <Link to="/pricing" onClick={() => setMobileOpen(false)} className="text-sm font-medium">Pricing</Link>
            {user ? (
              <>
                <Link to="/add-listing" onClick={() => setMobileOpen(false)} className="text-sm font-medium">List Your Land</Link>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="text-sm font-medium">Dashboard</Link>
                <Link to="/my-listings" onClick={() => setMobileOpen(false)} className="text-sm font-medium">My Listings</Link>
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="text-sm font-medium">Profile</Link>
                {isAdmin && <Link to="/admin" onClick={() => setMobileOpen(false)} className="text-sm font-medium">Admin</Link>}
                <Button variant="ghost" size="sm" onClick={() => { handleSignOut(); setMobileOpen(false); }}>Sign Out</Button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" onClick={() => setMobileOpen(false)}><Button variant="ghost" size="sm">Log In</Button></Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)}><Button size="sm">Sign Up</Button></Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
