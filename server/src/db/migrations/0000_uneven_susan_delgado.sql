CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`entity_name` text NOT NULL,
	`entity_id` text NOT NULL,
	`action` text NOT NULL,
	`old_values` text,
	`new_values` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `cities` (
	`id` text PRIMARY KEY NOT NULL,
	`governorate_id` text NOT NULL,
	`name` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`governorate_id`) REFERENCES `governorates`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_code` integer NOT NULL,
	`name` text NOT NULL,
	`phone_1` text NOT NULL,
	`phone_2` text,
	`landline` text,
	`governorate_id` text NOT NULL,
	`city_id` text NOT NULL,
	`village` text,
	`address_details` text,
	`filter_type_id` text,
	`maintenance_interval_id` text NOT NULL,
	`last_maintenance_date` text,
	`next_maintenance_date` text,
	`notes` text,
	`is_deleted` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`governorate_id`) REFERENCES `governorates`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`filter_type_id`) REFERENCES `filter_types`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`maintenance_interval_id`) REFERENCES `maintenance_intervals`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`is_technician` integer DEFAULT true NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`user_id` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `filter_types` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE `governorates` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE `maintenance_intervals` (
	`id` text PRIMARY KEY NOT NULL,
	`months` integer NOT NULL,
	`is_active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`idle_expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`role` text NOT NULL,
	`created_at` integer NOT NULL,
	`version` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `visits` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text NOT NULL,
	`employee_id` text NOT NULL,
	`visit_date` text NOT NULL,
	`workflow_status` text NOT NULL,
	`is_baseline` integer DEFAULT false NOT NULL,
	`item_1` integer DEFAULT false NOT NULL,
	`item_2` integer DEFAULT false NOT NULL,
	`item_3` integer DEFAULT false NOT NULL,
	`item_post` integer DEFAULT false NOT NULL,
	`item_calcium` integer DEFAULT false NOT NULL,
	`item_infrared` integer DEFAULT false NOT NULL,
	`item_salts` integer DEFAULT false NOT NULL,
	`notes` text,
	`is_deleted` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `customers_customer_code_unique` ON `customers` (`customer_code`);--> statement-breakpoint
CREATE UNIQUE INDEX `filter_types_name_unique` ON `filter_types` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `governorates_name_unique` ON `governorates` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `maintenance_intervals_months_unique` ON `maintenance_intervals` (`months`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);