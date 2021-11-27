import { realTimeToTarkovTime } from './time'
import { formatHMS } from './utils';

type Handler = (event: {
    request: {
        url: string
    }
}) => { response: Response, waitUntil: Promise<unknown> };

declare let _ENTRIES: Record<string, { default: Handler }>;

const resolvedPromise = Promise.resolve();

_ENTRIES = {
    "middleware_api": {
        default: ({ request }) => {
            const time = formatHMS(realTimeToTarkovTime(new Date(), true));
            return {
                response: new Response(time),
                waitUntil: resolvedPromise
            };
        }
    }
}
