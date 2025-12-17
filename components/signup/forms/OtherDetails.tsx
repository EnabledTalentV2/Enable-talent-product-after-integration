'use client';

import type { UserData } from "../types";
import SimpleText from "./SimpleText";

type Props = {
  data: UserData["otherDetails"];
  onChange: (patch: Partial<UserData["otherDetails"]>) => void;
};

export default function OtherDetails({ data, onChange }: Props) {
  return (
    <SimpleText
      title="Other Details"
      placeholder="Anything else we should know..."
      value={data.otherDetails}
      onChange={(value) => onChange({ otherDetails: value })}
    />
  );
}
