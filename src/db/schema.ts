
import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';


export const usersTable = sqliteTable('users', {
  id: integer('id').primaryKey(),
  firstName: text('first_name'),
  maternalName: text('maternal_name'),
  paternalName: text('paternal_name'),
  email: text('email').unique().notNull(),
  password: text('password').notNull()
});

export const termsTable = sqliteTable('terms', {
  id: integer('id').primaryKey(),
  content: text('content').unique().notNull(),
  userId: integer('user_id')
    .notNull(),
  createdAt: text('created_at')
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
});


export const audiosTable = sqliteTable('audios', {
  id: integer('id').primaryKey(),
  url: text('url').notNull(),
  createdAt: text('created_at')
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
  termId: integer('term_id')
    .notNull()
    .references(() => termsTable.id, { onDelete: 'cascade' }),
});

export const imagesTable = sqliteTable('images', {
  id: integer('id').primaryKey(),
  url: text('url').notNull(),
  createdAt: text('created_at')
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
  termId: integer('term_id')
    .notNull()
    .references(() => termsTable.id, { onDelete: 'cascade' }),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;

export type InsertTerm = typeof termsTable.$inferInsert;
export type SelectTerm = typeof termsTable.$inferSelect;

export type InsertAudio = typeof audiosTable.$inferInsert;
export type SelectAudio = typeof audiosTable.$inferSelect;

export type InsertImages = typeof imagesTable.$inferInsert;
export type SelectImages = typeof imagesTable.$inferSelect;
