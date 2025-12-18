'use client';

import { UploadCloud } from "lucide-react";
import InputBlock from "./InputBlock";
import type { UserData } from "../types";

type Props = {
  data: UserData["basicInfo"];
  onChange: (patch: Partial<UserData["basicInfo"]>) => void;
  errors?: Partial<Record<keyof UserData["basicInfo"], string>>;
};

export default function BasicInfo({ data, onChange, errors }: Props) {
  const selectClass = (hasError?: boolean) =>
    `w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 ${
      hasError ? "border-red-400 focus:ring-red-200 focus:border-red-500" : "border-gray-200 focus:ring-orange-500/30 focus:border-orange-500"
    }`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputBlock
          id="basicInfo-firstName"
          label="First Name"
          value={data.firstName}
          onChange={(v) => onChange({ firstName: v })}
          placeholder="Enter first name"
          error={Boolean(errors?.firstName)}
          errorMessage={errors?.firstName}
        />
        <InputBlock
          id="basicInfo-lastName"
          label="Last Name"
          value={data.lastName}
          onChange={(v) => onChange({ lastName: v })}
          placeholder="Enter last name"
          error={Boolean(errors?.lastName)}
          errorMessage={errors?.lastName}
        />
      </div>

      <div className="space-y-2">
        <label className={`block text-sm font-medium ${errors?.profilePhoto ? "text-red-600" : "text-slate-700"}`}>Profile photo</label>
        <div
          className={`w-full rounded-lg border border-dashed bg-white px-4 py-4 ${
            errors?.profilePhoto ? "border-red-400" : "border-gray-300"
          }`}
        >
          <label className="flex cursor-pointer flex-col items-center gap-2 text-sm text-slate-600">
            <UploadCloud className="h-5 w-5 text-orange-500" />
            <div className="flex items-center gap-1">
              <span>Drag and drop or,</span>
              <span className="text-orange-500 font-medium">Browse</span>
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onChange({ profilePhoto: e.target.files?.[0]?.name || "" })}
            />
          </label>
        </div>
        {errors?.profilePhoto ? <p className="text-xs text-red-600">{errors.profilePhoto}</p> : null}
      </div>

      <InputBlock
        id="basicInfo-email"
        label="Email Address"
        value={data.email}
        onChange={(v) => onChange({ email: v })}
        placeholder="Enter email address"
        type="email"
        error={Boolean(errors?.email)}
        errorMessage={errors?.email}
      />

      <InputBlock
        id="basicInfo-phone"
        label="Phone number"
        value={data.phone}
        onChange={(v) => onChange({ phone: v })}
        placeholder="(229) 555-0109"
        error={Boolean(errors?.phone)}
        errorMessage={errors?.phone}
      />

      <InputBlock
        id="basicInfo-location"
        label="Location"
        value={data.location}
        onChange={(v) => onChange({ location: v })}
        placeholder="City, Country"
        error={Boolean(errors?.location)}
        errorMessage={errors?.location}
      />

      <div className="space-y-2">
        <label className={`block text-sm font-medium ${errors?.citizenshipStatus ? "text-red-600" : "text-slate-700"}`}>Citizenship status</label>
        <select
          id="basicInfo-citizenshipStatus"
          className={selectClass(Boolean(errors?.citizenshipStatus))}
          value={data.citizenshipStatus}
          onChange={(e) => onChange({ citizenshipStatus: e.target.value })}
        >
          <option value="">Select status</option>
          <option value="Canadian">Canadian</option>
          <option value="Permanent Resident">Permanent Resident</option>
          <option value="Work Permit">Work Permit</option>
          <option value="Student Visa">Student Visa</option>
          <option value="Other">Other</option>
        </select>
        {errors?.citizenshipStatus ? <p className="text-xs text-red-600">{errors.citizenshipStatus}</p> : null}
      </div>

      <div className="space-y-2 text-xs text-slate-600">
        <p>Your response to this question is entirely voluntary and will not affect your eligibility.</p>
        <p>
          This information will be used by the Governments of Ontario and Canada for policy analysis and statistical purposes related to employment
          programs and services.
        </p>
      </div>

      <div className="space-y-2">
        <label className={`block text-sm font-medium ${errors?.gender ? "text-red-600" : "text-slate-700"}`}>Gender</label>
        <select
          id="basicInfo-gender"
          className={selectClass(Boolean(errors?.gender))}
          value={data.gender}
          onChange={(e) => onChange({ gender: e.target.value })}
        >
          <option value="">Select</option>
          <option value="Female">Female</option>
          <option value="Male">Male</option>
          <option value="Non-binary">Non-binary</option>
          <option value="Prefer not to say">Prefer not to say</option>
        </select>
        {errors?.gender ? <p className="text-xs text-red-600">{errors.gender}</p> : null}
      </div>

      <div className="space-y-2 text-xs text-slate-600">
        <p>Please select all that apply. Your response to this question is entirely voluntary and will not affect your eligibility.</p>
        <p>
          This information will be used by the Governments of Ontario and Canada for policy analysis and statistical purposes related to employment
          programs and services. (You may select more than one option).
        </p>
      </div>

      <div className="space-y-2">
        <label className={`block text-sm font-medium ${errors?.ethnicity ? "text-red-600" : "text-slate-700"}`}>Ethnicity</label>
        <select
          id="basicInfo-ethnicity"
          className={selectClass(Boolean(errors?.ethnicity))}
          value={data.ethnicity}
          onChange={(e) => onChange({ ethnicity: e.target.value })}
        >
          <option value="">Select</option>
          <option value="South Asian">South Asian</option>
          <option value="East Asian">East Asian</option>
          <option value="Black">Black</option>
          <option value="Middle Eastern">Middle Eastern</option>
          <option value="Latino">Latino</option>
          <option value="Indigenous">Indigenous</option>
          <option value="White">White</option>
          <option value="Other">Other</option>
        </select>
        {errors?.ethnicity ? <p className="text-xs text-red-600">{errors.ethnicity}</p> : null}
      </div>

      <InputBlock
        label="Social Profile"
        value={data.socialProfile}
        onChange={(v) => onChange({ socialProfile: v })}
        placeholder="Website or portfolio"
        error={Boolean(errors?.socialProfile)}
        errorMessage={errors?.socialProfile}
      />

      <InputBlock
        id="basicInfo-linkedinUrl"
        label="LinkedIn URL"
        value={data.linkedinUrl}
        onChange={(v) => onChange({ linkedinUrl: v })}
        placeholder="www.linkedin.com/yourprofile"
        error={Boolean(errors?.linkedinUrl)}
        errorMessage={errors?.linkedinUrl}
      />

      <InputBlock
        id="basicInfo-currentStatus"
        label="What is your current status and goal in joining the BReady Talent Program?"
        value={data.currentStatus}
        onChange={(v) => onChange({ currentStatus: v })}
        placeholder="Describe your status and goals"
        error={Boolean(errors?.currentStatus)}
        errorMessage={errors?.currentStatus}
      />
    </div>
  );
}
