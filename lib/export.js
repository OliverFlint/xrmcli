"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportsolution = void 0;
const header_1 = require("./header");
const node_fetch_1 = __importDefault(require("node-fetch"));
const fs_1 = require("fs");
const progress_1 = __importDefault(require("progress"));
const exportsolution = async (authToken, url, options, output) => {
    const bar = new progress_1.default('Exporting :bar :elapsed seconds', { total: 50 });
    let barReverse = false;
    const timer = setInterval(function () {
        bar.tick(barReverse ? -1 : 1);
        if (bar.curr === bar.total - 1 || bar.curr <= 1) {
            barReverse = !(bar.curr <= 1);
        }
    }, 100);
    try {
        const result = await node_fetch_1.default(`${url}/api/data/v9.2/ExportSolution`, {
            headers: header_1.initHeader(authToken.accessToken),
            method: 'POST',
            body: JSON.stringify(options),
        });
        if (result) {
            const json = await result.json();
            if (json.error) {
                console.error(`\n${json.error.message}`);
            }
            else {
                fs_1.mkdirSync(output.replace(/(?:.(?!\/|\\))+.zip/, ''), {
                    recursive: true,
                });
                fs_1.writeFileSync(output, json.ExportSolutionFile, { encoding: 'base64' });
                console.log('\nSolution exported');
            }
        }
    }
    catch (e) {
        console.error(`\n${e.message || 'Error exporting solution.'}`);
    }
    finally {
        clearInterval(timer);
    }
};
exports.exportsolution = exportsolution;
//# sourceMappingURL=export.js.map