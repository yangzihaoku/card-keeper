import { NextResponse } from "next/server";
import { db } from "@/db";
import { cards, benefits, benefitUsages } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { getCycleBoundaries } from "@/lib/utils";

export type CardWithProgress = {
  id: number;
  name: string;
  shortName: string;
  issuer: string;
  network: string;
  country: string;
  annualFee: number;
  currency: string;
  colorFrom: string;
  colorTo: string;
  status: string;
  notes: string | null;
  totalBenefits: number;
  usedBenefits: number;
  totalValue: number;
  usedValue: number;
};

export async function GET() {
  try {
    const allCards = await db.select().from(cards).orderBy(cards.sortOrder);
    const allBenefits = await db.select().from(benefits);
    const allUsages = await db.select().from(benefitUsages);

    const now = new Date();

    const result: CardWithProgress[] = allCards.map((card) => {
      const cardBenefits = allBenefits.filter(
        (b) => b.cardId === card.id && b.cycleType !== "ongoing" && b.cycleType !== "one_time" && b.cycleType !== "per_event"
      );

      let totalBenefits = 0;
      let usedBenefits = 0;
      let totalValue = 0;
      let usedValue = 0;

      for (const benefit of cardBenefits) {
        const { start, end } = getCycleBoundaries(
          benefit.cycleType,
          benefit.cycleReference,
          card.anniversaryMonth ?? undefined,
          card.anniversaryDay ?? undefined,
          now
        );

        const startStr = start.toISOString().split("T")[0];
        const endStr = end.toISOString().split("T")[0];

        const usages = allUsages.filter(
          (u) =>
            u.benefitId === benefit.id &&
            u.usedDate >= startStr &&
            u.usedDate <= endStr
        );

        totalBenefits++;
        if (benefit.maxValuePerCycle) {
          totalValue += benefit.maxValuePerCycle;
          const usedAmt = usages.reduce((sum, u) => sum + (u.amount || benefit.maxValuePerCycle!), 0);
          usedValue += Math.min(usedAmt, benefit.maxValuePerCycle);
          if (usedAmt > 0) usedBenefits++;
        } else if (benefit.maxUsesPerCycle) {
          if (benefit.value) totalValue += benefit.value * benefit.maxUsesPerCycle;
          if (usages.length > 0) usedBenefits++;
        } else {
          if (usages.length > 0) usedBenefits++;
        }
      }

      return {
        id: card.id,
        name: card.name,
        shortName: card.shortName,
        issuer: card.issuer,
        network: card.network,
        country: card.country,
        annualFee: card.annualFee,
        currency: card.currency,
        colorFrom: card.colorFrom,
        colorTo: card.colorTo,
        status: card.status,
        notes: card.notes,
        totalBenefits,
        usedBenefits,
        totalValue,
        usedValue,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching cards:", error);
    return NextResponse.json({ error: "Failed to fetch cards" }, { status: 500 });
  }
}
