import {ChannelType, TextChannel} from "discord.js";
import {Discord} from "discordx";
import {bot} from "../main";
import {Logger} from "tslog";
import {MessageHelper} from "../helper/message";
import {Jujutsu} from "../constants/jujutsu";

@Discord()
export class Timeline {
    private static logger = new Logger({name: "timeline"});
    public static channels: TextChannel[] = [];

    public static async updateServerChannels(): Promise<void> {
        this.logger.debug(`Starting channels update`)

        const guild = bot.guilds.cache.get(Jujutsu.GUILD_ID);

        if (guild) {
            await guild.channels.fetch().then(guildChannels => {
                guildChannels.forEach(guildChannel => {
                    const {GuildText} = ChannelType;

                    if (guildChannel && guildChannel.parentId && guildChannel.type === GuildText && !Jujutsu.EXCLUDED_CATEGORIES_ID.includes(guildChannel.parentId))
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

            await MessageHelper.getAllMessages(channel, 200).then(messages => {
                this.logger.debug(`Finished fetching messages for channel ${channel.name}`)

                if (messages.length > 0) {
                    const roleplayMessages = messages.filter(messages =>
                        messages.content.match(Jujutsu.TIMELINE_REGEX)
                    )

                    this.logger.debug(`Found ${roleplayMessages.length} roleplay messages from ${channel.name} !\n`)

                    roleplayMessagesSize += roleplayMessages.length;
                }
            })
        }

        return roleplayMessagesSize;
    }
}