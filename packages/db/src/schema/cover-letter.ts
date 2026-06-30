import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const coverLetter = pgTable(
	"cover_letter",
	{
		id: uuid("id").primaryKey(),
		title: text("title").notNull(),
		company: text("company").notNull(),
		role: text("role").notNull(),
		yourName: text("your_name").notNull(),
		content: text("content").notNull(),
		template: text("template").notNull().default("Classic"),
		userId: text("user_id").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => [index("cover_letter_user_id_index").on(table.userId)],
);
