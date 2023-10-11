import type {TextBasedChannel,} from "discord.js";
import {ChannelType, TextChannel} from "discord.js";
import {Discord} from "discordx";
import {bot} from "../main";
import {Logger} from "tslog";
import Message from "../helper/message";

@Discord()
export class Timeline {

    private static logger = new Logger({name: "timeline"});
    public static channels: TextChannel[] = [];

    public static async updateServerChannels(): Promise<void> {
        this.logger.debug(`Starting channels update`)

        const guild = bot.guilds.cache.get("955262302423253152");
        const excludedCategories = ["956945902050889848", "987485314941591622", "955262302423253153", "955262302876209172"]

        if (guild) {
            await guild.channels.fetch().then(guildChannels => {
                guildChannels.forEach(guildChannel => {
                    const {GuildText} = ChannelType;

                    if (guildChannel && guildChannel.parentId && guildChannel.type === GuildText && !excludedCategories.includes(guildChannel.parentId))
                        this.channels.push(guildChannel);
                })
            })
        }

        this.logger.debug(`Added ${this.channels.length} channels !\n`)
    }

    public static async fetchRoleplaySessions(): Promise<number> {
        this.logger.debug(`Starting global roleplay sessions messages fetcher !\n`)

        let roleplayMessagesSize = 0;

        for (const channel of this.channels) {
            this.logger.debug(`Starting messages fetching for channel ${channel.name}`)

            await Message.getAllMessages(channel, 200).then(messages => {
                this.logger.debug(`Finished fetching messages for channel ${channel.name}`)

                if (messages.length > 0) {
                    const roleplayMessages = messages.filter(messages =>
                        messages.content.match("```.*((\\d{1,2})? (\\D{3,9})? (\\d{4})).*((?:(?:[0-9])|(?:[0-1][0-9])|(?:[2][0-3])){1,2}(?:[hH:])(?:(?:[0-9])|(?:[0-5][0-9]))*)?.*(\\(GMT\\+\\d{1}\\))?\\W*```")
                    )

                    this.logger.debug(`Found ${roleplayMessages.length} roleplay messages from ${channel.name} !\n`)

                    roleplayMessagesSize += roleplayMessages.length;
                }
            })
        }

        return roleplayMessagesSize;
    }
}