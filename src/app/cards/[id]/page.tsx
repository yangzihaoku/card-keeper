"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Plus,
  Calendar,
  Clock,
  CreditCard,
  Crown,
  Shield,
  Moon,
  Armchair,
  Coins,
  Heart,
  Plane,
  X,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
  Badge,
  Button,
} from "@/components/ui";
import {
  formatCurrency,
  cycleTypeLabels,
  categoryLabels,
  getUrgency,
  cn,
} from "@/lib/utils";
import type { BenefitWithUsage } from "@/app/api/cards/[id]/route";

const categoryIcons: Record<string, React.ReactNode> = {
  credit: <CreditCard className="w-4 h-4" />,
  free_night: <Moon className="w-4 h-4" />,
  status: <Crown className="w-4 h-4" />,
  lounge: <Armchair className="w-4 h-4" />,
  insurance: <Shield className="w-4 h-4" />,
  points: <Coins className="w-4 h-4" />,
  lifestyle: <Heart className="w-4 h-4" />,
  travel: <Plane className="w-4 h-4" />,
};

type CardDetail = {
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
  notes: string | null;
};

export default function CardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [card, setCard] = useState<CardDetail | null>(null);
  const [benefits, setBenefits] = useState<BenefitWithUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingBenefit, setMarkingBenefit] = useState<number | null>(null);
  const [showUsageForm, setShowUsageForm] = useState<number | null>(null);
  const [usageDate, setUsageDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [usageAmount, setUsageAmount] = useState("");
  const [usageNotes, setUsageNotes] = useState("");

  const fetchData = useCallback(() => {
    fetch(`/api/cards/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.card) {
          setCard(data.card);
          setBenefits(data.benefits);
        }
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function markUsed(benefitId: number) {
    const amount = usageAmount ? parseFloat(usageAmount) : null;
    const res = await fetch("/api/usages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        benefitId,
        usedDate: usageDate,
        amount,
        notes: usageNotes || null,
      }),
    });
    if (res.ok) {
      setShowUsageForm(null);
      setUsageAmount("");
      setUsageNotes("");
      fetchData();
    }
  }

  async function deleteUsage(usageId: number) {
    const res = await fetch(`/api/usages?id=${usageId}`, { method: "DELETE" });
    if (res.ok) fetchData();
  }

  if (loading) {
    return (
      <AppShell>
        <div className="space-y-4 pb-20 md:pb-0">
          <div className="h-8 w-40 rounded bg-[hsl(var(--muted))] animate-pulse" />
          <div className="h-32 rounded-xl bg-[hsl(var(--muted))] animate-pulse" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 rounded-xl bg-[hsl(var(--muted))] animate-pulse"
              />
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  if (!card) {
    return (
      <AppShell>
        <div className="text-center py-20">
          <p className="text-[hsl(var(--muted-foreground))]">卡片未找到</p>
        </div>
      </AppShell>
    );
  }

  // Group benefits by category
  const grouped = benefits.reduce(
    (acc, b) => {
      const cat = b.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(b);
      return acc;
    },
    {} as Record<string, BenefitWithUsage[]>
  );

  const categoryOrder = [
    "credit",
    "free_night",
    "lounge",
    "lifestyle",
    "travel",
    "insurance",
    "status",
    "points",
  ];

  return (
    <AppShell>
      <div className="space-y-6 pb-20 md:pb-0">
        {/* Back + header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-[hsl(var(--accent))] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">{card.name}</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {card.issuer} | {card.network.toUpperCase()} |{" "}
              {formatCurrency(card.annualFee, card.currency)}/年
            </p>
          </div>
        </div>

        {/* Card visual */}
        <div
          className="h-20 md:h-28 rounded-2xl flex items-end p-5"
          style={{
            background: `linear-gradient(135deg, ${card.colorFrom}, ${card.colorTo})`,
          }}
        >
          <span className="text-white/90 text-lg font-bold">
            {card.shortName}
          </span>
        </div>

        {/* Benefits by category */}
        {categoryOrder.map((cat) => {
          const items = grouped[cat];
          if (!items || items.length === 0) return null;
          const catInfo = categoryLabels[cat] || {
            label: cat,
            icon: "CreditCard",
          };

          return (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[hsl(var(--primary))]">
                  {categoryIcons[cat]}
                </span>
                <h2 className="font-semibold">{catInfo.label}</h2>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  ({items.length})
                </span>
              </div>

              <div className="space-y-3">
                {items.map((benefit) => (
                  <BenefitCard
                    key={benefit.id}
                    benefit={benefit}
                    currency={card.currency}
                    showUsageForm={showUsageForm === benefit.id}
                    onToggleForm={() =>
                      setShowUsageForm(
                        showUsageForm === benefit.id ? null : benefit.id
                      )
                    }
                    usageDate={usageDate}
                    usageAmount={usageAmount}
                    usageNotes={usageNotes}
                    onDateChange={setUsageDate}
                    onAmountChange={setUsageAmount}
                    onNotesChange={setUsageNotes}
                    onMarkUsed={() => markUsed(benefit.id)}
                    onDeleteUsage={deleteUsage}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}

function BenefitCard({
  benefit,
  currency,
  showUsageForm,
  onToggleForm,
  usageDate,
  usageAmount,
  usageNotes,
  onDateChange,
  onAmountChange,
  onNotesChange,
  onMarkUsed,
  onDeleteUsage,
}: {
  benefit: BenefitWithUsage;
  currency: string;
  showUsageForm: boolean;
  onToggleForm: () => void;
  usageDate: string;
  usageAmount: string;
  usageNotes: string;
  onDateChange: (v: string) => void;
  onAmountChange: (v: string) => void;
  onNotesChange: (v: string) => void;
  onMarkUsed: () => void;
  onDeleteUsage: (id: number) => void;
}) {
  const isTrackable =
    benefit.cycleType !== "ongoing" || benefit.maxUsesPerCycle || benefit.maxValuePerCycle;

  const urgency =
    isTrackable && benefit.cycleType !== "ongoing" && benefit.cycleType !== "one_time"
      ? getUrgency(benefit.daysLeft, benefit.progressPercent / 100)
      : "ok";

  const showProgress =
    benefit.maxValuePerCycle || benefit.maxUsesPerCycle;

  return (
    <Card
      className={cn(
        "transition-all",
        urgency === "urgent" && "border-red-500/30 bg-red-50/5",
        urgency === "warning" && "border-amber-500/30 bg-amber-50/5"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-sm">{benefit.name}</p>
              <Badge variant="outline" className="text-[10px]">
                {cycleTypeLabels[benefit.cycleType] || benefit.cycleType}
              </Badge>
              {benefit.activationRequired && (
                <Badge variant="warning" className="text-[10px]">
                  需激活
                </Badge>
              )}
            </div>
            {benefit.description && (
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 line-clamp-2">
                {benefit.description}
              </p>
            )}
          </div>

          {/* Quick mark used button */}
          {isTrackable && (
            <Button
              size="sm"
              variant={benefit.progressPercent >= 100 ? "ghost" : "outline"}
              onClick={onToggleForm}
              className="shrink-0"
            >
              {benefit.progressPercent >= 100 ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>

        {/* Progress bar */}
        {showProgress && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))] mb-1">
              <span>
                {benefit.maxValuePerCycle
                  ? `${formatCurrency(benefit.usedAmount, currency)} / ${formatCurrency(benefit.maxValuePerCycle, currency)}`
                  : `${benefit.usedCount} / ${benefit.maxUsesPerCycle} 次`}
              </span>
              {benefit.cycleType !== "ongoing" &&
                benefit.cycleType !== "one_time" &&
                benefit.cycleType !== "per_event" && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {benefit.daysLeft > 0
                      ? `${benefit.daysLeft} 天后重置`
                      : "今天重置"}
                  </span>
                )}
            </div>
            <Progress value={benefit.progressPercent} />
          </div>
        )}

        {/* Urgency alert */}
        {urgency === "urgent" && benefit.progressPercent < 100 && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-red-500">
            <AlertCircle className="w-3 h-3" />
            <span>即将过期，请尽快使用！</span>
          </div>
        )}

        {/* Usage form */}
        {showUsageForm && (
          <div className="mt-3 p-3 rounded-lg bg-[hsl(var(--muted))]/50 border border-[hsl(var(--border))] space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-[hsl(var(--muted-foreground))]">
                  日期
                </label>
                <input
                  type="date"
                  value={usageDate}
                  onChange={(e) => onDateChange(e.target.value)}
                  className="w-full mt-0.5 px-2 py-1.5 text-sm rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))]"
                />
              </div>
              {benefit.maxValuePerCycle && (
                <div>
                  <label className="text-xs text-[hsl(var(--muted-foreground))]">
                    金额
                  </label>
                  <input
                    type="number"
                    value={usageAmount}
                    onChange={(e) => onAmountChange(e.target.value)}
                    placeholder={`最多 ${benefit.maxValuePerCycle}`}
                    className="w-full mt-0.5 px-2 py-1.5 text-sm rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))]"
                  />
                </div>
              )}
            </div>
            <div>
              <label className="text-xs text-[hsl(var(--muted-foreground))]">
                备注
              </label>
              <input
                type="text"
                value={usageNotes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="可选备注..."
                className="w-full mt-0.5 px-2 py-1.5 text-sm rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))]"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={onMarkUsed}>
                <Check className="w-3 h-3" /> 确认使用
              </Button>
              <Button size="sm" variant="ghost" onClick={onToggleForm}>
                取消
              </Button>
            </div>
          </div>
        )}

        {/* Usage history */}
        {benefit.usagesThisCycle.length > 0 && (
          <div className="mt-3 space-y-1">
            <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium">
              本周期使用记录
            </p>
            {benefit.usagesThisCycle.map((usage) => (
              <div
                key={usage.id}
                className="flex items-center justify-between text-xs py-1 px-2 rounded bg-[hsl(var(--muted))]/30"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
                  <span>{usage.usedDate}</span>
                  {usage.amount && (
                    <span className="text-[hsl(var(--primary))]">
                      {formatCurrency(usage.amount, currency)}
                    </span>
                  )}
                  {usage.notes && (
                    <span className="text-[hsl(var(--muted-foreground))] truncate max-w-[120px]">
                      {usage.notes}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => onDeleteUsage(usage.id)}
                  className="p-1 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Activation instructions */}
        {benefit.activationRequired && benefit.activationInstructions && (
          <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-900/20 px-2 py-1.5 rounded">
            {benefit.activationInstructions}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
