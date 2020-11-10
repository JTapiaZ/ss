const fetch = require("node-fetch");

// Get all the ids of the coins
exports.getCoins = (req) => {
    
    const {monedaPreferida} = req.infoToken;
    // USD - EUR - ARS
    let monedaUser = monedaPreferida;
    let url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${monedaUser}&order=market_cap_desc&per_page=100&page=1&sparkline=false`
    
    return fetch(url)
        .then(response => response.json())
        .then(data => {
            
            let array=[];
            
            data.forEach(element => {
                const {id} = element;
                array.push(id)
            });

            return array;
        })

}

// Get all the info of the user's coins
exports.fetchAllInfo = (monedaPreferida) => {
    
    const monedaPref = monedaPreferida;
    // USD - EUR - ARS
    let monedaUser = monedaPref;
    let url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${monedaUser}&order=market_cap_desc&per_page=100&page=1&sparkline=false`
    return fetch(url)
        .then(response => response.json())
        .then(data => {
            const values=[];
            data.map(elemnt => {
                const data = elemnt;
                values.push(data);  
            })
           return values;
        })
    
}

// Get all the prices of the user's coins
exports.fetchPriceCoins = (idsUser) => {

    return idsUser.map(async (item) => {
        let url = `https://api.coingecko.com/api/v3/coins/${item.id}`;

        const resultado = await fetch(url)
        .then(response => response.json())
        .then(data => {
            let values = [];
            const {ars, usd, eur} = data.market_data.current_price;
            
            values.push(ars);  
            values.push(usd);  
            values.push(eur);  

            return values;
        })

        // console.log(resultado, 'resultados');
        return resultado;
    })

}



