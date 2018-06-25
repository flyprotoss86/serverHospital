const port = 8080
const path = require('path')
const koaStatic = require('koa-static')
const session = require('koa-session')

const fs = require('fs')
const util = require('util')
const events = require('events')
const ansi = require('ansi')
const cursor = ansi(process.stdout)


// 创建http server
const koa = require('koa')
const app = new koa()
const server = require('http').createServer(app.callback())
const WebSocketServer = require('./server.js').Server

//全局异常处理
const handler = async (ctx, next) => {
    try{
        await next()
    }
    catch(err){
        console.log(err)
        ctx.response.status = 500
        ctx.response.body = 'internal server error'
    }
}
app.use(handler)

//静态资源
app.use(
    koaStatic(path.join(__dirname, 'public'))
)

// ws处理
// var wss = new WebSocketServer({server: server})
// wss.on('connection', function (ws) {
//     var id = setInterval(function () {
//         ws.send(JSON.stringify(process.memoryUsage()), function () { /* ignore errors */ })
//     }, 100)
//     console.log('started client interval')
//     ws.on('close', function () {
//         console.log('stopping client interval')
//         clearInterval(id)
//     })
// })


function BandwidthSampler (ws, interval) {
    interval = interval || 2000;
    var previousByteCount = 0;
    var self = this;
    var intervalId = setInterval(function () {
        var byteCount = ws.bytesReceived;
        var bytesPerSec = (byteCount - previousByteCount) / (interval / 1000);
        previousByteCount = byteCount;
        self.emit('sample', bytesPerSec);
    }, interval);
    ws.on('close', function () {
        clearInterval(intervalId);
    });
}
util.inherits(BandwidthSampler, events.EventEmitter)
function makePathForFile (filePath, prefix, cb) {
    if (typeof cb !== 'function') throw new Error('callback is required');
    filePath = path.dirname(path.normalize(filePath)).replace(/^(\/|\\)+/, '');
    var pieces = filePath.split(/(\\|\/)/);
    var incrementalPath = prefix;
    function step (error) {
        if (error) return cb(error);
        if (pieces.length === 0) return cb(null, incrementalPath);
        incrementalPath += '/' + pieces.shift();
        fs.access(incrementalPath, function (err) {
            if (err) fs.mkdir(incrementalPath, step);
            else process.nextTick(step);
        });
    }
    step();
}
cursor.eraseData(2).goto(1, 1)
var clientId = 0
var wss = new WebSocketServer({server: server})
wss.on('connection', function (ws) {
    var thisId = ++clientId;
    cursor.goto(1, 4 + thisId).eraseLine();
    console.log('Client #%d connected', thisId);

    var sampler = new BandwidthSampler(ws);
    sampler.on('sample', function (bps) {
        cursor.goto(1, 4 + thisId).eraseLine();
        console.log('WebSocket #%d incoming bandwidth: %d MB/s', thisId, Math.round(bps / (1024 * 1024)));
    });

    var filesReceived = 0;
    var currentFile = null;
    ws.on('message', function (data) {
        if (typeof data === 'string') {
            currentFile = JSON.parse(data);
            // note: a real-world app would want to sanity check the data
        } else {
            if (currentFile == null) return;
            makePathForFile(currentFile.path, path.join(__dirname, '/uploaded'), function (error, path) {
                if (error) {
                    console.log(error);
                    ws.send(JSON.stringify({event: 'error', path: currentFile.path, message: error.message}));
                    return;
                }
                fs.writeFile(path + '/' + currentFile.name, data, function (error) {
                    if (error) {
                        console.log(error);
                        ws.send(JSON.stringify({event: 'error', path: currentFile.path, message: error.message}));
                        return;
                    }
                    ++filesReceived;
                    // console.log('received %d bytes long file, %s', data.length, currentFile.path);
                    ws.send(JSON.stringify({event: 'complete', path: currentFile.path}));
                    currentFile = null;
                });
            });
        }
    });

    ws.on('close', function () {
        cursor.goto(1, 4 + thisId).eraseLine();
        console.log('Client #%d disconnected. %d files received.', thisId, filesReceived);
    });

    ws.on('error', function (e) {
        cursor.goto(1, 4 + thisId).eraseLine();
        console.log('Client #%d error: %s', thisId, e.message);
    });
})
fs.mkdir(path.join(__dirname, '/uploaded'), function () {
    // ignore errors, most likely means directory exists
    console.log('Uploaded files will be saved to %s/uploaded.', __dirname)
    console.log('Remember to wipe this directory if you upload lots and lots.')
})


// session处理
const CONFIG = {
    key: 'koa:_bjylt6868', /** (string) cookie key (default is koa:sess) */
    /** (number || 'session') maxAge in ms (default is 1 days) */
    /** 'session' will result in a cookie that expires when session/browser is closed */
    /** Warning: If a session cookie is stolen, this cookie will never expire */
    maxAge: 86400000,
    overwrite: true, /** (boolean) can overwrite or not (default true) */
    httpOnly: true, /** (boolean) httpOnly or not (default true) */
    signed: true, /** (boolean) signed or not (default true) */
    rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
    renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
}
app.keys = ['secret', 'keys']
app.use(session(CONFIG, app))

// app.use(route.get('/', ctx=>{
//     if(!ctx.session.authenticated){
//         ctx.response.status = 401
//         ctx.response.body = '401'
//     } else {
//         ctx.response.body = 'hello world'
//     }
// }))
// app.use(route.get('/login', async function(ctx){
//     await ctx.render('login')
// }))
// app.use(route.post('/login', ctx => {
//     if(ctx.request.body.username === 'username' &&
//         ctx.request.body.password === 'password'){
//         ctx.session.authenticated = true
//         ctx.response.redirect('/')
//     } else {
//         ctx.response.status = 400
//         ctx.response.body = '400'
//     }
// }))
// app.use(route.get('/logout', ctx => {
//     ctx.session.user = null
//     ctx.response.redirect('/login')
// }))
//
// const main = (ctx, next) => {
//     if(ctx.request.path === '/error'){
//         throw new Error('ooops')
//     } else {
//         ctx.response.body = 'OK'
//     }
//     next()
// }

//设置接口跨域
app.use((ctx,next)=>{
    ctx.res.setHeader('Access-Control-Allow-Origin','*')
    next()
})

//接口路由
//...

//404处理
app.use((ctx, next) => {
    ctx.response.status = 404
    ctx.response.body='not found'
    next()
})

// app.listen(port)
server.listen(port, ()=>{
    console.log('server listen at: '+port)
})

