"use client";

import { Save, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSites } from "../../sites/sites.api";
import { createUser, getUser, updateUser } from "../users.api";
import { getCountryOptions, languages, roles } from "./constants";
import { FieldLabel, Input, Select, Textarea } from "./FormField";
import { ProfileUploader } from "./ProfileUploader";
import { DeploymentAssignment, SiteAssignments } from "./DeploymentAssignments";
import type { EmployeeFormValues, SiteOption } from "./types";

const initialValues: EmployeeFormValues = {
  fullName: "",
  employeeId: "",
  company: "",
  nric: "",
  password: "",
  confirmPassword: "",
  dateOfBirth: "",
  nationality: "",
  gender: "",
  race: "",
  religion: "",
  phone: "",
  email: "",
  nfcCode: "",
  maritalStatus: "",
  address: "",
  role: "",
  secondaryRole: "",
  insurancePlan: "",
  primaryNokName: "",
  primaryNokRelationship: "",
  primaryNokLanguage: "",
  primaryNokPhone: "",
  secondaryNokName: "",
  secondaryNokRelationship: "",
  secondaryNokLanguage: "",
  secondaryNokPhone: "",
  vaccinated: "",
  deploymentSiteId: "",
  bypassGpsGeofence: false,
  siteIds: [],
};
const sectionClass =
  "rounded-xl border border-slate-200 bg-white p-5 shadow-sm";
const groupClass = "grid gap-x-5 gap-y-4 md:grid-cols-2";

