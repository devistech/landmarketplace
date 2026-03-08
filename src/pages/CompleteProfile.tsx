import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const CompleteProfile = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    country: "",
    state: "",
    city: "",
    village: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.full_name.trim() || !form.phone.trim() || !form.country.trim() || !form.state.trim() || !form.city.trim()) {
      toast.error("Please fill all required fields");
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ ...form, profile_completed: true })
      .eq("user_id", user.id);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      await refreshProfile();
      toast.success("Profile completed!");
      navigate("/dashboard");
    }
  };

  const update = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>We need a few details before you can start listing.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input value={form.full_name} onChange={(e) => update("full_name", e.target.value)} required maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label>Phone Number *</Label>
              <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} required maxLength={20} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Country *</Label>
                <Input value={form.country} onChange={(e) => update("country", e.target.value)} required maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label>State *</Label>
                <Input value={form.state} onChange={(e) => update("state", e.target.value)} required maxLength={100} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>City *</Label>
                <Input value={form.city} onChange={(e) => update("city", e.target.value)} required maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label>Village / Area</Label>
                <Input value={form.village} onChange={(e) => update("village", e.target.value)} maxLength={100} />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Complete Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompleteProfile;
