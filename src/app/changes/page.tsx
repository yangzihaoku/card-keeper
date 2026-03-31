"use client";

import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui";
import { Bell } from "lucide-react";

export default function ChangesPage() {
  return (
    <AppShell>
      <div className="space-y-6 pb-20 md:pb-0">
        <div>
          <h1 className="text-2xl font-bold">权益变动</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            监测信用卡权益变化
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-[hsl(var(--muted-foreground))]">
            <Bell className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-medium">即将上线</p>
            <p className="text-sm mt-1">Phase 3 将支持自动联网监测权益变化并推送通知</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
