const mysql = require('mysql')
const { check, validationResult } = require('express-validator')
const e = require('express')
const sha256 = require('sha256')

let isAuth = false
let userUsername = ''
let userId = 0
let page = ''

//Создаем пул подключений (Connection Pool)
const pool = mysql.createPool({
    connectionLimit: 100,
    host: process.env.DB_HOST, // передаем конфигурацию через .env
    user: process.env.DB_USER, // передаем конфигурацию через .env
    password: process.env.DB_PASS, // передаем конфигурацию через .env
    database: process.env.DB_NAME  // передаем конфигурацию через .env
})

// 1-ая страница
exports.welcome = async (req, res) => {
    res.render('welcome', { title: 'Welcome', layout: 'start' })
}

// Страница регистрации
exports.register = async (req, res) => {
    res.render('register', { title: 'Welcome', layout: 'start' })
}

// Регистрация завершена
exports.register_complete = async (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        let errs = []
        for (let objs of errors.array()) {
            errs.push(' ' + objs.msg + ' ')
        }
        res.render('register', { errs, title: 'Welcome', layout: 'start' })
    }
    else {
        const { user_username, user_email, user_password } = req.body

        pool.getConnection((err, connection) => {
            if (err) throw err
            else console.log('Connected as ID ' + connection.threadId)

            connection.query('SELECT user_username, user_email FROM users WHERE user_username = ? OR user_email = ?', [user_username, user_email], (err, result) => {
                if (err) console.log(err)
                if (result.length > 0) {
                    return res.render('register', { warning: 'That username/email is already being used', title: 'Welcome', layout: 'start' })
                }
                else {
                    let hashedPassword = sha256(user_password)
                    //Query запросы к БД
                    connection.query('INSERT INTO users SET user_username = ?, user_email = ?, user_password = ?', [user_username, user_email, hashedPassword], (err) => {
                        connection.release()

                        if (!err) {
                            res.render('register', { success: 'Account has been created successfully', title: 'Welcome', layout: 'start' })
                        }
                        else {
                            console.log(err)
                        }
                    })
                }
            })
        })
    }
}

exports.login = async (req, res) => {
    res.render('login', { title: 'Welcome', layout: 'start' })

}

exports.login_complete = async (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        let errs = []
        for (let objs of errors.array()) {
            errs.push(' ' + objs.msg + ' ')
        }
        res.render('login', { errs, title: 'Welcome', layout: 'start' })
    }
    else {
        let { user_username, user_password } = req.body

        pool.getConnection((err, connection) => {
            if (err) throw err
            else console.log('Connected as ID ' + connection.threadId)

            //Query запросы к БД
            connection.query('SELECT user_id ,user_username, user_password, user_email FROM users WHERE user_username = ?', [user_username], (err, result) => {
                if (err) console.log(err)

                if (result.length > 0) {

                    if (!(sha256(user_password) === result[0].user_password)) {
                        return res.render('login', { warning: 'Incorrect login/password', title: 'Welcome', layout: 'start' })
                    }
                    else {
                        isAuth = true
                        userUsername = result[0].user_username,
                            userId = result[0].user_id
                        res.redirect('/shop')
                    }
                }
                else {
                    return res.render('login', { warning: 'No such user registered', title: 'Welcome', layout: 'start' })
                }
            })
        })
    }
}

exports.shop = async (req, res) => {
    if (isAuth) {
        let addedProduct = req.query.added

        pool.getConnection((err, connection) => {
            if (err) throw err
            else console.log('Connected as ID ' + connection.threadId)

            //Query запросы к БД
            connection.query('SELECT * FROM categories', [], (err, rows) => {
                connection.release()

                if (!err) {
                    res.render('shop', { rows, userUsername, addedProduct, title: 'Shopping', layout: 'shopping' })
                }
            })
        })
    }
    else {
        res.redirect('/')
    }
}

exports.get_product = async (req, res) => {
    if (isAuth) {
        page = req.url
        let addedProduct = req.query.added
        pool.getConnection((err, connection) => {
            if (err) throw err
            else console.log('Connected as ID ' + connection.threadId)

            //Query запросы к БД
            connection.query('SELECT * FROM products WHERE category_name = ? AND food_quantity > 0', [req.params.category_name], (err, rows) => {
                connection.release()

                if (!err) {
                    if (rows.length != 0) {
                        res.render('get_prod', { rows, addedProduct, userUsername, title: 'Shopping', layout: 'shopping' })
                    }
                    else {
                        res.render('out_of_stock', { userUsername, title: 'Shopping', layout: 'shopping' })
                    }
                }
                else {
                    console.log(err)
                }
            })
        })
    }
    else {
        res.redirect('/')
    }
}

