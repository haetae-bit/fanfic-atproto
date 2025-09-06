import { column, defineDb, defineTable, NOW } from 'astro:db';

const Users = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    userDid: column.text({ name: "user_did", unique: true }),
    joinedAt: column.date({ name: "joined_at", default: NOW }),
  },
  indexes: [
    { on: ["userDid"], unique: true },
  ],
});

const Works = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    slug: column.text({ unique: true }),
    author: column.text({ references: () => Users.columns.userDid }),
    // recordkey
    title: column.text(),
    content: column.text({ multiline: true }),
    tags: column.json(),
    createdAt: column.date({ name: "created_at", default: NOW }),
    updatedAt: column.date({ name: "updated_at", optional: true }),
  },
  indexes: [
    { on: ["slug", "createdAt"], unique: true },
  ],
});

export default defineDb({
  tables: {
    Users,
    Works,
  },
});

