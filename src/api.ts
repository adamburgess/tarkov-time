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

async function logRequest(request: Request, apiUrl: string, response: any) {
    // report request to loggly
    await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            url: request.url,
            headers: Object.fromEntries(request.headers.entries()),
            response
        })
    });
}

function isSpam(request: Request) {

    return false;

    const ip = request.headers.get('cf-connecting-ip');
    const ua = request.headers.get('user-agent')?.toLowerCase() ?? '';
    if (ip === '81.109.147.70') return true; // 30,000 requests per day from one ip...
    if (ua.includes('qtwebengine')) return true; // 40,000 requests from all over the place, and ~~I have no idea what program this is.~~ https://apps.elgato.com/plugins/com.komordzsi.tarkovtime (no hard feelings!)

    return false;
}

export default {
    async fetch(request: Request, env: { LOGGLY_API: string }, context: ExecutionContext) {

        let response = '';
        let h: RequestInit;

        const url = new URL(request.url);
        const path = url.pathname;

        if (isSpam(request)) {
            // ¯\_(ツ)_/¯
            response = `Sorry, you're making too many requests. Make an issue at github.com/adamburgess/tarkov-time`;
            h = headers({
                'Content-Type': 'text/plain'
            });
        }
        else if (path === '/left') {
            response = get(true);
            h = headers();
        }
        else if (path === '/right') {
            response = get(false);
            h = headers();
        } else {
            let plaintext = url.searchParams.get('type') === 'plain';
            if (plaintext) {
                response = `${get(true)}\n${get(false)}`;
                h = headers({
                    'Content-Type': 'text/plain'
                });
            } else {
                response = JSON.stringify({
                    left: get(true),
                    right: get(false),
                }, null, 2);
                h = headers({
                    'Content-Type': 'application/json'
                });
            }
        }

        if ('LOGGLY_API' in env) {
            context.waitUntil(logRequest(request, env.LOGGLY_API, response).catch(() => { }));
        }

        return new Response(response, h);
    }
}
