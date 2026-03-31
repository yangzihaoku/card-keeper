"use client";

import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui";
import { TrendingUp } from "lucide-react";

export default function SpendingPage() {
  return (
    <AppShell>
      <div className="space-y-6 pb-20 md:pb-0">
        <div>
          <h1 className="text-2xl font-bold">消费追踪</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            开卡消费任务和年度消费目标
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-[hsl(var(--muted-foreground))]">
            <TrendingUp className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-medium">即将上线</p>
            <p className="text-sm mt-1">Phase 2 将支持消费追踪和开卡任务管理</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
