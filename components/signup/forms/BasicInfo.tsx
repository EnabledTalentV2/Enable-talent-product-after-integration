"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { UploadCloud } from "lucide-react";
import LocationAutocomplete from "@/components/ui/LocationAutocomplete";
import InputBlock from "./InputBlock";
import SimpleText from "./SimpleText";
import type { UserData } from "@/lib/types/user";

type Props = {
  data: UserData["basicInfo"];
  onChange: (patch: Partial<UserData["basicInfo"]>) => void;
  errors?: Partial<Record<keyof UserData["basicInfo"], string>>;
  hideProfilePhoto?: boolean;
};

export default function BasicInfo({
  data,
  onChange,
  errors,
  hideProfilePhoto = false,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const minPhotoSizeBytes = 10 * 1024;
  const maxPhotoSizeBytes = 2 * 1024 * 1024;
  const resolvedPhotoError = errors?.profilePhoto || photoError;
  const hasPhotoError = Boolean(resolvedPhotoError);

  const clearProfilePhoto = () => {
    setPhotoError(null);
    onChange({ profilePhoto: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const selectClass = (hasError?: boolean) =>
    `w-full rounded-lg border bg-white px-4 py-2.5 text-base text-slate-800 shadow-sm focus:outline-none focus:ring-2 ${
      hasError
        ? "border-red-400 focus:ring-red-200 focus:border-red-500"
        : "border-gray-200 focus:ring-orange-500/30 focus:border-orange-500"
    }`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputBlock
          id="basicInfo-firstName"
          label="First Name"
          required
          value={data.firstName}
          onChange={(v) => onChange({ firstName: v })}
          placeholder="Enter first name"
          error={Boolean(errors?.firstName)}
          errorMessage={errors?.firstName}
        />
        <InputBlock
          id="basicInfo-lastName"
          label="Last Name"
          required
          value={data.lastName}
          onChange={(v) => onChange({ lastName: v })}
          placeholder="Enter last name"
          error={Boolean(errors?.lastName)}
          errorMessage={errors?.lastName}
        />
      </div>

      {!hideProfilePhoto ? (
        <div className="space-y-2">
          <label
            htmlFor="basicInfo-profilePhoto"
            className={`block text-base font-medium ${
              hasPhotoError ? "text-red-600" : "text-slate-700"
            }`}
          >
            Profile photo
          </label>
          <div
            className={`w-full rounded-lg border border-dashed bg-white px-4 py-4 focus-within:ring-2 ${
              hasPhotoError
                ? "border-red-400 focus-within:border-red-500 focus-within:ring-red-200"
                : "border-gray-300 focus-within:border-orange-500 focus-within:ring-orange-500/30"
            }`}
          >
            <label
              htmlFor="basicInfo-profilePhoto"
              className="flex cursor-pointer flex-col items-center gap-2 text-base text-slate-600"
            >
              <UploadCloud className="h-5 w-5 text-orange-500" />
              <div className="flex items-center gap-1">
                <span>Drag and drop or,</span>
                <span className="text-orange-500 font-medium">Browse</span>
              </div>
              <input
                id="basicInfo-profilePhoto"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  const file = event.target.files?.[0];
                  if (!file) {
                    setPhotoError(null);
                    onChange({ profilePhoto: "" });
                    return;
                  }

                  if (
                    file.size < minPhotoSizeBytes ||
                    file.size > maxPhotoSizeBytes
                  ) {
                    setPhotoError("Image must be between 10KB and 2MB.");
                    onChange({ profilePhoto: "" });
                    event.target.value = "";
                    return;
                  }

                  setPhotoError(null);
                  onChange({ profilePhoto: file.name });
                }}
              />
            </label>
            {data.profilePhoto ? (
              <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-sm">
                <span className="text-slate-500">
                  Selected: {data.profilePhoto}
                </span>
                <button
                  type="button"
                  onClick={clearProfilePhoto}
                  className="font-medium text-red-600 hover:text-red-700"
                >
                  Remove photo
                </button>
              </div>
            ) : null}
          </div>
          {resolvedPhotoError ? (
            <p className="text-sm text-red-600">{resolvedPhotoError}</p>
          ) : null}
        </div>
      ) : null}

      <InputBlock
        id="basicInfo-email"
        label="Email Address"
        required
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
        required
        value={data.phone}
        onChange={(v) => onChange({ phone: v })}
        placeholder="Enter phone number"
        error={Boolean(errors?.phone)}
        errorMessage={errors?.phone}
      />

      <div className="space-y-1.5">
        <label
          htmlFor="basicInfo-location"
          className={`block text-base font-medium ${
            errors?.location ? "text-red-700" : "text-slate-700"
          }`}
        >
          Location
          <span aria-hidden="true" className="text-red-600">
            {" "}
            *
          </span>
          <span className="sr-only"> (required)</span>
        </label>
        <LocationAutocomplete
          label=""
          inputId="basicInfo-location"
          inputName="location"
          value={data.location}
          onChange={(v) => onChange({ location: v })}
          error={errors?.location}
          required
          placeholder="City, Country"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="basicInfo-citizenshipStatus"
          className={`block text-base font-medium ${
            errors?.citizenshipStatus ? "text-red-600" : "text-slate-700"
          }`}
        >
          Citizenship status
          <span aria-hidden="true" className="text-red-600">
            {" "}
            *
          </span>
          <span className="sr-only"> (required)</span>
        </label>
        <select
          id="basicInfo-citizenshipStatus"
          className={selectClass(Boolean(errors?.citizenshipStatus))}
          value={data.citizenshipStatus}
          onChange={(e) => onChange({ citizenshipStatus: e.target.value })}
          aria-required="true"
        >
          <option value="">Select status</option>
          <option value="Canadian">Canadian</option>
          <option value="Permanent Resident">Permanent Resident</option>
          <option value="Work Permit">Work Permit</option>
          <option value="Student Visa">Student Visa</option>
          <option value="Other">Other</option>
        </select>
        {errors?.citizenshipStatus ? (
          <p className="text-sm text-red-600">{errors.citizenshipStatus}</p>
        ) : null}
      </div>

      <div className="space-y-2 text-sm text-slate-600">
        <p>
          Your response to this question is entirely voluntary and will not
          affect your eligibility.
        </p>
        <p>
          This information will be used by the Governments of Ontario and Canada
          for policy analysis and statistical purposes related to employment
          programs and services.
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="basicInfo-gender"
          className={`block text-base font-medium ${
            errors?.gender ? "text-red-600" : "text-slate-700"
          }`}
        >
          Gender
          <span aria-hidden="true" className="text-red-600">
            {" "}
            *
          </span>
          <span className="sr-only"> (required)</span>
        </label>
        <select
          id="basicInfo-gender"
          className={selectClass(Boolean(errors?.gender))}
          value={data.gender}
          onChange={(e) => onChange({ gender: e.target.value })}
          aria-required="true"
        >
          <option value="">Select</option>
          <option value="Female">Female</option>
          <option value="Male">Male</option>
          <option value="Non-binary">Non-binary</option>
          <option value="Prefer not to say">Prefer not to say</option>
        </select>
        {errors?.gender ? (
          <p className="text-sm text-red-600">{errors.gender}</p>
        ) : null}
      </div>

      <div className="space-y-2 text-sm text-slate-600">
        <p>
          Please select all that apply. Your response to this question is
          entirely voluntary and will not affect your eligibility.
        </p>
        <p>
          This information will be used by the Governments of Ontario and Canada
          for policy analysis and statistical purposes related to employment
          programs and services. (You may select more than one option).
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="basicInfo-ethnicity"
          className={`block text-base font-medium ${
            errors?.ethnicity ? "text-red-600" : "text-slate-700"
          }`}
        >
          Ethnicity
          <span aria-hidden="true" className="text-red-600">
            {" "}
            *
          </span>
          <span className="sr-only"> (required)</span>
        </label>
        <select
          id="basicInfo-ethnicity"
          className={selectClass(Boolean(errors?.ethnicity))}
          value={data.ethnicity}
          onChange={(e) => onChange({ ethnicity: e.target.value })}
          aria-required="true"
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
        {errors?.ethnicity ? (
          <p className="text-sm text-red-600">{errors.ethnicity}</p>
        ) : null}
      </div>

      <InputBlock
        id="basicInfo-socialProfile"
        label="Website or portfolio"
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
        placeholder="https://www.linkedin.com/in/your-profile"
        error={Boolean(errors?.linkedinUrl)}
        errorMessage={errors?.linkedinUrl}
      />

      <SimpleText
        id="basicInfo-currentStatus"
        label="About"
        value={data.currentStatus}
        onChange={(v) => onChange({ currentStatus: v })}
        placeholder="Describe about yourself"
        error={Boolean(errors?.currentStatus)}
        errorMessage={errors?.currentStatus}
      />
    </div>
  );
}
