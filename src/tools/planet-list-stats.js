import {avg, numberFormat, sum} from "../utils/index";

/**
 * Convert planet list data into stats.
 *
 * @param {PlanetInfo[]} planetList
 * @return {PlanetListStats}
 */
export function getPlanetListStats(planetList) {
    const workers = sum(planetList, 'workersIdle') + sum(planetList, 'workersBusy');
    const soldiers = sum(planetList, 'soldiers');
    return {
        planetsOwned: planetList.length,
        coords: planetList.map(p => p.coords),
        fleets: planetList.reduce(
            (r, p) => [...r, ...p.fleets.map(f => ({...f, coords: p.coords }))],
            []
        ),
        workers,
        avgWorkers: workers / planetList.length,
        soldiers,
        avgSoldiers: soldiers / planetList.length,
        groundRemaining: sum(planetList, 'groundRemaining'),
        orbitRemaining: sum(planetList, 'orbitRemaining'),
        metal: {
            inStock: sum(planetList, 'metalInStock'),
            production: sum(planetList, 'metalProduction'),
            avgAbundance: avg(planetList, 'metalAbundance'),
        },
        mineral: {
            inStock: sum(planetList, 'mineralInStock'),
            production: sum(planetList, 'mineralProduction'),
            avgAbundance: avg(planetList, 'mineralAbundance'),
        },
        energy: {
            inStock: sum(planetList, 'energyInStock'),
            production: sum(planetList, 'energyProduction'),
            avgAbundance: avg(planetList, 'energyAbundance'),
        },
        producing: planetList.filter(p => p.shipYard.item !== 'None').map(({shipYard, coords}) => ({...shipYard, coords})),
        training: planetList.filter(p => p.barracks.item !== 'None').map(({barracks, coords}) => ({...barracks, coords})),
        building: planetList.filter(p => p.structure.item !== 'None').map(({structure, coords}) => ({...structure, coords})),
    };
}


/**
 * Very rudimentary textarea that outputs Discord-friendly stats.
 *
 * @param {window} env
 * @param {PlanetListStats} stats
 * @param {HeaderData} headerData
 * @return {HTMLTextAreaElement}
 */
export function renderPlanetListStats(env, stats, {turn}) {
    const discordOutputEl = env.document.createElement('textarea');
    discordOutputEl.style.width = '400px';
    discordOutputEl.style.height = '200px';
    discordOutputEl.value = [
        `Turn: ${turn}`,
        `:coords: Planets Owned: ${stats.planetsOwned}`,
        '',
        `:worker: ${numberFormat(stats.workers)} (${numberFormat(stats.avgWorkers)} / planet)`,
        `:soldier: ${numberFormat(stats.soldiers)} (${numberFormat(stats.avgSoldiers)} / planet)`,
        '',
        `:metal~1: ${outputResource(stats.metal)}`,
        `:mineral: ${outputResource(stats.mineral)}`,
        `:energy: ${outputResource(stats.energy)}`,
        '',
        `:army_barracks: Training:`,
        ...stats.training.reduce(groupUnitProduction, []).map(outputUnitProduction(turn)),
        '',
        `:ship_yard: Producing:`,
        ...stats.producing.reduce(groupUnitProduction, []).map(outputUnitProduction(turn)),
    ].join('\n');

    return discordOutputEl;
}

function outputResource({inStock, production, avgAbundance}) {
    return `${numberFormat(inStock)} (+${numberFormat(production)}) ${numberFormat(avgAbundance, 2)}%`;
}

function groupUnitProduction(r, { turns, item, quantity }) {
    const find = r.find(i => i.turns === turns && i.item === item);
    if (find) {
        find.quantity += quantity;
        return r;
    }
    return [...r, { turns, item, quantity }];
}

function outputUnitProduction(currentTurn) {
    return ({ quantity, item, turns }) => `+${numberFormat(quantity)}x ${item} done on turn ${currentTurn + turns} (in ${turns} turns)`;
}

// definitions

/**
 * @typedef PlanetListStats
 * @property {number} planetsOwned
 * @property {string[]} coords
 * @property {number} workers
 * @property {number} avgWorkers
 * @property {number} soldiers
 * @property {number} avgSoldiers
 * @property {number} groundRemaining
 * @property {number} orbitRemaining
 * @property {ResourceStats} metal
 * @property {ResourceStats} mineral
 * @property {ResourceStats} energy
 * @property {UnitProductionStats} training
 * @property {UnitProductionStats} building
 * @property {UnitProductionStats} producing
 * @property {FleetInOrbitAtCoords[]} fleets
 */

/**
 * @typedef ResourceStats
 * @property {number} inStock
 * @property {number} production
 * @property {number} avgAbundance
 */

/**
 * @typedef UnitProductionStats
 * @property {string} item
 * @property {number} turns
 * @property {number} quantity
 */

/**
 * @typedef {FleetInOrbit} FleetInOrbitAtCoords
 * @property {string} coords
 */
