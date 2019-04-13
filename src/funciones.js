const fs = require('fs')
const path = require('path')
const Respuesta = require('./dtos/Respuesta')

var data = {
    cursos:         [],
    usuarios:       [],
    cursosUsuarios: []
}

const stores = {
    USUARIOS: 'usuarios',
    CURSOS: 'cursos',
    CURSOS_USUARIOS: 'cursosUsuarios',
}

const guardar = (store) => {
    let datos = JSON.stringify(data[store]);
    let nombreArchivo = store+'.json' 
    let directorio = path.join(__dirname, '../')

    fs.writeFile(directorio+nombreArchivo, datos, (err)=> {
        if(err) throw (err);
        console.log(`Archivo ${nombreArchivo} creado/actualizado con éxito`)
    });

}

const listar = (store) => {

    // try {
    //     // console.log('Listar: ' + store)
    //     //Forma asíncrona
    //     let rutaJson = path.join(__dirname, '../', store + '.json')
    //     // console.log(rutaJson)
    //     data[store] = require(rutaJson)
    //     // console.log(data)
    // } catch(e) {
    //     data[store] = [];
    // }

    //Forma síncrona
    try {
        data[store] = JSON.parse(fs.readFileSync('./'+store + '.json'))
    } catch(e) {
        data[store] = [];
    }
}

const isEmptyString = (str) => {
    return str == null || str.length === 0 
}

const isBlankString = (str)  => {
    return str == null || str.trim().length === 0
}

module.exports = {
    data,
    stores,
    guardar,
    listar,
    isEmptyString,
    isBlankString
}