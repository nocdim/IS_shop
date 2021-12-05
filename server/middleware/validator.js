const { check } = require('express-validator')

exports.login = [
    check('user_username', 'Field "Username" is empty')
        .exists()
        .isLength({ min: 1 }),
    check('user_password', 'Field "Password" is empty')
        .exists()
        .isLength({ min: 1 })
]

exports.register = [ // вывод данных о регистрации в объекте
    check('user_username', 'Your username must be 3+ character long')
        .exists()
        .isLength({ min: 3 }),
    check('user_email', 'Email is not valid')
        .isEmail()
        .normalizeEmail(),
    check('user_password', 'Your password must be 8+ character long')
        .exists()
        .isLength({ min: 8 }),
    check('user_password1', 'Your passwords must match')
        .custom((value, { req }) => (value === req.body.user_password))
]

exports.product = [
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
]

exports.category = [
    check('category_name', 'Field "Name" is empty')
        .exists()
        .isLength({ min: 1 }),
    check('category_desc', 'Field "Description" is empty')
        .exists()
        .isLength({ min: 1 }),
    check('category_alt', 'Field "Alternative text" is empty')
        .exists()
        .isLength({ min: 1 }),
]
