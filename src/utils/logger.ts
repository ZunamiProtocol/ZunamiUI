const logs: Array<string> = [];
const STORAGE_KEY = 'ZUNAMI_LOGS';

/**
 * Logs message to the console or any other destination
 * @param message
 */
export function log(message: string): void {
    if (logs.indexOf(message) === -1) {
        logs.push(message);
        appendLogs(message);

        if (process.env.NODE_ENV === 'development' || window.location.hostname === 'test.zunami.io') {
            console.log(message);
        }
    }
}

/**
 * Append logs to permanent storage
 * @param message 
 */
function appendLogs(message: string) {
    const data = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    data.push(message);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function copyLogs() {
    const data = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');

    navigator.clipboard.writeText(data.join(`\n`)).then(() => {
        alert('Logs copied to clipboard');
    });
}
