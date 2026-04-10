import assert from "node:assert/strict";
import test from "node:test";
import { Client as PgClient } from "pg";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.DATABASE_URL;

if (!supabaseUrl || !serviceRoleKey || !databaseUrl) {
  throw new Error("Fehlende lokale Supabase-Variablen. Fuehre zuerst npm run supabase:start aus.");
}

function isRetryableAuthError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const status = (error as { status?: number }).status;
  return status === 502 || status === 503 || status === 504;
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

async function waitForAuthAdminReady(
  supabase: SupabaseClient,
): Promise<void> {
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

  throw new Error(`Supabase Auth Admin blieb nicht erreichbar (${String(lastError)}).`);
}

test("local postgres accepts direct connections", async () => {
  const client = new PgClient({ connectionString: databaseUrl });

  await client.connect();
  const result = await client.query<{ current_database: string }>(
    "select current_database() as current_database",
  );
  await client.end();

  assert.equal(result.rows[0]?.current_database, "postgres");
});

test("local supabase can create and read app data", async (t) => {
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  await waitForAuthAdminReady(supabase);

  const email = `integration-${Date.now()}@local.test`;
  const password = "Integration123!";
  let userId: string | null = null;

  await t.test("create auth user and profile", async () => {
    const { data, error } = await withAuthRetry(() =>
      supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          display_name: "Integration Test",
          driver_first_name: "Inga",
          driver_last_name: "Tester",
          driver_birth_date: "1993-05-17",
          driver_license_country: "de",
          driver_license_issue_date: "2011-08-30",
          driver_license_class: "B",
        },
      }),
    );

    assert.equal(error, null);
    userId = data.user?.id ?? null;
    assert.ok(userId);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, display_name, subscription_tier, driver_first_name, driver_last_name, driver_birth_date, driver_license_country, driver_license_issue_date, driver_license_class, driver_profile_completed")
      .eq("id", userId)
      .single();

    assert.equal(profileError, null);
    assert.equal(profile?.email, email);
    assert.equal(profile?.display_name, "Integration Test");
    assert.equal(profile?.subscription_tier, "free");
    assert.equal(profile?.driver_first_name, "Inga");
    assert.equal(profile?.driver_last_name, "Tester");
    assert.equal(profile?.driver_birth_date, "1993-05-17");
    assert.equal(profile?.driver_license_country, "DE");
    assert.equal(profile?.driver_license_issue_date, "2011-08-30");
    assert.equal(profile?.driver_license_class, "B");
    assert.equal(profile?.driver_profile_completed, true);

    const { error: profileUpdateError } = await supabase
      .from("profiles")
      .update({
        driver_first_name: "Inga-Maria",
        driver_last_name: "Tester",
        driver_birth_date: "1993-05-17",
        driver_license_country: "AT",
        driver_license_issue_date: "2012-09-01",
        driver_license_class: "B",
        driver_profile_completed: true,
      })
      .eq("id", userId);

    assert.equal(profileUpdateError, null);

    const { data: updatedProfile, error: updatedProfileError } = await supabase
      .from("profiles")
      .select("driver_first_name, driver_license_country")
      .eq("id", userId)
      .single();

    assert.equal(updatedProfileError, null);
    assert.equal(updatedProfile?.driver_first_name, "Inga-Maria");
    assert.equal(updatedProfile?.driver_license_country, "AT");
  });

  await t.test("insert and read vehicle row", async () => {
    assert.ok(userId);

    const { data: vehicle, error: insertError } = await supabase
      .from("vehicles")
      .insert({
        user_id: userId,
        make: "Test",
        model: "Car",
        year: 2024,
        fuel_type: "petrol",
        license_plate: "TEST-100",
        current_mileage: 12345,
      })
      .select("id, make, model, current_mileage")
      .single();

    assert.equal(insertError, null);
    assert.equal(vehicle?.make, "Test");
    assert.equal(vehicle?.model, "Car");

    const { data: storedVehicle, error: selectError } = await supabase
      .from("vehicles")
      .select("id, make, model, current_mileage")
      .eq("id", vehicle?.id ?? "")
      .single();

    assert.equal(selectError, null);
    assert.equal(storedVehicle?.current_mileage, 12345);

    const { error: deleteVehicleError } = await supabase
      .from("vehicles")
      .delete()
      .eq("id", vehicle?.id ?? "");

    assert.equal(deleteVehicleError, null);
  });

  await t.test("insert financed vehicle acquisition profile", async () => {
    assert.ok(userId);

    const { data: vehicle, error: insertError } = await supabase
      .from("vehicles")
      .insert({
        user_id: userId,
        make: "Finance",
        model: "Edition",
        year: 2022,
        fuel_type: "petrol",
        license_plate: "FIN-2022",
        current_mileage: 54321,
        acquisition_type: "finance",
        acquisition_subtype: "classic_loan",
        down_payment: 2500,
        monthly_payment: 299,
        term_months: 36,
        final_payment: 4500,
        purchase_price: 17764,
      })
      .select("id, acquisition_type, acquisition_subtype, down_payment, monthly_payment, term_months, final_payment")
      .single();

    assert.equal(insertError, null);
    assert.equal(vehicle?.acquisition_type, "finance");
    assert.equal(vehicle?.acquisition_subtype, "classic_loan");
    assert.equal(Number(vehicle?.down_payment), 2500);
    assert.equal(Number(vehicle?.monthly_payment), 299);
    assert.equal(vehicle?.term_months, 36);
    assert.equal(Number(vehicle?.final_payment), 4500);

    const { error: deleteVehicleError } = await supabase
      .from("vehicles")
      .delete()
      .eq("id", vehicle?.id ?? "");

    assert.equal(deleteVehicleError, null);
  });

  await t.test("mark vehicle as sold with negative sale entry", async () => {
    assert.ok(userId);

    const { data: vehicle, error: vehicleError } = await supabase
      .from("vehicles")
      .insert({
        user_id: userId,
        make: "Sold",
        model: "Case",
        year: 2021,
        fuel_type: "petrol",
        license_plate: "SOLD-1",
        current_mileage: 77777,
      })
      .select("id, status")
      .single();

    assert.equal(vehicleError, null);
    assert.equal(vehicle?.status, "owned");

    const { data: saleEntry, error: saleEntryError } = await supabase
      .from("cost_entries")
      .insert({
        vehicle_id: vehicle?.id,
        user_id: userId,
        category: "other",
        title: "Fahrzeugverkauf",
        amount: -9500,
        is_vehicle_sale: true,
        date: "2026-04-09",
      })
      .select("id, amount, is_vehicle_sale")
      .single();

    assert.equal(saleEntryError, null);
    assert.equal(Number(saleEntry?.amount), -9500);
    assert.equal(saleEntry?.is_vehicle_sale, true);

    const { error: soldUpdateError } = await supabase
      .from("vehicles")
      .update({
        status: "sold",
        sold_at: "2026-04-09T12:00:00.000Z",
        sale_cost_entry_id: saleEntry?.id,
      })
      .eq("id", vehicle?.id);

    assert.equal(soldUpdateError, null);

    const { data: storedVehicle, error: storedVehicleError } = await supabase
      .from("vehicles")
      .select("status, sale_cost_entry_id")
      .eq("id", vehicle?.id ?? "")
      .single();

    assert.equal(storedVehicleError, null);
    assert.equal(storedVehicle?.status, "sold");
    assert.equal(storedVehicle?.sale_cost_entry_id, saleEntry?.id);

    const { error: invalidNegativeError } = await supabase.from("cost_entries").insert({
      vehicle_id: vehicle?.id,
      user_id: userId,
      category: "other",
      title: "Invalid negative",
      amount: -5,
      date: "2026-04-10",
    });

    assert.equal(invalidNegativeError?.code, "23514");

    const { error: deleteVehicleError } = await supabase
      .from("vehicles")
      .delete()
      .eq("id", vehicle?.id ?? "");

    assert.equal(deleteVehicleError, null);
  });

  await t.test("insert cost detail data with comments and invoices", async () => {
    assert.ok(userId);

    const { data: vehicle, error: vehicleError } = await supabase
      .from("vehicles")
      .insert({
        user_id: userId,
        make: "Detail",
        model: "Case",
        year: 2023,
        fuel_type: "diesel",
        license_plate: "DETAIL-1",
        current_mileage: 45678,
      })
      .select("id")
      .single();

    assert.equal(vehicleError, null);
    assert.ok(vehicle?.id);

    const { data: cost, error: costError } = await supabase
      .from("cost_entries")
      .insert({
        vehicle_id: vehicle?.id,
        user_id: userId,
        category: "maintenance",
        title: "Inspektion Integration",
        amount: 249.9,
        date: "2026-04-01",
        notes: "Integrationstest",
      })
      .select("id")
      .single();

    assert.equal(costError, null);
    assert.ok(cost?.id);

    const { error: commentError } = await supabase.from("cost_comments").insert({
      cost_entry_id: cost?.id,
      user_id: userId,
      body: "Kommentar aus Integrationstest",
    });
    assert.equal(commentError, null);

    const storagePath = `${userId}/${cost?.id}/integration-test.pdf`;
    const fileBody = Buffer.from("integration invoice", "utf-8");
    const { error: uploadError } = await supabase.storage
      .from("cost-invoices")
      .upload(storagePath, fileBody, {
        contentType: "application/pdf",
        upsert: true,
      });
    assert.equal(uploadError, null);

    const { error: invoiceError } = await supabase.from("cost_invoices").insert({
      cost_entry_id: cost?.id,
      user_id: userId,
      storage_path: storagePath,
      file_name: "integration-test.pdf",
      mime_type: "application/pdf",
      file_size_bytes: fileBody.length,
      invoice_number: "IT-0001",
      invoice_date: "2026-04-01",
      note: "Integrationstestbeleg",
    });
    assert.equal(invoiceError, null);

    const { data: commentRows, error: readCommentError } = await supabase
      .from("cost_comments")
      .select("id")
      .eq("cost_entry_id", cost?.id ?? "");
    assert.equal(readCommentError, null);
    assert.ok((commentRows ?? []).length >= 1);

    const { data: invoiceRows, error: readInvoiceError } = await supabase
      .from("cost_invoices")
      .select("id")
      .eq("cost_entry_id", cost?.id ?? "");
    assert.equal(readInvoiceError, null);
    assert.ok((invoiceRows ?? []).length >= 1);

    const { error: removeError } = await supabase.storage
      .from("cost-invoices")
      .remove([storagePath]);
    assert.equal(removeError, null);

    const { error: cleanupVehicleError } = await supabase
      .from("vehicles")
      .delete()
      .eq("id", vehicle?.id ?? "");
    assert.equal(cleanupVehicleError, null);
  });

  await t.test("insert vehicle comments and vehicle images", async () => {
    assert.ok(userId);

    const { data: vehicle, error: vehicleError } = await supabase
      .from("vehicles")
      .insert({
        user_id: userId,
        make: "Gallery",
        model: "Edition",
        year: 2025,
        fuel_type: "petrol",
        license_plate: "PIC-100",
        current_mileage: 1000,
      })
      .select("id")
      .single();

    assert.equal(vehicleError, null);
    assert.ok(vehicle?.id);

    const { error: commentError } = await supabase.from("vehicle_comments").insert({
      vehicle_id: vehicle?.id,
      user_id: userId,
      body: "Fahrzeugkommentar aus Integrationstest",
    });
    assert.equal(commentError, null);

    const imagePath = `${userId}/${vehicle?.id}/integration-image.png`;
    const imageBody = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgQfIYvYAAAAASUVORK5CYII=",
      "base64",
    );

    const { error: imageUploadError } = await supabase.storage
      .from("vehicle-images")
      .upload(imagePath, imageBody, {
        contentType: "image/png",
        upsert: true,
      });
    assert.equal(imageUploadError, null);

    const { error: imageRowError } = await supabase.from("vehicle_images").insert({
      vehicle_id: vehicle?.id,
      user_id: userId,
      storage_path: imagePath,
      file_name: "integration-image.png",
      mime_type: "image/png",
      file_size_bytes: imageBody.length,
      caption: "Integrationstest-Bild",
    });
    assert.equal(imageRowError, null);

    const { data: commentRows, error: readCommentError } = await supabase
      .from("vehicle_comments")
      .select("id")
      .eq("vehicle_id", vehicle?.id ?? "");
    assert.equal(readCommentError, null);
    assert.ok((commentRows ?? []).length >= 1);

    const { data: imageRows, error: readImageError } = await supabase
      .from("vehicle_images")
      .select("id")
      .eq("vehicle_id", vehicle?.id ?? "");
    assert.equal(readImageError, null);
    assert.ok((imageRows ?? []).length >= 1);

    const { error: removeImageError } = await supabase.storage
      .from("vehicle-images")
      .remove([imagePath]);
    assert.equal(removeImageError, null);

    const { error: cleanupVehicleError } = await supabase
      .from("vehicles")
      .delete()
      .eq("id", vehicle?.id ?? "");
    assert.equal(cleanupVehicleError, null);
  });

  await t.test("enforce reminder and cost vehicle consistency", async () => {
    assert.ok(userId);

    const { data: vehicles, error: vehiclesError } = await supabase
      .from("vehicles")
      .insert([
        {
          user_id: userId,
          make: "Reminder",
          model: "Source",
          year: 2024,
          fuel_type: "petrol",
          license_plate: "REM-100",
          current_mileage: 15000,
        },
        {
          user_id: userId,
          make: "Reminder",
          model: "Mismatch",
          year: 2024,
          fuel_type: "diesel",
          license_plate: "REM-200",
          current_mileage: 25000,
        },
      ])
      .select("id, license_plate");

    assert.equal(vehiclesError, null);
    assert.equal(vehicles?.length, 2);

    const sourceVehicle = vehicles?.find((vehicle) => vehicle.license_plate === "REM-100");
    const mismatchVehicle = vehicles?.find((vehicle) => vehicle.license_plate === "REM-200");

    assert.ok(sourceVehicle?.id);
    assert.ok(mismatchVehicle?.id);

    const { data: reminder, error: reminderError } = await supabase
      .from("reminders")
      .insert({
        vehicle_id: sourceVehicle?.id,
        user_id: userId,
        title: "HU Termin",
        reminder_type: "date",
        due_date: "2026-06-01",
      })
      .select("id")
      .single();

    assert.equal(reminderError, null);
    assert.ok(reminder?.id);

    const { data: validCost, error: validCostError } = await supabase
      .from("cost_entries")
      .insert({
        vehicle_id: sourceVehicle?.id,
        user_id: userId,
        reminder_id: reminder?.id,
        category: "maintenance",
        title: "HU Gebühr",
        amount: 149.5,
        date: "2026-05-20",
      })
      .select("id, reminder_id")
      .single();

    assert.equal(validCostError, null);
    assert.equal(validCost?.reminder_id, reminder?.id);

    const { error: invalidCostError } = await supabase.from("cost_entries").insert({
      vehicle_id: mismatchVehicle?.id,
      user_id: userId,
      reminder_id: reminder?.id,
      category: "maintenance",
      title: "Falsche Verknüpfung",
      amount: 50,
      date: "2026-05-20",
    });

    assert.notEqual(invalidCostError, null);

    const { error: cleanupVehiclesError } = await supabase
      .from("vehicles")
      .delete()
      .in("id", [sourceVehicle?.id ?? "", mismatchVehicle?.id ?? ""]);

    assert.equal(cleanupVehiclesError, null);
  });

  await t.test("cleanup auth user", async () => {
    assert.ok(userId);
    const currentUserId = userId;
    const { error } = await withAuthRetry(() => supabase.auth.admin.deleteUser(currentUserId));
    assert.equal(error, null);
  });
});