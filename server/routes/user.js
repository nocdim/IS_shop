const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const { check, validationResult } = require('express-validator')

const urlencodedParser = bodyParser.urlencoded({ extended: false })

const userController = require('../controllers/userController')

router.get('/', userController.welcome) // Начальная страница (вход)

router.get('/register', userController.register) // регистрация
router.post('/register', urlencodedParser, [ // вывод данных о регистрации в объекте
    check('user_username', 'Your username must be 3+ character long')
        .exists()
        .isLength({ min: 3 }),
    check('user_email', 'Email is not valid')
        .isEmail()
        .normalizeEmail(),
    check('user_password', 'Your password must be 8+ character long')
        .exists()
        .isLength({ min: 8 }),
    check('user_password1', 'Your passwords must match').custom((value, { req }) => (value === req.body.user_password))
], userController.register_complete)

router.get('/login', userController.login) // вход
router.post('/login', urlencodedParser, [
    check('user_username', 'Field "Username" is empty')
        .exists()
        .isLength({ min: 1 }),
    check('user_password', 'Field "Password" is empty')
        .exists()
        .isLength({ min: 1 })
], userController.login_complete) // вход завершен

router.get('/shop', userController.shop) // страница магазина

router.get('/getproduct/:food_id', userController.get_product) // Добавление в корзину

router.get('/bakery', userController.bakery) // раздел

router.get('/cheese', userController.cheese) // раздел

router.get('/meat', userController.meat) // раздел

router.get('/fish', userController.fish) // раздел

router.get('/vegetables_fruits', userController.vegetables_fruits) // раздел

router.get('/coffee_tea', userController.coffee_tea) // раздел

router.get('/shopping_cart', userController.shopping_cart) // корзина покупок

router.get('/shopping_cart_delete/:id', userController.shopping_cart_delete) // удаление продукта из корзины

router.post('/buy', userController.buy) // оформление покупки

router.get('/logout', userController.logout) // выход из системы

module.exports = router