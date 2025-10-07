import { column, defineDb, defineTable, NOW } from 'astro:db';

const Users = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    nickname: column.text({ unique: true, optional: true }),
    userDid: column.text({ name: "user_did", unique: true }),
    joinedAt: column.date({ name: "joined_at", default: NOW }),
    preferences: column.json({ optional: true }),
  },
  indexes: [
    { on: ["userDid"], unique: true },
  ],
});

const Works = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    uri: column.text({ unique: true, optional: true }),
    slug: column.text({ unique: true }),
    title: column.text(),
    author: column.text({ references: () => Users.columns.userDid }),
    summary: column.text({ multiline: true }),
    tags: column.json(),
    createdAt: column.date({ name: "created_at", default: NOW }),
    updatedAt: column.date({ name: "updated_at", optional: true }),
  },
  indexes: [
    { on: ["author", "slug"], unique: true },
    { on: ["slug", "createdAt"], unique: true },
    { on: ["uri", "createdAt"], unique: true },
  ],
});

const Chapters = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    uri: column.text({ optional: true }),
    workId: column.number({ references: () => Works.columns.id }),
    // order: column.number(), // i don't think this is needed...
    title: column.text(),
    notes: column.text({ multiline: true, optional: true }),
    content: column.text({ multiline: true }),
    createdAt: column.date({ name: "created_at", default: NOW }),
    updatedAt: column.date({ name: "updated_at", optional: true }),
  },
});

const Tags = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    slug: column.text({ unique: true }),
    type: column.text({ enum: ["character", "relationship", "series", "warnings"] }),
    label: column.text(),
  },
});

export default defineDb({
  tables: {
    Users,
    Works,
    Chapters,
    Tags,
  },
});

