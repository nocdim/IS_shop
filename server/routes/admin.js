const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const { check, validationResult } = require('express-validator')


const urlencodedParser = bodyParser.urlencoded({ extended: false })

const adminController = require('../controllers/adminController')

router.get('/loginemployee', adminController.login_employee) // вход
router.post('/loginemployee', urlencodedParser, [
    check('user_username', 'Field "Username" is empty')
        .exists()
        .isLength({ min: 1 }),
    check('user_password', 'Field "Password" is empty')
        .exists()
        .isLength({ min: 1 })
], adminController.login_employee_complete) // вход завершен

// create, read, update, delete
router.get('/products', adminController.view) // Просмотр
router.post('/products', adminController.search) // Поиск

router.get('/addproduct', adminController.add_product) // Добавление
router.post('/addproduct', urlencodedParser, [
    check('category_name', 'Field "Type" is empty')
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
    check('food_price', 'Field "Price" is invalid')
        .exists()
        .isNumeric()
        .isFloat({ min: 0.1 }),
    check('food_comment', 'Field "Compounds" is empty')
        .exists()
        .isLength({ min: 1 }),
    check('food_quantity', 'Field "Quantity" is invalid')
        .exists()
        .isNumeric()
        .isInt({ min: 0 }),
], adminController.create_product) // Добавление

router.get('/categories', adminController.view_categories) // Просмотр

router.get('/addcategory', adminController.add_category) // Добавление
router.post('/addcategory', urlencodedParser, [
    check('category_name', 'Field "Name" is empty')
        .exists()
        .isLength({ min: 1 }),
    check('category_desc', 'Field "Description" is empty')
        .exists()
        .isLength({ min: 1 }),
    check('category_alt', 'Field "Alternative text" is empty')
        .exists()
        .isLength({ min: 1 }),
], adminController.create_category) // Добавление

router.get('/editproduct/:food_id', adminController.edit_product)  // Изменение
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
    check('food_price', 'Field "Price" is invalid')
        .exists()
        .isNumeric()
        .isFloat({ min: 0 }),
    check('food_comment', 'Field "Compounds" is empty')
        .exists()
        .isLength({ min: 1 }),
    check('food_quantity', 'Field "Quantity" is invalid')
        .exists()
        .isNumeric()
        .isInt({ min: 0 }),
], adminController.update_product) // Сохранение изменения

router.get('/viewproduct/:food_id', adminController.view_product) // Конкретный просмотр

router.get('/deleteproduct/:food_id', adminController.delete_product) // Удаление

router.get('/orders', adminController.view_orders) // просмотр заказов клиентов

router.get('/logout_admin', adminController.logout_admin) // Выход из системы (админ)

module.exports = router