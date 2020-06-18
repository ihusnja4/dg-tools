import processPlanetListStats from "./tools/planet-list-stats";
import {resolveCurrentView, VIEW} from "./view";
import {CORE_VERSION} from "./config";

/**
 * @description Public tools for DarkGalaxy game @link <https://www.darkgalaxy.com/>
 *
 * @author Ivan (aka Deda)
 * @version 1.0
 */

(function(env) {
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
            processPlanetListStats(env);
        }
        status();
    }

    // endregion

    function status() {
        console.log(`DGTOOLS v${CORE_VERSION} installed.`);
        console.log(`Flavor: Public script`); // public script is tied to core version
        console.log(`Viewing: ${view}`);
    }

})(window);
