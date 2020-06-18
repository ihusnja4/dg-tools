/**
 *
 *
 * @param {window} env
 */
export default function processPlanetListStats(env) {
    const locations = Array.from(document.querySelectorAll('.locationWrapper')).map(processLocation);
    const workers = sum(locations, 'workersIdle') + sum(locations, 'workersBusy');
    const soldiers = sum(locations, 'soldiers');
    const stats = {
        planetsOwned: locations.length,
        fleets: locations.reduce(
            (r, l) => [...r, ...l.fleets.map(f => ({...f, coords: l.coords }))],
            []
        ),
        workers,
        avgWorkers: workers / locations.length,
        soldiers,
        avgSoldiers: soldiers / locations.length,
        groundRemaining: sum(locations, 'groundRemaining'),
        orbitRemaining: sum(locations, 'orbitRemaining'),
        metalInStock: sum(locations, 'metalInStock'),
        metalProduction: sum(locations, 'metalProduction'),
        avgMetalAbundance: avg(locations, 'metalAbundance'),
        mineralInStock: sum(locations, 'mineralInStock'),
        mineralProduction: sum(locations, 'mineralProduction'),
        avgMineralAbundance: avg(locations, 'mineralAbundance'),
        energyInStock: sum(locations, 'energyInStock'),
        energyProduction: sum(locations, 'energyProduction'),
        avgEnergyAbundance: avg(locations, 'energyAbundance'),
        producing: locations.reduce((r, l) => {
            if (l.shipYard.item !== 'None') {
                r.push({...l.shipYard, coords: l.coords});
            }
            return r;
        }, []),
        training: locations.reduce((r, l) => {
            if (l.barracks.item !== 'None') {
                r.push({...l.barracks, coords: l.coords});
            }
            return r;
        }, []),
        building: locations.reduce((r, l) => {
            if (l.structure.item !== 'None') {
                r.push({...l.structure, coords: l.coords});
            }
            return r;
        }, [])
    };
    console.log('Locations', locations, stats);
    const discordOutputEl = env.document.createElement('textarea');
    discordOutputEl.style.width = '400px';
    discordOutputEl.style.height = '200px';
    discordOutputEl.value = [
        `:coords: Planets Owned: ${stats.planetsOwned}`,
        `:worker: ${numberFormat(stats.workers)} (${numberFormat(stats.avgWorkers)} / planet)`,
        `:soldier: ${numberFormat(stats.soldiers)} (${numberFormat(stats.avgSoldiers)} / planet)`,
        `:metal~1: ${numberFormat(stats.metalInStock)} (+${numberFormat(stats.metalProduction)}) ${numberFormat(stats.avgMetalAbundance, 2)}%`,
        `:mineral: ${numberFormat(stats.mineralInStock)} (+${numberFormat(stats.mineralProduction)}) ${numberFormat(stats.avgMineralAbundance, 2)}%`,
        `:energy: ${numberFormat(stats.energyInStock)} (+${numberFormat(stats.energyProduction)}) ${numberFormat(stats.avgEnergyAbundance, 2)}%`,
        `:army_barracks: Training:`,
        ...stats.training.reduce((r, b) => {
            const find = r.find(i => i.turns === b.turns && i.item === b.item);
            if (find) {
                find.quantity += b.quantity;
                return r;
            }
            return [...r, { turns: b.turns, item: b.item, quantity: b.quantity }];
        }, []).map(r => `+${numberFormat(r.quantity)}x ${r.item} in ${r.turns} turns`),
        `:ship_yard: Producing:`,
        ...stats.producing.reduce((r, b) => {
            const find = r.find(i => i.turns === b.turns && i.item === b.item);
            if (find) {
                find.quantity += b.quantity;
                return r;
            }
            return [...r, { turns: b.turns, item: b.item, quantity: b.quantity }];
        }, []).map(r => `+${numberFormat(r.quantity)}x ${r.item} in ${r.turns} turns`),
    ].join('\n');

    const outletEl = env.document.createElement('div');
    outletEl.classList.add('planet-list-stats-outlet');
    outletEl.append(discordOutputEl);
    env.document.body.append(outletEl);
}

function avg(items, aggregateBy) {
    return sum(items, aggregateBy) / items.length;
}
function sum(items, aggregateBy) {
    return items.reduce(aggregate(aggregateBy), 0);
}
function aggregate(by) {
    return (aggregator, item) => aggregator + item[by];
}
function numberFormat(val, decimals = 0) {
    return val.toLocaleString("en", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function processLocation(el) {
    return {
        el: el,
        coords: extractText(el,'.coords'),
        name: extractText(el,'.planetName'),
        planetLink: extractHref(el,'.planetName a'),
        newsLink: extractHref(el,'.planetHeadSection a[href^="/news"]'),
        orbitRemaining: unFormatNumber(extractText(el,'.orbit')),
        groundRemaining: unFormatNumber(extractText(el,'.ground')),
        soldiers: unFormatNumber(extractText(el,'.soldier')),
        workersIdle: unFormatNumber(extractText(el,'.population span')),
        workersBusy: unFormatNumber(extractText(el,'.population .neutral')),
        ...extractResource(el, 'metal'),
        ...extractResource(el, 'mineral'),
        ...extractResource(el, 'energy'),
        structure: extractBuild(el, 'Building'),
        shipYard: extractBuild(el, 'Ship Yard', true),
        barracks: extractBuild(el, 'Barracks', true),
        radarLink: extractRadarLink(el),
        fleets: extractFleets(el)
    };
}

function extractText(el, selector) {
    const found = el.querySelector(selector);
    return found ? found.innerText.trim() : '';
}
function extractHref(el, selector) {
    const found = el.querySelector(selector)
    return found ? found.getAttribute('href') : null;
}
function extractBuild(el, matcher) {
    return Array.from(el.querySelectorAll('.resource'))
        .filter(e => new RegExp(`^${matcher}$`).test(extractText(e,'a')))
        .reduce((r, e) => {
            const [, quantity = '1', item = 'None', turns = '0'] = e.innerText.match(/(?:[^\:]+)\:\s*([\d,]+x )?([^\(]+)\s(?:\((\d+) turns?\))?/) || [];
            return {
                item: item.trim(),
                quantity: unFormatNumber(quantity),
                turns: unFormatNumber(turns),
                link: extractHref(e,'a')
            };
        }, { item: 'None', turns: 0, link: null, quantity: 0 });
}
function extractRadarLink(el) {
    const [e] = Array.from(el.querySelectorAll('.resource'))
        .filter(e => new RegExp(`^Communications$`, 'i').test(extractText(e,'a')))
    return e ? extractHref(e, 'a') : null;
}
function extractResource(el, key) {
    const [inStock, production, abundance] = extractText(el, `.${key}`).split(' ').map(unFormatNumber);
    return {
        [`${key}InStock`]: inStock,
        [`${key}Production`]: production,
        [`${key}Abundance`]: abundance,
    }
}
function extractFleets(el) {
    return Array.from(el.querySelectorAll('.fleet')).slice(1) // first one is "Fleets in orbit" text
        .map(e => ({
            name: e.innerText.trim(),
            link: extractHref(e, 'a'),
            friendly: e.classList.contains('friendly'),
            hostile: el.classList.contains('hostile') // TODO not sure if its hostile or enemy
        }));
}

function unFormatNumber(val) {
    return parseFloat(val.replace(/[^\.\d]+/g, ''));
}
