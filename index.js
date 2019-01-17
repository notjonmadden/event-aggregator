function isInvalid(o) {
    return o === null || typeof o === 'undefined';
}
function getKey(event) {
    if (isInvalid(event)) {
        throw Error('event must not be null or undefined');
    }
    if (typeof event === 'function') {
        return event.toString();
    }
    else if (typeof event === 'object') {
        return event.constructor.toString();
    }
    throw Error('event must be an event object or class type');
}
var EventAggregator = /** @class */ (function () {
    function EventAggregator() {
        this.subscriptionMap = {};
        this.lastToken = -1;
    }
    EventAggregator.prototype.publish = function (event) {
        var key = getKey(event);
        var subscriptions = this.subscriptionMap[key];
        for (var _i = 0, subscriptions_1 = subscriptions; _i < subscriptions_1.length; _i++) {
            var callback = subscriptions_1[_i].callback;
            try {
                callback(event);
            }
            catch (err) {
                console.log(err);
            }
        }
    };
    EventAggregator.prototype.subscribe = function (event, callback) {
        if (isInvalid(callback)) {
            throw Error('callback must not be null or undefined');
        }
        var key = getKey(event);
        var subscriptions = this.subscriptionMap[key];
        var token = this.lastToken + 1;
        var subscription = { callback: callback, token: token };
        this.lastToken += 1;
        if (typeof subscriptions === 'undefined') {
            this.subscriptionMap[key] = [subscription];
        }
        else {
            subscriptions.push(subscription);
        }
        return token;
    };
    EventAggregator.prototype.listenOnce = function (event, timeout) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var token = _this.subscribe(event, function (e) {
                _this.unsubscribe(token);
                resolve(e);
            });
            setTimeout(function () {
                _this.unsubscribe(token);
                reject("timeout");
            }, timeout);
        });
    };
    EventAggregator.prototype.unsubscribe = function (token) {
        for (var _i = 0, _a = Object.keys(this.subscriptionMap); _i < _a.length; _i++) {
            var key = _a[_i];
            var subscriptions = this.subscriptionMap[key];
            var idxTargetSubscription = subscriptions.findIndex(function (s) { return s.token === token; });
            if (idxTargetSubscription !== -1) {
                subscriptions.splice(idxTargetSubscription, 1);
                return;
            }
        }
    };
    return EventAggregator;
}());
export default EventAggregator;
