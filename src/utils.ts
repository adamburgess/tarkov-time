import { useEffect, useState } from 'preact/hooks';

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
