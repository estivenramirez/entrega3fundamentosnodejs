const express = require('express')
const app = express()
const path = require('path')
const hbs = require('hbs')
const bodyParser = require('body-parser') //de express
const bcrypt = require('bcrypt');

const cursos = require('./../cursos')
const cursosUsuarios = require('./../cursosUsuarios')
const {data, respuestaAlertHtml} = require('./../funciones')
const Respuesta = require('../dtos/Respuesta')

const helpers = require('../helpers/helpers')

const dirViews = path.join(__dirname , '../../template/views')
const dirPartials = path.join(__dirname , '../../template/partials')

//Models
// const Estudiante = require('./../models/estudiante')

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json())

app.set('view engine', 'hbs')
app.set('views', dirViews)
hbs.registerPartials(dirPartials)

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

module.exports = app
