import type { Chapters, Tags, Users, Works } from "astro:db";

export type Work = typeof Works.$inferSelect;
export type Chapter = typeof Chapters.$inferSelect;
export type Tag = typeof Tags.$inferSelect;
export type User = typeof Users.$inferSelect;