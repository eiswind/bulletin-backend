CREATE TABLE "contact" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"user" text NOT NULL,
	"primary" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"likes" bigint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"username" text NOT NULL,
	"password" text NOT NULL,
	"firstname" text DEFAULT '' NOT NULL,
	"lastname" text DEFAULT '' NOT NULL,
	"phone_allowed" boolean DEFAULT false NOT NULL,
	"phone_country_code" text DEFAULT '+49' NOT NULL,
	"phone_number" text DEFAULT '' NOT NULL,
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "contact" ADD CONSTRAINT "contact_user_user_username_fk" FOREIGN KEY ("user") REFERENCES "public"."user"("username") ON DELETE cascade ON UPDATE no action;