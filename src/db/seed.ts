import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";
import { cards, benefits, appSettings } from "./schema";
import { seedCards, seedBenefitsTemplate } from "./seed-data";
import { hashPassword } from "../lib/auth";

async function seed() {
  console.log("🌱 Seeding database...");

  const db = drizzle(sql);

  // Create tables if they don't exist (using drizzle-kit push is preferred, but this is a fallback)
  console.log("📋 Inserting cards...");

  // Insert cards and collect the ID mapping
  const cardIdMap: Record<number, number> = {};

  for (const card of seedCards) {
    const [inserted] = await db
      .insert(cards)
      .values(card)
      .returning({ id: cards.id, sortOrder: cards.sortOrder });
    cardIdMap[inserted.sortOrder] = inserted.id;
    console.log(`  ✓ ${card.name} (id: ${inserted.id})`);
  }

  // Insert benefits with resolved card IDs
  console.log("📋 Inserting benefits...");
  let benefitCount = 0;

  for (const template of seedBenefitsTemplate) {
    const cardId = cardIdMap[template.cardSortOrder];
    if (!cardId) {
      console.warn(`  ⚠ No card found for sortOrder ${template.cardSortOrder}, skipping benefit: ${template.name}`);
      continue;
    }

    const { cardSortOrder, ...benefitData } = template;
    await db.insert(benefits).values({
      ...benefitData,
      cardId,
    });
    benefitCount++;
  }
  console.log(`  ✓ ${benefitCount} benefits inserted`);

  // Set default password
  const defaultPassword = "1234";
  const hash = await hashPassword(defaultPassword);
  await db
    .insert(appSettings)
    .values({ key: "password_hash", value: hash })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: { value: hash },
    });
  console.log(`🔑 Default password set to: ${defaultPassword}`);

  console.log("✅ Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
