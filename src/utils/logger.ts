/**
 * Logs message to the console or any other destination
 * @param message
 */
export function log(message: string): void {
    if (process.env.REACT_APP_DEBUG) {
        console.log(message);
    }
}
