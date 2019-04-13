const express = require('express')
const app = express()
const path = require('path')
const hbs = require('hbs')
const helpers = require('./helpers')
const bodyParser = require('body-parser') //de express

const port = process.env.PORT || 3000;

const cursos = require('./cursos')
const cursosUsuarios = require('./cursosUsuarios')
const {data, respuestaAlertHtml} = require('./funciones')
const Respuesta = require('./Respuesta')

app.use(express.static(path.join(__dirname, '../public')))

const dirNode_modules = path.join(__dirname , '../node_modules')
app.use('/css', express.static(dirNode_modules + '/bootstrap/dist/css'));
app.use('/css', express.static(dirNode_modules + '/bootstrap4-toggle/css'));
app.use('/js', express.static(dirNode_modules + '/jquery/dist'));
app.use('/js', express.static(dirNode_modules + '/popper.js/dist'));
app.use('/js', express.static(dirNode_modules + '/bootstrap/dist/js'));
app.use('/js', express.static(dirNode_modules + '/jquery-validation/dist'));
app.use('/js', express.static(dirNode_modules + '/bootstrap4-toggle/js'));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json())

hbs.registerPartials(path.join(__dirname, '../partials'))
app.set('view engine', 'hbs')

app.get('/', (req, res) => {
    cursos.listar()
    res.render('index', {
        cursos: data.cursos
    })
});

app.get('/cursos/crear', (req, res) => {
    cursos.listar()
    res.render('cursos/crear', {
        curso: {},
        respuesta: ''
    })
});

app.post('/crearCurso', (req, res) => {

    let body = req.body

    let curso = {
        id:                 body.id,
        nombre:             body.nombre,
        descripcion:        body.descripcion,
        valor:              body.valor,
        modalidad:          body.modalidad,
        intensidadHoraria:  body.intensidadHoraria
    }

    let respuesta = cursos.crear(curso);
    if(respuesta.success) {
        res.render('cursos/crear',  {
            respuesta: respuesta
        })
    } else {
        res.render('cursos/crear',  {
            respuesta: respuesta,
            curso: curso
        })
    }

});

app.get('/crearCurso', (req, res) => res.redirect('cursos/crear') );

app.get('/cursos/verInteresado', (req, res) => {
    res.render('cursos/verInteresado', {
        cursosDisponibles: cursos.listarCursosDisponibles()
    })
});

app.get('/cursos/verCoordinador', (req, res) => {
    res.render('cursos/verCoordinador')});

app.patch('/cambiarEstadoCurso', (req, res)=>{
    let body = req.body
    res.send(cursos.modificarEstado(body.idCurso, body.estado))
})

app.get('/cursos/inscribir', (req, res) => {
    res.render('cursos/inscribir', {
        cursosDisponibles: cursos.listarCursosDisponibles()
    })
});

app.post('/inscribirCurso', (req, res) => {

    let body = req.body
    let usuario = {
        documento:          body.documento,
        nombre:             body.nombre,
        correo:             body.correo,
        telefono:           body.telefono,
    }
    let idCurso = body.idCurso;
    let respuesta = cursosUsuarios.inscribir(idCurso, usuario)

        res.render('cursos/inscribir',  {
            respuesta: respuesta,
            cursosDisponibles: cursos.listarCursosDisponibles(),
            usuario: usuario,
            idCurso: respuesta.success ? '' : idCurso
        })
});

app.get('/inscribirCurso', (req, res) => res.redirect('cursos/inscribir') );

app.get('/cursos/verInscritos', (req, res) => {
    res.render('cursos/verInscritos', {
        cursosYUsuarios: cursosUsuarios.cursosUsuariosDisponibles()
    })
});

app.post('/eliminarCursoUsuario', (req, res) => {
    let body = req.body
    res.send(cursosUsuarios.eliminarCursoUsuario(body.idCurso, body.docUsuario))
});

app.get('*', (req, res) => {
    res.render('error')
});

app.listen(port, () => console.log('Escuchando en puerto ' + port))