'use client';

import type { UserData } from "../types";
import SimpleText from "./SimpleText";

type Props = {
  data: UserData["certification"];
  onChange: (patch: Partial<UserData["certification"]>) => void;
};

export default function Certification({ data, onChange }: Props) {
  return (
    <SimpleText
      title="Certification"
      placeholder="List certifications..."
      value={data.certification}
      onChange={(value) => onChange({ certification: value })}
    />
  );
}
