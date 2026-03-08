import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useState } from "react";
import { Phone, MessageCircle, MapPin, Flag, ArrowLeft } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type ReportReason = Database["public"]["Enums"]["report_reason"];

const landTypeLabels: Record<string, string> = {
  agriculture: "Agriculture",
  residential_plot: "Residential Plot",
  commercial: "Commercial",
  industrial: "Industrial",
};

const ListingDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [reportReason, setReportReason] = useState<ReportReason>("spam");
  const [reportDesc, setReportDesc] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const { data: listing, isLoading } = useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("listings")
        .select("*, listing_images(*)")
        .eq("id", id!)
        .single();
      return data;
    },
    enabled: !!id,
  });

  const handleReport = async () => {
    if (!user || !listing) return;
    const { error } = await supabase.from("reports").insert({
      listing_id: listing.id,
      reporter_id: user.id,
      reason: reportReason,
      description: reportDesc || null,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Report submitted");
      setReportOpen(false);
      setReportDesc("");
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </Layout>
    );
  }

  if (!listing) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <p className="text-lg text-muted-foreground">Listing not found.</p>
          <Link to="/browse"><Button>Browse Listings</Button></Link>
        </div>
      </Layout>
    );
  }

  const images = listing.listing_images || [];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Link to="/browse" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to listings
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Images */}
          <div className="lg:col-span-2">
            <div className="aspect-[16/10] overflow-hidden rounded-lg bg-muted">
              <img
                src={images[activeImage]?.image_url || "/placeholder.svg"}
                alt={listing.title}
                className="h-full w-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(i)}
                    className={`h-16 w-16 overflow-hidden rounded-md border-2 ${i === activeImage ? "border-primary" : "border-transparent"}`}
                  >
                    <img src={img.image_url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-2">{landTypeLabels[listing.land_type]}</Badge>
              <h1 className="font-serif text-3xl font-bold">{listing.title}</h1>
              <p className="mt-1 flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {[listing.village, listing.city, listing.state, listing.country].filter(Boolean).join(", ")}
              </p>
            </div>

            <div className="font-serif text-4xl font-bold text-primary">
              ₹{listing.price.toLocaleString("en-IN")}
            </div>

            <Card>
              <CardContent className="space-y-3 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Land Size</span>
                  <span className="font-medium">{listing.land_size} {listing.land_size_unit === "sq_ft" ? "sq ft" : listing.land_size_unit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Land Type</span>
                  <span className="font-medium">{landTypeLabels[listing.land_type]}</span>
                </div>
              </CardContent>
            </Card>

            {/* Contact Buttons */}
            <div className="space-y-3">
              <a href={`tel:${listing.phone}`}>
                <Button className="w-full gap-2" size="lg">
                  <Phone className="h-5 w-5" /> Call Seller
                </Button>
              </a>
              {listing.whatsapp && (
                <a href={`https://wa.me/${listing.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full gap-2" size="lg" variant="outline">
                    <MessageCircle className="h-5 w-5" /> WhatsApp Seller
                  </Button>
                </a>
              )}
              {listing.google_maps_link && (
                <a href={listing.google_maps_link} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full gap-2" size="lg" variant="outline">
                    <MapPin className="h-5 w-5" /> View on Google Maps
                  </Button>
                </a>
              )}
            </div>

            {/* Report */}
            {user && user.id !== listing.user_id && (
              <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1 text-destructive">
                    <Flag className="h-4 w-4" /> Report Listing
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Report this Listing</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Select value={reportReason} onValueChange={(v) => setReportReason(v as ReportReason)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spam">Spam</SelectItem>
                        <SelectItem value="scam">Scam</SelectItem>
                        <SelectItem value="fake_property">Fake Property</SelectItem>
                        <SelectItem value="wrong_location">Wrong Location</SelectItem>
                        <SelectItem value="adult_images">Adult Images</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea placeholder="Additional details (optional)" value={reportDesc} onChange={(e) => setReportDesc(e.target.value)} maxLength={500} />
                    <Button onClick={handleReport} className="w-full">Submit Report</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mt-8">
          <h2 className="mb-4 font-serif text-2xl font-bold">Description</h2>
          <p className="whitespace-pre-wrap text-muted-foreground">{listing.description}</p>
        </div>
      </div>
    </Layout>
  );
};

export default ListingDetail;
