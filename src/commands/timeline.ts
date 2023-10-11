import type {TextBasedChannel,} from "discord.js";
import {ChannelType, TextChannel} from "discord.js";
import {Discord} from "discordx";
import {bot} from "../main";

@Discord()
export class Timeline {

    private static channels: TextChannel[] = [];

    public static async updateServerChannels(): Promise<void> {
        const guild = bot.guilds.cache.get("988858395526307921");

        if (guild) {
            await guild.channels.fetch().then(guildChannels => {
                guildChannels.forEach(guildChannel => {
                    const {GuildText} = ChannelType;

                    if (guildChannel && guildChannel.type === GuildText)
                        this.channels.push(guildChannel);
                })
            })
        }
    }

    public static async fetchRoleplaySessions(): Promise<number> {
        let roleplaySessionsSize = 0;

        for (const channel of this.channels) {
            await channel.messages.fetch({cache: true}).then(messages => {

                if (messages.size > 0) {
                    const roleplaySessions = messages.filter(messages =>
                        messages.content.match("^```.*(\\d{2} \\D{4} \\d{4}).*(\\d{2}(?:H|:)\\d{2}).*(\\(GMT\\+\\d{1}\\))?\\W*```$")
                    )

                    console.log(`Found ${roleplaySessions.size} roleplay sessions from ${channel.name} !`)

                    roleplaySessionsSize += roleplaySessions.size;
                }
            })
        }

        return roleplaySessionsSize;
    }
}