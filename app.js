require('./src/Config/config');
console.clear();

// ----------------------------- //
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan')
var helmet = require('helmet');
var cors = require('cors');


// ---- Database Connection ---- //
mongoose.set('useCreateIndex', true);
mongoose.connect(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
    .then(() => {
        console.log('¡Connection Successfully!');
    });


// ---- Initialize the application ---- //
const app = express();
app.disable('x-powered-by');


// ---- Middlewares ---- //
app.use(helmet());
app.use('/static', express.static(__dirname + '/reportes'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'))
app.set('trust proxy', true);


// ---- Cors ---- //
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});


// Habilitar cors (DE MANERA LIMITADA)
// En esta ocasion sera abierta para mi
const whitelist=['localhost:5000'];
const corsOptions={
    origin: (origin,callback) => {
        
        const existe = whitelist.some(dominio => dominio=== origin);

        if (existe) {
            callback(null,true)
        } else {
            callback(new Error('No permitido por CORS'))
        }
    }
}

// Esta limita el acceso
// app.use(cors(corsOptions));

// Esta es abierta para todo el mundo.
app.use(cors());



// ---- Routes ---- //
app.use("/api/user", require('./src/Routes/userRoutes'));



// ---- Run the server ----
app.listen(process.env.PORT, () => {
    console.log(`Servidor corriendo en el puerto ${process.env.PORT}`);
});
