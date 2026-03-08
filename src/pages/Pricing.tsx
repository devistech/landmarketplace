import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const plans = [
  { id: "free", name: "Free", price: "₹0", period: "", listings: 1, features: ["1 active listing", "Basic visibility", "Contact buttons"] },
  { id: "pro", name: "Pro", price: "₹199", period: "/month", listings: 10, features: ["10 active listings", "Priority placement", "Analytics"], popular: true },
  { id: "business", name: "Business", price: "₹499", period: "/month", listings: 50, features: ["50 active listings", "Featured placement", "Premium support", "All Pro features"] },
];

const Pricing = () => {
  const { user } = useAuth();

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
                {user ? (
                  plan.id === "free" ? (
                    <Button variant="outline" className="w-full" disabled>Current Plan</Button>
                  ) : (
                    <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                      Upgrade to {plan.name}
                    </Button>
                  )
                ) : (
                  <Link to="/signup">
                    <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                      Get Started
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Pricing;
