const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')

const urlencodedParser = bodyParser.urlencoded({ extended: false })

const userController = require('../controllers/userController')

const validator = require('../middleware/validator')

router.get('/', userController.welcome) // Начальная страница (вход)

router.get('/register', userController.register) // регистрация
router.post('/register', urlencodedParser, validator.register, userController.register_complete)

router.get('/login', userController.login) // вход
router.post('/login', urlencodedParser, validator.login, userController.login_complete) // вход завершен

router.get('/shop', userController.shop) // страница магазина

router.get('/getproduct/:category_name', userController.get_product) // Конкретный просмотр

router.get('/buyproduct/:food_id', userController.buy_product) // Добавление в корзину

router.get('/shopping_cart', userController.shopping_cart) // корзина покупок

router.get('/shopping_cart_delete/:id', userController.shopping_cart_delete) // удаление продукта из корзины

router.post('/order_sent', userController.buy) // оформление покупки

router.get('/logout', userController.logout) // выход из системы

module.exports = router