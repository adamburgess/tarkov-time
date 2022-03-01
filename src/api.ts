import { realTimeToTarkovTime } from './time'
import { formatHMS } from './utils';

type EventContext<Env> = {
    request: Request;
    waitUntil: (promise: Promise<any>) => void;
    next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
    env: Env & { ASSETS: { fetch: typeof fetch } };
};

function get(left: boolean) {
    return formatHMS(realTimeToTarkovTime(new Date(), left));
}

function headers(extraHeaders: Record<string, string> = {}) {
    return {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=1',
            ...extraHeaders
        }
    }
}

export function onRequest(context: EventContext<unknown>): Response {
    const url = new URL(context.request.url);
    const path = url.pathname;

    if (path === '/left') return new Response(get(true), headers());
    else if (path === '/right') return new Response(get(false), headers());

    return new Response(JSON.stringify({
        left: get(true),
        right: get(false),
    }, null, 2), headers({
        'Content-Type': 'application/json'
    }));
}
