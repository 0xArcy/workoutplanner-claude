import { Trophy } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export function PRBadge() {
  return (
    <Badge variant="pr">
      <Trophy size={12} />
      PR
    </Badge>
  );
}
