import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, FileText, CreditCard } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  approved: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
  sold: "bg-muted text-muted-foreground",
};

const Dashboard = () => {
  const { user, profile } = useAuth();

  const { data: listings } = useQuery({
    queryKey: ["my-listings-summary", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("listings")
        .select("id, title, status, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: subscription } = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("subscriptions").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const planName = subscription?.plan_name || "free";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {profile?.full_name || "User"}</p>
          </div>
          <Link to="/add-listing">
            <Button className="gap-2"><Plus className="h-4 w-4" /> New Listing</Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Listings</p>
                <p className="text-2xl font-bold">{listings?.length || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <FileText className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{listings?.filter((l) => l.status === "approved").length || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <CreditCard className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Plan</p>
                <p className="text-2xl font-bold capitalize">{planName}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-serif">Recent Listings</CardTitle>
            <Link to="/my-listings"><Button variant="ghost" size="sm">View All</Button></Link>
          </CardHeader>
          <CardContent>
            {listings && listings.length > 0 ? (
              <div className="space-y-3">
                {listings.map((l) => (
                  <div key={l.id} className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <p className="font-medium">{l.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleDateString()}</p>
                    </div>
                    <Badge className={statusColors[l.status]}>{l.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No listings yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
