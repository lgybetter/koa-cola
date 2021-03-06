
# koa-cola
[![Build Status](https://travis-ci.org/hcnode/koa-cola.svg?branch=develop)](https://travis-ci.org/hcnode/koa-cola)

[koa-cola](https://github.com/hcnode/koa-cola)是一个基于koa和react的SSR(server side render)web前后端全栈应用框架，使用typescript开发，使用d-mvc（es7 decorator风格的mvc）开发模式。另外koa-cola大量使用universal ("isomorphic") 开发模式，比如react技术栈完全前后端universal（server端和client端均可以使用同一套component、react-redux、react-router）。

1. [特点](#特点)
2. [如何使用](#如何使用)
3. [对比next.js](#对比nextjs)
4. [todolist例子](#examples)
5. [开发文档](#开发文档)
    * [d-mvc](#d-mvc)
        * [Controller](#controller)
        * [View](#view)
        * [Model](#model)
    * [配置](#配置)
        * [app初始化](#app初始化)
        * [koa中间件](#koa中间件)
        * [其他配置](#其他配置)
    * [Cli](#Cli)
        * [创建koa-cola项目](#创建koa-cola项目)
        * [启动应用](#启动应用)
        * [生成model schema文件](#生成model-schema文件)
    * [代码编译](#代码编译)
        * [client](#client)
        * [server](#server)
    * [inject global](#inject-global)
    * [api开发模式](#api开发模式)
    * [universal ("isomorphic")](#universal-isomorphic)
        * [前后端router](#前后端router)
        * [前后端redux](#前后端redux)
        * [react组件的前后端复用](#react组件的前后端复用)
        * [http api和请求fetch](#http-api和请求fetch)
            
    * [cluster模式](#cluster模式)
    * [调试](#调试)
    * [Tips](#tips)
        * [tips 1: 初始化react组件数据](#tips-1-初始化react组件数据)
        * [tips 2: redux-connect组件的redux坑](#tips-2-redux-connect组件的redux坑)

## 特点
koa-cola的开发风格受[sails](http://sailsjs.com/)影响，之前使用过sails开发过大型的web应用，深受其[约定优先配置](https://en.wikipedia.org/wiki/Convention_over_configuration)的开发模式影响。
* 使用koa作为web服务（使用node8可以使用最新的v8高性能原生使用async/await）
* 使用typescript开发
* 使用完整的react技术栈(包括react-router和react-redux)
* react相关代码前后端复用(包括component渲染、react-router和react-redux)
* SSR(server side render)的完整方案，只需要一份react代码便可以实现：服务器端渲染＋浏览器端bundle实现的交互


## 如何使用

koa-cola支持node.js的版本包括7.6和8，建议使用8，因为8.0使用的最新的v8版本，而且8.0会在[今年10月正式激活LTS](https://github.com/nodejs/LTS)，因为koa-cola的async/await是原生方式使用没有经过transform成es6，所以不支持node7.6以下的node版本。

开发者可以通过两种开发模式进行koa-cola项目开发

1. 基于模版的文件结构方式创建koa-cola项目，通过这种方式创建出完整的项目工程，适合大型的web项目开发。
    * `npm i koa-cola ts-node -g`
    * `koa-cola -n app` 在当前文件夹创建名字为app的新koa-cola项目，创建完整的目录结构，并自动安装依赖
    * `cd app`
    * `koa-cola -c` 执行webpack build bundle，并启动项目
    * 访问[http://localhost:3000](http://localhost:3000)
    (在开发环境，可以使用`npm run watch`和`npm run local`进行开发)

2. 使用api方式创建项目，通过这种方式，可以几分钟内部署好koa-cola项目，适合简单的项目开发。
    * `npm i koa-cola ts-node -g`
    * `koa-cola -n app -m api` 在目录里面创建api.tsx,package.json,tsconfig.json, 并自动安装依赖和启动项目
    * 访问[http://localhost:3000](http://localhost:3000)
    (在开发环境，可以使用`npm run local`进行开发)

api模式只需要一个app.tsx即可启动一个koa-cola web服务：

```javascript
import * as React from 'react'
var {RunApp} = require('koa-cola')
var { Controller, Get, Use, Param, Body, Delete, Put, Post, QueryParam, View, Ctx, Response } = require('koa-cola').Decorators.controller;
@Controller('') 
class FooController {
    @Get('/')
    index(@Ctx() ctx) {
        return '<h1>hello koa-cola !</h1>'
    }

    @Get('/view')
    @View('some_view')
    async view( @Ctx() ctx ) { 
        return await Promise.resolve({
            foo : 'bar'
        });
    } 
}
RunApp({
    controllers: {
        FooController: FooController
    },
    pages: {
        some_view : function({ctrl : {foo}}){
            return <div>{foo}</div>
        }
    }
});

```

## 对比next.js

[next.js](https://github.com/zeit/next.js)是一个比较流行的也是基于react的SSR的应用框架，不过在react技术栈，next.js支持component和react-router，并没有集成redux，在服务器端，也没有太多支持，比如controller层和express/koa中间件，服务器端只是支持简单的路由、静态页面等，koa-cola则是提供前后端完整的解决方案的框架。

在数据初始化，两者有点类似，next.js使用静态方法getInitialProps来初始化数据：
```javascript
import React from 'react'
export default class extends React.Component {
  static async getInitialProps ({ req }) {
    return req
      ? { userAgent: req.headers['user-agent'] }
      : { userAgent: navigator.userAgent }
  }
  render () {
    return <div>
      Hello World {this.props.userAgent}
    </div>
  }
}
```

koa-cola提供[两种方式](#tips-1-初始化react组件数据)来进行数据初始化，更加灵活。

而且，next.js不支持子组件的数据初始化：

> Note: getInitialProps can not be used in children components. Only in pages.

koa-cola则只需要加上decorator "include", 完全支持所有的子组件的数据初始化。

```javascript
import * as React from 'react';

var {
  asyncConnect,
  include
} = require('../../../dist').Decorators.view;
// Child1, Child2 是asyncConnect的组件，并且会进行数据初始化
var Child1 = require('../components/child1').default;
var Child2 = require('../components/child2').default;

export interface Props {}
export interface States {}

@asyncConnect([])
@include({
  Child1,
  Child2
})
class MultiChildren extends React.Component<Props, States> {
  constructor(props: Props) {
    super(props);
  }
  render() {
    return <div>
        <Child1 {...this.props} />
        <Child2 {...this.props} />
      </div>
  }
}

export default MultiChildren;

```

koa-cola不但可以支持component的数据初始化，还可以合并page和component的reducer，使用同一个store，page和component的redux无缝结合。详细可参考[多子组件的redux页面例子源码](https://github.com/hcnode/koa-cola/blob/master/app_test/views/pages/multiChildren.tsx)和[在线Demo](http://koa-cola.com:3001/multiChildren)


## Examples
使用[官方react-redux的todolist](http://redux.js.org/docs/basics/UsageWithReact.html)作为基础，演示了官方的和基于koa-cola的例子（完整的mvc结构）

**demo依赖本地的mongodb**

[online demo](http://koa-cola.com:3000/)

使用方法：
* `npm i koa-cola ts-node -g`
* `git clone https://github.com/koa-cola/todolist`
* `cd todolist`
* `npm i`
* `webpack`
* `koa-cola`
* 访问[http://localhost:3000](http://localhost:3000)，选择官方demo或者是koa-cola风格的demo

## 开发文档

## d-mvc
koa-cola可以使用es7的decorator装饰器开发模式来写mvc，controller是必须用提供的decorator来开发（因为涉及到router相关的定义），model和view层则没有强制需要demo所演示的decorator来开发。
### Controller
    
使用decorator装饰器来注入相关依赖，路由层的decorators包括router、中间件、response、view，响应阶段的decorators包括koa.Context、param、response、request等，比如以下例子：
```javascript
var { Controller, Get, Use, Param, Body, Delete, Put, Post, QueryParam, View, Ctx, Response } = require('koa-cola').Decorators.controller;
@Controller('') 
class FooController {
    @Get('/some_api')  // 定义router以及method
    @Response(Ok)       // 定义数据返回的结构
    some_api (@Ctx() ctx, @QueryParam() param : any) { // 注入ctx和param
        // 初始化数据，数据将会以“Ok”定义的格式返回
        return {
            foo : 'bar'
        }
    }

    @Get('/some_page')  // 定义router以及method
    @View('some_page')
    some_page (@Ctx() ctx, @QueryParam() param : any) { // 注入ctx和param
        // 初始化数据，数据将会注入到react组件的props，如：this.props.ctrl.foo
        return {
            foo : 'bar'
        }
    }
}
```    

    因为使用decorator定义router，所以在koa-cola里面不需要单独定义router。

### View

view层可以是简单的React.Component或者是stateless的函数组件，也可以是使用官方的react-redux封装过的组件，todolist demo的view则是使用了[redux-connect](https://github.com/makeomatic/redux-connect) 提供的decorator(当然你也可以直接用它的connect方法)，redux-connect也是基于react-redux，以下是view层支持的react组件类型。
    
1. React.Component组件

```javascript
    class Index extends React.Component<Props, States>   {
        constructor(props: Props) {
            super(props);
        }
        static defaultProps = {
            
        };
        render() {
            return <h1>Wow koa-cola!</h1>
        }
    };
    export default Index
```

2. stateless组件

```javascript
    export default function({some_props}) {
        return <h1>Wow koa-cola!</h1>
    }
```

3. react-redux组件

```javascript
    import { connect } from 'react-redux'
    var Index = function({some_props}) {
        return <h1>Wow koa-cola!</h1>
    }
    export default connect(
        mapStateToProps,
        mapDispatchToProps
    )(Index)
```

4. redux-connect的decorator
使用这种方式的话，需要注意两点：
    * redux的reducer需要使用装饰器colaReducer
    * 如果有子组件也是使用redux-connect封装，则需要使用装饰器include
    * 以上两点可以参考todolist的[代码](https://github.com/koa-cola/todolist/blob/master/views/pages/colastyleDemo.tsx)

```javascript
import AddTodo from '../official-demo/containers/AddTodo';
import FilterLink from '../official-demo/containers/FilterLink';
import VisibleTodoList from '../official-demo/containers/VisibleTodoList';
var {
  asyncConnect,
  colaReducer,
  include
} = require('koa-cola').Decorators.view;
@asyncConnect([
  {
    key: 'todosData',
    promise: async ({ params, helpers, store: { dispatch } }) => {
      var api = new GetTodoList({});
      var data = await api.fetch(helpers.ctx);
      dispatch({
        type: 'INIT_TODO',
        data: data.result.result
      });
      return data.result.result;
    }
  }
])
@colaReducer({
  todos,
  visibilityFilter
})
@include({ AddTodo, FilterLink, VisibleTodoList })
class ColastyleDemo extends React.Component<Props, States> {
  constructor(props: Props) {
    super(props);
  }
  render() {
    return <App />;
  }
}
export default ColastyleDemo;
```

5. 自定义header和bundle方式

koa-cola渲染页面时，默认会找views/pages/layout.ts封装页面的html，如果没有这个layout文件，则直接输出page组件的html，如果view组件使用了doNotUseLayout decorator，则页面不会使用layout.ts输出，这时你可以自定义header和bundle的decorator。

```javascript
import * as React from 'react';
var {
  header, bundle, doNotUseLayout
} = require('../../../dist').Decorators.view;
@doNotUseLayout
@bundle([
  "/bundle.js",
  "/test.js"
])
@header(() => {
  return <head>
    <meta name="viewport" content="width=device-width" />
  </head>
})
function Page (){
  return <h1>koa-cola</h1>
};
export default Page
```

### Model
和必须使用decorator的controller层、必须使用react组件的view层不一样，model层是完全没有耦合，你可以使用任何你喜欢的orm或者odm，或者不需要model层也可以，不过使用koa-cola风格的来写model，你可以体验不一样的开发模式。

1. 你可以直接在目录api/models下创建如user.ts：
```javascript
import * as mongoose from 'mongoose'
export default mongoose.model('user', new mongoose.Schema({
    name : String,
    email : String
}))
```

然后就可以在其他代码里面使用：
```javascript
var user = await app.models.user.find({name : 'harry'})
```

2. 使用koa-cola的风格写model

首先在`api/schemas`目录创建user.ts

```javascript
export const userSchema = function(mongoose){
    return {
        name: {
            type : String
        },
        email : {
            type : String
        }
    }
}
```

在目录`api/models`下创建model如user.ts：
```javascript
import * as mongoose from 'mongoose'
import userSchema from '../schemas/user'
export default mongoose.model('user', new mongoose.Schema(userSchema(mongoose)))
```

当然也可以使用decorator方式定义model，还可以定义相关hook，详情可以参考[mongoose-decorators](https://github.com/aksyonov/mongoose-decorators)

```javascript
import { todoListSchema } from '../schemas/todoList';
var { model } = app.decorators.model;

@model(todoListSchema(app.mongoose))
export default class TodoList {}
```

使用cli生成model的schema

`koa-cola --schema` 自动生成model的接口定义在`typings/schema.ts`

然后你可以在代码通过使用typescript的类型定义，享受vscode的intellisense带来的乐趣
```javascript
import {userSchema} from './typings/schema' 
var user : userSchema = await app.models.user.find({name : 'harry'})
```

在前面提到的为什么需要在api/schemas定义model的schema，除了上面可以自动生成schema的接口，这部分可以在浏览器端代码复用，比如数据Validate。详细可以查看[文档](http://mongoosejs.com/docs/browser.html)

3. koa-cola提供了前后端universal的api接口定义，比如todolist demo的获取数据的接口定义

```javascript
import { todoListSchema } from './typings/schema';
import { ApiBase, apiFetch } from 'koa-cola';

export class GetTodoList extends ApiBase<
  {
      // 参数类型
  },
  {
    code: number;
    result: [todoListSchema];
  },
  {
      // 异常定义
  }
> {
  constructor(body) {
    super(body);
  }
  url: string = '/api/getTodoList';
  method: string = 'get';
}
```

在代码里面使用api，并享受ts带来的乐趣：
```javascript
var api = new GetTodoList({});
var data = await api.fetch(helpers.ctx);
```

<img src="https://github.com/hcnode/koa-cola/raw/master/screenshots/api1.png" alt="Drawing" width="600"/>
<img src="https://github.com/hcnode/koa-cola/raw/master/screenshots/api2.png" alt="Drawing" width="600"/>

又比如参数body的定义，如果定义了必传参数，调用时候没有传，则vscode会提示错误
```javascript
import { testSchema } from './typings/schema';
import { ApiBase, apiFetch } from 'koa-cola'
export interface ComposeBody{
    foo : string,
    bar? : number
}
export class Compose extends ApiBase<ComposeBody, testSchema, {}>{
    constructor(body : ComposeBody){
        super(body)
    }
    url : string = '/compose'
    method : string = 'post'
}
```
<img src="https://github.com/hcnode/koa-cola/raw/master/screenshots/api3.png" alt="Drawing" width="600"/>


## 配置
通过约定config目录下所有文件都会成为config的属性，运行时会被env环境下的配置覆盖，所有配置会暴露在app.config。

	> config
	    > env
            local.js
            test.js
            development.js
        development.js
        production.js
        any_config_you_need.js 
        ...

比如配置any_config_you_need.js 

    exports.module = {
        foo : 'bar'
    }


如果当前是development环境，并且config/env/development.js:

    exports.module = {
        foo : 'wow'
    }

那么`app.config.foo == 'wow'`

### app初始化
在config目录下面的bootstrap.js可以定义初始化调用，在app启动时调用，如：

```javascript
module.exports = function(koaApp){
	koaApp.proxy = true;
	app.mongoose.Promise = global.Promise;
	if(process.env.NODE_ENV != 'test'){
		app.mongoose.connect(app.config.mongodb); 
	}
};
```
### koa中间件
koa-cola默认会使用以下几个中间件，并按照这个顺序：
1. koa-response-time
2. koa-favicon
3. koa-etag
4. koa-morgan
5. koa-compress
6. koa-static

参数详情可以查看[这里](https://github.com/hcnode/koa-cola/blob/master/src/middlewares/defaultMiddlewares.ts)

如果开发者希望修改默认的中间件，或者添加自定义的中间件，又或者希望重新排序，可以通过config.middlewares来修改默认：

```javascript
module.exports = {
    // 添加自定义中间件，或者禁用默认中间件
    // 自定义中间件在api/middlewares下提供
	middlewares : {
		checkMiddlewareOrder : true,
		requestTime : true,
		disabledMiddleware : false,
		sessionTest : true,
		middlewareWillDisable : true
	},
    // 重新排序
	sort : function(middlewares){
		return middlewares;
	}
};
```

### 其他配置
默认的配置包括端口默认是3000，session默认是使用内存模式，如果需要修改可以在config下或者对应的config/env下修改

## Cli
koa-cola提供了一些有用的cli命令，包括新建项目、启动项目、生成model schema文件

### 创建koa-cola项目

`koa-cola --new app` 或者 `koa-cola --n app` 在当前目录创建文件夹名字为app的模版项目，并自动安装依赖，和自动build bundle和启动应用。

### 启动应用

`koa-cola` 在项目目录里面执行，启动项目，node端启动app项目，但是不会build bundle

`koa-cola --cheer` 或者 `koa-cola -c` 先build bundle，再launch app

**windows环境使用koa-cola命令启动可能有问题，可以尝试以下方式启动**

* 先安装全局的ts-node `npm i ts-node -g`
* 使用ts-node运行 `ts-node ./app.ts`

### 生成model schema文件

`koa-cola --schema` 或者 `koa-cola --s` 生成`api/schenmas`下面的model schema定义，保存在`typings/schema.ts`

## 代码编译

### client
前端的bundle build使用webpack来构建，使用cli命令创建项目，会自动生成[webpack配置](https://github.com/hcnode/koa-cola/blob/master/template/webpack.config.js)
ts文件的loader使用了[awesome-typescript-loader](https://github.com/s-panferov/awesome-typescript-loader)，并配置了使用babel，加入babel-polyfill到bundle，可以兼容ie9+。

webpack的入口tsx文件在项目里面的`view/app.tsx`:
```javascript
import * as React from 'react';
import { render } from 'react-dom';
import IndexController from '../api/controllers/IndexController';
import index from './pages/index';
import officialDemo from './pages/officialDemo';
import colastyleDemo from './pages/colastyleDemo';

var { createProvider } = require('koa-cola');
// 使用koa-cola提供的createProvider会自动建立路由，如果手动使用官方的Provider，则需要开发者手动写router
var Provider = createProvider([IndexController], {
  index,
  officialDemo,
  colastyleDemo
});

render(<Provider />, document.getElementById('app'));
```

wepack build 新建默认的项目得到的bundle的大小有400K，依赖的库组成如下图：
<img src="https://github.com/hcnode/koa-cola/raw/master/screenshots/bundle.png" alt="Drawing" width="800"/>

webpack的配置文件默认加了四个IgnorePlugin插件，因为有些文件是前后端都会使用，所以需要忽略服务器端的require。

```javascript
// 以下两个是给服务器端使用，不能打包到webpack
new webpack.IgnorePlugin(/\.\/src\/app/),
new webpack.IgnorePlugin(/\.\/src\/util\/injectGlobal/),
// 以下两个是controller引用的，也是服务器端使用，也不能打包到webpack，如果你的controller也有服务器端使用的库，也必须要加IgnorePlugin插件
new webpack.IgnorePlugin(/koa$/),
new webpack.IgnorePlugin(/koa-body$/),
```


### server
koa-cola本身框架只编译了部分代码，比如es6的module import和export，ts类型相关的语法，对es6或者es7（比如async/await）没有进行编译，尽量用到node.js原生的es高级语法（所以会不支持低版本的node），如果你想希望你的应用在低版本node下使用，则需要你手动build出你所希望的代码，并包括所依赖的koa-cola库。

如果在node.js 8.0的环境下运行，则可以不需要任何编译，可以直接使用ts-node运行（cli运行命令都是使用ts-node），甚至可以直接[线上使用](https://github.com/TypeStrong/ts-node/issues/104)

## inject global
全局依赖注入，有时候在其他非应用运行时引用koa-cola里面的文件时，会因为文件依赖`app.xxx`而出错，使用inject global方式，可以实现第三方非koa-cola的require。
```javascript
import { reqInject } from 'koa-cola'
var user;
reqInject(function(){
    user = require('./api/models/user').default // 直接require项目内的文件
    var config = app.config; // 或者app当前配置
});
```

## api开发模式

前面提到过api的[开发模式](#getting-started)，可以简单快速开发koa-cola应用，开发者可以通过约定api接口，配置controller和view模块，并且也可以使用大部分的koa-cola功能。

api开发模式的缺点就是暂时不能build webpack bundle，所以api开发模式适合ssr静态页面渲染，或者是简单的交互的页面的渲染（交互js无法耦合react组件）

## universal ("isomorphic")

### 前后端router

通过controller生成server端的react-router，并且也生成client端的react-reduxt的Provider(里面还是封装了react-router)

```javascript
@Controller('') 
class FooController {
    @Get('/')
    @View('index')
    index(@Ctx() ctx) {
        return '<h1>hello koa-cola !</h1>'
    }
}
```
自动生成的server端的react-router:

```html
<Router ... >
    <Route path="/" component={IndexComponent} />
</Router>
```

通过react-router的match到对应的route后，再通过Provider，最终渲染出html：
```html
<Provider store={store} key="provider">
    <SomeReduxComponent />
</Provider>
```


client端Provider则是:
```html
<Provider store={store} key="provider">
    <Router ... >
        <Route path="/" component={IndexComponent} />
    </Router>
</Provider>
```

### 前后端redux

koa-cola集成了react-redux方案

server端redux:

#### controller返回props+普通react组件

react组件最终会转换成react-redux组件，在生命周期的render之前，你可以使用redux比如dispatch。

```javascript
@Get('/view')
@View('some_view')
async view( @Ctx() ctx ) { // controller返回数据传递到react组件的props.ctrl
    return await Promise.resolve({
        foo : 'bar'
    });
} 
```

react组件：

```javascript
function({ctrl : {foo}}){
    return <div>{foo}</div>
}
```

或者

```javascript
class Page extends React.Component<Props, States>   {
    constructor(props: Props) {
        super(props);
    }
    render() {
        return <div>{this.props.ctrl.foo}</div>
    }
};
```
#### 使用react-redux组件，但是无法获得controller返回的props

```javascript
import { connect } from 'react-redux'
var Index = function({some_props}) {
    return <h1>Wow koa-cola!</h1>
}
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Index)
```

或者是经过redux-connect封装的react-redux:

```javascript
var {
    asyncConnect,
} = require('koa-cola').Decorators.view;

@asyncConnect(
[{
    key: 'foo',
    promise: async ({ params, helpers}) => {
        return await Promise.resolve('this will go to this.props.some_props')
    }
}],
mapStateToProps,
mapDispatchToProps
)
class Index extends React.Component<Props, States>   {
    constructor(props: Props) {
        super(props);
    }
    render() {
        return <h1>{this.props.foo}</h1>
    }
};
export default Index
```

client端的redux

在client可以使用上面所有形式的react组件的redux数据流开发模式，并且没有server端只能在render前使用的限制，可以在组件的生命周期任何时候使用。

但是client端的redux store会依赖server端，如果server端的store已经经过一系列的数据流操作，那么将会在render阶段之前的数据保存起来，作为client端react-redux的初始化数据（详细查看[redux的createStore](http://redux.js.org/docs/api/createStore.html)），那么这样就可以完美地redux数据流从server端无缝衔接到client端。

### react组件的前后端复用

从前面react-router和react-redux可以看到react组件是可以完全前后端复用，在前端可以使用react所有功能，但是在server端只能使用render之前的生命周期，包括：

* constructor()
* componentWillMount()
* render()

如果你的组件会依赖浏览器的dom，如果是在以上生命周期里面调用，则在server端渲染时出错，所以避免出错，你需要判断当前环境，比如：`if(typeof window != 'undefined')`，或者你可以使用这个类似[模拟浏览器端方案](https://github.com/airbnb/enzyme/blob/master/docs/guides/jsdom.md)。

### http api和请求fetch

在前面[Model](#model)的介绍，也说到过可以使用koa-cola定义的api基类来创建自己的api类，并使用api的fetch方法获取数据：

```javascript
var api = new GetTodoList({});
var data = await api.fetch(helpers.ctx);
```

上面代码也是可以兼容server端和服务器端，ajax库使用了[axios](https://github.com/mzabriskie/axios)，比如todolist demo有个react组件定义：

```javascript
@asyncConnect([
  {
    key: 'todosData',
    promise: async ({ params, helpers, store: { dispatch } }) => {
      var api = new GetTodoList({});
      var data = await api.fetch(helpers.ctx);
      return data.result.result;
    }
  }
])
class Page extends React.Component<Props, States> {
  ...
}
export default Page;
```
如果该组件的路由是服务器端直接渲染，则`api.fetch`会在服务器端调用，如果该组件是在浏览器端的<Link>跳转，则`api.fetch`会在浏览器端调用。

## cluster模式

如果你想使用cluster模式，koa-cola提供了pm2的配置文件，使用cli新建项目时候会生成这个配置文件，启动方式使用：`pm2 start pm2.config.js`

## 调试

如果需要调试koa-cola项目，需要添加两个依赖`npm i ts-node typescript -S`，然后在vscode新建调试配置：

```json
{
    "name": "DebugApp",
    "type": "node",
    "request": "launch",
    "program": "${workspaceRoot}/node_modules/ts-node/dist/_bin.js",
    "stopOnEntry": false,
    "args": [],
    "runtimeArgs": [
        "-r", "ts-node/register",
        "${workspaceRoot}/app.tsx"
    ],
    "sourceMaps": true,
    "console": "internalConsole",
    "internalConsoleOptions": "openOnSessionStart"
}
```
便可享受vscode的调试ts的乐趣。

另外，koa-cola加了redux调试支持，你也可以使用chrome的redux插件调试：

<img src="https://github.com/hcnode/koa-cola/raw/master/screenshots/dev-tool.png" alt="Drawing" width="600"/>

## Tips

### tips 1: 初始化react组件数据

koa-cola提供两种方式初始化react。

1. 在controller里面初始化

初始化数据，数据将会注入到react组件的props.ctrl，如：this.props.ctrl.foo

```javascript
var { Controller, Get, Use, Param, Body, Delete, Put, Post, QueryParam, View, Ctx, Response } = require('koa-cola').Decorators.controller;
@Controller('') 
class FooController {
    @Get('/some_page')  
    @View('some_page') // some_page是普通react组件
    async some_page (@Ctx() ctx, @QueryParam() param : any) { 
        // 初始化数据，数据将会注入到react组件的props，如：this.props.ctrl.foo
        return await Promise.resolve({
            foo : 'bar'
        });
    }
}
```  

2. 在redux-connect封装的react组件初始化数据


```javascript
var {asyncConnect} = require('koa-cola').Decorators.view;
@asyncConnect([
  {
    key: 'foo',
    promise: async ({ params, helpers, store: { dispatch } }) => {
        return await Promise.resolve({
            foo : 'bar'
        });
    }
  }
])
class Some_Page extends React.Component<Props, States> {
  constructor(props: Props) {
    super(props);
  }
  render() {
    return <div>{this.props.foo}</div>;
  }
}
export default Some_Page;
```

这两种方式的区别是：

第一种方式：
* 只会在服务器端进行初始化
* 只支持非react-redux或者redux-connect封装的组件
* 因为只会在服务器端进行初始化，所以可以支持任何获取数据的方式比如数据库获取

第二种方式：
* 服务器端和浏览器端都支持（服务器端就是SSR，浏览器端就是异步获取数据）
* redux-connect封装的组件
* 因为服务器端和浏览器端都支持初始化，所以数据的获取必须前后端Universal，比如使用axios库


### tips 2: redux-connect组件的redux坑

使用redux-connect进行数据初始化，如果这个key和自定义的mapStateToProps的props属性有冲突，那么key定义的数据将会更优先

下面例子，定义了初始化的props属性foo，然后mapStateToProps也定义了返回的props.foo的新value，但是，其实dispatch后props.foo还是最开始的"bar"，而不是"bar again"。

```javascript
var {asyncConnect, colaReducer, store} = require('koa-cola').Decorators.view;
@asyncConnect([
  {
    key: 'foo',
    promise: async ({ params, helpers, store: { dispatch } }) => {
        return await Promise.resolve('bar');
    }
  }
], // mapStateToProps
({ fooState }) => {
    return {
        foo : fooState
    };
}, dispatch => {
    return {
        changeFoo: () => {
            dispatch({
                type: 'CHANGE_FOO'
            });
        }
    };
})
@colaReducer({
    fooState : (state = '', action) => {
        switch (action.type) {
            case 'CHANGE_FOO':
                return 'bar again';
            default:
                return state;
        }
    }
})
class Some_Page extends React.Component<Props, States> {
  constructor(props: Props) {
    super(props);
  }
  render() {
    return <div>
        {this.props.foo}
        <button onClick={() => this.props.changeFoo()}>change foo</button>
    </div>;
  }
}
export default Some_Page;
```

如果必须要修改props.foo，可以使用下面的方法。

```javascript
var loadSuccess = store.loadSuccess;
...
...
changeFoo: () => {
    dispatch(loadSuccess('foo', 'bar again'));
}
```
