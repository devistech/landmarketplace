import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle, XCircle, Trash2, Ban, Eye, Flag } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const Admin = () => {
  const qc = useQueryClient();

  const { data: pendingListings } = useQuery({
    queryKey: ["admin-pending"],
    queryFn: async () => {
      const { data } = await supabase.from("listings").select("*, listing_images(*)").eq("status", "pending").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: reports } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const { data } = await supabase.from("reports").select("*, listings(title, id)").eq("resolved", false).order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: allListings } = useQuery({
    queryKey: ["admin-all-listings"],
    queryFn: async () => {
      const { data } = await supabase.from("listings").select("*, listing_images(*)").order("created_at", { ascending: false }).limit(100);
      return data || [];
    },
  });

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("listings").update({ status: status as any }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success(`Listing ${status}`);
      qc.invalidateQueries({ queryKey: ["admin-pending"] });
      qc.invalidateQueries({ queryKey: ["admin-all-listings"] });
    }
  };

  const deleteListing = async (id: string) => {
    if (!confirm("Delete this listing permanently?")) return;
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Listing deleted");
      qc.invalidateQueries({ queryKey: ["admin-pending"] });
      qc.invalidateQueries({ queryKey: ["admin-all-listings"] });
    }
  };

  const resolveReport = async (id: string) => {
    const { error } = await supabase.from("reports").update({ resolved: true }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Report resolved");
      qc.invalidateQueries({ queryKey: ["admin-reports"] });
    }
  };

  const banUser = async (userId: string) => {
    if (!confirm("Ban this user?")) return;
    const { error } = await supabase.from("profiles").update({ is_banned: true }).eq("user_id", userId);
    if (error) toast.error(error.message);
    else toast.success("User banned");
  };

  const statusColors: Record<string, string> = {
    pending: "bg-warning/10 text-warning",
    approved: "bg-success/10 text-success",
    rejected: "bg-destructive/10 text-destructive",
    sold: "bg-muted text-muted-foreground",
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 font-serif text-3xl font-bold">Admin Dashboard</h1>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingListings?.length || 0})</TabsTrigger>
            <TabsTrigger value="reports">Reports ({reports?.length || 0})</TabsTrigger>
            <TabsTrigger value="all">All Listings</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6 space-y-4">
            {pendingListings?.map((l) => (
              <Card key={l.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    <img src={l.listing_images?.[0]?.image_url || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium line-clamp-1">{l.title}</p>
                    <p className="text-sm text-muted-foreground">{l.city}, {l.state} · ₹{l.price.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => updateStatus(l.id, "approved")} className="gap-1">
                      <CheckCircle className="h-4 w-4" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => updateStatus(l.id, "rejected")} className="gap-1">
                      <XCircle className="h-4 w-4" /> Reject
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteListing(l.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!pendingListings?.length && <p className="text-center text-muted-foreground py-8">No pending listings.</p>}
          </TabsContent>

          <TabsContent value="reports" className="mt-6 space-y-4">
            {reports?.map((r: any) => (
              <Card key={r.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <Flag className="h-5 w-5 text-destructive flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">Listing: {r.listings?.title || "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">Reason: {r.reason?.replace("_", " ")} · {r.description || "No details"}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => resolveReport(r.id)}>Resolve</Button>
                    {r.listings?.id && (
                      <Button size="sm" variant="destructive" onClick={() => deleteListing(r.listings.id)}>Remove Listing</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {!reports?.length && <p className="text-center text-muted-foreground py-8">No open reports.</p>}
          </TabsContent>

          <TabsContent value="all" className="mt-6 space-y-4">
            {allListings?.map((l) => (
              <Card key={l.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    <img src={l.listing_images?.[0]?.image_url || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium line-clamp-1">{l.title}</p>
                    <p className="text-xs text-muted-foreground">₹{l.price.toLocaleString("en-IN")}</p>
                  </div>
                  <Badge className={statusColors[l.status]}>{l.status}</Badge>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => banUser(l.user_id)} title="Ban user">
                      <Ban className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteListing(l.id)} className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
