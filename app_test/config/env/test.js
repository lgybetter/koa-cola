module.exports = {
	env : 'test',
	port : 3000,
	session : {
		maxAge: 86400000,
		overwrite: true, /** (boolean) can overwrite or not (default true) */
		httpOnly: true, /** (boolean) httpOnly or not (default true) */
		signed: true, /** (boolean) signed or not (default true) */
	},
	middlewares : function(middlewares){
		delete middlewares.middlewareWillDisable;
		return middlewares;
	}
};