export {};

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            [key: string]: string | undefined;
            BOT_TOKEN: string;
            // add more environment variables and their types here
        }
    }
}
