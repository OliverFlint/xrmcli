"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importsolution = void 0;
const header_1 = require("./header");
const node_fetch_1 = __importDefault(require("node-fetch"));
const progress_1 = __importDefault(require("progress"));
const importsolution = async (authToken, url, options) => {
    const bar = new progress_1.default('Importing :bar :elapsed seconds', { total: 50 });
    let barReverse = false;
    const timer = setInterval(function () {
        bar.tick(barReverse ? -1 : 1);
        if (bar.curr === bar.total - 1 || bar.curr <= 1) {
            barReverse = !(bar.curr <= 1);
        }
    }, 500);
    try {
        const result = await node_fetch_1.default(`${url}/api/data/v9.2/ImportSolution`, {
            headers: header_1.initHeader(authToken.accessToken),
            method: 'POST',
            body: JSON.stringify(options),
        });
        if (result) {
            if (result.status >= 200 && result.status < 300) {
                console.log('\nSolution imported');
            }
            else {
                console.error(`\nError importing solution. ${result.statusText}`);
            }
        }
    }
    catch (e) {
        console.error(`\n${e.message || 'Error importing solution.'}`);
    }
    finally {
        clearInterval(timer);
    }
};
exports.importsolution = importsolution;
//# sourceMappingURL=importsolution.js.map