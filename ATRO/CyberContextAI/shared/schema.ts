import { pgTable, text, serial, integer, boolean, timestamp, json, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Incidents schema (defined first to avoid circular references)
export const incidents = pgTable("incidents", {
  id: serial("id").primaryKey(),
  incidentKey: text("incident_key").notNull().unique(), // Unique identifier for the incident
  type: text("type").notNull(),
  status: text("status").notNull().default("open"),
  source: text("source").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  metadata: json("metadata").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Agents schema
export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull().default("inactive"),
  lastActive: timestamp("last_active").defaultNow().notNull(),
  metadata: json("metadata").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Security Logs schema
export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  level: text("level").notNull(),
  message: text("message").notNull(),
  source: text("source").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  agentId: integer("agent_id").references(() => agents.id),
  metadata: json("metadata").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Alerts schema
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  severity: text("severity").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  source: text("source").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  status: text("status").notNull().default("new"),
  agentId: integer("agent_id").references(() => agents.id),
  incidentId: integer("incident_id").references(() => incidents.id),
  metadata: json("metadata").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Response Actions schema
export const responseActions = pgTable("response_actions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  trigger: text("trigger").notNull(),
  status: text("status").notNull().default("pending"),
  incidentId: integer("incident_id").references(() => incidents.id),
  lastExecuted: timestamp("last_executed"),
  metadata: json("metadata").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// LLM Insights schema
export const llmInsights = pgTable("llm_insights", {
  id: serial("id").primaryKey(),
  analysis: text("analysis").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  severity: text("severity").notNull(),
  incidentId: integer("incident_id").references(() => incidents.id),
  recommendation: text("recommendation"),
  metadata: json("metadata").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Many-to-many relationship between agents and responseActions
export const agentResponseActions = pgTable("agent_response_actions", {
  agentId: integer("agent_id").notNull().references(() => agents.id),
  responseActionId: integer("response_action_id").notNull().references(() => responseActions.id),
}, (t) => ({
  pk: primaryKey(t.agentId, t.responseActionId),
}));

// Define relations after all tables are defined
export const agentsRelations = relations(agents, ({ many }) => ({
  logs: many(logs),
  alerts: many(alerts),
  agentResponseActions: many(agentResponseActions),
}));

export const logsRelations = relations(logs, ({ one }) => ({
  agent: one(agents, {
    fields: [logs.agentId],
    references: [agents.id],
  }),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  agent: one(agents, {
    fields: [alerts.agentId],
    references: [agents.id],
  }),
  incident: one(incidents, {
    fields: [alerts.incidentId],
    references: [incidents.id],
  }),
}));

export const incidentsRelations = relations(incidents, ({ many }) => ({
  alerts: many(alerts),
  responseActions: many(responseActions),
  llmInsights: many(llmInsights),
}));

export const responseActionsRelations = relations(responseActions, ({ one, many }) => ({
  incident: one(incidents, {
    fields: [responseActions.incidentId],
    references: [incidents.id],
  }),
  agentResponseActions: many(agentResponseActions),
}));

export const llmInsightsRelations = relations(llmInsights, ({ one }) => ({
  incident: one(incidents, {
    fields: [llmInsights.incidentId],
    references: [incidents.id],
  }),
}));

export const agentResponseActionsRelations = relations(agentResponseActions, ({ one }) => ({
  agent: one(agents, {
    fields: [agentResponseActions.agentId],
    references: [agents.id],
  }),
  responseAction: one(responseActions, {
    fields: [agentResponseActions.responseActionId],
    references: [responseActions.id],
  }),
}));

// Export all insert schemas
export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
  createdAt: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});

export const insertIncidentSchema = createInsertSchema(incidents).omit({
  id: true,
  createdAt: true,
});

export const insertLogSchema = createInsertSchema(logs).omit({
  id: true,
  createdAt: true,
});

export const insertResponseActionSchema = createInsertSchema(responseActions).omit({
  id: true,
  createdAt: true,
});

export const insertLlmInsightSchema = createInsertSchema(llmInsights).omit({
  id: true,
  createdAt: true,
});

// Export all types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = z.infer<typeof insertIncidentSchema>;

export type Log = typeof logs.$inferSelect;
export type InsertLog = z.infer<typeof insertLogSchema>;

export type ResponseAction = typeof responseActions.$inferSelect;
export type InsertResponseAction = z.infer<typeof insertResponseActionSchema>;

export type LlmInsight = typeof llmInsights.$inferSelect;
export type InsertLlmInsight = z.infer<typeof insertLlmInsightSchema>;

export type AgentResponseAction = typeof agentResponseActions.$inferSelect;
