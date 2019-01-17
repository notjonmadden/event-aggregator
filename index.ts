type EventType<T> = { new(...args: any[]): T };
type SubscriptionToken = number;
type Subscription = { 
    callback: (e: any) => void;
    token: SubscriptionToken;
}

function isInvalid(o: any) {
    return o === null || typeof o === 'undefined';
}

function getKey<T>(event: T | EventType<T>): string {
    if (isInvalid(event)) {
        throw Error('event must not be null or undefined');
    }

    if (typeof event === 'function') {
        return event.toString();
    } else if (typeof event === 'object') {
        return event.constructor.toString();
    }

    throw Error('event must be an event object or class type');
}

export default class EventAggregator {
    private readonly subscriptionMap: { [eventKey: string]: Subscription[] } = {};
    private lastToken: SubscriptionToken = -1;

    public publish<T>(event: T): void {
        const key = getKey(event);
        const subscriptions = this.subscriptionMap[key];

        for (const { callback } of subscriptions) {
            try {
                callback(event);
            } catch (err) {
                console.log(err);
            }
        }
    }

    public subscribe<T>(event: EventType<T>, callback: (e: T) => void): SubscriptionToken {
        if (isInvalid(callback)) {
            throw Error('callback must not be null or undefined');
        }
        
        const key = getKey(event);
        const subscriptions = this.subscriptionMap[key];
        const token = this.lastToken + 1;
        const subscription = { callback, token };

        this.lastToken += 1;

        if (typeof subscriptions === 'undefined') {
            this.subscriptionMap[key] = [subscription];
        } else {
            subscriptions.push(subscription);
        }

        return token;
    }

    public listenOnce<T>(event: EventType<T>, timeout?: number): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const token = this.subscribe(event, e => {
                this.unsubscribe(token);
                resolve(e);
            });

            setTimeout(() => {
                this.unsubscribe(token);
                reject("timeout");
            }, timeout);
        });
    }

    public unsubscribe(token: SubscriptionToken): void {
        for (const key of Object.keys(this.subscriptionMap)) {
            const subscriptions = this.subscriptionMap[key];
            const idxTargetSubscription = subscriptions.findIndex(
                s => s.token === token
            );
            
            if (idxTargetSubscription !== -1) {
                subscriptions.splice(idxTargetSubscription, 1);
                return;
            }
        }
    }
}