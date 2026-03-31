"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Check, Plus, Calendar, Clock, CreditCard, Crown,
  Shield, Moon, Armchair, Coins, Heart, Plane, Trash2, AlertCircle,
  Settings2, CheckCircle2, Circle, Square, ListTodo, Hash,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import {
  Card, CardContent, CardHeader, CardTitle, Progress, Badge, Button,
} from "@/components/ui";
import {
  formatCurrency, cycleTypeLabels, categoryLabels, getUrgency, cn,
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
  lastFourDigits: string | null;
  openDate: string | null;
  annualFeeDate: string | null;
  statementDay: number | null;
  paymentDueDay: number | null;
  creditLimit: number | null;
  anniversaryMonth: number | null;
  anniversaryDay: number | null;
  notes: string | null;
};

type TaskItem = {
  id: number;
  cardId: number;
  title: string;
  description: string | null;
  dueDate: string | null;
  completedAt: string | null;
  category: string;
};

export default function CardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [card, setCard] = useState<CardDetail | null>(null);
  const [benefits, setBenefits] = useState<BenefitWithUsage[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"benefits" | "tasks" | "info">("benefits");
  const [showUsageForm, setShowUsageForm] = useState<number | null>(null);
  const [usageDate, setUsageDate] = useState(new Date().toISOString().split("T")[0]);
  const [usageAmount, setUsageAmount] = useState("");
  const [usageNotes, setUsageNotes] = useState("");

  // Task form state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDue, setNewTaskDue] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("onboarding");

  // Card edit state
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<CardDetail>>({});

  const fetchData = useCallback(() => {
    fetch(`/api/cards/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.card) {
          setCard(data.card);
          setBenefits(data.benefits);
          setTasks(data.tasks || []);
        }
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function markUsed(benefitId: number) {
    const amount = usageAmount ? parseFloat(usageAmount) : null;
    const res = await fetch("/api/usages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ benefitId, usedDate: usageDate, amount, notes: usageNotes || null }),
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

  async function addTask() {
    if (!newTaskTitle.trim() || !card) return;
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cardId: card.id,
        title: newTaskTitle,
        dueDate: newTaskDue || null,
        category: newTaskCategory,
      }),
    });
    setNewTaskTitle("");
    setNewTaskDue("");
    fetchData();
  }

  async function toggleTask(taskId: number, currentlyCompleted: boolean) {
    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: taskId, completed: !currentlyCompleted }),
    });
    fetchData();
  }

  async function deleteTask(taskId: number) {
    await fetch(`/api/tasks?id=${taskId}`, { method: "DELETE" });
    fetchData();
  }

  async function saveCardEdits() {
    if (!card) return;
    await fetch(`/api/cards/${card.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setEditing(false);
    fetchData();
  }

  function startEditing() {
    if (!card) return;
    setEditForm({
      lastFourDigits: card.lastFourDigits,
      openDate: card.openDate,
      annualFeeDate: card.annualFeeDate,
      statementDay: card.statementDay,
      paymentDueDay: card.paymentDueDay,
      creditLimit: card.creditLimit,
      notes: card.notes,
    });
    setEditing(true);
  }

  if (loading) {
    return (
      <AppShell>
        <div className="space-y-4 pb-20 md:pb-0">
          <div className="h-8 w-40 rounded bg-[hsl(var(--muted))] animate-pulse" />
          <div className="h-32 rounded-xl bg-[hsl(var(--muted))] animate-pulse" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-[hsl(var(--muted))] animate-pulse" />
          ))}
        </div>
      </AppShell>
    );
  }

  if (!card) {
    return <AppShell><div className="text-center py-20 text-[hsl(var(--muted-foreground))]">卡片未找到</div></AppShell>;
  }

  const grouped = benefits.reduce((acc, b) => {
    if (!acc[b.category]) acc[b.category] = [];
    acc[b.category].push(b);
    return acc;
  }, {} as Record<string, BenefitWithUsage[]>);

  const categoryOrder = ["credit", "free_night", "lounge", "lifestyle", "travel", "insurance", "status", "points"];
  const pendingTasks = tasks.filter((t) => !t.completedAt);
  const completedTasks = tasks.filter((t) => t.completedAt);

  return (
    <AppShell>
      <div className="space-y-6 pb-20 md:pb-0">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-[hsl(var(--accent))] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">
              {card.name}
              {card.lastFourDigits && <span className="text-[hsl(var(--muted-foreground))] font-normal ml-2">({card.lastFourDigits})</span>}
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {card.issuer} | {card.network.toUpperCase()} | {formatCurrency(card.annualFee, card.currency)}/年
            </p>
          </div>
        </div>

        {/* Card visual */}
        <div
          className="h-20 md:h-28 rounded-2xl flex items-end justify-between p-5"
          style={{ background: `linear-gradient(135deg, ${card.colorFrom}, ${card.colorTo})` }}
        >
          <span className="text-white/90 text-lg font-bold">{card.shortName}</span>
          {card.lastFourDigits && (
            <span className="text-white/60 text-sm font-mono">{`**** ${card.lastFourDigits}`}</span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[hsl(var(--border))]">
          {([
            { key: "benefits", label: "权益", icon: <CreditCard className="w-4 h-4" /> },
            { key: "tasks", label: `任务 (${pendingTasks.length})`, icon: <ListTodo className="w-4 h-4" /> },
            { key: "info", label: "卡片信息", icon: <Settings2 className="w-4 h-4" /> },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
                activeTab === tab.key
                  ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
                  : "border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              )}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ═══ Benefits Tab ═══ */}
        {activeTab === "benefits" && (
          <div className="space-y-6">
            {categoryOrder.map((cat) => {
              const items = grouped[cat];
              if (!items?.length) return null;
              const catInfo = categoryLabels[cat] || { label: cat };
              return (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[hsl(var(--primary))]">{categoryIcons[cat]}</span>
                    <h2 className="font-semibold">{catInfo.label}</h2>
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">({items.length})</span>
                  </div>
                  <div className="space-y-3">
                    {items.map((benefit) => (
                      <BenefitCard
                        key={benefit.id}
                        benefit={benefit}
                        currency={card.currency}
                        showUsageForm={showUsageForm === benefit.id}
                        onToggleForm={() => setShowUsageForm(showUsageForm === benefit.id ? null : benefit.id)}
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
        )}

        {/* ═══ Tasks Tab ═══ */}
        {activeTab === "tasks" && (
          <div className="space-y-4">
            {/* Add task form */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="添加新任务..."
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))]"
                    onKeyDown={(e) => e.key === "Enter" && addTask()}
                  />
                  <Button size="sm" onClick={addTask} disabled={!newTaskTitle.trim()}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex gap-2 mt-2">
                  <input
                    type="date"
                    value={newTaskDue}
                    onChange={(e) => setNewTaskDue(e.target.value)}
                    className="px-2 py-1 text-xs rounded border border-[hsl(var(--input))] bg-[hsl(var(--background))]"
                  />
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value)}
                    className="px-2 py-1 text-xs rounded border border-[hsl(var(--input))] bg-[hsl(var(--background))]"
                  >
                    <option value="onboarding">开卡任务</option>
                    <option value="recurring">周期任务</option>
                    <option value="one_time">一次性</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Pending tasks */}
            {pendingTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-2">待完成 ({pendingTasks.length})</h3>
                <div className="space-y-2">
                  {pendingTasks.map((task) => (
                    <TaskRow key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
                  ))}
                </div>
              </div>
            )}

            {/* Completed tasks */}
            {completedTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-2">已完成 ({completedTasks.length})</h3>
                <div className="space-y-2">
                  {completedTasks.map((task) => (
                    <TaskRow key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
                  ))}
                </div>
              </div>
            )}

            {tasks.length === 0 && (
              <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
                <ListTodo className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>暂无任务</p>
                <p className="text-xs mt-1">添加开卡任务、权益激活等待办事项</p>
              </div>
            )}
          </div>
        )}

        {/* ═══ Info Tab ═══ */}
        {activeTab === "info" && (
          <div className="space-y-4 max-w-lg">
            {!editing ? (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">卡片详情</CardTitle>
                      <Button size="sm" variant="outline" onClick={startEditing}>
                        <Settings2 className="w-3 h-3" /> 编辑
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <InfoRow label="卡片尾号" value={card.lastFourDigits || "未设置"} />
                    <InfoRow label="开卡日期" value={card.openDate || "未设置"} />
                    <InfoRow label="年费日" value={card.annualFeeDate || "未设置"} />
                    <InfoRow label="账单日" value={card.statementDay ? `每月 ${card.statementDay} 日` : "未设置"} />
                    <InfoRow label="还款日" value={card.paymentDueDay ? `每月 ${card.paymentDueDay} 日` : "未设置"} />
                    <InfoRow label="信用额度" value={card.creditLimit ? formatCurrency(card.creditLimit, card.currency) : "未设置"} />
                    <InfoRow label="开卡周年" value={
                      card.anniversaryMonth
                        ? `${card.anniversaryMonth} 月 ${card.anniversaryDay || 1} 日`
                        : "未设置"
                    } />
                  </CardContent>
                </Card>
                {card.notes && (
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-base">备注</CardTitle></CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap">{card.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">编辑卡片信息</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <EditField label="卡片尾号" value={editForm.lastFourDigits || ""} onChange={(v) => setEditForm({ ...editForm, lastFourDigits: v || null })} placeholder="1234" maxLength={4} />
                  <EditField label="开卡日期" type="date" value={editForm.openDate || ""} onChange={(v) => setEditForm({ ...editForm, openDate: v || null })} />
                  <EditField label="年费日" type="date" value={editForm.annualFeeDate || ""} onChange={(v) => setEditForm({ ...editForm, annualFeeDate: v || null })} />
                  <EditField label="账单日 (1-31)" type="number" value={editForm.statementDay?.toString() || ""} onChange={(v) => setEditForm({ ...editForm, statementDay: v ? parseInt(v) : null })} />
                  <EditField label="还款日 (1-31)" type="number" value={editForm.paymentDueDay?.toString() || ""} onChange={(v) => setEditForm({ ...editForm, paymentDueDay: v ? parseInt(v) : null })} />
                  <EditField label="信用额度" type="number" value={editForm.creditLimit?.toString() || ""} onChange={(v) => setEditForm({ ...editForm, creditLimit: v ? parseFloat(v) : null })} />
                  <div>
                    <label className="text-xs text-[hsl(var(--muted-foreground))]">备注</label>
                    <textarea
                      value={editForm.notes || ""}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value || null })}
                      rows={3}
                      className="w-full mt-0.5 px-3 py-2 text-sm rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] resize-none"
                      placeholder="自由备注..."
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" onClick={saveCardEdits}><Check className="w-3 h-3" /> 保存</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>取消</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[hsl(var(--border))]/50 last:border-0">
      <span className="text-sm text-[hsl(var(--muted-foreground))]">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function EditField({ label, value, onChange, type = "text", placeholder, maxLength }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; maxLength?: number;
}) {
  return (
    <div>
      <label className="text-xs text-[hsl(var(--muted-foreground))]">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full mt-0.5 px-3 py-2 text-sm rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))]"
      />
    </div>
  );
}

function TaskRow({ task, onToggle, onDelete }: {
  task: TaskItem;
  onToggle: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
}) {
  const isCompleted = !!task.completedAt;
  const categoryLabels: Record<string, string> = {
    onboarding: "开卡",
    recurring: "周期",
    one_time: "一次",
  };
  const isOverdue = !isCompleted && task.dueDate && task.dueDate < new Date().toISOString().split("T")[0];

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg border",
      isCompleted ? "bg-[hsl(var(--muted))]/30 border-[hsl(var(--border))]/50" : "border-[hsl(var(--border))]",
      isOverdue && "border-red-500/30 bg-red-50/5"
    )}>
      <button onClick={() => onToggle(task.id, isCompleted)} className="shrink-0">
        {isCompleted ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        ) : (
          <Circle className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm", isCompleted && "line-through text-[hsl(var(--muted-foreground))]")}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge variant="outline" className="text-[10px]">{categoryLabels[task.category] || task.category}</Badge>
          {task.dueDate && (
            <span className={cn("text-[10px]", isOverdue ? "text-red-500" : "text-[hsl(var(--muted-foreground))]")}>
              {isOverdue ? "已逾期 " : ""}{task.dueDate}
            </span>
          )}
        </div>
      </div>
      <button onClick={() => onDelete(task.id)} className="p-1 text-[hsl(var(--muted-foreground))] hover:text-red-500 shrink-0">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function BenefitCard({
  benefit, currency, showUsageForm, onToggleForm,
  usageDate, usageAmount, usageNotes, onDateChange, onAmountChange, onNotesChange,
  onMarkUsed, onDeleteUsage,
}: {
  benefit: BenefitWithUsage; currency: string; showUsageForm: boolean;
  onToggleForm: () => void; usageDate: string; usageAmount: string; usageNotes: string;
  onDateChange: (v: string) => void; onAmountChange: (v: string) => void; onNotesChange: (v: string) => void;
  onMarkUsed: () => void; onDeleteUsage: (id: number) => void;
}) {
  const isTrackable = benefit.cycleType !== "ongoing" || benefit.maxUsesPerCycle || benefit.maxValuePerCycle;
  const urgency = isTrackable && !["ongoing", "one_time"].includes(benefit.cycleType)
    ? getUrgency(benefit.daysLeft, benefit.progressPercent / 100) : "ok";
  const showProgress = benefit.maxValuePerCycle || benefit.maxUsesPerCycle;

  return (
    <Card className={cn(
      "transition-all",
      urgency === "urgent" && "border-red-500/30 bg-red-50/5",
      urgency === "warning" && "border-amber-500/30 bg-amber-50/5"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-sm">{benefit.name}</p>
              <Badge variant="outline" className="text-[10px]">{cycleTypeLabels[benefit.cycleType] || benefit.cycleType}</Badge>
              {benefit.activationRequired && <Badge variant="warning" className="text-[10px]">需激活</Badge>}
            </div>
            {benefit.description && (
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 line-clamp-2">{benefit.description}</p>
            )}
          </div>
          {isTrackable && (
            <Button size="sm" variant={benefit.progressPercent >= 100 ? "ghost" : "outline"} onClick={onToggleForm} className="shrink-0">
              {benefit.progressPercent >= 100 ? <Check className="w-4 h-4 text-emerald-500" /> : <Plus className="w-4 h-4" />}
            </Button>
          )}
        </div>

        {showProgress && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))] mb-1">
              <span>
                {benefit.maxValuePerCycle
                  ? `${formatCurrency(benefit.usedAmount, currency)} / ${formatCurrency(benefit.maxValuePerCycle, currency)}`
                  : `${benefit.usedCount} / ${benefit.maxUsesPerCycle} 次`}
              </span>
              {!["ongoing", "one_time", "per_event"].includes(benefit.cycleType) && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {benefit.daysLeft > 0 ? `${benefit.daysLeft} 天后重置` : "今天重置"}
                </span>
              )}
            </div>
            <Progress value={benefit.progressPercent} />
          </div>
        )}

        {urgency === "urgent" && benefit.progressPercent < 100 && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-red-500">
            <AlertCircle className="w-3 h-3" /><span>即将过期，请尽快使用！</span>
          </div>
        )}

        {showUsageForm && (
          <div className="mt-3 p-3 rounded-lg bg-[hsl(var(--muted))]/50 border border-[hsl(var(--border))] space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-[hsl(var(--muted-foreground))]">日期</label>
                <input type="date" value={usageDate} onChange={(e) => onDateChange(e.target.value)}
                  className="w-full mt-0.5 px-2 py-1.5 text-sm rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))]" />
              </div>
              {benefit.maxValuePerCycle && (
                <div>
                  <label className="text-xs text-[hsl(var(--muted-foreground))]">金额</label>
                  <input type="number" value={usageAmount} onChange={(e) => onAmountChange(e.target.value)}
                    placeholder={`最多 ${benefit.maxValuePerCycle}`}
                    className="w-full mt-0.5 px-2 py-1.5 text-sm rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))]" />
                </div>
              )}
            </div>
            <div>
              <label className="text-xs text-[hsl(var(--muted-foreground))]">备注</label>
              <input type="text" value={usageNotes} onChange={(e) => onNotesChange(e.target.value)}
                placeholder="可选备注..."
                className="w-full mt-0.5 px-2 py-1.5 text-sm rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))]" />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={onMarkUsed}><Check className="w-3 h-3" /> 确认使用</Button>
              <Button size="sm" variant="ghost" onClick={onToggleForm}>取消</Button>
            </div>
          </div>
        )}

        {benefit.usagesThisCycle.length > 0 && (
          <div className="mt-3 space-y-1">
            <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium">本周期使用记录</p>
            {benefit.usagesThisCycle.map((usage) => (
              <div key={usage.id} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-[hsl(var(--muted))]/30">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
                  <span>{usage.usedDate}</span>
                  {usage.amount && <span className="text-[hsl(var(--primary))]">{formatCurrency(usage.amount, currency)}</span>}
                  {usage.notes && <span className="text-[hsl(var(--muted-foreground))] truncate max-w-[120px]">{usage.notes}</span>}
                </div>
                <button onClick={() => onDeleteUsage(usage.id)} className="p-1 hover:text-red-500 transition-colors">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {benefit.activationRequired && benefit.activationInstructions && (
          <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-900/20 px-2 py-1.5 rounded">
            {benefit.activationInstructions}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
