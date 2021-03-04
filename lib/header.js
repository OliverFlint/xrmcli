"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initHeader = void 0;
const initHeader = (accessToken) => ({
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/json',
    'Content-Type': 'application/json; charset=utf-8',
    'OData-MaxVersion': '4.0',
    'OData-Version': '4.0',
});
exports.initHeader = initHeader;
//# sourceMappingURL=header.js.map