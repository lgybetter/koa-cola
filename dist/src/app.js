"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 启动文件
 */
const index_1 = require("./index");
var server;
function run(colaApp) {
    if (server) {
        server.close();
    }
    server = index_1.default(colaApp);
    return server;
}
exports.run = run;
