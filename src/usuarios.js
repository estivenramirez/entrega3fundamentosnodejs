const funciones = require('./funciones')
const stores = funciones.stores
const data = funciones.data
const Respuesta = require('./dtos/Respuesta')

const crear = (usuario) => {

    let validacion = validarCrear(usuario);

    if(validacion.length>0) {
        return new Respuesta(false, validacion)
    } else {

        let duplicado = obtenerUsuarios().find(u=> u.documento == usuario.documento)

        if(duplicado) {
            duplicado.nombre=   usuario.nombre;
            duplicado.correo=   usuario.correo;
            duplicado.telefono= usuario.telefono;
            guardar();
            return new Respuesta(true, 'Usuario ya existe, modificado con éxito');
        } else {
            // let usr = {
            //     documento:  usuario.documento,
            //     nombre:     usuario.nombre,
            //     correo:     usuario.correo,
            //     telefono:   usuario.telefono
            // };
            data.usuarios.push(usuario);
            guardar();
            return new Respuesta(true, 'Usuario creado con éxito');
        }
    }
};

const validarCrear = (usuario) => {
    let messages = [];
    cargar();
    
    if(usuario.documento == undefined)
        messages.push('El documento es obligatorio.')
    else if(usuario.documento <= 0)
        messages.push('El id del documento debe ser un valor mayor a 0.')
        
    if(funciones.isBlankString(usuario.nombre))
        messages.push('El nombre es obligatorio.')

    if(funciones.isBlankString(usuario.correo))
        messages.push('El correo es obligatorio.')

    if(funciones.isBlankString(usuario.telefono))
        messages.push('El telefono es obligatoria.')

    return messages
}

const cargar = () => funciones.listar(stores.USUARIOS)

const guardar = () => funciones.guardar(stores.USUARIOS)

const obtenerUsuarios = () => {
    cargar();
    return data.usuarios
}

module.exports =  {
    crear,
    cargar,
    guardar,
    obtenerUsuarios
}