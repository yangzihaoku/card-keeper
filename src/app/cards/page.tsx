"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Filter } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, Progress, Badge, Button } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import type { CardWithProgress } from "@/app/api/cards/route";

type FilterType = "all" | "US" | "CN";

export default function CardsPage() {
  const [cards, setCards] = useState<CardWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    fetch("/api/cards")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCards(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "all" ? cards : cards.filter((c) => c.country === filter);

  return (
    <AppShell>
      <div className="space-y-6 pb-20 md:pb-0">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">我的卡片</h1>
          <div className="flex gap-1">
            {(["all", "US", "CN"] as const).map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "default" : "ghost"}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "全部" : f === "US" ? "美国" : "国内"}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-28 rounded-xl bg-[hsl(var(--muted))] animate-pulse"
                />
              ))
            : filtered.map((card) => (
                <Link key={card.id} href={`/cards/${card.id}`}>
                  <Card className="hover:border-[hsl(var(--primary))]/30 transition-colors cursor-pointer group mb-3">
                    <CardContent className="p-4 flex items-center gap-4">
                      {/* Card color indicator */}
                      <div
                        className="w-14 h-10 rounded-lg shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${card.colorFrom}, ${card.colorTo})`,
                        }}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">
                            {card.name}
                          </p>
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            {card.issuer}
                          </Badge>
                        </div>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                          {formatCurrency(card.annualFee, card.currency)}/年 |{" "}
                          {card.usedBenefits}/{card.totalBenefits} 项权益已用
                        </p>
                        {card.totalValue > 0 && (
                          <Progress
                            value={
                              card.totalValue > 0
                                ? (card.usedValue / card.totalValue) * 100
                                : 0
                            }
                            className="mt-2 h-1.5"
                          />
                        )}
                      </div>

                      <ChevronRight className="w-4 h-4 text-[hsl(var(--muted-foreground))] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
        </div>
      </div>
    </AppShell>
  );
}
