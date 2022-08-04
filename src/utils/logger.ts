const logs: Array<string> = [];

/**
 * Logs message to the console or any other destination
 * @param message
 */
export function log(message: string): void {
    logs.push(message);
}

export function copyLogs() {
    navigator.clipboard.writeText(logs.join(`\n`)).then(() => {
        alert('Logs copied to clipboard');
    });
}
