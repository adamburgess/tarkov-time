import { hrs } from './utils';

// 1 second real time = 7 seconds tarkov time
const tarkovRatio = 7;

export function realTimeToTarkovTime(time: Date, left: boolean) {
    // tarkov time moves at 7 seconds per second.
    // surprisingly, 00:00:00 does not equal unix 0... but it equals unix 10,800,000.
    // Which is 3 hours. What's also +3? Yep, St. Petersburg - MSK: UTC+3.
    // therefore, to convert real time to tarkov time,
    // tarkov time = (real time * 7 % 24 hr) + 3 hour

    const oneDay = hrs(24);
    const russia = hrs(3);

    const offset = russia + (left ? 0 : hrs(12));
    const tarkovTime = new Date((offset + (time.getTime() * tarkovRatio)) % oneDay);
    return tarkovTime;
}

export function timeUntilRelative(until: number, left: boolean, date: Date) {
    const tarkovTime = realTimeToTarkovTime(date, left);
    if (until < tarkovTime.getTime()) until += hrs(24);

    const diffTarkov = until - tarkovTime.getTime();
    const diffRT = diffTarkov / tarkovRatio;

    return diffRT;
}
