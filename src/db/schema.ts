import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  real,
  jsonb,
  serial,
} from "drizzle-orm/pg-core";

// ─── Cards ───────────────────────────────────────────────────────────────────

export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  shortName: text("short_name").notNull(),
  issuer: text("issuer").notNull(),
  network: text("network").notNull(), // visa, mastercard, amex, unionpay
  country: text("country").notNull(), // US, CN
  annualFee: real("annual_fee").notNull(),
  currency: text("currency").notNull().default("USD"),
  colorFrom: text("color_from").notNull().default("#1e3a5f"),
  colorTo: text("color_to").notNull().default("#2d5a87"),
  openDate: text("open_date"), // YYYY-MM-DD
  anniversaryMonth: integer("anniversary_month"), // 1-12
  anniversaryDay: integer("anniversary_day"), // 1-31
  status: text("status").notNull().default("active"), // active, closed
  notes: text("notes"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Benefits ────────────────────────────────────────────────────────────────

export const benefits = pgTable("benefits", {
  id: serial("id").primaryKey(),
  cardId: integer("card_id")
    .notNull()
    .references(() => cards.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // credit, free_night, status, lounge, insurance, points, lifestyle, travel
  value: real("value"), // monetary value if applicable
  currency: text("currency").default("USD"),
  cycleType: text("cycle_type").notNull(), // monthly, quarterly, semi_annual, annual, one_time, per_event, ongoing
  cycleReference: text("cycle_reference").notNull().default("calendar"), // calendar, anniversary
  maxUsesPerCycle: integer("max_uses_per_cycle"), // null = unlimited
  maxValuePerCycle: real("max_value_per_cycle"), // null = unlimited
  activationRequired: boolean("activation_required").notNull().default(false),
  activationInstructions: text("activation_instructions"),
  externalUrl: text("external_url"),
  reminderDaysBefore: integer("reminder_days_before").default(14),
  metadata: jsonb("metadata"), // card-specific extra data
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Benefit Usages ──────────────────────────────────────────────────────────

export const benefitUsages = pgTable("benefit_usages", {
  id: serial("id").primaryKey(),
  benefitId: integer("benefit_id")
    .notNull()
    .references(() => benefits.id, { onDelete: "cascade" }),
  usedDate: text("used_date").notNull(), // YYYY-MM-DD
  amount: real("amount"), // actual amount used (for partial usage)
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Spending Trackers ───────────────────────────────────────────────────────

export const spendingTrackers = pgTable("spending_trackers", {
  id: serial("id").primaryKey(),
  cardId: integer("card_id")
    .notNull()
    .references(() => cards.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // e.g., "Sign-up Bonus", "$15K for Free Night"
  targetAmount: real("target_amount").notNull(),
  currentAmount: real("current_amount").notNull().default(0),
  currency: text("currency").default("USD"),
  deadline: text("deadline"), // YYYY-MM-DD
  status: text("status").notNull().default("in_progress"), // in_progress, completed, failed
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Task Items ──────────────────────────────────────────────────────────────

export const taskItems = pgTable("task_items", {
  id: serial("id").primaryKey(),
  cardId: integer("card_id")
    .notNull()
    .references(() => cards.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: text("due_date"), // YYYY-MM-DD
  completedAt: timestamp("completed_at"),
  category: text("category").notNull().default("onboarding"), // onboarding, recurring, one_time
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Change Log ──────────────────────────────────────────────────────────────

export const changeLogs = pgTable("change_logs", {
  id: serial("id").primaryKey(),
  cardId: integer("card_id").references(() => cards.id, { onDelete: "set null" }),
  detectedAt: timestamp("detected_at").defaultNow(),
  sourceUrl: text("source_url"),
  changeType: text("change_type").notNull(), // addition, removal, modification
  severity: text("severity").notNull().default("info"), // critical, info, minor
  title: text("title").notNull(),
  description: text("description"),
  previousValue: text("previous_value"),
  newValue: text("new_value"),
  acknowledged: boolean("acknowledged").notNull().default(false),
});

// ─── App Settings ────────────────────────────────────────────────────────────

export const appSettings = pgTable("app_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
