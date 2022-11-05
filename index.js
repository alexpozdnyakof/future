"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FutureStatus;
(function (FutureStatus) {
    FutureStatus[FutureStatus["Pending"] = 0] = "Pending";
    FutureStatus[FutureStatus["Resolved"] = 1] = "Resolved";
})(FutureStatus || (FutureStatus = {}));
function Future(executor) {
    let resolvers = [];
    let result;
    let status = FutureStatus.Pending;
    const setState = (aValue, aStatus) => {
        if (status !== FutureStatus.Pending)
            return;
        result = aValue;
        status = aStatus;
    };
    const resolve = (value) => {
        setState(value, FutureStatus.Resolved);
    };
    executor(resolve);
    const executeChain = () => {
        resolvers.forEach(resolver => resolver(result));
        resolvers = [];
    };
    return {
        then: (resolver) => {
            return Future((resolve) => {
                resolvers.push((value) => {
                    resolve(resolver(value));
                });
                executeChain();
            });
        },
    };
}
exports.default = Future;
