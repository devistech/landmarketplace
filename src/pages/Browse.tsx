import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ListingCard from "@/components/ListingCard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [landType, setLandType] = useState(searchParams.get("type") || "all");
  const [sortBy, setSortBy] = useState("newest");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");

  const { data: listings, isLoading } = useQuery({
    queryKey: ["browse-listings", landType, sortBy, country, state, search],
    queryFn: async () => {
      let query = supabase
        .from("listings")
        .select("*, listing_images(*)")
        .eq("status", "approved");

      if (landType !== "all") query = query.eq("land_type", landType as any);
      if (country) query = query.ilike("country", `%${country}%`);
      if (state) query = query.ilike("state", `%${state}%`);
      if (search) query = query.or(`title.ilike.%${search}%,city.ilike.%${search}%,village.ilike.%${search}%`);

      switch (sortBy) {
        case "price_asc": query = query.order("price", { ascending: true }); break;
        case "price_desc": query = query.order("price", { ascending: false }); break;
        case "size_desc": query = query.order("land_size", { ascending: false }); break;
        default: query = query.order("created_at", { ascending: false });
      }

      const { data } = await query.limit(50);
      return data || [];
    },
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 font-serif text-3xl font-bold">Browse Land Listings</h1>

        {/* Filters */}
        <div className="mb-8 grid gap-4 rounded-lg border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1">
            <Label className="text-xs">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Land Type</Label>
            <Select value={landType} onValueChange={setLandType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="agriculture">Agriculture</SelectItem>
                <SelectItem value="residential_plot">Residential Plot</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Country</Label>
            <Input placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">State</Label>
            <Input placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Sort By</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price_asc">Price: Low → High</SelectItem>
                <SelectItem value="price_desc">Price: High → Low</SelectItem>
                <SelectItem value="size_desc">Largest Size</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : listings && listings.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">No listings found.</p>
            <Link to="/add-listing"><Button className="mt-4">List Your Land</Button></Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Browse;
