'use client';

import type { UserData } from "../types";
import SimpleText from "./SimpleText";

type Props = {
  data: UserData["preference"];
  onChange: (patch: Partial<UserData["preference"]>) => void;
};

export default function Preference({ data, onChange }: Props) {
  return (
    <SimpleText
      title="Preference"
      placeholder="Add role/location preferences..."
      value={data.preference}
      onChange={(value) => onChange({ preference: value })}
    />
  );
}
