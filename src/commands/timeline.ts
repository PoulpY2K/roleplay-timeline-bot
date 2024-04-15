import {ChannelType, Role, TextChannel} from "discord.js";
import {Discord} from "discordx";
import {bot} from "../main";
import {Logger} from "tslog";
import {MessageHelper} from "../helper/message";
import {Jujutsu} from "../constants/jujutsu";
import type { RoleplayEvent } from "@prisma/client";

export namespace Timeline {
     const logger = new Logger({name: "timeline"});
     const channels: TextChannel[] = [];

     export const updateServerChannels = async () => {
        logger.debug(`Starting channels update`)

        const guild = bot.guilds.cache.get(Jujutsu.GUILD_ID);

        if (guild) {
            await guild.channels.fetch().then(guildChannels => {
                guildChannels.forEach(guildChannel => {
                    const {GuildText} = ChannelType;

                    if (guildChannel && guildChannel.parentId && guildChannel.type === GuildText && !Jujutsu.EXCLUDED_CATEGORIES_ID.includes(guildChannel.parentId))
                        channels.push(guildChannel);
                })
            })
        }

        logger.debug(`Added ${channels.length} channels !\n`)
    }

    export const fetchRoleplaySessions = async() => {
        logger.debug(`Starting global roleplay sessions messages fetcher !\n`)

        let roleplayMessagesSize = 0;

        for (const channel of channels) {
            logger.debug(`Starting messages fetching for channel ${channel.name}`)

            await MessageHelper.getAllMessages(channel, 200).then(messages => {
                logger.debug(`Finished fetching messages for channel ${channel.name}`)

                if (messages.length > 0) {
                    const roleplayMessages = messages.filter(messages =>
                        messages.content.match(Jujutsu.TIMELINE_REGEX)
                    )

                    logger.debug(`Found ${roleplayMessages.length} roleplay messages from ${channel.name} !\n`)

                    roleplayMessagesSize += roleplayMessages.length;
                }
            })
        }

        return roleplayMessagesSize;
    }
}
