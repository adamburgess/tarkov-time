import { h, Fragment, ComponentChildren } from 'preact';
import dayjs from 'dayjs';
import dayjsUtc from 'dayjs/plugin/utc'
import { realTimeToTarkovTime, timeUntilRelative, hrs, formatFuture } from './time';
dayjs.extend(dayjsUtc);

function TarkovCurrentTime({ tarkovTime }: { tarkovTime: Date }) {
    return <Fragment>{dayjs.utc(tarkovTime).format('HH:mm:ss')}</Fragment>
}

function TarkovFutureTime({ hour, future, isLeft }: { hour: number, future: number, isLeft: boolean }) {
    const direction = isLeft ? 'flex-row' : 'flex-row-reverse';

    const timeRemaining = future == 0 ? 'now' : formatFuture(future);
    const timeNow = dayjs().add(future, 'ms').format('h:mma');

    return <Fragment>
        <div class={`border-b inline`} style={{ width: 10, height: 0 }}></div>
        <div class={`flex flex-col px-1`}>
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

export function Scroller({ side, time }: { side: 'left' | 'right', time: Date }) {
    const isLeft = side === 'left';

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
        <div class={`relative overflow-hidden`}>
            <div class="relative" style={{
                top: -tarkovMinute
            }}>
                {hourElements}
            </div>
            <div class="absolute w-full" style={{
                top: 0,
                height: 40,
                background: 'linear-gradient(180deg, rgba(33,33,33,1) 0%, rgba(33,33,33,0) 100%)'
            }}></div>
            <div class="z-10 absolute w-full" style={{
                bottom: 0,
                height: 120,
                background: 'linear-gradient(0deg, rgba(33,33,33,1) 0%, rgba(33,33,33,1) 50%, rgba(33,33,33,0) 100%)'
            }}></div>
            <TarkovCurrentTimeElement tarkovTime={tarkovTime} left={isLeft} />
        </div>
    </div>
}