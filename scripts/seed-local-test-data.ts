import { createClient } from "@supabase/supabase-js";

type SubscriptionTier = "free" | "pro";

type SeedUser = {
  email: string;
  password: string;
  displayName: string;
  subscriptionTier: SubscriptionTier;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const schema = process.env.SUPABASE_DB_SCHEMA || "public";

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Fehlende Umgebungsvariablen. Bitte zuerst `npm run supabase:start` ausfuehren.",
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  db: { schema: schema as "public" },
});

const COST_INVOICE_BUCKET = "cost-invoices";
const VEHICLE_IMAGE_BUCKET = "vehicle-images";

function isRetryableAuthError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const maybeStatus = (error as { status?: number }).status;
  return maybeStatus === 502 || maybeStatus === 503 || maybeStatus === 504;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withAuthRetry<T>(task: () => Promise<T>): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      const result = await task();
      const maybeError =
        typeof result === "object" && result !== null && "error" in result
          ? (result as { error?: unknown }).error
          : null;

      if (maybeError && isRetryableAuthError(maybeError)) {
        throw maybeError;
      }

      return result;
    } catch (error) {
      lastError = error;
      if (!isRetryableAuthError(error) || attempt === 5) {
        throw error;
      }

      const delayMs = 400 * (attempt + 1);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

async function waitForAuthAdminReady(): Promise<void> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      const { error } = await withAuthRetry(() =>
        supabase.auth.admin.listUsers({ page: 1, perPage: 1 }),
      );

      if (!error) {
        return;
      }

      if (!isRetryableAuthError(error)) {
        throw error;
      }

      lastError = error;
    } catch (error) {
      if (!isRetryableAuthError(error)) {
        throw error;
      }

      lastError = error;
    }

    await sleep(1000 + attempt * 250);
  }

  throw new Error(
    `Supabase Auth Admin wurde nicht rechtzeitig bereit (${String(lastError)}).`,
  );
}

const seedUsers: SeedUser[] = [
  {
    email: "free@testuser.local",
    password: "Test1234!",
    displayName: "Anna Testfahrer",
    subscriptionTier: "free",
  },
  {
    email: "pro@testuser.local",
    password: "Test1234!",
    displayName: "Max Profifahrer",
    subscriptionTier: "pro",
  },
];

function requireUserId(id: string | undefined, email: string): string {
  if (!id) {
    throw new Error(`Konnte keine User-ID fuer ${email} ermitteln.`);
  }

  return id;
}

async function findUserByEmail(email: string): Promise<{ id: string } | null> {
  let page = 1;

  while (true) {
    const { data, error } = await withAuthRetry(() =>
      supabase.auth.admin.listUsers({ page, perPage: 200 }),
    );
    if (error) {
      throw error;
    }

    const user = data.users.find(
      (candidate) => candidate.email?.toLowerCase() === email.toLowerCase(),
    );
    if (user?.id) {
      return { id: user.id };
    }

    if (data.users.length < 200) {
      return null;
    }

    page += 1;
  }
}

async function ensureAuthUser(user: SeedUser): Promise<string> {
  const existing = await findUserByEmail(user.email);

  if (!existing) {
    const { data, error } = await withAuthRetry(() =>
      supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { display_name: user.displayName },
      }),
    );

    if (error) {
      throw error;
    }

    return requireUserId(data.user?.id, user.email);
  }

  const { data, error } = await withAuthRetry(() =>
    supabase.auth.admin.updateUserById(existing.id, {
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { display_name: user.displayName },
    }),
  );

  if (error) {
    throw error;
  }

  return requireUserId(data.user?.id ?? existing.id, user.email);
}

async function upsertProfile(
  id: string,
  user: SeedUser,
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        id,
        email: user.email,
        display_name: user.displayName,
        subscription_tier: user.subscriptionTier,
      },
      { onConflict: "id" },
    );

  if (error) {
    throw error;
  }
}

