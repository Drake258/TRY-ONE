CREATE TABLE `services` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`category` text DEFAULT 'repair' NOT NULL,
	`description` text,
	`price` real NOT NULL,
	`duration` text,
	`featured` integer DEFAULT false NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	`created_by` integer
);
