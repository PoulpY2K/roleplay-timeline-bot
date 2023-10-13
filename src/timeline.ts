import {ChannelType, Message, TextChannel} from "discord.js";
import {Discord} from "discordx";
import {bot} from "./main";
import {Logger} from "tslog";
import {MessageHelper} from "./helper/message";
import {Jujutsu} from "./constants/jujutsu";
import {MessageFormat} from "./types/message-format";

export class Timeline {
    private static logger = new Logger({name: "timeline"});

    public static async updateServerChannels(): Promise<TextChannel[]> {
        let channels: TextChannel[] = []

        this.logger.debug(`Starting channels update`)

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

        this.logger.debug(`Added ${channels.length} channels !\n`)

        return channels;
    }

    public static async fetchRoleplaySession(channel: TextChannel): Promise<Message[]> {
        let roleplaySessionMessages: Message[] = [];

        const messages = await MessageHelper.getAllMessages(channel, 200)

        if (messages.length > 0) {
            const sessionMessages = messages.filter(messages =>
                messages.content.match(Jujutsu.TIMELINE_REGEX)
            )

            this.logger.debug(`Found ${sessionMessages.length} roleplay messages from ${channel.name} !\n`)
            roleplaySessionMessages.push(...sessionMessages);

        }


        return roleplaySessionMessages;
    }

    public static async fetchAllRoleplaySessions(channels: TextChannel[]): Promise<Message[]> {
        this.logger.debug(`Starting global roleplay sessions messages fetcher !\n`)

        let roleplaySessionMessages: Message[] = []

        for (const channel of channels) {
            const messages = await this.fetchRoleplaySession(channel);
            roleplaySessionMessages.push(...messages);
        }

        return roleplaySessionMessages;
    }

    public static formatMessages(messages: Message[]): MessageFormat[] {
        const messageMatchOnly =
            messages.map(messages => messages.content.match(Jujutsu.TIMELINE_REGEX))
                .flatMap(m => m ? [m] : [])

        const dates = messageMatchOnly.map(message => message[0].match(Jujutsu.DATE_REGEX))
        const hours = messageMatchOnly.map(message => message[0].match(Jujutsu.HOUR_REGEX))
        const timezones = messageMatchOnly.map(message => message[0].match(Jujutsu.TIMEZONE_REGEX))

        return messages.map((message, index): MessageFormat => {
            return {
                initialMessage: message.content,
                sessionMessage: messageMatchOnly[index][0],
                messageUrl: message.url,
                date: dates[index],
                hours: hours[index],
                timezones: timezones[index]
            }
        })
    }
}