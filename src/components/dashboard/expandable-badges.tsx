"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";

type Item = {
  id: number;
  label: string;
};

type Props = {
  items: Item[];
  initialCount?: number;
};

export function ExpandableBadges({ items, initialCount = 3 }: Props) {
  const [expanded, setExpanded] = useState(false);
  const hiddenCount = Math.max(0, items.length - initialCount);
  const visibleItems = expanded ? items : items.slice(0, initialCount);

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {visibleItems.map((item) => (
        <Badge key={item.id} variant="outline">
          {item.label}
        </Badge>
      ))}
      {!expanded && hiddenCount > 0 && (
        <button
          type="button"
          className="inline-flex"
          onClick={() => setExpanded(true)}
        >
          <Badge variant="secondary">+{hiddenCount} more</Badge>
        </button>
      )}
    </div>
  );
}
