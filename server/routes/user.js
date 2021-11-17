const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser') // middleware (прежде чем запрос обработается сервером, запрос проходит через middleware (является ли пользователь админом))
const { check, validationResult } = require('express-validator')

const urlencodedParser = bodyParser.urlencoded({ extended: false })

const userController = require('../controllers/userController')

// create, find, update, delete
router.get('/products', userController.view) // Просмотр
router.post('/products', userController.search) // Поиск

router.get('/addproduct', userController.add_product) // Добавление
router.post('/addproduct', urlencodedParser, [
    check('food_type', 'Field "Type" is empty')
        .exists()
        .isLength({ min: 1 }),
    check('food_name', 'Field "Name" is empty')
        .exists()
        .isLength({ min: 1 }),
    check('food_storage_conditions', 'Field "Compounds" is empty')
        .exists()
        .isLength({ min: 1 }),
    check('food_manufacturer', 'Field "Manufacturer" is empty')
        .exists()
        .isLength({ min: 1 }),
    check('food_price', 'Field "Price" must consist of numbers')
        .exists()
        .isNumeric(),
    check('food_comment', 'Field "Compounds" is empty')
        .exists()
        .isLength({ min: 1 }),
], userController.create_product) // Добавление

router.get('/editproduct/:food_id', userController.edit_product)  // Изменение
router.post('/editproduct/:food_id', urlencodedParser, [
    check('food_name', 'Field "Name" is empty')
        .exists()
        .isLength({ min: 1 }),
    check('food_storage_conditions', 'Field "Compounds" is empty')
        .exists()
        .isLength({ min: 1 }),
    check('food_manufacturer', 'Field "Manufacturer" is empty')
        .exists()
        .isLength({ min: 1 }),
    check('food_price', 'Field "Price" must consist of numbers')
        .exists()
        .isNumeric(),
    check('food_comment', 'Field "Compounds" is empty')
        .exists()
        .isLength({ min: 1 }),
], userController.update_product) // Сохранение изменения

router.get('/viewproduct/:food_id', userController.view_product) // Конкретный просмотр

router.get('/deleteproduct/:food_id', userController.delete_product) // Удаление

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
],userController.login_complete) // вход завершен

router.get('/shop', userController.shop) // страница магазина

router.get('/getproduct/:food_id', userController.get_product) // Добавление в корзину




router.get('/loginemployee', userController.login_employee) // вход
router.post('/loginemployee', urlencodedParser, [
    check('user_username', 'Field "Username" is empty')
        .exists()
        .isLength({ min: 1 }),
    check('user_password', 'Field "Password" is empty')
        .exists()
        .isLength({ min: 1 })
], userController.login_employee_complete) // вход завершен

router.get('/bakery', userController.bakery) // раздел

router.get('/cheese', userController.cheese) // раздел

router.get('/meat', userController.meat) // раздел

router.get('/fish', userController.fish) // раздел

router.get('/vegetables_fruits', userController.vegetables_fruits) // раздел

router.get('/coffee_tea', userController.coffee_tea) // раздел

router.get('/shopping_cart', userController.shopping_cart) // корзина покупок

router.get('/shopping_cart_delete/:id', userController.shopping_cart_delete) // удаление продукта из корзины

router.get('/buy', userController.buy) // оформление покупки

router.get('/orders', userController.view_orders) // вход



module.exports = router