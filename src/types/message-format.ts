export type MessageFormat = {
    initialMessage: string,
    sessionMessage: string,
    messageUrl: string,
    date: RegExpMatchArray | null,
    hours: RegExpMatchArray | null,
    timezones: RegExpMatchArray | null
}