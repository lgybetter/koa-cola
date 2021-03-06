// Type definitions for koa-static 3.0
// Project: https://github.com/koajs/static
// Definitions by: Yu-Hsin Lu <https://github.com/kerol2r20/>
// Definitions: https://github.com/kerol2r20/DefinitelyTyped

/* =================== USAGE ===================
    import session = require("koa-session");
    var Koa = require('koa');
    var app = new Koa();
    app.use(session(app));
 =============================================== */

import * as Koa from "koa";

declare function session(CONFIG: {
    /**
     * cookie key (default is koa:sess)
     */
    key?: string,

    /**
     * maxAge in ms (default is 1 days)
     * 'session' will result in a cookie that expires when session/browser is closed
     * Warning: If a session cookie is stolen, this cookie will never expire
     */
    maxAge?: number|'session',

    /**
     * can overwrite or not (default true)
     */
    overwrite?: boolean,

    /**
     * httpOnly or not (default true)
     */
    httpOnly?: boolean,

    /**
     * signed or not (default true)
     */
    signed?: boolean,

    /**
     * You can store the session content in external stores(redis, mongodb or other DBs)
     */
    store?: session.stores,

    /**
     * Hook: valid session value before use it
     */
    valid(...rest: any[]): void,

    /**
     * Hook: before save session
     */
    beforeSave(...rest: any[]): void,
}, app: Koa): Koa.Middleware;

declare function session(app: Koa): Koa.Middleware;

declare module 'koa' {
    interface Context {
        session: session.sessionProps;
    }
}

declare namespace session {
    interface sessionProps {
        isNew: boolean;
        maxAge: number;
        save(): void;
        [propName: string]: any;
    }

    interface stores {
        /**
        * get session object by key
        */
        get(key: any): any;

        /**
        * set session object for key, with a maxAge (in ms)
        */
        set(key: any, sess: any, maxAge?: number): any;

        /**
        * destroy session for key
        */
        destroy(key: any): void;
    }
}

export = session;