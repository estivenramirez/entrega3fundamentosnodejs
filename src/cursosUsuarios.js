const funciones = require('./funciones')
const stores = funciones.stores
const data = funciones.data
const cursos = require('./cursos')
const usuarios = require('./usuarios')
const Respuesta = require('./Respuesta')

const cargar = () => funciones.listar(stores.CURSOS_USUARIOS)

const guardar = () => funciones.guardar(stores.CURSOS_USUARIOS)

const obtenerCursosUsuarios = () => {
    cargar();
    return data.cursosUsuarios
}

const obtenerCursoYUsuarios = () => {

    let listaCursos = cursos.obtenerCursos()
    let listaUsuarios = usuarios.obtenerUsuarios()
    let cursosUsuarios = obtenerCursosUsuarios()
    let listaCursosYUsuarios = [];

    listaCursos.forEach((cur, index) => {
        let cursoYUsuarios = {curso: cur, usuarios: []};

        cursosUsuarios
            .filter(cu=> cur.id == cu.idCurso)
            .forEach((cusr, idx)=>{
                let usuario = listaUsuarios.find(u=>cusr.docUsuario == u.documento)
                cursoYUsuarios.usuarios.push(usuario)
            })
        listaCursosYUsuarios.push(cursoYUsuarios)
    })
    
    return listaCursosYUsuarios
}

const inscribir = (idCurso, usuario) => {

    let curso = cursos.obtenerCursos().find(c=>c.id == idCurso)
    let duplicado = obtenerCursosUsuarios().find((cu)=> cu.idCurso == idCurso && cu.docUsuario == usuario.documento)

    if(!curso)
        return new Respuesta(false, `El curso con id ${idCurso} no existe.`)
    else if(curso.estado != cursos.estado.DISPONIBLE)
        return new Respuesta(false, `El curso con id ${idCurso} no está disponible.`)
    
    if(duplicado)
       return new Respuesta(false, `El usuario con documento ${usuario.documento} ya está inscrito en el curso ${curso.nombre} (${curso.id})`)

    let respuestaCrearUsuario = usuarios.crear(usuario)

    if(!respuestaCrearUsuario.success) {
        return respuestaCrearUsuario
    }
    else {
        obtenerCursosUsuarios().push({idCurso: idCurso, docUsuario: usuario.documento})
        guardar()
        return new Respuesta(true, 'Inscripción exitosa')
    }
}

const cursosUsuariosDisponibles = () => {
    return obtenerCursoYUsuarios()
        .filter(cu => cu.curso.estado == cursos.estado.DISPONIBLE )
        .sort((a, b) => {

            let nombreA = a.curso.nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase()
            let nombreB = b.curso.nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase()

            if (nombreA > nombreB) {
            return 1;
            }
            if (nombreA < nombreB) {
            return -1;
            }
            // a must be equal to b
            return 0;
    });
}

const eliminarCursoUsuario = (idCurso, docUsuario) => {
    let cursosUsuarios = obtenerCursosUsuarios()
    let index = cursosUsuarios.findIndex(cu=> cu.idCurso == idCurso && cu.docUsuario == docUsuario)

    if(index > -1) {
        data.cursosUsuarios = cursosUsuarios.filter(cu => !(cu.idCurso == idCurso && cu.docUsuario == docUsuario))
        guardar()
        return new Respuesta(true, 'Usuario eliminado del curso con éxito')
    } else {
        new Respuesta(false, `No se puedo eliminar el usuario con documento ${docUsuario} del curso con id ${idCurso}`)
    }

}

module.exports =  {
    cargar,
    guardar,
    obtenerCursosUsuarios,
    obtenerCursoYUsuarios,
    inscribir,
    cursosUsuariosDisponibles,
    eliminarCursoUsuario
}