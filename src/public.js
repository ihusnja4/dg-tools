import {resolveCurrentView, VIEW} from "./view";
import {CORE_VERSION} from "./config";
import {parseHeaderData} from "./parsers/header-data";
import {parsePlanetList} from "./parsers/planet-list";
import {getPlanetListStats, renderPlanetListStats} from "./tools/planet-list-stats";

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
            const planetList = parsePlanetList(env);
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
