require("../Config/config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../Models/userModel");


// Create user in database
const userRegister = async (req, res) => {

    // ------------------ Validate Request ----------------- //
    console.log(req.body);
    if (!req.body.nombre) {
        return res.status(400).send("¡Por favor rellene el campo nombre!");
    } else if (!req.body.apellido) {
        return res.status(400).send("¡Por favor rellene el campo apellido!");
    } else if (!req.body.username) {
        return res.status(400).send("¡Por favor rellene el campo username!");
    } else if (!req.body.password) {
        return res.status(400).send("¡Por favor rellene el campo contraseña!");
    }

    const array = ['usd', 'eur', 'ars']

    if (!array.includes(req.body.monedaPreferida)) {
        return res.status(400).send('¡Por favor ingrese un tipo de moneda preferida valido (usd, eur, ars)!')
    } 

    try {
        //Validate the username
        let usernameNotTaken = await validateUsername(req.body.username);
        if (!usernameNotTaken) {
            return res.status(400).json({
                message: `El nombre de usuario no esta disponible.`,
                success: false
            });
        }

        // Get the hashed password 
        const password = await bcrypt.hash(req.body.password, 12);
        // Create a new user
        const newUser = new User({
            ...req.body,
            password
        });
        await newUser.save();
        return res.status(201).json({
            message: "Registrado con exito. Ahora inicia sesión",
            success: true
        });
    } catch (err) {
        console.log(err);
        if(!err.errors.password.message){
            return res.status(500).json({
                message: "No es posible crear la cuenta",
                success: false
            });
        } else {
            return res.status(500).send(err.errors.password.message);
        }
    }
};

// Login user
const userLogin = async (req, res) => {
    let { username, password } = req.body;

    if (!username || !password ){
        return res.status(400).send("¡Por favor ingrese un usuario y una contraseña valida!");
    }

    // Check if the username is in the database
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(400).send("¡Usuario no encontrado, credenciales invalidas para iniciar sesion!");
    }

    // Check for the password
    let isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
        //Sign in the token and issue it to the user
        let token = jwt.sign(
        {
            user_id: user._id,
            username: user.username,
            monedaPreferida: user.monedaPreferida
        },
        process.env.SECRET,
        { expiresIn: "1h" }
        );

        let result = {
            token: `${token}`,      
        };
        return res.status(200).json({
            ...result
        });
    } else {
        return res.status(403).json({
            message: "Contraseña incorrecta."
        });
    }
};


// Username validation
const validateUsername = async username => {
    let user = await User.findOne({ username });
    return user ? false : true;
};


// Check is Logued and token is valid
const checkToken = (req, res, next) => {
    try {
        const {token} = req.headers;
        dataToken= jwt.verify(token, process.env.SECRET);
        req.infoToken = dataToken;
        next(); 
    } catch (error) {
      console.log(error.message);
      res.status(401).send('¡Token no valido, asegurate de estar logueado!')
    }
  };


module.exports = {
    checkToken,
    userLogin,
    userRegister
};