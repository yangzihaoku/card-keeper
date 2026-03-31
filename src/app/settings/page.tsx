"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import { Settings as SettingsIcon, Lock, Mail, Database, Download, Upload } from "lucide-react";

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const res = await fetch("/api/auth/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });
    const data = await res.json();
    if (data.success) {
      setMessage("密码已更新");
      setCurrentPassword("");
      setNewPassword("");
    } else {
      setMessage(data.error || "更新失败");
    }
  }

  async function exportData() {
    const res = await fetch("/api/cards");
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `card-keeper-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell>
      <div className="space-y-6 pb-20 md:pb-0 max-w-lg">
        <div>
          <h1 className="text-2xl font-bold">设置</h1>
        </div>

        {/* Password */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="w-4 h-4" />
              修改密码
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={changePassword} className="space-y-3">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="新密码"
                className="w-full px-3 py-2 text-sm rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))]"
              />
              {message && (
                <p className="text-sm text-[hsl(var(--primary))]">{message}</p>
              )}
              <Button type="submit" size="sm" disabled={!newPassword}>
                更新密码
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Data */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="w-4 h-4" />
              数据管理
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" size="sm" onClick={exportData}>
              <Download className="w-4 h-4" />
              导出数据 (JSON)
            </Button>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-[hsl(var(--muted-foreground))] text-center">
              Card Keeper v1.0 | 信用卡权益管家
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
