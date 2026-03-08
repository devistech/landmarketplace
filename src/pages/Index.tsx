import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import ListingCard from "@/components/ListingCard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MapPin, Search, Upload, Users, CheckCircle, ArrowRight, Tractor, Building2, Factory, Home } from "lucide-react";

const landTypes = [
  { icon: Tractor, label: "Agricultural", type: "agriculture" },
  { icon: Home, label: "Residential Plot", type: "residential_plot" },
  { icon: Building2, label: "Commercial", type: "commercial" },
  { icon: Factory, label: "Industrial", type: "industrial" },
];

const steps = [
  { icon: Upload, title: "List Your Land", desc: "Create a listing with photos, price, and location details." },
  { icon: Search, title: "Get Discovered", desc: "Buyers find your land through search and filters." },
  { icon: Users, title: "Connect with Buyers", desc: "Receive calls and WhatsApp messages from interested buyers." },
];

const plans = [
  { name: "Free", price: "₹0", listings: "1 active listing", features: ["Basic listing", "Contact buttons", "Public visibility"] },
  { name: "Pro", price: "₹199/mo", listings: "10 active listings", features: ["Priority listing", "All Free features", "Analytics dashboard"], popular: true },
  { name: "Business", price: "₹499/mo", listings: "50 active listings", features: ["Featured placement", "All Pro features", "Premium support"] },
];

const Index = () => {
  const { data: featuredListings } = useQuery({
    queryKey: ["featured-listings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("listings")
        .select("*, listing_images(*)")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(6);
      return data || [];
    },
  });

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 lg:py-32">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge variant="secondary" className="mb-4 text-sm">🌍 Global Land Marketplace</Badge>
            <h1 className="mx-auto mb-6 max-w-4xl font-serif text-4xl font-bold leading-tight md:text-6xl lg:text-7xl">
              Buy and Sell Land{" "}
              <span className="text-primary">Worldwide</span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
              Discover verified land listings across the globe. Agricultural, residential, commercial, and industrial — find the perfect plot.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link to="/browse">
                <Button size="lg" className="gap-2 text-base">
                  <Search className="h-5 w-5" /> Browse Lands
                </Button>
              </Link>
              <Link to="/add-listing">
                <Button size="lg" variant="outline" className="gap-2 text-base">
                  <Upload className="h-5 w-5" /> List Your Land
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Land Types */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center font-serif text-3xl font-bold">Explore by Land Type</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {landTypes.map((lt) => (
              <Link key={lt.type} to={`/browse?type=${lt.type}`}>
                <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/30">
                  <CardContent className="flex flex-col items-center gap-3 p-6">
                    <lt.icon className="h-10 w-10 text-primary transition-transform group-hover:scale-110" />
                    <span className="font-medium">{lt.label}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      {featuredListings && featuredListings.length > 0 && (
        <section className="bg-muted/50 py-16">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="font-serif text-3xl font-bold">Featured Lands</h2>
              <Link to="/browse">
                <Button variant="ghost" className="gap-1">
                  View All <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredListings.map((listing) => (
                <motion.div key={listing.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <ListingCard listing={listing} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center font-serif text-3xl font-bold">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                <Card className="h-full text-center">
                  <CardContent className="flex flex-col items-center gap-4 p-8">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                      <step.icon className="h-7 w-7 text-primary" />
                    </div>
                    <span className="text-sm font-bold text-primary">Step {i + 1}</span>
                    <h3 className="font-serif text-xl font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-4 text-center font-serif text-3xl font-bold">Simple, Transparent Pricing</h2>
          <p className="mb-12 text-center text-muted-foreground">Start free and scale as you grow.</p>
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.name} className={`relative ${plan.popular ? "border-primary shadow-lg" : ""}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
                )}
                <CardContent className="p-8">
                  <h3 className="font-serif text-xl font-bold">{plan.name}</h3>
                  <div className="my-4">
                    <span className="font-serif text-4xl font-bold">{plan.price}</span>
                  </div>
                  <p className="mb-6 text-sm text-muted-foreground">{plan.listings}</p>
                  <ul className="mb-8 space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link to="/pricing">
                    <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                      {plan.name === "Free" ? "Get Started" : "Choose Plan"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
