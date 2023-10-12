import {FetchMessagesOptions, Message, TextChannel} from "discord.js";
import {setTimeout} from "timers/promises";

export namespace MessageHelper {
    export const getAllMessages = async (channel: TextChannel, timeoutMs: number): Promise<Message[]> => {
        let out: Message[] = []

        let lastId: string = ""
        let isFetching = true;

        do {
            const options: FetchMessagesOptions = {
                limit: 100,
            }
            if (lastId.length > 0) {
                options.before = lastId
            }

            await setTimeout(timeoutMs);
            const messages = await channel.messages.fetch(options)
            const messageMap = messages.map(messages => messages)

            if (messageMap.length <= 0) {
                isFetching = false;
            } else {
                out.push(...messageMap);
                lastId = messageMap[(messageMap.length - 1)].id
            }
        } while (isFetching);

        return out
    };
}