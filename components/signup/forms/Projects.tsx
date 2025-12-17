'use client';

import type { UserData } from "../types";
import SimpleText from "./SimpleText";

type Props = {
  data: UserData["projects"];
  onChange: (patch: Partial<UserData["projects"]>) => void;
};

export default function Projects({ data, onChange }: Props) {
  return (
    <SimpleText
      title="Projects"
      placeholder="Describe your projects..."
      value={data.projects}
      onChange={(value) => onChange({ projects: value })}
    />
  );
}