export function BasicEmployeeForm({
  onSaved,
  mode = "create",
  employeeId,
  initialData,
  onUpdated,
  formId,
}: {
  onSaved?: (employeeId: string) => void;
  mode?: "create" | "edit";
  /** Internal database user id when this form is used on the edit route. */
  employeeId?: string;
  initialData?: EmployeeFormValues | null;
  onUpdated?: (employeeId: string) => void;
  formId?: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<EmployeeFormValues>(() =>
    initialData
      ? { ...initialValues, ...initialData, password: "", confirmPassword: "" }
      : initialValues,
  );
  const [sites, setSites] = useState<SiteOption[]>([]);
  const [countryOptions, setCountryOptions] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState(
    () => (initialData?.profileImageUrl as string) ?? "",
  );
  const [loadingDetails, setLoadingDetails] = useState(
    mode === "edit" && Boolean(employeeId) && !initialData,
  );
  useEffect(() => {
    getSites()
      .then((items) =>
        setSites(items.map((site) => ({ id: site.id, name: site.name }))),
      )
      .catch(() => setSites([]));
  }, []);
  useEffect(() => {
    Promise.resolve().then(() => setCountryOptions(getCountryOptions()));
  }, []);
  useEffect(() => {
    if (mode !== "edit" || !employeeId || initialData) return;

    let active = true;
    void getUser(employeeId)
      .then((employee) => {
        if (!active) return;
        setValues({
          ...initialValues,
          ...(employee as EmployeeFormValues),
          password: "",
          confirmPassword: "",
        });
        setExistingImageUrl((employee.profileImageUrl as string) ?? "");
        setLoadingDetails(false);
      })
      .catch((cause) => {
        if (!active) return;
        setError(
          cause instanceof Error
            ? cause.message
            : "Unable to load employee details.",
        );
        setLoadingDetails(false);
      });

    return () => {
      active = false;
    };
  }, [employeeId, initialData, mode]);
  const preview = useMemo(
    () => (file ? URL.createObjectURL(file) : existingImageUrl || null),
    [existingImageUrl, file],
  );
  const age = useMemo(() => {
    const dob = values.dateOfBirth as string;
    if (!dob) return "";
    const date = new Date(dob);
    const now = new Date();
    return String(
      now.getFullYear() -
        date.getFullYear() -
        (now < new Date(now.getFullYear(), date.getMonth(), date.getDate())
          ? 1
          : 0),
    );
  }, [values.dateOfBirth]);
  const canSave =
    [
      "fullName",
      "employeeId",
      "employmentType",
      "password",
      "confirmPassword",
      "nationality",
      "phone",
      "role",
      "secondaryRole",
    ].every((key) => Boolean(values[key])) &&
    (mode === "edit" ||
      ((values.password as string) &&
        values.password === values.confirmPassword));
  const setValue = (key: string, value: string | boolean | string[]) =>
    setValues((current) => ({ ...current, [key]: value }));
  const toggleSite = (siteId: string) => {
    const selected = values.siteIds as string[];
    setValue(
      "siteIds",
      selected.includes(siteId)
        ? selected.filter((id) => id !== siteId)
        : [...selected, siteId],
    );
  };
  const selectDeployment = (siteId: string) =>
    setValue("deploymentSiteId", siteId);
  const uploadImage = async () => {
    if (!file) return undefined;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset)
      throw new Error(
        "Cloudinary is not configured. Add the cloud name and unsigned upload preset to frontend/.env.local.",
      );
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData },
    );
    if (!response.ok) throw new Error("Profile image upload failed.");
    return ((await response.json()) as { secure_url: string }).secure_url;
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (values.password && (values.password as string) !== (values.confirmPassword as string)) {
      setError("Password and confirm password must match.");
      return;
    }
    setSaving(true);
    try {
      const uploadedImageUrl = await uploadImage();
      const profileImageUrl = uploadedImageUrl ?? existingImageUrl ?? undefined;
      const payload = {
        ...values,
        password: (values.password as string) || undefined,
        profileImageUrl,
        siteIds: values.siteIds as string[],
      };
      if (mode === "edit") {
        const updateTarget = employeeId ?? (initialData?.employeeId as string);
        if (!updateTarget) throw new Error("Employee ID is missing from this edit request.");
        await updateUser(updateTarget, payload);
        if (uploadedImageUrl) setExistingImageUrl(uploadedImageUrl);
        onUpdated?.(values.employeeId as string);
      } else {
        await createUser({ ...payload, password: values.password as string });
        if (onSaved) {
          onSaved(values.employeeId as string);
        } else {
          router.push(
            `/om/users/create-new-employee?employeeId=${encodeURIComponent(values.employeeId as string)}&tab=employment`,
          );
        }
      }
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to save employee.",
      );
    } finally {
      setSaving(false);
    }
  };
  if (mode === "edit" && loadingDetails) {
    return (
      <div className="rounded-xl border border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
        Loading employee details…
      </div>
    );
  }
  return (
    <form id={formId} onSubmit={submit} className="space-y-5">
      <section className={sectionClass}>
        <ProfileUploader preview={preview} onChange={setFile} />
        <p className="mt-5 text-center text-base font-semibold text-slate-900">
          Profile Picture
        </p>
        <div className={`${groupClass} mt-8`}>
          <Field
            name="fullName"
            label="Full Name"
            required
            placeholder="Enter full name"
            value={values.fullName as string}
            onChange={setValue}
          />
          <Field
            name="nric"
            label="NRIC"
            placeholder="Enter NRIC number"
            value={values.nric as string}
            onChange={setValue}
          />
          <Field
            name="employeeId"
            label="Employee ID"
            required
            placeholder="Enter employee ID"
            value={values.employeeId as string}
            onChange={setValue}
          />
          <Field
            name="company"
            label="Company (Optional)"
            placeholder="Enter company name"
            value={values.company as string}
            onChange={setValue}
          />
          <Choice
            name="employmentType"
            label="Employment Type"
            required={mode === "create"}
            value={values.employmentType as string}
            onChange={setValue}
            options={["Permanent", "Relief", "Contract", "Part Time"]}
          />
          <Field
            name="password"
            label="Password"
            required={mode === "create"}
            type="password"
            placeholder={mode === "edit" ? "Leave blank to keep current password" : "Enter password"}
            value={values.password as string}
            onChange={setValue}
          />
          <Field
            name="confirmPassword"
            label="Confirm Password"
            required={mode === "create" || Boolean(values.password)}
            type="password"
            placeholder="Confirm password"
            value={values.confirmPassword as string}
            onChange={setValue}
          />
          <Field
            name="dateOfBirth"
            label="Date of Birth"
            type="date"
            value={values.dateOfBirth as string}
            onChange={setValue}
          />
          <div>
            <FieldLabel>Age</FieldLabel>
            <Input
              value={age}
              readOnly
              placeholder="Auto-calculated from Date of Birth"
              className="bg-slate-50"
            />
          </div>
          <Choice
            name="gender"
            label="Gender"
            value={values.gender as string}
            onChange={setValue}
            options={["Male", "Female"]}
          />
          <Choice
            name="nationality"
            label="Nationality"
            required
            value={values.nationality as string}
            onChange={setValue}
            options={countryOptions}
          />
          <Choice
            name="race"
            label="Race"
            value={values.race as string}
            onChange={setValue}
            options={["Malay", "Chinese", "Indian", "Others"]}
          />
          <Choice
            name="religion"
            label="Religion"
            value={values.religion as string}
            onChange={setValue}
            options={[
              "Islam",
              "Buddhism",
              "Christianity",
              "Hinduism",
              "Others",
            ]}
          />
          <Field
            name="phone"
            label="Phone No."
            required
            placeholder="Enter phone number"
            value={values.phone as string}
            onChange={setValue}
          />
          <Field
            name="email"
            label="Email Address"
            type="email"
            placeholder="Enter email address"
            value={values.email as string}
            onChange={setValue}
          />
          <Field
            name="nfcCode"
            label="NFC Code"
            placeholder="Enter NFC code"
            value={values.nfcCode as string}
            onChange={setValue}
          />
          <Choice
            name="maritalStatus"
            label="Marital Status"
            value={values.maritalStatus as string}
            onChange={setValue}
            options={["Single", "Married", "Divorced", "Widowed"]}
          />
        </div>
        <div className="mt-4">
          <FieldLabel>Address</FieldLabel>
          <Textarea
            value={values.address as string}
            onChange={(event) => setValue("address", event.target.value)}
            placeholder="Enter full home address"
          />
        </div>
        <div className={`${groupClass} mt-4`}>
          <Choice
            name="role"
            label="Role"
            required
            value={values.role as string}
            onChange={setValue}
            options={roles}
          />
          <Choice
            name="secondaryRole"
            label="Secondary Role"
            required={mode === "create"}
            value={values.secondaryRole as string}
            onChange={setValue}
            options={roles}
          />
          <Choice
            name="insurancePlan"
            label="Insurance Plan"
            value={values.insurancePlan as string}
            onChange={setValue}
            options={["Basic", "Extended"]}
          />
        </div>
      </section>
      <NokSection values={values} setValue={setValue} />
      <section className={sectionClass}>
        <h2 className="text-base font-semibold text-blue-800">
          Vaccination Details
        </h2>
        <div className="mt-4 max-w-xl">
          <Choice
            name="vaccinated"
            label="Is Vaccinated?"
            value={values.vaccinated as string}
            onChange={setValue}
            options={["Yes", "No"]}
          />
        </div>
      </section>
      <DeploymentAssignment
        sites={sites}
        selectedSiteId={values.deploymentSiteId as string}
        onDeploymentChange={selectDeployment}
      />
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <input
          type="checkbox"
          checked={Boolean(values.bypassGpsGeofence)}
          onChange={(event) =>
            setValue("bypassGpsGeofence", event.target.checked)
          }
          className="mt-0.5 size-4 rounded border-slate-300"
        />
        <span>
          <b className="text-sm">Bypass GPS Geofence Validation</b>
          <span className="mt-1 block text-xs text-amber-700">
            Allow this officer to check-in/out regardless of their distance from
            the site location.
          </span>
        </span>
      </label>
      <SiteAssignments
        sites={sites}
        selectedSiteIds={values.siteIds as string[]}
        onToggleSite={toggleSite}
      />
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      {mode === "create" && <footer className="flex flex-wrap items-center justify-between gap-3 pb-6">
        <div className="flex gap-3">
          <button
            disabled
            type="button"
            className="h-9 rounded-md border border-slate-200 px-4 text-sm text-slate-400"
          >
            ‹ Prev
          </button>
          <button
            disabled
            type="button"
            className="h-9 rounded-md border border-slate-200 px-4 text-sm text-slate-400"
          >
            Next ›
          </button>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/om/users")}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-4 text-sm"
          >
            <X className="size-4" />
            Exit
          </button>
          <button
            disabled={!canSave || saving}
            type="submit"
            className="inline-flex h-9 items-center gap-2 rounded-md bg-neutral-900 px-5 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Save className="size-4" />
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </footer>}
    </form>
  );
}

