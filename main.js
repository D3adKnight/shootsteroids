let path = require('path')

let express = require('express')
let app = express()
let server = require('http').Server(app)
let io = require('socket.io')(server)
require('./server/socket')(io)

app.use(express.static(path.join(__dirname, '/public')))
app.use(express.static(path.join(__dirname, '/public/assets')))

app.set('port', (process.env.PORT | 3000))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/client/src/views'))

app.get('/', function (req, res) {
  res.render('index.ejs')
})

server.listen(3000)
console.log('Server listening on port 3000')
