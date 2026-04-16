import { Building2, Landmark, GraduationCap, Scissors, ShoppingBag, Box } from "lucide-react";
import { QueueIndustry } from "@workspace/api-client-react";

export function IndustryIcon({ industry, className }: { industry: string, className?: string }) {
  switch (industry) {
    case QueueIndustry.hospital:
      return <Building2 className={className} />;
    case QueueIndustry.bank:
      return <Landmark className={className} />;
    case QueueIndustry.college:
      return <GraduationCap className={className} />;
    case QueueIndustry.salon:
      return <Scissors className={className} />;
    case QueueIndustry.retail:
      return <ShoppingBag className={className} />;
    default:
      return <Box className={className} />;
  }
}

export function getIndustryName(industry: string): string {
  return industry.charAt(0).toUpperCase() + industry.slice(1);
}
