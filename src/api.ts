import { realTimeToTarkovTime } from './time'
import { formatHMS } from './utils';

function get(left: boolean) {
    return formatHMS(realTimeToTarkovTime(new Date(), left));
}

function headers(extraHeaders: Record<string, string> = {}) {
    return {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'max-age=0, no-store',
            ...extraHeaders
        }
    }
}

export default {
    async fetch(request: Request) {
        const url = new URL(request.url);
        const path = url.pathname;

        if (path === '/left') return new Response(get(true), headers());
        else if (path === '/right') return new Response(get(false), headers());

        let plaintext = url.searchParams.get('type') === 'plain';

        if (plaintext) {
            return new Response(`${get(true)}\n${get(false)}`, headers({
                'Content-Type': 'text/plain'
            }));
        }

        return new Response(JSON.stringify({
            left: get(true),
            right: get(false),
        }, null, 2), headers({
            'Content-Type': 'application/json'
        }));
    }
}
