/**
 * Retrieves theme state from a local storage
 * @returns
 */
function getTheme() {
    return window.localStorage.getItem('theme') || 'default';
}

/**
 * Saves theme to the local storage
 * @param {string} theme Theme's name
 * @returns
 */
function setTheme(theme: string) {
    return window.localStorage.setItem('theme', theme);
}

export { getTheme, setTheme };
