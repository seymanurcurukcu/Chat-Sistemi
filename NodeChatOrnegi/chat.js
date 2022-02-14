const http = require("http")
const express = require('express')
const app = express()
const server = http.createServer(app)
const io = require('socket.io')(server)
const bodyparser = require("body-parser")
const sharedsession = require("express-socket.io-session")
const fs = require('fs')
app.use(bodyparser.urlencoded({ extended: false }))
const session = require("express-session")({
    secret: "chatsistemim",
    resave: false,
    saveUninitialized: false

})
app.use(session)
io.use(sharedsession(session, {
    autoSave: true

}))

app.get("/", function (request, response) {

    if (!request.session.kulad) {
        response.sendFile('./index.html', { root: __dirname })
    }
    else {
        response.sendFile('./chat.html', { root: __dirname })
    }


})

app.post("/chat", function (request, response) {


    if (request.body.kulad) {
        request.session.kulad = request.body.kulad
    }

    if (request.session.kulad) {
        response.sendFile('./chat.html', { root: __dirname })
    }
    else {
        response.sendFile('./index.html', { root: __dirname })
    }
})

io.on('connection', function (socket) {
    console.log("bir kullanıcı bağlandı " + socket.handshake.session.kulad)

    socket.on('mesajvar', function (msg) {
        io.emit('mesajvar', socket.handshake.session.kulad, msg)
    })

    socket.on('disconnect', function () {
        console.log("Bir kullanıcı ayrıldı")
    })

    socket.on('konusmakaydet', function (konusmalar) {

        var bosluksil=konusmalar.trim()
        var parcalihali=bosluksil.split("*")
        var sonhal=parcalihali.join('\n')

        fs.writeFile("konusmalar.txt", sonhal, function (err) {
            if (err) throw err
            else console.log("VERİ KAYDEDİLDİ")

        })
    })
})

server.listen(8000, function () {

    console.log("server başladı")
})

