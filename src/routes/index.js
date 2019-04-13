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
const Curso = require('./../models/curso')
const Usuario = require('./../models/usuario')

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json())

app.set('view engine', 'hbs')
app.set('views', dirViews)
hbs.registerPartials(dirPartials)

app.get('/', (req, res) => {
    res.render('index')
});

app.get('/cursos/crear', (req, res) => {
    res.render('cursos/crear', {
        curso: {},
        respuesta: ''
    })
});

app.post('/crearCurso', (req, res) => {

    let curso =  new Curso ({
        nombre:             req.body.nombre,
        descripcion:        req.body.descripcion,
        valor:              req.body.valor,
        modalidad:          req.body.modalidad,
        intensidadHoraria:  req.body.intensidadHoraria
    })

    curso.save((err, result)=>{

        let respuesta
        let cursoR = {}

        if(!err) {
            respuesta = new Respuesta(true, `Se ha creado el curso ${result.nombre}`);
        } else {
            console.log(err)
            respuesta = new Respuesta(false, err)
            cursoR = curso
        }

        res.render('cursos/crear',  {
            respuesta: respuesta,
            curso: cursoR
        })

    })

});

app.get('/crearCurso', (req, res) => res.redirect('cursos/crear') );

app.get('/cursos/verInteresado', (req, res) => {

    Curso.find({estado:'disponible'}, (err, result)=> {
        if(err)
            return console.log(err)

        res.render('cursos/verInteresado', {
            cursosDisponibles: result
        })
    })

});

app.get('/cursos/verCoordinador', (req, res) => {

    Curso.find({}, (err, result) => {

        if(err)
          return  console.log(err)
        
        res.render('cursos/verCoordinador', { 
        tablaListaCursos : 
        `<table class="table table-striped" style="width:100%">
            <thead class="thead-dark">
                <tr>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Valor</th>
                    <th>Modalidad</th>
                    <th>Intensidad Horaria</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                ${result.map(c => 
                   `<tr>
                    <td>${c.nombre}</td>
                    <td>${c.descripcion}</td>
                    <td>${c.valor}</td>
                    <td>${c.modalidad != undefined ? c.modalidad : ''}</td>
                    <td>${c.intensidadHoraria != undefined ? c.intensidadHoraria : ''}</td>
                    <td><input class="estado" type="checkbox"  ${c.estado == 'disponible'? 'checked' : ''} data-size="sm" data-width="90" data-toggle="toggle" data-on="disponible" data-off="cerrado" data-onstyle="success" data-offstyle="danger"></td>
                    <input type="hidden" name="idCurso" value="${c._id}">
                    </td>
                    </tr>`
                ).join('')}
            </tbody>
        </table>`

        })
    })
   
});

app.patch('/cambiarEstadoCurso', (req, res) => {

    Curso.findByIdAndUpdate(req.body.idCurso, {estado: req.body.estado}, (err, result) => {
        let respuesta
        if(err) {
            console.log(err)
            respuesta = new Respuesta(false, 'Ocurrió un error al cambiar el estado del curso')
        } else {
            console.log(result)
            respuesta = new Respuesta(true, 'Se modificó el estado')
        } 
        res.send(respuesta)
    })

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