exports.buy_product = async (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err
        else console.log('Connected as ID ' + connection.threadId)

        connection.query('UPDATE products SET food_quantity = food_quantity-1 WHERE food_id = ?', [req.params.food_id], (err, rows) => {
            connection.release()
            if (err) {
                console.log(err)
            }

            pool.getConnection((err, connection) => {
                if (err) throw err
                else console.log('Connected as ID ' + connection.threadId)

                connection.query('INSERT INTO products_orders SET food_id = ?', [req.params.food_id], (err, rows) => {
                    connection.release()

                    if (!err) {
                        let addedProduct = encodeURIComponent('Food item successfully added to your shopping cart.')

                        res.redirect('' + page + '?added=' + addedProduct)
                    }
                    else {
                        console.log(err)
                    }
                })
            })
        })
    })
}

exports.shopping_cart = async (req, res) => {

    if (isAuth) {
        pool.getConnection((err, connection) => {
            if (err) throw err
            else console.log('Connected as ID ' + connection.threadId)

            //Query запросы к БД
            connection.query('SELECT po.id, p.food_name, p.food_manufacturer, p.food_price FROM users u LEFT JOIN orders o ON o.user_id = u.user_id RIGHT JOIN products_orders po ON po.order_id = o.order_id LEFT JOIN products p ON p.food_id = po.food_id WHERE po.status = "cart"', [userId], (err, rows) => {
                connection.release()

                if (!err) {
                    if (rows.length != 0) {
                        res.render('shopping_cart', { rows, userUsername, title: 'Shopping', layout: 'shopping' })
                    }
                    else {
                        res.render('empty', { rows, userUsername, title: 'Shopping', layout: 'shopping' })
                    }
                }
                else {
                    console.log(err)
                }
            })
        })
    }
    else {
        res.redirect('/')
    }
}

exports.shopping_cart_delete = async (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err
        else console.log('Connected as ID ' + connection.threadId)

        connection.query('UPDATE products p LEFT JOIN products_orders po ON p.food_id = po.food_id SET p.food_quantity = p.food_quantity+1 WHERE po.id = ?', [req.params.id], (err, rows) => {
            connection.release()
            if (err) {
                console.log(err)
            }

            //Query запросы к БД
            pool.getConnection((err, connection) => {
                if (err) throw err
                else console.log('Connected as ID ' + connection.threadId)

                connection.query('DELETE FROM products_orders WHERE id = ?', [req.params.id], (err, rows) => {
                    connection.release()

                    if (!err) {
                        res.redirect('/shopping_cart')
                    }
                    else {
                        console.log(err)
                    }
                })
            })
        })
    })
}

exports.buy = async (req, res) => {

    const { order_pay_type } = req.body

    pool.getConnection((err, connection) => {
        if (err) throw err
        else console.log('Connected as ID ' + connection.threadId)

        connection.query('INSERT INTO orders SET user_id = ?, order_pay_type = ?, order_date = Now()', [userId, order_pay_type], (err) => {
            connection.release()

            if (err) console.log(err)
        })
    })

    pool.getConnection((err, connection) => {
        if (err) throw err
        else console.log('Connected as ID ' + connection.threadId)

        //Query запросы к БД
        connection.query('UPDATE products_orders SET status = "processing", order_id = (SELECT order_id FROM orders ORDER BY order_id DESC LIMIT 1) WHERE status = "cart" AND order_id IS NULL', (err, rows) => {
            connection.release()

            if (!err) {
                let success_buy = 'Your order is now processing. We will contact you through email as soon as possible!'
                res.render('success', { userUsername, success_buy, title: 'Shopping', layout: 'shopping' })
            }
            else {
                console.log(err)
            }
        })
    })
}

exports.logout = async (req, res) => {
    if (isAuth) {
        isAuth = false
        userUsername = ''
        userId = 0
        res.render('logout', { title: 'Welcome', layout: 'start' })
    }
    else {
        res.redirect('/')
    }
}