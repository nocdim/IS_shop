const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')

const urlencodedParser = bodyParser.urlencoded({ extended: false })

const adminController = require('../controllers/adminController')

const validator = require('../middleware/validator')

router.get('/loginemployee', adminController.login_employee) // вход
router.post('/loginemployee', urlencodedParser, validator.login, adminController.login_employee_complete) // вход завершен

// create, read, update, delete
router.get('/products', adminController.view) // Просмотр
router.post('/products', adminController.search) // Поиск

router.get('/viewproduct/:food_id', adminController.view_product) // Конкретный просмотр

router.get('/addproduct', adminController.add_product) // Добавление
router.post('/addproduct', urlencodedParser, validator.product, adminController.create_product) // Добавление

router.get('/editproduct/:food_id', adminController.edit_product)  // Изменение
router.post('/editproduct/:food_id', urlencodedParser, validator.product, adminController.update_product) // Сохранение изменения

router.get('/deleteproduct/:food_id', adminController.delete_product) // Удаление

router.get('/categories', adminController.view_categories) // Просмотр

router.get('/addcategory', adminController.add_category) // Добавление
router.post('/addcategory', urlencodedParser, validator.category, adminController.create_category) // Добавление

router.get('/editcategory/:category_id', adminController.edit_category)  // Изменение
router.post('/editcategory/:category_id', urlencodedParser, validator.category, adminController.update_category) // Сохранение изменения

router.get('/deletecategory/:category_id', adminController.delete_category) // Удаление

router.get('/orders', adminController.view_orders) // просмотр заказов клиентов

router.get('/logout_admin', adminController.logout_admin) // Выход из системы (админ)

module.exports = router