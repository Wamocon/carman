import assert from "node:assert/strict";
import test from "node:test";
import { Client as PgClient } from "pg";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.DATABASE_URL;

if (!supabaseUrl || !serviceRoleKey || !databaseUrl) {
  throw new Error("Fehlende lokale Supabase-Variablen. Fuehre zuerst npm run supabase:start aus.");
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

  const email = `integration-${Date.now()}@local.test`;
  const password = "Integration123!";
  let userId: string | null = null;

  await t.test("create auth user and profile", async () => {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: "Integration Test" },
    });

    assert.equal(error, null);
    userId = data.user?.id ?? null;
    assert.ok(userId);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, display_name, subscription_tier")
      .eq("id", userId)
      .single();

    assert.equal(profileError, null);
    assert.equal(profile?.email, email);
    assert.equal(profile?.display_name, "Integration Test");
    assert.equal(profile?.subscription_tier, "free");
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

  await t.test("cleanup auth user", async () => {
    assert.ok(userId);
    const { error } = await supabase.auth.admin.deleteUser(userId);
    assert.equal(error, null);
  });
});