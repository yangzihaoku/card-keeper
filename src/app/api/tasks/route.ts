import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { taskItems } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cardId, title, description, dueDate, category } = body;

    if (!cardId || !title) {
      return NextResponse.json({ error: "cardId and title required" }, { status: 400 });
    }

    const [task] = await db
      .insert(taskItems)
      .values({
        cardId,
        title,
        description: description || null,
        dueDate: dueDate || null,
        category: category || "onboarding",
      })
      .returning();

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, completed } = body;

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const [task] = await db
      .update(taskItems)
      .set({ completedAt: completed ? new Date() : null })
      .where(eq(taskItems.id, id))
      .returning();

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    await db.delete(taskItems).where(eq(taskItems.id, parseInt(id, 10)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
