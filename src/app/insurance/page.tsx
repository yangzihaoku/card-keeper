"use client";

import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import { Shield, Phone, Plane, Car, Briefcase, AlertTriangle } from "lucide-react";

type InsuranceRow = {
  card: string;
  color: string;
  tripDelay: string;
  tripCancel: string;
  rentalCar: string;
  cellPhone: string;
  lostBaggage: string;
  flightAccident: string;
  emergencyEvac: string;
};

const usInsurance: InsuranceRow[] = [
  {
    card: "Amex Aspire",
    color: "#1a1a2e",
    tripDelay: "$500 (6小时)",
    tripCancel: "$10K/$20K",
    rentalCar: "Secondary",
    cellPhone: "无",
    lostBaggage: "$3,000",
    flightAccident: "-",
    emergencyEvac: "无上限",
  },
  {
    card: "Amex Brilliant",
    color: "#e94560",
    tripDelay: "$500 (6小时)",
    tripCancel: "$10K/$20K",
    rentalCar: "Secondary $75K",
    cellPhone: "无",
    lostBaggage: "$3,000",
    flightAccident: "-",
    emergencyEvac: "无上限",
  },
  {
    card: "Chase CSP",
    color: "#2c5364",
    tripDelay: "$500 (12小时)",
    tripCancel: "$10K/$20K",
    rentalCar: "Primary $60K",
    cellPhone: "无",
    lostBaggage: "$3,000",
    flightAccident: "$500K",
    emergencyEvac: "$100K",
  },
  {
    card: "Chase IHG",
    color: "#40916c",
    tripDelay: "无",
    tripCancel: "$5K/$10K",
    rentalCar: "Secondary",
    cellPhone: "$800/$50免赔",
    lostBaggage: "$3,000",
    flightAccident: "-",
    emergencyEvac: "-",
  },
];

const cnInsurance: InsuranceRow[] = [
  {
    card: "农行尊然白",
    color: "#636e72",
    tripDelay: "¥300 (2小时)",
    tripCancel: "-",
    rentalCar: "-",
    cellPhone: "-",
    lostBaggage: "-",
    flightAccident: "1000万",
    emergencyEvac: "-",
  },
  {
    card: "中信世界卡",
    color: "#8e44ad",
    tripDelay: "¥1000/2000",
    tripCancel: "-",
    rentalCar: "-",
    cellPhone: "-",
    lostBaggage: "-",
    flightAccident: "含",
    emergencyEvac: "-",
  },
  {
    card: "广发臻享白",
    color: "#c0392b",
    tripDelay: "待确认",
    tripCancel: "-",
    rentalCar: "-",
    cellPhone: "-",
    lostBaggage: "-",
    flightAccident: "含",
    emergencyEvac: "-",
  },
];

export default function InsurancePage() {
  return (
    <AppShell>
      <div className="space-y-6 pb-20 md:pb-0">
        <div>
          <h1 className="text-2xl font-bold">保险权益对比</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            各卡保险覆盖一览
          </p>
        </div>

        {/* Recommendations */}
        <Card className="border-blue-500/20 bg-blue-50/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              用卡建议
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Recommendation
              icon={<Phone className="w-4 h-4" />}
              title="手机话费"
              description="用 Chase IHG Premier 交美国手机费，享 $800/次手机保险"
              badge="IHG Premier"
            />
            <Recommendation
              icon={<Car className="w-4 h-4" />}
              title="租车"
              description="用 Chase CSP 租车，享 Primary 保险覆盖 $60K，无需走个人车险"
              badge="CSP"
            />
            <Recommendation
              icon={<Plane className="w-4 h-4" />}
              title="国际机票"
              description="用 Amex Aspire/Brilliant 买国际机票，6小时延误即赔 $500 + 无上限紧急撤离"
              badge="Aspire/Brilliant"
            />
            <Recommendation
              icon={<Plane className="w-4 h-4" />}
              title="国内机票"
              description="用中信国航世界卡买机票，2小时延误赔 ¥1000，4小时赔 ¥2000"
              badge="中信世界卡"
            />
          </CardContent>
        </Card>

        {/* US Insurance Table */}
        <div>
          <h2 className="text-lg font-semibold mb-3">美国卡保险</h2>
          <div className="overflow-x-auto">
            <InsuranceTable rows={usInsurance} />
          </div>
        </div>

        {/* CN Insurance Table */}
        <div>
          <h2 className="text-lg font-semibold mb-3">国内卡保险</h2>
          <div className="overflow-x-auto">
            <InsuranceTable rows={cnInsurance} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Recommendation({
  icon,
  title,
  description,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-[hsl(var(--muted))]/30">
      <div className="mt-0.5 text-blue-500">{icon}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{title}</p>
          <Badge variant="outline" className="text-[10px]">{badge}</Badge>
        </div>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
          {description}
        </p>
      </div>
    </div>
  );
}

function InsuranceTable({ rows }: { rows: InsuranceRow[] }) {
  const headers = [
    { key: "card", label: "卡片" },
    { key: "tripDelay", label: "航班延误" },
    { key: "tripCancel", label: "行程取消" },
    { key: "rentalCar", label: "租车保险" },
    { key: "cellPhone", label: "手机保险" },
    { key: "lostBaggage", label: "行李丢失" },
    { key: "flightAccident", label: "航空意外" },
    { key: "emergencyEvac", label: "紧急撤离" },
  ];

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-[hsl(var(--border))]">
          {headers.map((h) => (
            <th
              key={h.key}
              className="py-2 px-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] whitespace-nowrap"
            >
              {h.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={row.card}
            className="border-b border-[hsl(var(--border))]/50 hover:bg-[hsl(var(--muted))]/30"
          >
            <td className="py-2 px-3 whitespace-nowrap">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ background: row.color }}
                />
                <span className="font-medium text-xs">{row.card}</span>
              </div>
            </td>
            <td className="py-2 px-3 text-xs whitespace-nowrap">
              <CellValue value={row.tripDelay} />
            </td>
            <td className="py-2 px-3 text-xs whitespace-nowrap">
              <CellValue value={row.tripCancel} />
            </td>
            <td className="py-2 px-3 text-xs whitespace-nowrap">
              <CellValue value={row.rentalCar} highlight={row.rentalCar.includes("Primary")} />
            </td>
            <td className="py-2 px-3 text-xs whitespace-nowrap">
              <CellValue value={row.cellPhone} highlight={row.cellPhone !== "无" && row.cellPhone !== "-"} />
            </td>
            <td className="py-2 px-3 text-xs whitespace-nowrap">
              <CellValue value={row.lostBaggage} />
            </td>
            <td className="py-2 px-3 text-xs whitespace-nowrap">
              <CellValue value={row.flightAccident} />
            </td>
            <td className="py-2 px-3 text-xs whitespace-nowrap">
              <CellValue value={row.emergencyEvac} highlight={row.emergencyEvac === "无上限"} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CellValue({ value, highlight }: { value: string; highlight?: boolean }) {
  if (value === "无" || value === "-") {
    return <span className="text-[hsl(var(--muted-foreground))]">{value}</span>;
  }
  if (highlight) {
    return <span className="text-emerald-600 dark:text-emerald-400 font-medium">{value}</span>;
  }
  return <span>{value}</span>;
}
