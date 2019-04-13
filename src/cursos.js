const funciones = require('./funciones')
const stores = funciones.stores
const data = funciones.data
const Respuesta = require('./Respuesta')

const modalidad = {
    VIRTUAL:    'Virtual',
    PRESENCIAL: 'Presencial',
}

const estado = {
    DISPONIBLE: 'disponible',
    CERRADO:    'cerrado',
}

const crear = (curso) => {

    let validacion = validarCrear(curso);

    if(validacion.length>0) {
        return new Respuesta(false, validacion)
    } else {
        let cur = {
            id:                 curso.id,
            nombre:             curso.nombre,
            descripcion:        curso.descripcion,
            valor:              curso.valor,
            modalidad:          curso.modalidad,
            intensidadHoraria:  curso.intensidadHoraria,
            valor:              curso.valor,
            estado:             estado.DISPONIBLE
        };
        data.cursos.push(cur);
        guardar();
        return new Respuesta(true, 'Curso creado con éxito');
    }

};

const validarCrear = (curso) => {
    let messages = [];
    listar();
    
    if(curso.id == undefined)
        messages.push('El id es obligatorio.')
    else if(curso.id <= 0)
        messages.push('El id del curso debe ser un valor mayor a 0.')
    
    let duplicado = data.cursos.find((c)=> c.id == curso.id)
    if(duplicado)
        messages.push('Ya existe el curso con id ' + curso.id)
        
    if(funciones.isBlankString(curso.nombre))
        messages.push('El nombre es obligatorio.')

    if(funciones.isBlankString(curso.descripcion))
        messages.push('La descripción es obligatoria.')

    return messages
}

const listar = () => {
    funciones.listar(stores.CURSOS)
}

const listarCursosDisponibles = () => {
    listar();
    return data.cursos
        .filter(c=>c.estado == 'disponible')
        .sort(comparar);
}

const comparar = (a, b) => {

    let nombreA = a.nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase()
    let nombreB = b.nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase()

    if (nombreA > nombreB) {
        return 1;
    }
    if (nombreA < nombreB) {
        return -1;
    }
    // a must be equal to b
    return 0;
}

const guardar = () => {
    funciones.guardar(stores.CURSOS)
}

const mostrarTablaHtml = () => {

    return `
    <table class="table table-striped" style="width:100%">
        <thead class="thead-dark">
            <tr>
                <th>id</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Valor</th>
                <th>Modalidad</th>
                <th>Intensidad Horaria</th>
                <th>Estado</th>
            </tr>
        </thead>
        <tbody>
            ${obtenerCursos().map(c => 
               `<tr>
                <td>${c.id}</td>
                <td>${c.nombre}</td>
                <td>${c.descripcion}</td>
                <td>${c.valor}</td>
                <td>${c.modalidad != undefined ? c.modalidad : ''}</td>
                <td>${c.intensidadHoraria != undefined ? c.intensidadHoraria : ''}</td>
                <td><input class="estado" type="checkbox"  ${c.estado == 'disponible'? 'checked' : ''} data-size="sm" data-width="90" data-toggle="toggle" data-on="disponible" data-off="cerrado" data-onstyle="success" data-offstyle="danger"></td>
                </td>
                </tr>`
            ).join('')}
        </tbody>
    </table>`
}

const obtenerCursos = () => {
    listar();
    return data.cursos
}

const modificarEstado = (idCurso, est) => {
    listar();
    let curso = data.cursos.find(c=> c.id == idCurso)
    if(!curso) {
            return new Respuesta(false, `El curso con id ${idCurso} no existe.`)
    } else if(est != estado.DISPONIBLE && est != estado.CERRADO ) {
        return new Respuesta(false, `El estado no es válido, use disponible, cerrado.`)
    } else {
        curso.estado=est;
        guardar()
        return new Respuesta(true, `Se cambió el estado a ${est}`)
    }

}

module.exports =  {
    modalidad,
    estado,
    crear,
    listar,
    guardar,
    mostrarTablaHtml,
    obtenerCursos,
    listarCursosDisponibles,
    modificarEstado,
    comparar
}