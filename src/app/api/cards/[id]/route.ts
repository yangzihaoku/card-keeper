import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cards, benefits, benefitUsages, taskItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCycleBoundaries } from "@/lib/utils";

export type BenefitWithUsage = {
  id: number;
  name: string;
  description: string | null;
  category: string;
  value: number | null;
  currency: string | null;
  cycleType: string;
  cycleReference: string;
  maxUsesPerCycle: number | null;
  maxValuePerCycle: number | null;
  activationRequired: boolean;
  activationInstructions: string | null;
  externalUrl: string | null;
  sortOrder: number;
  cycleStart: string;
  cycleEnd: string;
  daysLeft: number;
  usagesThisCycle: Array<{
    id: number;
    usedDate: string;
    amount: number | null;
    notes: string | null;
  }>;
  usedCount: number;
  usedAmount: number;
  progressPercent: number;
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cardId = parseInt(id, 10);

    const [card] = await db.select().from(cards).where(eq(cards.id, cardId)).limit(1);
    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const cardBenefits = await db
      .select()
      .from(benefits)
      .where(eq(benefits.cardId, cardId))
      .orderBy(benefits.sortOrder);

    const allUsages = await db.select().from(benefitUsages);

    const tasks = await db
      .select()
      .from(taskItems)
      .where(eq(taskItems.cardId, cardId))
      .orderBy(taskItems.sortOrder);

    const now = new Date();

    const benefitsWithUsage: BenefitWithUsage[] = cardBenefits.map((benefit) => {
      const { start, end } = getCycleBoundaries(
        benefit.cycleType,
        benefit.cycleReference,
        card.anniversaryMonth ?? undefined,
        card.anniversaryDay ?? undefined,
        now
      );

      const startStr = start.toISOString().split("T")[0];
      const endStr = end.toISOString().split("T")[0];
      const daysLeft = Math.max(
        0,
        Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      );

      const usages = allUsages
        .filter(
          (u) =>
            u.benefitId === benefit.id &&
            u.usedDate >= startStr &&
            u.usedDate <= endStr
        )
        .map((u) => ({
          id: u.id,
          usedDate: u.usedDate,
          amount: u.amount,
          notes: u.notes,
        }));

      const usedCount = usages.length;
      const usedAmount = usages.reduce((sum, u) => sum + (u.amount || 0), 0);

      let progressPercent = 0;
      if (benefit.maxValuePerCycle) {
        progressPercent = Math.min(100, (usedAmount / benefit.maxValuePerCycle) * 100);
      } else if (benefit.maxUsesPerCycle) {
        progressPercent = Math.min(100, (usedCount / benefit.maxUsesPerCycle) * 100);
      } else if (benefit.cycleType === "ongoing" || benefit.cycleType === "one_time") {
        progressPercent = usedCount > 0 ? 100 : 0;
      }

      return {
        id: benefit.id,
        name: benefit.name,
        description: benefit.description,
        category: benefit.category,
        value: benefit.value,
        currency: benefit.currency,
        cycleType: benefit.cycleType,
        cycleReference: benefit.cycleReference,
        maxUsesPerCycle: benefit.maxUsesPerCycle,
        maxValuePerCycle: benefit.maxValuePerCycle,
        activationRequired: benefit.activationRequired,
        activationInstructions: benefit.activationInstructions,
        externalUrl: benefit.externalUrl,
        sortOrder: benefit.sortOrder,
        cycleStart: startStr,
        cycleEnd: endStr,
        daysLeft,
        usagesThisCycle: usages,
        usedCount,
        usedAmount,
        progressPercent,
      };
    });

    return NextResponse.json({ card, benefits: benefitsWithUsage, tasks });
  } catch (error) {
    console.error("Error fetching card:", error);
    return NextResponse.json({ error: "Failed to fetch card" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cardId = parseInt(id, 10);
    const body = await request.json();

    const allowedFields = [
      "name", "shortName", "lastFourDigits", "openDate",
      "annualFeeDate", "statementDay", "paymentDueDay",
      "creditLimit", "anniversaryMonth", "anniversaryDay",
      "notes", "status",
    ];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields" }, { status: 400 });
    }

    const [updated] = await db
      .update(cards)
      .set(updates)
      .where(eq(cards.id, cardId))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating card:", error);
    return NextResponse.json({ error: "Failed to update card" }, { status: 500 });
  }
}
