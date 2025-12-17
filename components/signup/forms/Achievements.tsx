'use client';

import type { UserData } from "../types";
import SimpleText from "./SimpleText";

type Props = {
  data: UserData["achievements"];
  onChange: (patch: Partial<UserData["achievements"]>) => void;
};

export default function Achievements({ data, onChange }: Props) {
  return (
    <SimpleText
      title="Achievements"
      placeholder="Add achievements or awards..."
      value={data.achievements}
      onChange={(value) => onChange({ achievements: value })}
    />
  );
}
