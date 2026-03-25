ALTER TABLE "contact" ADD COLUMN "phone_allowed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "contact" ADD COLUMN "phone_country_code" text DEFAULT '+49' NOT NULL;--> statement-breakpoint
ALTER TABLE "contact" ADD COLUMN "phone_number" text DEFAULT '' NOT NULL;