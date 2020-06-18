(function () {
    'use strict';

    /**
     * @param {window} env
     * @returns [VIEW, ViewParams]
     */
    function resolveCurrentView(env) {
        if (env.location.pathname.match(/\/planets\/?$/)) {
            return [VIEW.PLANET_LIST, {}];
        }
        return [VIEW.UNMATCHED, {}];
    }

    /**
     * @enum VIEW
     */
    const VIEW = {
        UNMATCHED: 'No view matched',
        PLANET: 'Planet',
        PLANET_LIST: 'Planet list'
    };

    /**
     * @typedef {{}} ViewParams
     * @property *
     */

    /**
     * Version of core tools (used both in public and protected scripts)
     *
     * @type {string}
     */
    const CORE_VERSION = '1.0.0';

    /**
     * Parses DOM nodes in header to collect Ruler name, alliance, turn...
     *
     * @param {window} env
     * @return {HeaderData}
     */
    function parseHeaderData(env) {
        const [alliance = null, name] = env.document.querySelector('#header .header').innerText.trim().match(/Welcome\s(\[[^\]]+\])?(.+)/).slice(1, 3);
        const turn = parseInt(document.querySelector('#turnNumber').innerText.trim(), 10);

        return {name, alliance, turn};
    }

    /**
     * @typedef HeaderData
     * @property {string} name
     * @property {string|null} alliance
     * @property {number} turn
     */

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

    function numberUnFormat(val) {
        return parseFloat(val.replace(/[^\.\d]+/g, ''));
    }

    /**
     * Parses planet list and collects information about resources: production, abundance, stock, workers, soldiers, structures, ships...
     *
     * @param {window} env
     * @return {PlanetInfo[]}
     */
    function parsePlanetList(env) {
        return Array.from(document.querySelectorAll('.locationWrapper')).map(processLocation);
    }

    /**
     * @param {element} el
     * @return {PlanetInfo}
     */
    function processLocation(el) {
        return {
            el: el,
            coords: extractText(el,'.coords'),
            name: extractText(el,'.planetName'),
            planetLink: extractHref(el,'.planetName a'),
            newsLink: extractHref(el,'.planetHeadSection a[href^="/news"]'),
            orbitRemaining: numberUnFormat(extractText(el,'.orbit')),
            groundRemaining: numberUnFormat(extractText(el,'.ground')),
            soldiers: numberUnFormat(extractText(el,'.soldier')),
            workersIdle: numberUnFormat(extractText(el,'.population span')),
            workersBusy: numberUnFormat(extractText(el,'.population .neutral')),
            ...extractResource(el, 'metal'),
            ...extractResource(el, 'mineral'),
            ...extractResource(el, 'energy'),
            structure: extractBuild(el, 'Building'),
            shipYard: extractBuild(el, 'Ship Yard'),
            barracks: extractBuild(el, 'Barracks'),
            radarLink: extractRadarLink(el),
            fleets: extractFleets(el)
        };
    }

    // TODO move to utils
    function extractText(el, selector) {
        const found = el.querySelector(selector);
        return found ? found.innerText.trim() : '';
    }

    // TODO move to utils
    function extractHref(el, selector) {
        const found = el.querySelector(selector);
        return found ? found.getAttribute('href') : null;
    }

    function extractBuild(el, matcher) {
        return Array.from(el.querySelectorAll('.resource'))
            .filter(e => new RegExp(`^${matcher}$`).test(extractText(e,'a')))
            .reduce((r, e) => {
                const [, quantity = '1', item = 'None', turns = '0'] = e.innerText.match(/(?:[^\:]+)\:\s*([\d,]+x )?([^\(]+)\s(?:\((\d+) turns?\))?/) || [];
                return {
                    item: item.trim(),
                    quantity: numberUnFormat(quantity),
                    turns: numberUnFormat(turns),
                    link: extractHref(e,'a')
                };
            }, { item: 'None', turns: 0, link: null, quantity: 0 });
    }

    function extractRadarLink(el) {
        const [e] = Array.from(el.querySelectorAll('.resource'))
            .filter(e => new RegExp(`^Communications$`, 'i').test(extractText(e,'a')));
        return e ? extractHref(e, 'a') : null;
    }

    function extractResource(el, key) {
        const [inStock, production, abundance] = extractText(el, `.${key}`).split(' ').map(numberUnFormat);
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
                hostile: e.classList.contains('hostile') // TODO not sure if its hostile or enemy
            }));
    }

    // Definitions

    /**
     * @typedef PlanetInfo
     * @property {Element} el
     * @property {string} name
     * @property {string} coords
     * @property {string} planetLink
     * @property {string} newsLink
     * @property {number} orbitRemaining
     * @property {number} groundRemaining
     * @property {number} soldiers
     * @property {number} workersIdle
     * @property {number} workersBusy
     * @property {number} metalInStock
     * @property {number} metalProduction
     * @property {number} metalAbundance
     * @property {number} mineralInStock
     * @property {number} mineralProduction
     * @property {number} mineralAbundance
     * @property {number} energyInStock
     * @property {number} energyProduction
     * @property {number} energyAbundance
     * @property {PlanetProduction} structure
     * @property {PlanetProduction} shipYard
     * @property {PlanetProduction} barracks
     * @property {string|null} radarLink
     * @property {FleetInOrbit[]} fleets
     */

    /**
     * @typedef PlanetProduction
     * @property {string} item
     * @property {number} turns
     * @property {string} link
     * @property {number} quantity
     */

    /**
     * @typedef FleetInOrbit
     * @property {string} name
     * @property {string} link
     * @property {boolean} friendly
     * @property {boolean} hostile
     */

    /**
     * Convert planet list data into stats.
     *
     * @param {PlanetInfo[]} planetList
     * @return {PlanetListStats}
     */
    function getPlanetListStats(planetList) {
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
    function renderPlanetListStats(env, stats, {turn}) {
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

    /**
     * @description Public tools for DarkGalaxy game @link <https://www.darkgalaxy.com/>
     *
     * @author Ivan (aka Deda)
     * @version 1.0
     */

    (function(env) {
        const headerData = parseHeaderData(env);
        const [view, params] = resolveCurrentView(env);

        /**
         * @namespace DGTOOLSv1
         */
        env.DGTOOLSv1 = {
            connect: connect,
            status: status
        };

        // region View scripts

        /**
         * @param options
         */
        function connect(options = {}) {
            if (view === VIEW.PLANET_LIST) {
                // TODO this would be inserted into a dedicated toolbar for DG tools
                const planetList = parsePlanetList();
                const planetStats = getPlanetListStats(planetList); // TODO per galaxy
                const discordOutputEl = renderPlanetListStats(env, planetStats, headerData);
                const outletEl = env.document.createElement('div');
                outletEl.classList.add('planet-list-stats-outlet');
                outletEl.append(discordOutputEl);
                env.document.body.append(outletEl);
            }
        }

        // endregion

        function status() {
            console.log(`DGTOOLS v${CORE_VERSION} installed.`);
            console.log(`Flavor: Public script`); // public script is tied to core version
            console.log(`Viewing: ${view}`);
        }

    })(window);

}());
