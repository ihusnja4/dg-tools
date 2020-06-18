/**
 * @param {window} env
 * @returns [VIEW, ViewParams]
 */
export function resolveCurrentView(env) {
    if (env.location.pathname.match(/\/planets\/?$/)) {
        return [VIEW.PLANET_LIST, {}];
    }
    return [VIEW.UNMATCHED, {}];
}

/**
 * @enum VIEW
 */
export const VIEW = {
    UNMATCHED: 'No view matched',
    PLANET: 'Planet',
    PLANET_LIST: 'Planet list'
};

/**
 * @typedef {{}} ViewParams
 * @property *
 */
