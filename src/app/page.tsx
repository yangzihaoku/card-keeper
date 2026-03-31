"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle, Progress, Badge } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import type { CardWithProgress } from "@/app/api/cards/route";

export default function DashboardPage() {
  const [cards, setCards] = useState<CardWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cards")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCards(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const usCards = cards.filter((c) => c.country === "US");
  const cnCards = cards.filter((c) => c.country === "CN");
  const totalAnnualFees = cards.reduce((sum, c) => {
    const fee = c.currency === "CNY" ? c.annualFee / 7.2 : c.annualFee;
    return sum + fee;
  }, 0);
  const totalUsedValue = cards.reduce((sum, c) => {
    const val = c.currency === "CNY" ? c.usedValue / 7.2 : c.usedValue;
    return sum + val;
  }, 0);
  const totalAvailValue = cards.reduce((sum, c) => {
    const val = c.currency === "CNY" ? c.totalValue / 7.2 : c.totalValue;
    return sum + val;
  }, 0);

  const urgentCards = cards.filter(
    (c) => c.totalBenefits > 0 && c.usedBenefits / c.totalBenefits < 0.5
  );

  return (
    <AppShell>
      <div className="space-y-6 pb-20 md:pb-0">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">总览</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            管理 {cards.length} 张信用卡权益
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={<CreditCard className="w-4 h-4" />}
            label="持卡数量"
            value={`${cards.length} 张`}
            loading={loading}
          />
          <StatCard
            icon={<DollarSign className="w-4 h-4" />}
            label="年费总计"
            value={`$${Math.round(totalAnnualFees).toLocaleString()}`}
            sub="≈ 折合美元"
            loading={loading}
          />
          <StatCard
            icon={<TrendingUp className="w-4 h-4" />}
            label="已用权益"
            value={`$${Math.round(totalUsedValue).toLocaleString()}`}
            sub={`/ $${Math.round(totalAvailValue).toLocaleString()}`}
            loading={loading}
          />
          <StatCard
            icon={<AlertTriangle className="w-4 h-4" />}
            label="需关注"
            value={`${urgentCards.length} 张卡`}
            sub="权益使用不足 50%"
            loading={loading}
            highlight={urgentCards.length > 0}
          />
        </div>

        {/* US Cards */}
        <CardGroup
          title="美国信用卡"
          cards={usCards}
          loading={loading}
        />

        {/* CN Cards */}
        <CardGroup
          title="国内信用卡"
          cards={cnCards}
          loading={loading}
        />
      </div>
    </AppShell>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  loading,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  loading: boolean;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-amber-500/50 bg-amber-50/5" : ""}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))] mb-2">
          {icon}
          <span className="text-xs">{label}</span>
        </div>
        {loading ? (
          <div className="h-7 w-20 rounded bg-[hsl(var(--muted))] animate-pulse" />
        ) : (
          <>
            <p className="text-xl font-bold">{value}</p>
            {sub && (
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{sub}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function CardGroup({
  title,
  cards,
  loading,
}: {
  title: string;
  cards: CardWithProgress[];
  loading: boolean;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className="h-24 rounded bg-[hsl(var(--muted))] animate-pulse" />
                </CardContent>
              </Card>
            ))
          : cards.map((card) => <CreditCardItem key={card.id} card={card} />)}
      </div>
    </div>
  );
}

function CreditCardItem({ card }: { card: CardWithProgress }) {
  const usagePercent =
    card.totalBenefits > 0
      ? Math.round((card.usedBenefits / card.totalBenefits) * 100)
      : 0;

  const valuePercent =
    card.totalValue > 0
      ? Math.round((card.usedValue / card.totalValue) * 100)
      : 0;

  return (
    <Link href={`/cards/${card.id}`}>
      <Card className="hover:border-[hsl(var(--primary))]/30 transition-colors cursor-pointer group">
        <CardContent className="p-5">
          {/* Card visual header */}
          <div
            className="h-12 rounded-lg mb-4 flex items-center px-4"
            style={{
              background: `linear-gradient(135deg, ${card.colorFrom}, ${card.colorTo})`,
            }}
          >
            <span className="text-white text-sm font-bold truncate">
              {card.shortName}
            </span>
            <ChevronRight className="w-4 h-4 text-white/50 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Card name and fee */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-medium text-sm">{card.name}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {card.issuer} | {formatCurrency(card.annualFee, card.currency)}/年
              </p>
            </div>
            <Badge
              variant={
                usagePercent >= 80
                  ? "success"
                  : usagePercent >= 40
                    ? "warning"
                    : "destructive"
              }
            >
              {usagePercent}%
            </Badge>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
              <span>
                {card.usedBenefits}/{card.totalBenefits} 项权益已用
              </span>
              <span>
                {card.totalValue > 0 &&
                  `${formatCurrency(card.usedValue, card.currency)} / ${formatCurrency(card.totalValue, card.currency)}`}
              </span>
            </div>
            <Progress value={valuePercent > 0 ? valuePercent : usagePercent} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
