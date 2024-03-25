import { dirname, importx } from "@discordx/importer";
import type { GuildMember, Interaction } from "discord.js";
import {
  ActivityType,
  ApplicationCommandType,
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
  IntentsBitField,
} from "discord.js";
import { Client } from "discordx";
// import { PrismaClient } from "@prisma/client";
import { Logger } from "tslog";
import { Timeline } from "./commands/timeline";

const logger = new Logger({ name: "main" });
let startTimestamp: Date;
// export const prisma = new PrismaClient()

const {
  MessageContent,
  GuildMembers,
  Guilds,
  GuildVoiceStates,
  GuildMessages,
  GuildMessageReactions,
} = IntentsBitField.Flags;
export const bot = new Client({
  // To use only guild command
  botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],

  // Discord intents
  intents: [
    Guilds,
    GuildMembers,
    GuildMessages,
    GuildMessageReactions,
    GuildVoiceStates,
    MessageContent,
  ],

  // Debug logs are disabled in silent mode
  silent: false,
});

bot.once("ready", async () => {
  // Make sure all guilds are cached
  await bot.guilds.fetch();

  // Make sure all guild members are cached
  bot.guilds.cache.forEach((guild) => guild.members.fetch());

  // Synchronize applications commands with Discord
  await bot.initApplicationCommands();

  // To clear all guild commands, uncomment this line,
  // This is useful when moving from guild commands to global commands
  // It must only be executed once
  //
  // await bot.clearApplicationCommands(
  //    ...bot.guilds.cache.map((g) => g.id)
  // );

  if (bot.user) {
    const { Playing } = ActivityType;
    bot.user.setActivity({
      name: "/build 🔨",
      type: Playing,
    });
  }

  logger.info(`Bot started in ${Date.now() - startTimestamp.getTime()}ms`);
});

bot.on("interactionCreate", (interaction: Interaction) => {
  bot.executeInteraction(interaction);
  if (
    interaction instanceof ChatInputCommandInteraction ||
    interaction instanceof ContextMenuCommandInteraction
  )
    logger.info(
      `[${interaction.commandName} - ${ApplicationCommandType[interaction.commandType]}] Launched by: ${(interaction.member! as GuildMember).displayName} (${interaction.user.username})`,
    );
});

async function run() {
  // The following syntax should be used in the ECMAScript environment
  await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);

  // Let's start the bot
  if (!process.env.BOT_TOKEN) {
    const error = Error("Could not find BOT_TOKEN in your environment");
    logger.fatal(error);
    throw error;
  }

  // Log in with your bot token
  await bot.login(process.env.BOT_TOKEN);
}

run().then(async () => {
  logger.info("Starting...");
  startTimestamp = new Date();

  await Timeline.updateServerChannels();
  Timeline.fetchRoleplaySessions().then((roleplaySessionsAmount) =>
    logger.debug(
      `Found ${roleplaySessionsAmount} start/finish sessions messages in ${new Date(Date.now() - startTimestamp.getTime()).getSeconds()}s !`,
    ),
  );
});
