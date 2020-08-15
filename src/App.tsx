import { h, Fragment } from 'preact';
import { useEffect, useState } from 'preact/hooks'
import dayjs, { Dayjs } from 'dayjs'

import { useDate } from './utils';
import './App.css'

import { Scroller } from './Scroller'

export function App() {
    const time = useDate(new Date(), 50);
    return <div class="container max-w-screen-sm px-3">
        <h1 class="text-3xl ff-heading font-black mt-3 text-center">Escape from Tarkov</h1>
        <h2 class="text-2xl xl:text-3xl ff-heading font-black text-center mb-2">Real time to In-game time</h2>
        <div class="grid grid-cols-2 grid-rows-1">
            <Scroller side="left" time={time}/>
            <Scroller side="right" time={time}/>
        </div>
    </div>
}
