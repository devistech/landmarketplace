import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

const Footer = () => (
  <footer className="border-t bg-card">
    <div className="container mx-auto px-4 py-12">
      <div className="grid gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-6 w-6 text-primary" />
            <span className="font-serif text-lg font-bold">Land Marketplace</span>
          </div>
          <p className="text-sm text-muted-foreground">
            The global platform for buying and selling land. Discover verified listings across the world.
          </p>
        </div>
        <div>
          <h4 className="mb-3 font-serif text-sm font-semibold">Platform</h4>
          <div className="flex flex-col gap-2">
            <Link to="/browse" className="text-sm text-muted-foreground hover:text-foreground">Browse Lands</Link>
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link>
            <Link to="/add-listing" className="text-sm text-muted-foreground hover:text-foreground">List Your Land</Link>
          </div>
        </div>
        <div>
          <h4 className="mb-3 font-serif text-sm font-semibold">Account</h4>
          <div className="flex flex-col gap-2">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">Log In</Link>
            <Link to="/signup" className="text-sm text-muted-foreground hover:text-foreground">Sign Up</Link>
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">Dashboard</Link>
          </div>
        </div>
        <div>
          <h4 className="mb-3 font-serif text-sm font-semibold">Land Types</h4>
          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">Agricultural Land</span>
            <span className="text-sm text-muted-foreground">Residential Plots</span>
            <span className="text-sm text-muted-foreground">Commercial Land</span>
            <span className="text-sm text-muted-foreground">Industrial Land</span>
          </div>
        </div>
      </div>
      <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Land Marketplace. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
