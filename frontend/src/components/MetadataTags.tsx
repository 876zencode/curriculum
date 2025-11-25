import { Badge } from "@/components/ui/badge";
import { MetadataDTO } from "@/lib/types";

interface MetadataTagsProps {
  metadata: MetadataDTO;
}

export function MetadataTags({ metadata }: MetadataTagsProps) {
  const tags = [];

  if (metadata.type) {
    tags.push(<Badge key="type" variant="secondary">{metadata.type}</Badge>);
  }
  if (metadata.spec_version) {
    tags.push(<Badge key="spec_version" variant="secondary">Spec: {metadata.spec_version}</Badge>);
  }
  if (metadata.notes) {
    tags.push(<Badge key="notes" variant="secondary">{metadata.notes}</Badge>);
  }

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {tags}
    </div>
  );
}
