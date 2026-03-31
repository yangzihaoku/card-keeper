"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import {
  Bell, RefreshCw, ExternalLink, AlertTriangle, Info, CheckCircle2,
  Search, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ChangeLog = {
  id: number;
  cardId: number | null;
  detectedAt: string;
  sourceUrl: string | null;
  changeType: string;
  severity: string;
  title: string;
  description: string | null;
  acknowledged: boolean;
};

type MonitorResult = {
  success: boolean;
  timestamp: string;
  cardsScanned: number;
  totalChangesFound: number;
  results: Array<{
    card: string;
    queriesRun: number;
    changesFound: number;
    changes: Array<{ title: string; url: string; severity: string }>;
  }>;
};

export default function ChangesPage() {
  const [logs, setLogs] = useState<ChangeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<MonitorResult | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  function fetchLogs() {
    setLoading(true);
    fetch("/api/monitor")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setLogs(data);
      })
      .finally(() => setLoading(false));
  }

  async function runScan() {
    setScanning(true);
    setScanResult(null);
    try {
      const res = await fetch("/api/monitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setScanResult(data);
      fetchLogs(); // refresh logs after scan
    } catch (error) {
      console.error("Scan failed:", error);
    } finally {
      setScanning(false);
    }
  }

  const severityIcon: Record<string, React.ReactNode> = {
    critical: <AlertTriangle className="w-4 h-4 text-red-500" />,
    info: <Info className="w-4 h-4 text-blue-500" />,
    minor: <CheckCircle2 className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />,
  };

  const severityBadge: Record<string, "destructive" | "default" | "outline"> = {
    critical: "destructive",
    info: "default",
    minor: "outline",
  };

  return (
    <AppShell>
      <div className="space-y-6 pb-20 md:pb-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">权益变动监测</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              通过 Brave Search 联网监测各卡权益变化
            </p>
          </div>
          <Button onClick={runScan} disabled={scanning}>
            {scanning ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> 扫描中...</>
            ) : (
              <><Search className="w-4 h-4" /> 立即检测</>
            )}
          </Button>
        </div>

        {/* Scan result summary */}
        {scanResult && (
          <Card className={cn(
            "border-l-4",
            scanResult.totalChangesFound > 0 ? "border-l-amber-500" : "border-l-emerald-500"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                {scanResult.totalChangesFound > 0 ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                )}
                <span className="font-medium text-sm">
                  {scanResult.totalChangesFound > 0
                    ? `发现 ${scanResult.totalChangesFound} 条潜在变化`
                    : "未发现新的权益变化"}
                </span>
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                扫描了 {scanResult.cardsScanned} 张卡 | {scanResult.timestamp.split("T")[0]}
              </p>
              {scanResult.results
                .filter((r) => r.changesFound > 0)
                .map((r) => (
                  <div key={r.card} className="mt-2">
                    <p className="text-xs font-medium">{r.card}:</p>
                    {r.changes.map((c, i) => (
                      <a
                        key={i}
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-[hsl(var(--primary))] hover:underline mt-0.5"
                      >
                        <ExternalLink className="w-3 h-3" /> {c.title}
                      </a>
                    ))}
                  </div>
                ))}
            </CardContent>
          </Card>
        )}

        {/* Change log history */}
        <div>
          <h2 className="text-lg font-semibold mb-3">变动记录</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-[hsl(var(--muted))] animate-pulse" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-[hsl(var(--muted-foreground))]">
                <Bell className="w-12 h-12 mb-3 opacity-30" />
                <p className="font-medium">暂无变动记录</p>
                <p className="text-sm mt-1">点击「立即检测」开始扫描各卡权益变化</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <Card key={log.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{severityIcon[log.severity] || severityIcon.minor}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm">{log.title}</p>
                          <Badge variant={severityBadge[log.severity] || "outline"} className="text-[10px]">
                            {log.severity === "critical" ? "重要" : log.severity === "info" ? "信息" : "次要"}
                          </Badge>
                        </div>
                        {log.description && (
                          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 line-clamp-2">
                            {log.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                            {new Date(log.detectedAt).toLocaleDateString("zh-CN")}
                          </span>
                          {log.sourceUrl && (
                            <a
                              href={log.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[10px] text-[hsl(var(--primary))] hover:underline"
                            >
                              <ExternalLink className="w-3 h-3" /> 查看来源
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