async function seedDomainData(freeUserId: string, proUserId: string): Promise<void> {
  const seedUserIds = [freeUserId, proUserId];

  const { error: deleteCostEntriesError } = await supabase
    .from("cost_entries")
    .delete()
    .in("user_id", seedUserIds);

  if (deleteCostEntriesError) {
    throw deleteCostEntriesError;
  }

  const { error: deleteRemindersError } = await supabase
    .from("reminders")
    .delete()
    .in("user_id", seedUserIds);

  if (deleteRemindersError) {
    throw deleteRemindersError;
  }

  const { error: deleteVehiclesError } = await supabase
    .from("vehicles")
    .delete()
    .in("user_id", seedUserIds);

  if (deleteVehiclesError) {
    throw deleteVehiclesError;
  }

  const vehicles = [
    {
      id: "11111111-1111-4111-8111-111111111111",
      user_id: freeUserId,
      make: "VW",
      model: "Golf",
      year: 2019,
      fuel_type: "petrol",
      purchase_price: 17200,
      purchase_date: "2023-05-16",
      license_plate: "B-AB 1234",
      current_mileage: 45000,
    },
    {
      id: "22222222-2222-4222-8222-222222222221",
      user_id: proUserId,
      make: "BMW",
      model: "320d",
      year: 2020,
      fuel_type: "diesel",
      purchase_price: 28900,
      purchase_date: "2022-03-04",
      license_plate: "M-PRO 320",
      current_mileage: 68000,
    },
    {
      id: "22222222-2222-4222-8222-222222222222",
      user_id: proUserId,
      make: "Tesla",
      model: "Model 3",
      year: 2022,
      fuel_type: "electric",
      purchase_price: 39990,
      purchase_date: "2024-09-12",
      license_plate: "M-EV 3030",
      current_mileage: 28000,
    },
  ];

  const { error: upsertVehiclesError } = await supabase
    .from("vehicles")
    .upsert(vehicles, { onConflict: "id" });

  if (upsertVehiclesError) {
    throw upsertVehiclesError;
  }

  const costEntries: Array<{
    id: string;
    vehicle_id: string;
    user_id: string;
    category: string;
    title: string;
    amount: number;
    date: string;
    mileage?: number;
    liters?: number;
    price_per_liter?: number;
    notes?: string;
  }> = [];

  const formatDate = (date: Date, day: number): string => {
    const target = new Date(date.getFullYear(), date.getMonth(), day);
    const year = target.getFullYear();
    const month = String(target.getMonth() + 1).padStart(2, "0");
    const monthDay = String(target.getDate()).padStart(2, "0");
    return `${year}-${month}-${monthDay}`;
  };

  const makeCostId = (sequence: number): string =>
    `33333333-3333-4333-8333-${String(sequence).padStart(12, "0")}`;

  const monthAnchors: Date[] = [];
  const today = new Date();
  for (let i = 23; i >= 0; i -= 1) {
    monthAnchors.push(new Date(today.getFullYear(), today.getMonth() - i, 1));
  }

  const profiles = [
    {
      vehicle: vehicles[0],
      userId: freeUserId,
      monthlyKm: 1100,
      consumption: 6.9,
      energyPrice: 1.75,
      insurance: 54.9,
      taxQuarterly: 0,
      isElectric: false,
      fuelTitle: "Aral Super E10",
      notes: "Pendelstrecke und Stadtverkehr",
    },
    {
      vehicle: vehicles[1],
      userId: proUserId,
      monthlyKm: 1650,
      consumption: 5.7,
      energyPrice: 1.69,
      insurance: 68.5,
      taxQuarterly: 85.5,
      isElectric: false,
      fuelTitle: "Shell Diesel",
      notes: "Langstrecke mit Autobahnanteil",
    },
    {
      vehicle: vehicles[2],
      userId: proUserId,
      monthlyKm: 1300,
      consumption: 18.5,
      energyPrice: 0.36,
      insurance: 74.9,
      taxQuarterly: 0,
      isElectric: true,
      fuelTitle: "Ladestrom zuhause + HPC",
      notes: "Gemischte AC/DC Ladevorgaenge",
    },
  ];

  let sequence = 1;

  for (const profile of profiles) {
    const startMileage = Math.max(
      profile.vehicle.current_mileage - profile.monthlyKm * 24,
      0,
    );

    for (let index = 0; index < monthAnchors.length; index += 1) {
      const month = monthAnchors[index];
      const seasonFactor = [1.08, 1.08, 1.03, 1, 0.98, 0.97, 0.96, 0.97, 1, 1.02, 1.05, 1.08][month.getMonth()] ?? 1;
      const usageFactor = 0.96 + (index % 5) * 0.02;
      const monthMileage = startMileage + Math.round(profile.monthlyKm * (index + 1) + ((index % 4) - 1.5) * 42);
      const monthlyEnergyAmount =
        (profile.monthlyKm / 100) * profile.consumption * profile.energyPrice * seasonFactor * usageFactor;

      if (profile.isElectric) {
        costEntries.push({
          id: makeCostId(sequence),
          vehicle_id: profile.vehicle.id,
          user_id: profile.userId,
          category: "fuel",
          title: profile.fuelTitle,
          amount: Number(monthlyEnergyAmount.toFixed(2)),
          date: formatDate(month, 6),
          mileage: monthMileage,
          notes: profile.notes,
        });
        sequence += 1;

        costEntries.push({
          id: makeCostId(sequence),
          vehicle_id: profile.vehicle.id,
          user_id: profile.userId,
          category: "other",
          title: "Premium Konnektivitaet",
          amount: 9.99,
          date: formatDate(month, 2),
        });
        sequence += 1;

        if (index % 8 === 4) {
          costEntries.push({
            id: makeCostId(sequence),
            vehicle_id: profile.vehicle.id,
            user_id: profile.userId,
            category: "maintenance",
            title: "Reifenrotation und Auswuchten",
            amount: Number((85 + (index % 3) * 12).toFixed(2)),
            date: formatDate(month, 20),
            mileage: monthMileage,
          });
          sequence += 1;
        }
      } else {
        const liters = (profile.monthlyKm / 100) * profile.consumption * seasonFactor;
        const pricePerLiter = profile.energyPrice * usageFactor;
        costEntries.push({
          id: makeCostId(sequence),
          vehicle_id: profile.vehicle.id,
          user_id: profile.userId,
          category: "fuel",
          title: profile.fuelTitle,
          amount: Number((liters * pricePerLiter).toFixed(2)),
          date: formatDate(month, 6),
          mileage: monthMileage,
          liters: Number(liters.toFixed(2)),
          price_per_liter: Number(pricePerLiter.toFixed(3)),
          notes: profile.notes,
        });
        sequence += 1;

        if (index % 6 === 2) {
          costEntries.push({
            id: makeCostId(sequence),
            vehicle_id: profile.vehicle.id,
            user_id: profile.userId,
            category: "maintenance",
            title: "Inspektion / Oelwechsel",
            amount: Number((159 + (index % 4) * 23).toFixed(2)),
            date: formatDate(month, 18),
            mileage: monthMileage,
          });
          sequence += 1;
        }

        if (index % 10 === 5) {
          costEntries.push({
            id: makeCostId(sequence),
            vehicle_id: profile.vehicle.id,
            user_id: profile.userId,
            category: "repair",
            title: "Werkstatt-Reparatur",
            amount: Number((320 + (index % 3) * 110).toFixed(2)),
            date: formatDate(month, 23),
            mileage: monthMileage,
          });
          sequence += 1;
        }
      }

      costEntries.push({
        id: makeCostId(sequence),
        vehicle_id: profile.vehicle.id,
        user_id: profile.userId,
        category: "insurance",
        title: "Haftpflicht monatlich",
        amount: Number(profile.insurance.toFixed(2)),
        date: formatDate(month, 1),
      });
      sequence += 1;

      if (profile.taxQuarterly > 0 && month.getMonth() % 3 === 0) {
        costEntries.push({
          id: makeCostId(sequence),
          vehicle_id: profile.vehicle.id,
          user_id: profile.userId,
          category: "tax",
          title: "Kfz-Steuer",
          amount: Number(profile.taxQuarterly.toFixed(2)),
          date: formatDate(month, 4),
        });
        sequence += 1;
      }

      if (index % 2 === 0) {
        costEntries.push({
          id: makeCostId(sequence),
          vehicle_id: profile.vehicle.id,
          user_id: profile.userId,
          category: "parking",
          title: "Parken Innenstadt",
          amount: Number((18 + (index % 4) * 2.5).toFixed(2)),
          date: formatDate(month, 12),
        });
        sequence += 1;
      }
    }
  }

  const { error: upsertCostsError } = await supabase
    .from("cost_entries")
    .upsert(costEntries, { onConflict: "id" });

  if (upsertCostsError) {
    throw upsertCostsError;
  }

  const makeCommentId = (index: number): string =>
    `55555555-5555-4555-8555-${String(index).padStart(12, "0")}`;

  const comments = costEntries
    .filter((_, index) => index % 11 === 0)
    .slice(0, 32)
    .map((entry, index) => ({
      id: makeCommentId(index + 1),
      cost_entry_id: entry.id,
      user_id: entry.user_id,
      body:
        index % 2 === 0
          ? "Beleg geprueft, Betrag stimmt mit Kontoauszug ueberein."
          : "Werkstattposition dokumentiert, naechste Pruefung in 6 Monaten einplanen.",
    }));

  if (comments.length > 0) {
    const { error: upsertCommentsError } = await supabase
      .from("cost_comments")
      .upsert(comments, { onConflict: "id" });

    if (upsertCommentsError) {
      throw upsertCommentsError;
    }
  }

  const makeInvoiceId = (index: number): string =>
    `66666666-6666-4666-8666-${String(index).padStart(12, "0")}`;

  const invoiceCandidates = costEntries
    .filter((entry) => entry.category === "maintenance" || entry.category === "repair" || entry.category === "insurance")
    .slice(0, 30);

  const invoices: Array<{
    id: string;
    cost_entry_id: string;
    user_id: string;
    storage_path: string;
    file_name: string;
    mime_type: string;
    file_size_bytes: number;
    invoice_number: string;
    invoice_date: string;
    note: string;
  }> = [];

  for (let index = 0; index < invoiceCandidates.length; index += 1) {
    const entry = invoiceCandidates[index];
    if (!entry) continue;

    const invoiceId = makeInvoiceId(index + 1);
    const fileName = `Rechnung-${index + 1}.pdf`;
    const storagePath = `${entry.user_id}/${entry.id}/seed-${invoiceId}.pdf`;
    const invoiceNumber = `INV-${String(index + 1).padStart(5, "0")}`;
    const payload = Buffer.from(
      `Seed Rechnung\nKosten-ID: ${entry.id}\nKategorie: ${entry.category}\nBetrag: ${entry.amount}\n`,
      "utf-8",
    );

    const { error: uploadError } = await supabase.storage
      .from(COST_INVOICE_BUCKET)
      .upload(storagePath, payload, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    invoices.push({
      id: invoiceId,
      cost_entry_id: entry.id,
      user_id: entry.user_id,
      storage_path: storagePath,
      file_name: fileName,
      mime_type: "application/pdf",
      file_size_bytes: payload.length,
      invoice_number: invoiceNumber,
      invoice_date: entry.date,
      note: "Automatisch erzeugte Seed-Rechnung fuer Testzwecke.",
    });
  }

  if (invoices.length > 0) {
    const { error: upsertInvoicesError } = await supabase
      .from("cost_invoices")
      .upsert(invoices, { onConflict: "id" });

    if (upsertInvoicesError) {
      throw upsertInvoicesError;
    }
  }

  const vehicleComments = [
    {
      id: "77777777-7777-4777-8777-000000000001",
      vehicle_id: vehicles[0].id,
      user_id: freeUserId,
      body: "Lieblingsauto fuer den Alltag. Naechstes Upgrade: neue Felgen.",
    },
    {
      id: "77777777-7777-4777-8777-000000000002",
      vehicle_id: vehicles[1].id,
      user_id: proUserId,
      body: "Langstreckenprofil im Blick behalten, Wartungsintervall sauber dokumentieren.",
    },
    {
      id: "77777777-7777-4777-8777-000000000003",
      vehicle_id: vehicles[2].id,
      user_id: proUserId,
      body: "Detailing geplant, Fotoserie fuer Umbaufortschritt sammeln.",
    },
  ];

  const { error: upsertVehicleCommentsError } = await supabase
    .from("vehicle_comments")
    .upsert(vehicleComments, { onConflict: "id" });

  if (upsertVehicleCommentsError) {
    throw upsertVehicleCommentsError;
  }

  const imageBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgQfIYvYAAAAASUVORK5CYII=",
    "base64",
  );

  const vehicleImages = [
    {
      id: "88888888-8888-4888-8888-000000000001",
      vehicle_id: vehicles[0].id,
      user_id: freeUserId,
      storage_path: `${freeUserId}/${vehicles[0].id}/seed-golf.png`,
      file_name: "vw-golf-seed.png",
      mime_type: "image/png",
      file_size_bytes: imageBuffer.length,
      caption: "Seed-Bild Golf",
    },
    {
      id: "88888888-8888-4888-8888-000000000002",
      vehicle_id: vehicles[1].id,
      user_id: proUserId,
      storage_path: `${proUserId}/${vehicles[1].id}/seed-bmw.png`,
      file_name: "bmw-320d-seed.png",
      mime_type: "image/png",
      file_size_bytes: imageBuffer.length,
      caption: "Seed-Bild BMW",
    },
    {
      id: "88888888-8888-4888-8888-000000000003",
      vehicle_id: vehicles[2].id,
      user_id: proUserId,
      storage_path: `${proUserId}/${vehicles[2].id}/seed-tesla.png`,
      file_name: "tesla-model3-seed.png",
      mime_type: "image/png",
      file_size_bytes: imageBuffer.length,
      caption: "Seed-Bild Tesla",
    },
  ];

  for (const image of vehicleImages) {
    const { error: uploadImageError } = await supabase.storage
      .from(VEHICLE_IMAGE_BUCKET)
      .upload(image.storage_path, imageBuffer, {
        contentType: image.mime_type,
        upsert: true,
      });

    if (uploadImageError) {
      throw uploadImageError;
    }
  }

  const { error: upsertVehicleImagesError } = await supabase
    .from("vehicle_images")
    .upsert(vehicleImages, { onConflict: "id" });

  if (upsertVehicleImagesError) {
    throw upsertVehicleImagesError;
  }

  const reminders = [
    {
      id: "44444444-4444-4444-8444-444444444401",
      vehicle_id: vehicles[0].id,
      user_id: freeUserId,
      title: "TUEV erneuern",
      reminder_type: "date",
      due_date: "2026-08-15",
      notes: "HU/AU Termin buchen",
    },
    {
      id: "44444444-4444-4444-8444-444444444402",
      vehicle_id: vehicles[0].id,
      user_id: freeUserId,
      title: "Winterreifen aufziehen",
      reminder_type: "date",
      due_date: "2026-10-15",
    },
    {
      id: "44444444-4444-4444-8444-444444444411",
      vehicle_id: vehicles[1].id,
      user_id: proUserId,
      title: "Inspektion 70k",
      reminder_type: "mileage",
      due_mileage: 70000,
    },
    {
      id: "44444444-4444-4444-8444-444444444412",
      vehicle_id: vehicles[1].id,
      user_id: proUserId,
      title: "TUEV BMW",
      reminder_type: "date",
      due_date: "2026-06-30",
    },
    {
      id: "44444444-4444-4444-8444-444444444421",
      vehicle_id: vehicles[2].id,
      user_id: proUserId,
      title: "Bremsfluessigkeit check",
      reminder_type: "both",
      due_date: "2026-11-01",
      due_mileage: 32000,
    },
  ];

  const { error: upsertRemindersError } = await supabase
    .from("reminders")
    .upsert(reminders, { onConflict: "id" });

  if (upsertRemindersError) {
    throw upsertRemindersError;
  }
}

async function main(): Promise<void> {
  const freeUser = seedUsers[0];
  const proUser = seedUsers[1];

  if (!freeUser || !proUser) {
    throw new Error("Seed-User-Konfiguration ist unvollstaendig.");
  }

  await waitForAuthAdminReady();

  const freeUserId = await ensureAuthUser(freeUser);
  const proUserId = await ensureAuthUser(proUser);

  await upsertProfile(freeUserId, freeUser);
  await upsertProfile(proUserId, proUser);

  await seedDomainData(freeUserId, proUserId);

  console.log("Testdaten wurden erfolgreich angelegt/aktualisiert.");
  console.log(`Free User: ${freeUser.email}`);
  console.log(`Pro User: ${proUser.email}`);
}

main().catch((error: unknown) => {
  console.error("Fehler beim Seeding der Testdaten.");
  console.error(error);
  process.exit(1);
});
