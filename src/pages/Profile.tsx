import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Profile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "", phone: "", country: "", state: "", city: "", village: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        country: profile.country || "",
        state: profile.state || "",
        city: profile.city || "",
        village: profile.village || "",
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("profiles").update(form).eq("user_id", user.id);
    setLoading(false);
    if (error) toast.error(error.message);
    else {
      await refreshProfile();
      toast.success("Profile updated!");
    }
  };

  const update = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  return (
    <Layout>
      <div className="container mx-auto max-w-lg px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2"><Label>Full Name</Label><Input value={form.full_name} onChange={(e) => update("full_name", e.target.value)} maxLength={100} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => update("phone", e.target.value)} maxLength={20} /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Country</Label><Input value={form.country} onChange={(e) => update("country", e.target.value)} maxLength={100} /></div>
                <div className="space-y-2"><Label>State</Label><Input value={form.state} onChange={(e) => update("state", e.target.value)} maxLength={100} /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>City</Label><Input value={form.city} onChange={(e) => update("city", e.target.value)} maxLength={100} /></div>
                <div className="space-y-2"><Label>Village / Area</Label><Input value={form.village} onChange={(e) => update("village", e.target.value)} maxLength={100} /></div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving..." : "Update Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Profile;
