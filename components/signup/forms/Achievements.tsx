"use client";

import { Plus, Trash2 } from "lucide-react";
import InputBlock from "./InputBlock";
import type { UserData } from "@/lib/types/user";

type Entry = UserData["achievements"]["entries"][number];

type Props = {
  data: UserData["achievements"];
  onEntryChange: (index: number, patch: Partial<Entry>) => void;
  onAddEntry: () => void;
  onRemoveEntry?: (index: number) => void;
};

export default function Achievements({
  data,
  onEntryChange,
  onAddEntry,
  onRemoveEntry,
}: Props) {
  const entries = data.entries;

  return (
    <div className="space-y-8">
      {entries.map((entry, idx) => (
        <div key={idx} className="space-y-6">
          {onRemoveEntry && entries.length > 1 ? (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onRemoveEntry(idx)}
                className="flex items-center gap-1 text-sm font-semibold text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            </div>
          ) : null}

          <InputBlock
            id={`achievement-${idx}-title`}
            label="Title"
            required
            value={entry.title}
            onChange={(v) => onEntryChange(idx, { title: v })}
            placeholder="Spot Award"
          />

          <InputBlock
            id={`achievement-${idx}-issueDate`}
            label="Issue Date"
            value={entry.issueDate}
            onChange={(v) => onEntryChange(idx, { issueDate: v })}
            type="date"
            placeholder="YYYY-MM-DD"
            hint="Use the format YYYY-MM-DD."
          />

          <InputBlock
            id={`achievement-${idx}-description`}
            label="Description"
            value={entry.description}
            onChange={(v) => onEntryChange(idx, { description: v })}
            placeholder="Received Spot Award in recognition of outstanding performance and contributions..."
          />
        </div>
      ))}

      <button
        type="button"
        onClick={onAddEntry}
        className="inline-flex items-center gap-2 text-[#C27528] border border-[#C27528] px-4 py-2 rounded-lg font-medium text-base hover:bg-orange-50 transition-colors"
      >
        <Plus size={16} />
        {entries.length === 0 ? "Add achievement" : "Add another achievement"}
      </button>
    </div>
  );
}
