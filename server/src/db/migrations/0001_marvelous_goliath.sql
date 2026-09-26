CREATE TABLE `expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`amount` real NOT NULL,
	`category` text NOT NULL,
	`description` text NOT NULL,
	`expense_date` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `installments` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text NOT NULL,
	`amount` real NOT NULL,
	`due_date` text NOT NULL,
	`is_paid` integer DEFAULT false NOT NULL,
	`paid_date` text,
	`notes` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `inventory` (
	`id` text PRIMARY KEY NOT NULL,
	`item_name` text NOT NULL,
	`quantity` integer DEFAULT 0 NOT NULL,
	`unit_price` real DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `inventory_item_name_unique` ON `inventory` (`item_name`);