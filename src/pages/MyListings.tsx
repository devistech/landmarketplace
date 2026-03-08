import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Trash2, Plus, MapPin } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  approved: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
  sold: "bg-muted text-muted-foreground",
};

const MyListings = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: listings, isLoading } = useQuery({
    queryKey: ["my-listings", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("listings")
        .select("*, listing_images(*)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this listing?")) return;
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Listing deleted");
      qc.invalidateQueries({ queryKey: ["my-listings"] });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-serif text-3xl font-bold">My Listings</h1>
          <Link to="/add-listing"><Button className="gap-2"><Plus className="h-4 w-4" /> New Listing</Button></Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
        ) : listings && listings.length > 0 ? (
          <div className="space-y-4">
            {listings.map((l) => (
              <Card key={l.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    <img src={l.listing_images?.[0]?.image_url || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link to={`/listing/${l.id}`} className="font-medium hover:text-primary line-clamp-1">{l.title}</Link>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {l.city}, {l.state}
                    </div>
                    <p className="text-sm font-semibold text-primary">₹{l.price.toLocaleString("en-IN")}</p>
                  </div>
                  <Badge className={statusColors[l.status]}>{l.status}</Badge>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(l.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-muted-foreground">No listings yet.</p>
            <Link to="/add-listing"><Button className="mt-4">Create Your First Listing</Button></Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyListings;
