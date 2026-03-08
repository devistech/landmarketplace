import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

interface ListingCardProps {
  listing: Tables<"listings"> & { listing_images?: Tables<"listing_images">[] };
}

const landTypeLabels: Record<string, string> = {
  agriculture: "Agriculture",
  residential_plot: "Residential Plot",
  commercial: "Commercial",
  industrial: "Industrial",
};

const ListingCard = ({ listing }: ListingCardProps) => {
  const imageUrl = listing.listing_images?.[0]?.image_url || "/placeholder.svg";

  return (
    <Link to={`/listing/${listing.id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={imageUrl}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        <CardContent className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {landTypeLabels[listing.land_type] || listing.land_type}
            </Badge>
            <span className="font-serif text-lg font-bold text-primary">
              ₹{listing.price.toLocaleString("en-IN")}
            </span>
          </div>
          <h3 className="mb-1 font-serif text-base font-semibold leading-tight line-clamp-1">
            {listing.title}
          </h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="line-clamp-1">
              {[listing.village, listing.city, listing.state, listing.country].filter(Boolean).join(", ")}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {listing.land_size} {listing.land_size_unit === "sq_ft" ? "sq ft" : listing.land_size_unit}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ListingCard;
