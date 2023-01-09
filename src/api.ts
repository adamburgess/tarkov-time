import { realTimeToTarkovTime } from './time'
import { formatHMS } from './utils';
import { ExecutionContext } from '@cloudflare/workers-types'

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

async function logRequest(request: Request, apiUrl: string) {
    // report request to some service dunno how
    await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            url: request.url,
            headers: Object.fromEntries(request.headers.entries())
        })
    });
}

function shouldLogRequest() {
    //return Math.random() < 0.05; // log 5% of requests.
    return true;
}

export default {
    async fetch(request: Request, env: {LOGGLY_API: string}, context: ExecutionContext) {
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

        if (shouldLogRequest()) {
            context.waitUntil(logRequest(request, env.LOGGLY_API).catch(() => { }));
        }

        return new Response(JSON.stringify({
            left: get(true),
            right: get(false),
        }, null, 2), headers({
            'Content-Type': 'application/json'
        }));
    }
}
