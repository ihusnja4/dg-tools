# dg-tools

# Prerequisites

1. Not too old Chrome/Chromium or FireFox browser
2. Installed [TamperMonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=hr) extension or if preffering FireFox then [GreaseMonkey](https://addons.mozilla.org/hr/firefox/addon/greasemonkey/) addon.
3. TamperMonkey/GreaseMonkey enabled via extension/addon console

# Installation

## Public DGTOOLS

1. Open TamperMonkey/GreaseMonkey dashboard
2. Create new script and paste in the code bellow and save it:
    ```javascript
    // ==UserScript==
    // @name         DG Tools for Beta - Public
    // @namespace    https://ihusnja4.github.io/dg-tools
    // @version      0.1
    // @description  DarkGalaxy tools to enhance game UI like: battle calculators, stats, color enhancers, etc...
    // @author       Ivan (aka Deda)
    // @match        https://beta.darkgalaxy.com/*
    // @require      https://ihusnja4.github.io/dg-tools/master/dist/public.js
    // @grant        none
    // ==/UserScript==

    (function() {
        'use strict';

         DGTOOLSv1.connect();
    })();
    ```
 
## Protected DGTOOLS

These tools use API to communicate with database, so anyone without a valid API key is autiomatically forbidden the access to this data. However, the data will still be collected so if your are not a WolfPack member or member of allies, please install the public one instead!

1. Open TamperMonkey/GreaseMonkey dashboard
2. Create new script and paste in the code bellow:
    ```javascript
    // ==UserScript==
    // @name         DG Tools for Beta - Members and allies only
    // @namespace    https://ihusnja4.github.io/dg-tools
    // @version      0.1
    // @description  Along all the DarkGalaxy tools to enhance game UI like: battle calculators, stats, color enhancers, etc... This also provides features like sharing radar, planet scans, and storing battle and invasion reports.
    // @author       Ivan (aka Deda)
    // @match        https://beta.darkgalaxy.com/*
    // @require      https://ihusnja4.github.io/dg-tools/master/dist/protected.js
    // @grant        none
    // ==/UserScript==

    (function() {
        'use strict';

         DGTOOLSv1.connect({
             API_KEY: '<<API key you have received, do not share this key>>'
         });
    })();
    ```
3. Replace the `<<API key you have received, do not share this key>>` with actual API key.
4. Save script
       
## Verification (optional)

To verify that script is installed, visit DarkGalaxy website and open browser's developer console, in the console type in:  
`DGTOOLSv1.status()`

It should output something like this: 
```
DGTOOLS (v 0.1) installed.
Viewing: Navigation 1.45
...
```

# Usage

TBD
