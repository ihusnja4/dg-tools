/**
 * Parses DOM nodes in header to collect Ruler name, alliance, turn...
 *
 * @param {window} env
 * @return {HeaderData}
 */
export function parseHeaderData(env) {
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
