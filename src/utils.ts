export function formatHM(date: Date) {
    return [date.getUTCHours(), date.getUTCMinutes()].map(x => x.toString().padStart(2, '0')).join(':');
}
export function formatHMS(date: Date) {
    return [date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()].map(x => x.toString().padStart(2, '0')).join(':');
}
export function formatTimeUntil(ms: number) {
    const time = new Date(ms);
    const hour = time.getUTCHours();
    const min = time.getUTCMinutes();
    const sec = time.getUTCSeconds();
    let text = '';
    if (hour != 0) {
        text = hour + 'hr';
    }
    text += min + 'min';
    if (hour == 0 && min == 0) {
        text = sec + 's';
    }
    return text;
}
export function formatLocalTime(date: Date) {
    const hours = date.getHours();
    return `${hours == 0 ? '12' : hours >= 12 ? hours - 12 : hours}:${date.getMinutes().toString().padStart(2, '0')}${hours < 12 ? 'a' : 'p'}m`;
}

export function hrs(num: number) {
    return 1000 * 60 * 60 * num;
}
