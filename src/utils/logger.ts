const logs: Array<string> = [];

/**
 * Logs message to the console or any other destination
 * @param message
 */
export function log(message: string): void {
    if (logs.indexOf(message) === -1) {
        logs.push(message);

        if (process.env.NODE_ENV === 'development' || window.location.hostname === 'test.zunami.io') {
            console.log(message);
        }
    }
}

export function copyLogs() {
    navigator.clipboard.writeText(logs.join(`\n`)).then(() => {
        alert('Logs copied to clipboard');
    });
}
