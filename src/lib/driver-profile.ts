interface DriverProfileFields {
  driver_first_name: string | null;
  driver_last_name: string | null;
  driver_birth_date: string | null;
  driver_license_country: string | null;
  driver_license_issue_date: string | null;
  driver_license_class: string | null;
  driver_profile_completed: boolean;
}

function normalizeOptionalText(value: string | null | undefined): string | null {
  const trimmed = (value ?? "").trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeOptionalDate(value: string | null | undefined): string | null {
  const normalized = normalizeOptionalText(value);
  if (!normalized) return null;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return null;
  }

  const date = new Date(`${normalized}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return normalized;
}

function isFutureDate(dateIso: string): boolean {
  const today = new Date();
  const y = today.getUTCFullYear();
  const m = String(today.getUTCMonth() + 1).padStart(2, "0");
  const d = String(today.getUTCDate()).padStart(2, "0");
  const todayIso = `${y}-${m}-${d}`;
  return dateIso > todayIso;
}

function computeDriverProfileCompleted(fields: Omit<DriverProfileFields, "driver_profile_completed">): boolean {
  return Boolean(
    fields.driver_first_name &&
      fields.driver_last_name &&
      fields.driver_birth_date &&
      fields.driver_license_country &&
      fields.driver_license_issue_date &&
      fields.driver_license_class,
  );
}

function parseDriverProfileFromFormData(formData: FormData): {
  fields: DriverProfileFields;
  error: string | null;
} {
  const driverFirstName = normalizeOptionalText(formData.get("driver_first_name") as string | null);
  const driverLastName = normalizeOptionalText(formData.get("driver_last_name") as string | null);
  const driverBirthDateRaw = normalizeOptionalText(formData.get("driver_birth_date") as string | null);
  const driverLicenseCountryRaw = normalizeOptionalText(formData.get("driver_license_country") as string | null);
  const driverLicenseIssueDateRaw = normalizeOptionalText(formData.get("driver_license_issue_date") as string | null);
  const driverLicenseClass = normalizeOptionalText(formData.get("driver_license_class") as string | null);

  if ((driverFirstName && !driverLastName) || (!driverFirstName && driverLastName)) {
    return {
      fields: {
        driver_first_name: driverFirstName,
        driver_last_name: driverLastName,
        driver_birth_date: null,
        driver_license_country: null,
        driver_license_issue_date: null,
        driver_license_class: driverLicenseClass,
        driver_profile_completed: false,
      },
      error: "Bitte Vorname und Nachname gemeinsam angeben.",
    };
  }

  const driverBirthDate = normalizeOptionalDate(driverBirthDateRaw);
  if (driverBirthDateRaw && !driverBirthDate) {
    return {
      fields: {
        driver_first_name: driverFirstName,
        driver_last_name: driverLastName,
        driver_birth_date: null,
        driver_license_country: null,
        driver_license_issue_date: null,
        driver_license_class: driverLicenseClass,
        driver_profile_completed: false,
      },
      error: "Bitte ein gültiges Geburtsdatum eingeben.",
    };
  }
  if (driverBirthDate && isFutureDate(driverBirthDate)) {
    return {
      fields: {
        driver_first_name: driverFirstName,
        driver_last_name: driverLastName,
        driver_birth_date: null,
        driver_license_country: null,
        driver_license_issue_date: null,
        driver_license_class: driverLicenseClass,
        driver_profile_completed: false,
      },
      error: "Das Geburtsdatum darf nicht in der Zukunft liegen.",
    };
  }

  const driverLicenseIssueDate = normalizeOptionalDate(driverLicenseIssueDateRaw);
  if (driverLicenseIssueDateRaw && !driverLicenseIssueDate) {
    return {
      fields: {
        driver_first_name: driverFirstName,
        driver_last_name: driverLastName,
        driver_birth_date: driverBirthDate,
        driver_license_country: null,
        driver_license_issue_date: null,
        driver_license_class: driverLicenseClass,
        driver_profile_completed: false,
      },
      error: "Bitte ein gültiges Führerschein-Ausstellungsdatum eingeben.",
    };
  }
  if (driverLicenseIssueDate && isFutureDate(driverLicenseIssueDate)) {
    return {
      fields: {
        driver_first_name: driverFirstName,
        driver_last_name: driverLastName,
        driver_birth_date: driverBirthDate,
        driver_license_country: null,
        driver_license_issue_date: null,
        driver_license_class: driverLicenseClass,
        driver_profile_completed: false,
      },
      error: "Das Führerschein-Ausstellungsdatum darf nicht in der Zukunft liegen.",
    };
  }

  const driverLicenseCountry = driverLicenseCountryRaw ? driverLicenseCountryRaw.toUpperCase() : null;
  if (driverLicenseCountry && !/^[A-Z]{2}$/.test(driverLicenseCountry)) {
    return {
      fields: {
        driver_first_name: driverFirstName,
        driver_last_name: driverLastName,
        driver_birth_date: driverBirthDate,
        driver_license_country: null,
        driver_license_issue_date: driverLicenseIssueDate,
        driver_license_class: driverLicenseClass,
        driver_profile_completed: false,
      },
      error: "Bitte ein gültiges Führerschein-Land im ISO-2 Format angeben (z. B. DE).",
    };
  }

  const fieldsBase = {
    driver_first_name: driverFirstName,
    driver_last_name: driverLastName,
    driver_birth_date: driverBirthDate,
    driver_license_country: driverLicenseCountry,
    driver_license_issue_date: driverLicenseIssueDate,
    driver_license_class: driverLicenseClass,
  };

  return {
    fields: {
      ...fieldsBase,
      driver_profile_completed: computeDriverProfileCompleted(fieldsBase),
    },
    error: null,
  };
}

export type { DriverProfileFields };
export { parseDriverProfileFromFormData };
