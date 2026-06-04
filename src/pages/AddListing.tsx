import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type LandType = Database["public"]["Enums"]["land_type"];
type LandSizeUnit = Database["public"]["Enums"]["land_size_unit"];

const AddListing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [form, setForm] = useState({
    title: "", description: "", price: "", country: "", state: "", city: "", village: "",
    land_size: "", land_size_unit: "acre" as LandSizeUnit, land_type: "agriculture" as LandType,
    google_maps_link: "", phone: "", whatsapp: "",
  });

  const update = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const invalid = files.find((f) => !ALLOWED_IMAGE_TYPES.includes(f.type));
    if (invalid) {
      toast.error("Only JPEG, PNG, WebP, or GIF images are allowed");
      return;
    }
    if (images.length + files.length > 3) {
      toast.error("Maximum 3 images allowed");
      return;
    }
    setImages((prev) => [...prev, ...files].slice(0, 3));
  };

  const removeImage = (i: number) => setImages((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (images.length === 0) {
      toast.error("Please add at least 1 image");
      return;
    }

    // Validate Google Maps link if provided
    const mapsLink = form.google_maps_link.trim();
    if (mapsLink) {
      try {
        const u = new URL(mapsLink);
        const allowed = ["maps.google.com", "www.google.com", "google.com", "maps.app.goo.gl", "goo.gl"];
        const host = u.hostname.toLowerCase();
        const ok =
          u.protocol === "https:" &&
          allowed.includes(host) &&
          (!(host === "www.google.com" || host === "google.com") || u.pathname.startsWith("/maps"));
        if (!ok) {
          toast.error("Google Maps link must be a valid Google Maps URL");
          return;
        }
      } catch {
        toast.error("Google Maps link is not a valid URL");
        return;
      }
    }

    setLoading(true);

    // Check listing limit
    const { data: count } = await supabase.rpc("get_user_listing_count", { _user_id: user.id });
    const { data: limit } = await supabase.rpc("get_user_plan_limit", { _user_id: user.id });
    if ((count ?? 0) >= (limit ?? 1)) {
      toast.error("Listing limit reached. Upgrade your plan to add more.");
      setLoading(false);
      return;
    }

    // Create listing
    const { data: listing, error } = await supabase.from("listings").insert({
      user_id: user.id,
      title: form.title.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      country: form.country.trim(),
      state: form.state.trim(),
      city: form.city.trim(),
      village: form.village.trim() || null,
      land_size: Number(form.land_size),
      land_size_unit: form.land_size_unit,
      land_type: form.land_type,
      google_maps_link: form.google_maps_link.trim() || null,
      phone: form.phone.trim(),
      whatsapp: form.whatsapp.trim() || null,
    }).select().single();

    if (error || !listing) {
      toast.error(error?.message || "Failed to create listing");
      setLoading(false);
      return;
    }

    // Upload images
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${listing.id}/${i}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("listing-images").upload(path, file);
      if (uploadErr) {
        toast.error(`Image upload failed: ${uploadErr.message}`);
        continue;
      }
      const { data: urlData } = supabase.storage.from("listing-images").getPublicUrl(path);
      await supabase.from("listing_images").insert({
        listing_id: listing.id,
        image_url: urlData.publicUrl,
        display_order: i,
      });
    }

    setLoading(false);
    toast.success("Listing submitted for review!");
    navigate("/my-listings");
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-2xl">List Your Land</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => update("title", e.target.value)} required maxLength={200} placeholder="e.g. 5 Acre Agricultural Land in Maharashtra" />
              </div>
              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} required maxLength={2000} rows={4} placeholder="Describe the land..." />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Price (₹) *</Label>
                  <Input type="number" value={form.price} onChange={(e) => update("price", e.target.value)} required min={1} placeholder="500000" />
                </div>
                <div className="space-y-2">
                  <Label>Land Type *</Label>
                  <Select value={form.land_type} onValueChange={(v) => update("land_type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agriculture">Agriculture</SelectItem>
                      <SelectItem value="residential_plot">Residential Plot</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Land Size *</Label>
                  <Input type="number" value={form.land_size} onChange={(e) => update("land_size", e.target.value)} required min={0.01} step="0.01" />
                </div>
                <div className="space-y-2">
                  <Label>Unit *</Label>
                  <Select value={form.land_size_unit} onValueChange={(v) => update("land_size_unit", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="acre">Acre</SelectItem>
                      <SelectItem value="hectare">Hectare</SelectItem>
                      <SelectItem value="sq_ft">Sq Ft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Country *</Label><Input value={form.country} onChange={(e) => update("country", e.target.value)} required maxLength={100} /></div>
                <div className="space-y-2"><Label>State *</Label><Input value={form.state} onChange={(e) => update("state", e.target.value)} required maxLength={100} /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>City *</Label><Input value={form.city} onChange={(e) => update("city", e.target.value)} required maxLength={100} /></div>
                <div className="space-y-2"><Label>Village / Area</Label><Input value={form.village} onChange={(e) => update("village", e.target.value)} maxLength={100} /></div>
              </div>
              <div className="space-y-2">
                <Label>Google Maps Link</Label>
                <Input value={form.google_maps_link} onChange={(e) => update("google_maps_link", e.target.value)} placeholder="https://maps.google.com/..." maxLength={500} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Phone *</Label><Input value={form.phone} onChange={(e) => update("phone", e.target.value)} required maxLength={20} /></div>
                <div className="space-y-2"><Label>WhatsApp Number</Label><Input value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} maxLength={20} /></div>
              </div>

              {/* Images */}
              <div className="space-y-2">
                <Label>Images (1–3) *</Label>
                <div className="flex flex-wrap gap-3">
                  {images.map((file, i) => (
                    <div key={i} className="relative h-24 w-24 overflow-hidden rounded-md border">
                      <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover" />
                      <button type="button" onClick={() => removeImage(i)} className="absolute right-1 top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {images.length < 3 && (
                    <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed text-muted-foreground hover:border-primary hover:text-primary">
                      <Upload className="h-5 w-5" />
                      <span className="mt-1 text-xs">Add</span>
                      <input type="file" accept="image/*" onChange={handleImageAdd} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Submitting..." : "Submit for Review"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AddListing;
