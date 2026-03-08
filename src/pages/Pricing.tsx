import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const plans = [
  { id: "free", name: "Free", price: "₹0", period: "", listings: 1, features: ["1 active listing", "Basic visibility", "Contact buttons"] },
  { id: "pro", name: "Pro", price: "₹199", period: "/month", listings: 10, features: ["10 active listings", "Priority placement", "Analytics"], popular: true },
  { id: "business", name: "Business", price: "₹499", period: "/month", listings: 50, features: ["50 active listings", "Featured placement", "Premium support", "All Pro features"] },
];

const Pricing = () => {
  const { user, session } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [loading, setLoading] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (document.getElementById("razorpay-script")) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchSub = async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("plan_name, expiry_date")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data && data.expiry_date && new Date(data.expiry_date) > new Date()) {
        setCurrentPlan(data.plan_name);
      } else {
        setCurrentPlan("free");
      }
    };
    fetchSub();
  }, [user]);

  const handleSubscribe = async (planId: string) => {
    if (!user || !session) {
      toast.error("Please log in first");
      return;
    }
    if (!scriptLoaded) {
      toast.error("Payment system is loading, please wait...");
      return;
    }

    setLoading(planId);

    try {
      const { data, error } = await supabase.functions.invoke("razorpay-subscription", {
        body: { action: "create_order", plan_name: planId },
      });

      if (error || !data?.order_id) {
        console.error("Order creation error:", error, data);
        toast.error("Failed to create order. Please try again.");
        setLoading(null);
        return;
      }

      const options = {
        key: data.razorpay_key,
        amount: data.amount,
        currency: data.currency,
        name: "LandMarket",
        description: `${planId === "pro" ? "Pro" : "Business"} Plan - Monthly`,
        order_id: data.order_id,
        handler: async (response: any) => {
          try {
            const { error: verifyError } = await supabase.functions.invoke("razorpay-subscription", {
              body: {
                action: "verify_payment",
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan_name: planId,
              },
            });

            if (verifyError) {
              toast.error("Payment verification failed");
            } else {
              toast.success(`Successfully subscribed to ${planId === "pro" ? "Pro" : "Business"} plan!`);
              setCurrentPlan(planId);
            }
          } catch {
            toast.error("Payment verification failed");
          }
          setLoading(null);
        },
        modal: {
          ondismiss: () => setLoading(null),
        },
        prefill: {
          email: user.email,
        },
        theme: { color: "#4a7c59" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
      setLoading(null);
    }
  };

  const getPlanButton = (plan: typeof plans[0]) => {
    if (!user) {
      return (
        <Link to="/signup">
          <Button className="w-full" variant={plan.popular ? "default" : "outline"}>Get Started</Button>
        </Link>
      );
    }
    if (plan.id === currentPlan) {
      return <Button variant="outline" className="w-full" disabled>Current Plan</Button>;
    }
    if (plan.id === "free") {
      return <Button variant="outline" className="w-full" disabled>Free Plan</Button>;
    }
    if (currentPlan === "business" && plan.id === "pro") {
      return <Button variant="outline" className="w-full" disabled>Included</Button>;
    }
    return (
      <Button className="w-full" variant={plan.popular ? "default" : "outline"} onClick={() => handleSubscribe(plan.id)} disabled={loading !== null}>
        {loading === plan.id ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : `Upgrade to ${plan.name}`}
      </Button>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-serif text-4xl font-bold">Choose Your Plan</h1>
          <p className="text-lg text-muted-foreground">Start free and scale as you grow.</p>
        </div>
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.popular ? "border-primary shadow-lg scale-105" : ""}`}>
              {plan.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>}
              <CardContent className="p-8">
                <h3 className="font-serif text-xl font-bold">{plan.name}</h3>
                <div className="my-4">
                  <span className="font-serif text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="mb-6 text-sm text-muted-foreground">{plan.listings} active listing{plan.listings > 1 ? "s" : ""}</p>
                <ul className="mb-8 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" /> {f}
                    </li>
                  ))}
                </ul>
                {getPlanButton(plan)}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Pricing;
