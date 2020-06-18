import processPlanetListStats from "./tools/planet-list-stats";
import {CORE_VERSION} from "./config";
import {resolveCurrentView, VIEW} from "./view";

/**
 * @description gTools for DarkGalaxy ame @link <https://www.darkgalaxy.com/> tools
 * intended only for WolfPack members and allies.
 * This script also includes all public tools, so its not advisable to use them both together.
 *
 * @author Ivan (aka Deda)
 * @version 1.0
 */
(function(env) {
    const VERSION = '1.0';
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
        console.log(`Flavor: Protected script v${VERSION}`);
        console.log(`Viewing: ${view}`);
    }
    
})(window);