function Field({
  name,
  label,
  required,
  value,
  onChange,
  ...props
}: {
  name: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (name: string, value: string) => void;
} & Omit<React.ComponentProps<typeof Input>, "name" | "value" | "onChange">) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <Input
        name={name}
        value={value}
        required={required}
        onChange={(event) => onChange(name, event.target.value)}
        {...props}
      />
    </div>
  );
}
function Choice({
  name,
  label,
  required,
  value,
  onChange,
  options,
}: {
  name: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (name: string, value: string) => void;
  options: string[];
}) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <Select
        name={name}
        value={value}
        required={required}
        onChange={(event) => onChange(name, event.target.value)}
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
    </div>
  );
}
function NokSection({
  values,
  setValue,
}: {
  values: EmployeeFormValues;
  setValue: (key: string, value: string | boolean | string[]) => void;
}) {
  const person = (prefix: "primary" | "secondary", title: string) => (
    <div className="mt-5">
      <h3 className="text-base font-semibold">{title}</h3>
      <div className={`${groupClass} mt-4`}>
        <Field
          name={`${prefix}NokName`}
          label="Name"
          value={values[`${prefix}NokName`] as string}
          onChange={setValue}
          placeholder="Enter full name"
        />
        <Field
          name={`${prefix}NokRelationship`}
          label="Relationship to Employee"
          value={values[`${prefix}NokRelationship`] as string}
          onChange={setValue}
          placeholder={
            prefix === "primary"
              ? "e.g. Spouse, Parent"
              : "e.g. Sibling, Friend"
          }
        />
        <Choice
          name={`${prefix}NokLanguage`}
          label="Preferred Language"
          value={values[`${prefix}NokLanguage`] as string}
          onChange={setValue}
          options={languages}
        />
        <Field
          name={`${prefix}NokPhone`}
          label="Contact Number"
          value={values[`${prefix}NokPhone`] as string}
          onChange={setValue}
          placeholder="Enter contact number"
        />
      </div>
    </div>
  );
  return (
    <section className={sectionClass}>
      <h2 className="text-lg font-semibold text-blue-800">Next Of Kin (NOK)</h2>
      {person("primary", "Primary")}
      {person("secondary", "Secondary")}
    </section>
  );
}
