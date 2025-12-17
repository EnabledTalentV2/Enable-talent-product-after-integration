'use client';

import InputBlock from "./InputBlock";
import type { UserData } from "../types";

type Props = {
  data: UserData["education"];
  onChange: (patch: Partial<UserData["education"]>) => void;
};

export default function Education({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <InputBlock label="School / University" value={data.school} onChange={(v) => onChange({ school: v })} placeholder="University name" />
      <InputBlock label="Degree" value={data.degree} onChange={(v) => onChange({ degree: v })} placeholder="BSc Computer Science" />
      <InputBlock label="Graduation" value={data.graduation} onChange={(v) => onChange({ graduation: v })} placeholder="May 2025" />
    </div>
  );
}
