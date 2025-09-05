import { column, defineDb, defineTable, NOW } from 'astro:db';

const Users = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    userDid: column.text({ name: "user_did" }),
    joinedAt: column.date({ default: NOW }),
  },
});

const Works = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    author: column.text({ references: () => Users.columns.userDid }),
    title: column.text(),
    content: column.text({ multiline: true }),
    tags: column.json(),
    createdAt: column.date({ name: "created_at", default: NOW }),
    updatedAt: column.date({ name: "updated_at", optional: true }),
  },
});

export default defineDb({
  tables: {
    Users,
    Works,
  },
});

