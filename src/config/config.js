process.env.PORT = process.env.PORT || 3000;
process.env.NODE_ENV = process.env.NODE_ENV || 'local';

let urlDB
if (process.env.NODE_ENV === 'local'){
	urlDB = 'mongodb://localhost:27017/asignaturas';
}
else {
	urlDB = 'mongodb+srv://admin:JGzVk5YjePieWsU@fundamentos-nodejs-erp-uh8j7.mongodb.net/asignaturas?retryWrites=true'
}

process.env.URLDB = urlDB