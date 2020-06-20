import {CORE_VERSION} from "./config";
import {resolveCurrentView, VIEW} from "./view";
import {parseHeaderData} from "./parsers/header-data";
import {parsePlanetList} from "./parsers/planet-list";
import {renderPlanetListStats, getPlanetListStats} from "./tools/planet-list-stats";

/**
 * @description Tools for DarkGalaxy game @link <https://www.darkgalaxy.com/>
 * These tools are intended only for WolfPack members and allies.
 * This script also includes all public tools, so its not advisable to use them both together.
 *
 * @author Ivan (aka Deda)
 * @version 1.0.0
 */
(function(env) {
    const VERSION = '1.0.0';
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
        // todo authorize by API key

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
        console.log(`Flavor: Protected script v${VERSION}`);
        console.log(`Viewing: ${view}`);
    }
    
})(window);
