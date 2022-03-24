function is1024() {
    return document.body.clientWidth >= 1024;
}

function is1440() {
    return document.body.clientWidth >= 1440;
}

function is1920() {
    return document.body.clientWidth >= 1920;
}

function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );
}

export { is1024, is1440, is1920, isMobile };
