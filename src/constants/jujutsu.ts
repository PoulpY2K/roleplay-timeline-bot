export namespace Jujutsu {
    export const GUILD_ID: string = "955262302423253152";
    export const EXCLUDED_CATEGORIES_ID: string [] = ["956945902050889848", "987485314941591622", "955262302423253153", "955262302876209172"]
    export const TIMELINE_REGEX: RegExp = /```.*```/g;
    export const DATE_REGEX: RegExp = /(?:\d{1,2})?\s\D{3,9}\s\d{4}/
    export const HOUR_REGEX: RegExp = /\d{1,2}[hH:]\d{0,2}(?: [A|P]M)?/
    export const TIMEZONE_REGEX: RegExp = /\([UTCGM]{3}[+-]\d\)/
}