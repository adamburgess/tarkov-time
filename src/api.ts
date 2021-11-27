import { realTimeToTarkovTime } from './time'
import { formatHMS } from './utils';

interface VercelRequest {
    url: string
}
type Handler = (event: {
    request: VercelRequest
}) => { response: Response, waitUntil: Promise<unknown> };

declare let _ENTRIES: Record<string, { default: Handler }>;

const resolvedPromise = Promise.resolve();

_ENTRIES = {
    "middleware_api": {
        default: ({ request }) => {
            return {
                response: handle(request),
                waitUntil: resolvedPromise
            };
        }
    }
}

function get(left: boolean) {
    return formatHMS(realTimeToTarkovTime(new Date(), left));
}

function headers(extraHeaders: Record<string, string> = {}) {
    return {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache',
            ...extraHeaders
        }
    }
}

function handle(request: VercelRequest): Response {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === 'left') return new Response(get(true), headers());
    else if (path === 'right') return new Response(get(false), headers());

    return new Response(JSON.stringify({
        left: get(true),
        right: get(false),
    }, null, 2), headers({
        'Content-Type': 'application/json'
    }));
}
