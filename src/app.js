const express = require('express')
const app = express()
const path = require('path')
const helpers = require('./helpers/helpers')
const bodyParser = require('body-parser') //de express
const session = require('express-session')
const mongoose = require('mongoose');

const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../public')))

const dirNode_modules = path.join(__dirname , '../node_modules')
app.use('/css', express.static(dirNode_modules + '/bootstrap/dist/css'));
app.use('/css', express.static(dirNode_modules + '/bootstrap4-toggle/css'));
app.use('/js', express.static(dirNode_modules + '/jquery/dist'));
app.use('/js', express.static(dirNode_modules + '/popper.js/dist'));
app.use('/js', express.static(dirNode_modules + '/bootstrap/dist/js'));
app.use('/js', express.static(dirNode_modules + '/jquery-validation/dist'));
app.use('/js', express.static(dirNode_modules + '/bootstrap4-toggle/js'));

//Session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
  }))

app.use((req, res, next) => {
    // if(req.session.usuario) {
    //     res.locals.sesion = true;
    //     res.locals.nombre = req.session.nombre;
    // }
    next()
})

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json())

//Routes
app.use(require('./routes/index'))

// mongoose.connect('mongodb://localhost:27017/asignaturas', {useNewUrlParser: true}, (error, result)=> {
//     if(error)
//         return console.log(error)
//     else 
//         return console.log('Conectado')    
// })

app.listen(port, () => console.log('Escuchando en puerto ' + port))