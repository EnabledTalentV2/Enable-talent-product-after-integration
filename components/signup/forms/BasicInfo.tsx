'use client';

import InputBlock from "./InputBlock";
import type { UserData } from "../types";

type Props = {
  data: UserData["basicInfo"];
  onChange: (patch: Partial<UserData["basicInfo"]>) => void;
};

export default function BasicInfo({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <InputBlock label="Full Name" value={data.fullName} onChange={(v) => onChange({ fullName: v })} placeholder="Enter your full name" />
      <InputBlock label="Email" value={data.email} onChange={(v) => onChange({ email: v })} placeholder="you@example.com" type="email" />
      <InputBlock label="Phone" value={data.phone} onChange={(v) => onChange({ phone: v })} placeholder="+1 555 123 4567" />
      <InputBlock label="Location" value={data.location} onChange={(v) => onChange({ location: v })} placeholder="City, Country" />
    </div>
  );
}
