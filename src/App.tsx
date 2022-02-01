import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import './App.css'

import { Scroller } from './Scroller'

export function useDate(initial: Date, updateSpeed: number) {
    const [time, setTime] = useState(initial);
    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, updateSpeed);
        return () => clearInterval(interval);
    }, [updateSpeed]);

    return time;
}

export function App() {
    const time = useDate(new Date(), 50);
    return <div class="container max-w-screen-sm px-3">
        <h1 class="text-3xl ff-heading font-black mt-3 text-center">Escape from Tarkov</h1>
        <h2 class="text-2xl xl:text-3xl ff-heading font-black text-center mb-2">Real time to ingame time</h2>
        <div class="grid grid-cols-2 grid-rows-1">
            <Scroller side="left" time={time} />
            <Scroller side="right" time={time} />
        </div>
        <div class="z-50 relative text-xs text-gray-500 text-right mt-2">
            <div>Time in Escape from Tarkov moves at 7 seconds per second.</div>
            <a href="https://github.com/adamburgess/tarkov-time">Source code at github.com/adamburgess/tarkov-time</a>
        </div>
    </div>
}
