import { realTimeToTarkovTime } from './time'
import { formatHMS } from './utils';

type Handler = (event: { request: {
    url: string
}} ) => {response: Response, waitUntil: Promise<unknown> };

declare let _ENTRIES: Record<string, { default: Handler }>;

_ENTRIES = {
    "middleware_api": {
        default: ({ request }) => {
            if (request.url.includes('foo')) {
                const time = formatHMS(realTimeToTarkovTime(new Date(), true));
                return {
                    response: new Response(time),
                    waitUntil: Promise.resolve()
                };
            }

            return {
                response: new Response(null, {
                    headers: {
                        'x-middleware-next': '1',
                        'ohverynice': 'yes'
                    }
                }),
                waitUntil: Promise.resolve()
            }
        }
    }
}

const ms = realTimeToTarkovTime(new Date(), true);

const time = formatHMS(ms);
console.log(time);