CREATE TABLE `game_state` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`current_question_id` text,
	`scores` text DEFAULT '{}' NOT NULL,
	`allow_buzz` integer DEFAULT false NOT NULL,
	`showing_code` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`current_question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` text PRIMARY KEY NOT NULL,
	`worth` integer NOT NULL,
	`question_text` text NOT NULL,
	`answer_text` text NOT NULL,
	`category` text NOT NULL,
	`is_answered` integer DEFAULT false NOT NULL
);
