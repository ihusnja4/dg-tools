export function avg(items, aggregateBy) {
    return sum(items, aggregateBy) / items.length;
}

export function sum(items, aggregateBy) {
    return items.reduce(aggregate(aggregateBy), 0);
}

export function aggregate(by) {
    return (aggregator, item) => aggregator + item[by];
}

export function numberFormat(val, decimals = 0) {
    return val.toLocaleString("en", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function numberUnFormat(val) {
    return parseFloat(val.replace(/[^\.\d]+/g, ''));
}
