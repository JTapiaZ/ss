const express = require('express');
const router = express.Router();

// --------- Import the controllers ----------
const userController = require('../Controllers/userController');
const { userRegister,  userLogin } = require("../Utils/authUser");
const { checkToken } = require('../Utils/authUser');


//Users List Route
router.route('/list').get(userController.allUsers);

//User Registration Route
router.route('/registerUser').post(userRegister);

//User Login Route
router.route('/loginUser').post(userLogin);

//User Add Coins Route
router.route('/addCoins').put(checkToken, userController.addCoins);

//List currency information with user's preferred currency 
router.route("/allCoins").get(checkToken, userController.allCoins);

//List user coins with information, descendant default
router.route('/myCoins').get(checkToken, userController.findUserCoins);

//List user coins with information, upward default
router.route('/myCoinsAsc').get(checkToken, userController.findUserCoinsAsc);

//User Delete Route
router.route('/:id').delete(userController.userDelete);


module.exports = router;
