'use client';

import type { UserData } from "../types";
import SimpleText from "./SimpleText";

type Props = {
  data: UserData["skills"];
  onChange: (patch: Partial<UserData["skills"]>) => void;
};

export default function Skills({ data, onChange }: Props) {
  return (
    <SimpleText
      title="Skills"
      placeholder="List your top skills..."
      value={data.skills}
      onChange={(value) => onChange({ skills: value })}
    />
  );
}
