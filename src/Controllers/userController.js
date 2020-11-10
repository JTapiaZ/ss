const User = require('../Models/userModel');
const fetch = require("node-fetch");

const {getCoins, fetchAllInfo, fetchPriceCoins} = require('../Helpers/fetchCoins')


// Return all users
exports.allUsers = (req, res) => {
    User.find()
        .then(data => {
            var message = "";
            if (data === undefined || data.length == 0) message = "Users not found!";
            else message = "Users received";
            res.send({
                success: true,
                message: message,
                data: data
            });
        })
        .catch(err => {
            res.status(500).send({
                success: false,
                message: err.message || "An error occurred while bringing in the records"
            });
        });
};


// Return all coins
exports.allCoins = (req,res) => {
    
    const monedaPreferida = req.infoToken.monedaPreferida;
    
    // USD - EUR - ARS
    let monedaUser = monedaPreferida;
    let url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${monedaUser}&order=market_cap_desc&per_page=100&page=1&sparkline=false`
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const values=[];
            data.map(elemnt => {
                const {symbol, current_price, name, image,  last_updated} = elemnt;
                values.push({symbol, current_price, name, image, last_updated});  
            })
           res.send(values);
        })
}


// Find a user by id
exports.userDetails = (req, res) => {
    User.findById(req.params.id)
        .then(data => {
            if (!data) {
                return res.status(404).send({
                    success: false,
                    message: "User not found with the id" + req.params.id
                });
            }
            res.send({
                success: true,
                message: "User found",
                data: data
            });
        })
        .catch(err => {
            if (err.kind === "ObjectId") {
                return res.status(404).send({
                    success: false,
                    message: "User not found with the id " + req.params.id
                });
            }
            return res.status(500).send({
                success: false,
                message: "Error when bringing the user with the id " + req.params.id
            });
        });
};


// Find user and add coins to your account
exports.addCoins = async (req, res) => {

    const {user_id} = req.infoToken;
    const {idMonedasSeguimiento} = req.body;

    const coins = await getCoins(req)

    if(!idMonedasSeguimiento) {
        return res.status(400).send("¡Ingrese una moneda valida!");
    }
    
    if(!coins.includes(idMonedasSeguimiento)){
        return res.status(400).send('Esta moneda no existe, ingresa una moneda valida')
    }

    const respBD = await User.findById(user_id,{
        idMonedasSeguimiento
    });

    const newArray = [];

    respBD.idMonedasSeguimiento.forEach(element => {
        newArray.push(element);
    });

    if(newArray.includes(idMonedasSeguimiento)){
        return res.status(400).send("¡Ya ingresaste esta moneda!");
    }

    newArray.push(idMonedasSeguimiento);

    User.findByIdAndUpdate(
        user_id,
        {
            idMonedasSeguimiento : newArray
        },
        {new: true}
    )
    .then(data => {
        console.log(data);
        if (!data){
            return res.status(400).send({
                success: false,
                message: "User not found with the id " + user_id
            });
        }
        res.send({
            success: true,
            data: data
        });
    })
    .catch( err => {
        if (err.kind === "ObjectId") {
            return res.status(404).send({
            success: false,
            message: "User not found with the id " + user_id
            });
        }
        return res.status(500).send({
            success: false,
            message: "Error updating the user with the id " + user_id
        });
    });
}


// Coins User - DESC default
exports.findUserCoins = async (req, res) => {

    const {user_id} = req.infoToken;

    const respBD = await User.findById(user_id);

    const monedaPreferida = respBD.monedaPreferida

    const infoCoins = await fetchAllInfo(monedaPreferida);

    let infoUser = [];
    let idsUser = [];

    infoCoins.forEach(element => {
        
        const {id, symbol, name, image, last_updated} = element;

        if(respBD.idMonedasSeguimiento.includes(element.id)){

            infoUser.push({symbol, name, image, last_updated});
            idsUser.push({id});
        }
    })

    const priceCoin = await Promise.all(fetchPriceCoins(idsUser))

    let i = 0;
    let newArray = infoUser.map(element => {
        const newArray2 = {...element, ArgentineanPesos:priceCoin[i][0], Dollars:priceCoin[i][1], Euros:priceCoin[i][2]}
        i++;
        return newArray2;
    }); 

    const coins = newArray.map(element => {
        return element;
    })
    
    let desc = coins.sort((a, b) => b.Dollars - a.Dollars );

    res.send(desc);
}


// Coins User - ASC
exports.findUserCoinsAsc = async (req, res) => {

    const {user_id} = req.infoToken;

    const respBD = await User.findById(user_id);

    const monedaPreferida = respBD.monedaPreferida

    const infoCoins = await fetchAllInfo(monedaPreferida);

    let infoUser = [];
    let idsUser = [];

    infoCoins.forEach(element => {
        
        const {id, symbol, name, image, last_updated} = element;

        if(respBD.idMonedasSeguimiento.includes(element.id)){

            infoUser.push({symbol, name, image, last_updated});
            idsUser.push({id});
        }
    })

    const priceCoin = await Promise.all(fetchPriceCoins(idsUser))

    let i = 0;
    let newArray = infoUser.map(element => {
        const newArray2 = {...element, ArgentineanPesos:priceCoin[i][0], Dollars:priceCoin[i][1], Euros:priceCoin[i][2]}
        i++;
        return newArray2;
    }); 

    const coins = newArray.map(element => {
        return element;
    })
    
    let asc = coins.sort((a, b) => a.Dollars - b.Dollars );

    res.send(asc);
}


// ----------- delete a user with the specified id -----------
exports.userDelete = (req, res) => {
    User.findByIdAndDelete(req.params.id)
        .then(data => {
            if (!data) {
                return res.status(404).send({
                    success: false,
                    message: "User not found with the id " + req.params.id
                });
            }
            res.send({
                success: true,
                message: "User successfully removed"
            });
        })
        .catch(err => {
            if (err.kind === "ObjectId" || err.name === "NotFound") {
                return res.status(404).send({
                    success: false,
                    message: "User not found with the id " + req.params.id
                });
            }
            return res.status(500).send({
                success: false,
                message: "You cannot delete the user with the id " + req.params.id
            });
        });
};

