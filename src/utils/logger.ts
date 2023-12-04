const logs: Array<string> = [];
const STORAGE_KEY = 'ZUNAMI_LOGS';
const LOGS_THRESHOLD = 1000;

/**
 * Logs message to the console or any other destination
 * @param message
 */
export function log(message: string): void {
    console.log(message);

    // if (logs.indexOf(message) === -1) {
    //     logs.push(message);
    //     appendLogs(message);

    //     if (
    //         process.env.NODE_ENV === 'development' ||
    //         window.location.hostname === 'test.zunami.io'
    //     ) {
    //         console.log(message);
    //     }
    // }
}

/**
 * Append logs to permanent storage
 * @param message
 */
function appendLogs(message: string) {
    let data = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    data.push(message);

    if (data.length >= LOGS_THRESHOLD) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        data = data.slice(-1000);
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function copyLogs() {
    const data = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');

    navigator.clipboard.writeText(data.join(`\n`)).then(() => {
        alert('Logs copied to clipboard');
    });
}
