import { h, Fragment } from 'preact';
import { realTimeToTarkovTime, timeUntilRelative, hrs } from './time';
import { formatHMS, formatLocalTime, formatTimeUntil } from './utils';

import './Scroller.css'

function TarkovCurrentTime({ tarkovTime }: { tarkovTime: Date }) {
    return <Fragment>{formatHMS(tarkovTime)}</Fragment>
}

function TarkovFutureTime({ hour, future, isLeft }: { hour: number, future: number, isLeft: boolean }) {
    const direction = isLeft ? 'flex-row' : 'flex-row-reverse';

    const timeRemaining = future == 0 ? 'now' : formatTimeUntil(future);
    const timeNow = formatLocalTime(new Date(new Date().getTime() + future));

    return <Fragment>
        <div class="border-b inline" style={{ width: 10, height: 0 }}></div>
        <div class="flex flex-col px-1">
            <div class="leading-4 text-base text-gray-400 ff-blender">{hour.toString().padStart(2, '0')}:00</div>
            <div class={"flex leading-4 text-xs text-gray-500 " + direction}>
                <span>{timeNow}</span>
                <span class="mx-1">·</span>
                <span>{timeRemaining}</span>
            </div>
        </div>
    </Fragment>;
}

function TarkovCurrentTimeElement({ tarkovTime, left }: { tarkovTime: Date, left: boolean }) {

    const justify = left ? 'justify-end' : 'justify-start';
    // update 2021 july: push it slightly towards the center
    const desktopMargin = left ? 'md:ml-6' : 'md:mr-6';

    return <div class={`z-10 flex absolute w-full text-center items-center ${justify} md:justify-center`} style={{
        top: 0,
        height: 60
    }}>
        <div class={`mx-2 ${desktopMargin}`}>
            <div class="inline-block ff-blender text-xl border-2 border-white bg-grey-900 px-3 py-1 md:px-5 md:py-2">
                <TarkovCurrentTime tarkovTime={tarkovTime} />
            </div>
        </div>
    </div>
}

export function Scroller({ isLeft, time }: { isLeft: boolean, time: Date }) {
    const tarkovTime = realTimeToTarkovTime(time, isLeft);
    const tarkovHour = tarkovTime.getUTCHours();
    const tarkovMinute = tarkovTime.getUTCMinutes();

    const futureHours: { hour: number, future: number }[] = [];

    for (let i = tarkovHour; i < tarkovHour + 13; i++) {
        const hour = i % 24;
        let future = timeUntilRelative(hrs(hour), isLeft, time);
        if (i === tarkovHour) future = 0;
        futureHours.push({
            hour,
            future
        });
    }

    let border = " ";
    border += isLeft ? 'border-l' : 'border-r';
    let align = isLeft ? 'text-left' : 'text-right';

    let direction = isLeft ? 'flex-row' : 'flex-row-reverse';

    const hourElements = futureHours.map(({ hour, future }) => {
        return <div key={hour} style={{
            height: 60,
        }} class={`${border} flex items-center ${direction} ${align}`}>
            <TarkovFutureTime hour={hour} future={future} isLeft={isLeft} />
        </div>;
    });

    return <div style={{
        height: 12 * 60
    }}>
        <div class="relative overflow-hidden">
            <div class="relative" style={{
                top: -tarkovMinute
            }}>
                {hourElements}
            </div>
            <div class="absolute w-full T"></div>
            <div class="z-10 absolute w-full B"></div>
            <TarkovCurrentTimeElement tarkovTime={tarkovTime} left={isLeft} />
        </div>
    </div>
}
