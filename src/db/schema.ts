import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';

export const questions = sqliteTable('questions', {
  id: text('id').primaryKey(),
  worth: integer('worth').notNull(),
  questionText: text('question_text').notNull(),
  answerText: text('answer_text').notNull(),
  category: text('category').notNull(), // Category type is "Before You Met Me" | "Music" | "Resume" | "Misc."
  isAnswered: integer('is_answered', { mode: 'boolean' }).notNull().default(false),
});

export const gameState = sqliteTable('game_state', {
  // Using a single row to store the overall game state.
  // A primary key is still useful for Drizzle Kit to manage the table.
  id: integer('id').primaryKey({ autoIncrement: true }),
  // currentQuestionId will store the ID of the current question.
  // It can be null if no question is currently selected.
  currentQuestionId: text('current_question_id').references(() => questions.id),
  // scores will be stored as a JSON string: e.g., {"teamA": 100, "teamB": 200}
  scores: text('scores', { mode: 'json' }).$type<Record<string, number>>().notNull().default('{}'),
  allowBuzz: integer('allow_buzz', { mode: 'boolean' }).notNull().default(false),
  showingCode: integer('showing_code', { mode: 'boolean' }).notNull().default(false),
});
