export default interface CommandOptions {
    rawArgs: string[];
    rawArgv: string[];
    args: string[];
    options: {
        [option: string]: string;
    }
}