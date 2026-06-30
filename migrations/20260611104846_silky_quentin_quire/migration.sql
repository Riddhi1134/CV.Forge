CREATE TABLE "cover_letter" (
	"id" uuid PRIMARY KEY,
	"title" text NOT NULL,
	"company" text NOT NULL,
	"role" text NOT NULL,
	"your_name" text NOT NULL,
	"content" text NOT NULL,
	"template" text DEFAULT 'Classic' NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "cover_letter_user_id_index" ON "cover_letter" ("user_id");