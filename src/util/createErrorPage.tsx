import * as React from 'react';
import { renderToString } from 'react-dom/server'
export default function createErrorPage({
    env,
    ctx,
    error,
    stack,
    status = 500,
    code = 500
}){
    // some errors will have .status
    // however this is not a guarantee
    ctx.status = status || 500;
    ctx.type = 'html';
    // var ErrorPage = require(`${process.cwd()}/views/pages/${status}`).default;
    var ErrorPage = app.pages[status];
    if(ErrorPage){
        ctx.body = renderToString(<ErrorPage {...arguments[0]} />)
    }else{
        if(process.env.NODE_ENV == 'production'){
            ctx.body = error;
        }else{
            ctx.body = `
                <p>${error}</p>
                <p>${stack}</p>
            `;
        }
    }
}