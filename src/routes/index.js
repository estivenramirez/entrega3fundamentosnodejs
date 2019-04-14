const express = require('express')
const app = express()
const path = require('path')
const hbs = require('hbs')
const bodyParser = require('body-parser') //de express
const bcrypt = require('bcrypt');

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

    Curso.find({"estado": "disponible"}, (err, result) => {

        if(err)
          return  console.log(err)
        
        res.render('cursos/inscribir', {
            cursosDisponibles : result
        })

    })
});

app.post('/inscribirCurso', (req, res) => {

    Curso.findOne({"_id":req.body.idCurso, "estudiantes": "5cb29e528c73fd2fd40894cd"}, (err, result) => {
        if(err)
            return console.log(err)

        if(result) {

            Curso.find({"estado": "disponible"}, (err, resp) => {
                if(err) return  console.log(err)
                res.render('cursos/inscribir', {respuesta: new Respuesta(false, `El aspirante ya está inscrito en el curso "${result.nombre}"`), cursosDisponibles : resp, idCurso: req.body.idCurso })
            })

        } else {
            Curso.findByIdAndUpdate(req.body.idCurso, {$push: {"estudiantes": "5cb29e528c73fd2fd40894cd"}}, {'new': true}, (err, resp) => {
                if(err) return console.log(err)
                res.render('respuesta',  {respuesta: new Respuesta(true, `Aspirante inscrito al curso "${resp.nombre}" con éxito`) })
            })
        }
    })
});

app.get('/inscribirCurso', (req, res) => res.redirect('cursos/inscribir'));

app.get('/cursos/verInscritos', (req, res) => {

    Curso.find({estado: "disponible"})
    .populate('estudiantes')
    .sort('nombre')
    .exec((err, result) => {
        if(err)
            return console.log(err)

        res.render('cursos/verInscritos', {
            cursos: result
        })
    })

});

app.post('/eliminarCursoUsuario', (req, res) => {

    console.log(`idCurso ${req.body.idCurso} idEstudiante ${req.body.idUsuario}`)

    Curso.findByIdAndUpdate(req.body.idCurso, {$pull: {"estudiantes": req.body.idUsuario}}, {'new': true}, (err, result) => {
        if(err)
            return console.log(err)
        
        console.log(result)

        res.send(new Respuesta(true, 'Estudiante eliminado del curso'))
    })

});

app.get('/usuarios/registrar', (req, res) => res.render('usuarios/registro') );

app.post('/registro', (req, res) => {

    let usuario = new Usuario({
        documento: req.body.documento,
        nombre: req.body.nombre,
        correo: req.body.correo,
        telefono: req.body.telefono
    })

    if(req.body.rol != null && req.body.rol != '') {
        usuario.rol = req.body.rol
    }

    if(req.body.password === req.body.passwordAgain) {
        usuario.password = bcrypt.hashSync(req.body.password, 10)
    } else {
        res.render('usuarios/registro', {
            respuesta: new Respuesta(false, "Las contraseñas no coinciden."),
            documento: req.body.documento,
            nombre: req.body.nombre,
            correo: req.body.correo,
            telefono: req.body.telefono,
            rol: req.body.rol,
            password: req.body.password,
            passwordAgain: req.body.passwordAgain
        })
    }

    usuario.save((err, result) => {
        if(err) {
            console.log(err)
            res.render('usuarios/registro', {
                respuesta: new Respuesta(false, err),
                documento: req.body.documento,
                nombre: req.body.nombre,
                correo: req.body.correo,
                telefono: req.body.telefono,
                rol: req.body.rol,
                password: req.body.password,
                passwordAgain: req.body.passwordAgain
            })
        } else {
            res.render('respuesta', {
                respuesta: new Respuesta(true, `Se registro usuario con nombre  ${result.nombre}`)
            })

        }

    })

});


app.get('*', (req, res) => {
    res.render('error')
});

module.exports = app
