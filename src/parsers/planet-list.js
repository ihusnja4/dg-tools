import {numberUnFormat} from "../utils/index";

/**
 * Parses planet list and collects information about resources: production, abundance, stock, workers, soldiers, structures, ships...
 *
 * @param {window} env
 * @return {PlanetInfo[]}
 */
export function parsePlanetList(env) {
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
                quantity: numberUnFormat(quantity),
                turns: numberUnFormat(turns),
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
