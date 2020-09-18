function stopwatch_format(time_ms) {
    // delta in seconds
    const delta = parseInt(Math.abs(Date.now() - new Date(time_ms)) / 1000);

    const days = Math.floor(delta / 86400);
    const hours = Math.floor((delta / 3600) - days * 24) % 24;
    const minutes = Math.floor((delta / 60) - (days * 24 * 60) - (hours * 60)) % 60;
    const seconds = parseInt((delta - (days * 24 * 60 * 60) - (hours * 60 * 60) - (minutes * 60)));

    const day_portion = days > 0 ? `${days}:` : '';
    const hour_portion = days > 0 || hours > 0 ? `${("0" + hours).slice(-2)}:` : '';

    return `${day_portion}${hour_portion}${("0" + minutes).slice(-2)}:${("0" + seconds).slice(-2)}`
};