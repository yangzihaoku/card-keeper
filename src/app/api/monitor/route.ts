import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cards, changeLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

const BRAVE_API_KEY = process.env.BRAVE_API_KEY;
const BRAVE_SEARCH_URL = "https://api.search.brave.com/res/v1/web/search";

type BraveResult = {
  title: string;
  url: string;
  description: string;
  age?: string;
};

async function braveSearch(query: string): Promise<BraveResult[]> {
  if (!BRAVE_API_KEY) {
    throw new Error("BRAVE_API_KEY not configured");
  }

  const params = new URLSearchParams({
    q: query,
    count: "5",
    freshness: "pm", // past month
  });

  const res = await fetch(`${BRAVE_SEARCH_URL}?${params}`, {
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip",
      "X-Subscription-Token": BRAVE_API_KEY,
    },
  });

  if (!res.ok) {
    throw new Error(`Brave search failed: ${res.status}`);
  }

  const data = await res.json();
  return (data.web?.results || []).map((r: Record<string, string>) => ({
    title: r.title,
    url: r.url,
    description: r.description,
    age: r.age,
  }));
}

// Search queries per card
const cardSearchQueries: Record<string, string[]> = {
  "Amex Hilton Aspire": [
    "Amex Hilton Aspire card benefits changes 2026",
    "Hilton Aspire credit card devaluation news",
  ],
  "Amex Hilton Surpass": [
    "Amex Hilton Surpass card benefits changes 2026",
  ],
  "Amex Marriott Bonvoy Brilliant": [
    "Amex Marriott Brilliant card benefits changes 2026",
    "Marriott Bonvoy Brilliant devaluation news",
  ],
  "Chase Sapphire Preferred": [
    "Chase Sapphire Preferred benefits changes 2026",
    "CSP card new perks announcement",
  ],
  "Chase IHG One Rewards Premier": [
    "Chase IHG Premier card benefits changes 2026",
  ],
  "农行万事达尊然白金卡": [
    "农行尊然白金卡 权益调整 2026",
    "农行白金卡 贵宾厅 变化",
  ],
  "中信国航知音世界卡": [
    "中信国航世界卡 权益调整 2026",
    "中信银行 国航卡 里程规则变化",
  ],
  "广发国航臻享白金卡": [
    "广发国航臻享白 权益调整 2026",
    "广发银行 信用卡 权益变动",
  ],
};

// Keywords that indicate a change
const changeKeywords = [
  "change", "update", "new", "removed", "devalue", "reduced",
  "increased", "added", "discontinued", "modified", "effective",
  "announcement", "starting", "ending", "no longer",
  "变化", "调整", "取消", "新增", "缩水", "升级", "下调", "公告",
  "变更", "停止", "恢复", "延长",
];

function detectPotentialChange(title: string, description: string): {
  isChange: boolean;
  severity: string;
} {
  const text = `${title} ${description}`.toLowerCase();
  const matchCount = changeKeywords.filter((kw) => text.includes(kw)).length;

  if (matchCount === 0) return { isChange: false, severity: "info" };

  const negativeKeywords = ["removed", "devalue", "reduced", "discontinued", "no longer", "取消", "缩水", "下调", "停止"];
  const hasNegative = negativeKeywords.some((kw) => text.includes(kw));

  return {
    isChange: true,
    severity: hasNegative ? "critical" : matchCount >= 2 ? "info" : "minor",
  };
}

// POST /api/monitor - trigger monitoring for all cards or a specific card
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const targetCardId = body.cardId ? parseInt(body.cardId, 10) : null;

    const allCards = targetCardId
      ? await db.select().from(cards).where(eq(cards.id, targetCardId))
      : await db.select().from(cards);

    const results: Array<{
      card: string;
      queriesRun: number;
      changesFound: number;
      changes: Array<{ title: string; url: string; severity: string }>;
    }> = [];

    for (const card of allCards) {
      const queries = cardSearchQueries[card.name] || [
        `${card.name} credit card benefits changes 2026`,
      ];

      let changesFound = 0;
      const cardChanges: Array<{ title: string; url: string; severity: string }> = [];

      for (const query of queries) {
        try {
          const searchResults = await braveSearch(query);

          for (const result of searchResults) {
            const { isChange, severity } = detectPotentialChange(
              result.title,
              result.description
            );

            if (isChange) {
              // Check if we already logged this URL
              const existing = await db
                .select()
                .from(changeLogs)
                .where(eq(changeLogs.sourceUrl, result.url))
                .limit(1);

              if (existing.length === 0) {
                await db.insert(changeLogs).values({
                  cardId: card.id,
                  sourceUrl: result.url,
                  changeType: "modification",
                  severity,
                  title: result.title,
                  description: result.description,
                });

                changesFound++;
                cardChanges.push({
                  title: result.title,
                  url: result.url,
                  severity,
                });
              }
            }
          }
        } catch (searchError) {
          console.error(`Search error for "${query}":`, searchError);
        }
      }

      results.push({
        card: card.name,
        queriesRun: queries.length,
        changesFound,
        changes: cardChanges,
      });
    }

    const totalChanges = results.reduce((sum, r) => sum + r.changesFound, 0);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      cardsScanned: results.length,
      totalChangesFound: totalChanges,
      results,
    });
  } catch (error) {
    console.error("Monitor error:", error);
    return NextResponse.json({ error: "Monitoring failed" }, { status: 500 });
  }
}

// GET /api/monitor - get change logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get("cardId");

    const logs = cardId
      ? await db
          .select()
          .from(changeLogs)
          .where(eq(changeLogs.cardId, parseInt(cardId, 10)))
          .orderBy(desc(changeLogs.detectedAt))
          .limit(50)
      : await db
          .select()
          .from(changeLogs)
          .orderBy(desc(changeLogs.detectedAt))
          .limit(50);

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching change logs:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}
