const express = require('express');
const app = express();
//const morgan = require('morgan');

const QueryCtrl = require('./Query');
//middlewares

//app.use(morgan('dev')); // Ayuda a entender las peticiones del cliente al servidor
app.use(express.json());

//Routes

app.post('/applications/', QueryCtrl.getAPPs);
app.post('/opportunities/', QueryCtrl.getOPPs);
app.post('/standards/', QueryCtrl.getSnS);

//Static files

app.use('/Documents', express.static('Documents'));

//Starting the server

const server = app.listen(8443, ()=> {
    console.log('Server on port', 8443 );
});

server.setTimeout(300000);

