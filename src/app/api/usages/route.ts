import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { benefitUsages } from "@/db/schema";
import { eq } from "drizzle-orm";

// Create a new usage record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { benefitId, usedDate, amount, notes } = body;

    if (!benefitId || !usedDate) {
      return NextResponse.json(
        { error: "benefitId and usedDate are required" },
        { status: 400 }
      );
    }

    const [usage] = await db
      .insert(benefitUsages)
      .values({
        benefitId,
        usedDate,
        amount: amount || null,
        notes: notes || null,
      })
      .returning();

    return NextResponse.json(usage);
  } catch (error) {
    console.error("Error creating usage:", error);
    return NextResponse.json({ error: "Failed to create usage" }, { status: 500 });
  }
}

// Delete a usage record
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await db.delete(benefitUsages).where(eq(benefitUsages.id, parseInt(id, 10)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting usage:", error);
    return NextResponse.json({ error: "Failed to delete usage" }, { status: 500 });
  }
}
