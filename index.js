const express = require('express');
const app = express();
const morgan = require('morgan');

const QueryCtrl = require('./Query');

app.set('port',process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080); // usar el puerto que le asigne el sistema, si este no agina alguno, usa el 8080

//middlewares

app.use(morgan('dev')); // Ayuda a entender las peticiones del cliente al servidor
app.use(express.json());

//Routes

app.post('/applications/', QueryCtrl.getAPPs);
app.post('/opportunities/', QueryCtrl.getOPPs);
app.post('/standards/', QueryCtrl.getSnS);

//Static files

app.use('/Documents', express.static('Documents'));

//Starting the server

const server = app.listen(app.get('port'), ()=> {
    console.log('Server on port', app.get('port') );
});

server.setTimeout(300000);

