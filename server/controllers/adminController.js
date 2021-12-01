const mysql = require('mysql')
const { check, validationResult } = require('express-validator')
const e = require('express')
const sha256 = require('sha256')

let adminIsAuth = false

//Создаем пул подключений (Connection Pool)
const pool = mysql.createPool({
    connectionLimit: 100,
    host: process.env.DB_HOST, // передаем конфигурацию через .env
    user: process.env.DB_USER, // передаем конфигурацию через .env
    password: process.env.DB_PASS, // передаем конфигурацию через .env
    database: process.env.DB_NAME  // передаем конфигурацию через .env
})

exports.login_employee = async (req, res) => {
    res.render('login_employee', { title: 'Welcome', layout: 'start' })
}
exports.login_employee_complete = async (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        let errs = []
        for (let objs of errors.array()) {
            errs.push(' ' + objs.msg + ' ')
        }
        res.render('login_employee', { errs, title: 'Welcome', layout: 'start' })
    }
    else {
        let { user_username, user_password } = req.body

        pool.getConnection((err, connection) => {
            if (err) throw err
            else console.log('Connected as ID ' + connection.threadId)


            //Query запросы к БД
            connection.query('SELECT user_username, user_password, user_status FROM users WHERE user_username = ?', [user_username], (err, result) => {
                if (err) console.log(err)

                if (result.length > 0) {

                    if (sha256(user_password) === result[0].user_password) {
                        if (result[0].user_status === 'admin') {
                            adminIsAuth = true
                            res.redirect('/products')
                        }
                        else {
                            return res.render('login_employee', { warning: 'No permission', title: 'Welcome', layout: 'start' })
                        }
                    }
                    else {
                        return res.render('login_employee', { warning: 'Incorrect login/password', title: 'Welcome', layout: 'start' })
                    }
                }
                else {
                    return res.render('login_employee', { warning: 'No such user registered', title: 'Welcome', layout: 'start' })
                }
            })
        })
    }
}

// показываем информацию
exports.view = async (req, res) => {

    if (adminIsAuth) {
        //Подключаемся к БД
        pool.getConnection((err, connection) => {
            if (err) throw err
            else console.log('Connected as ID ' + connection.threadId)

            //Query запросы к БД
            connection.query('SELECT * FROM products', (err, rows) => {
                connection.release()

                if (!err) {
                    let removedProduct = req.query.removed
                    res.render('home', { rows, removedProduct })
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

// Поиск
exports.search = async (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err
        else console.log('Connected as ID ' + connection.threadId)

        let search = req.body.search
        //Query запросы к БД
        connection.query('SELECT * FROM products WHERE food_name LIKE ? OR food_type LIKE ?', ['%' + search + '%', search], (err, rows) => {
            connection.release()

            if (!err) {
                if (rows.length != 0) {
                    res.render('home', { rows })
                }
                else {
                    res.render('not_found')
                }
            }
            else {
                console.log(err)
            }
        })
    })
}

// Новый 
exports.add_product = async (req, res) => {
    if (adminIsAuth) {
        res.render('add_prod')
    }
    else {
        res.redirect('/')
    }
}

exports.create_product = async (req, res) => {

    if (adminIsAuth) {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            let errs = []
            for (let objs of errors.array()) {
                errs.push(' ' + objs.msg + ' ')
            }
            res.render('add_prod', { errs })
        }
        else {
            const { food_name, food_comment, food_storage_conditions, food_manufacturer, food_price, food_type } = req.body

            pool.getConnection((err, connection) => {
                if (err) throw err
                else console.log('Connected as ID ' + connection.threadId)

                //Query запросы к БД
                connection.query('INSERT INTO products SET food_name = ?, food_comment = ?, food_storage_conditions = ?, food_manufacturer = ?, food_price = ?, food_type = ?', [food_name, food_comment, food_storage_conditions, food_manufacturer, food_price, food_type], (err, rows) => {
                    connection.release()

                    if (!err) {
                        res.render('add_prod', { alert: 'Food item added successfully.' })
                    }
                    else {
                        console.log(err)
                    }
                })
            })
        }
    }
    else {
        res.redirect('/')
    }
}

// Изменение 
exports.edit_product = async (req, res) => {

    if (adminIsAuth) {
        pool.getConnection((err, connection) => {
            if (err) throw err
            else console.log('Connected as ID ' + connection.threadId)

            //Query запросы к БД
            connection.query('SELECT * FROM products WHERE food_id = ?', [req.params.food_id], (err, rows) => {
                connection.release()

                if (!err) {
                    res.render('edit_prod', { rows })
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
// Обновление 
exports.update_product = async (req, res) => {

    if (adminIsAuth) {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            let errs = []
            for (let objs of errors.array()) {
                errs.push(' ' + objs.msg + ' ')
            }
            res.render('add_prod', { errs })
        }
        else {
            const { food_name, food_comment, food_storage_conditions, food_manufacturer, food_price, food_type } = req.body

            pool.getConnection((err, connection) => {
                if (err) throw err
                else console.log('Connected as ID ' + connection.threadId)

                //Query запросы к БД
                connection.query('UPDATE products SET food_name = ?, food_comment = ?, food_storage_conditions = ?, food_manufacturer = ?, food_price = ?, food_type = ? WHERE food_id = ?', [food_name, food_comment, food_storage_conditions, food_manufacturer, food_price, food_type, req.params.food_id], (err, rows) => {
                    connection.release()

                    if (!err) {
                        pool.getConnection((err, connection) => {
                            if (err) throw err
                            else console.log('Connected as ID ' + connection.threadId)

                            //Query запросы к БД
                            connection.query('SELECT * FROM products WHERE food_id = ?', [req.params.food_id], (err, rows) => {
                                connection.release()

                                if (!err) {
                                    res.render('edit_prod', { rows, alert: `${food_name} has been updated` })
                                }
                                else {
                                    console.log(err)
                                }
                            })
                        })
                    }
                    else {
                        console.log(err)
                    }
                })
            })
        }
    }
    else {
        res.redirect('/')
    }
}


// Удаление 
exports.delete_product = async (req, res) => {

    if (adminIsAuth) {
        pool.getConnection((err, connection) => {
            if (err) throw err
            else console.log('Connected as ID ' + connection.threadId)

            //Query запросы к БД
            connection.query('DELETE FROM products WHERE food_id = ?', [req.params.food_id], (err, rows) => {
                connection.release()

                if (!err) {
                    let removedProduct = encodeURIComponent('Food item successfully removed.')
                    res.redirect('/products?removed=' + removedProduct)
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

exports.view_product = async (req, res) => {

    if (adminIsAuth) {
        //Подключаемся к БД
        pool.getConnection((err, connection) => {
            if (err) throw err
            else console.log('Connected as ID ' + connection.threadId)

            //Query запросы к БД
            connection.query('SELECT * FROM products WHERE food_id = ?', [req.params.food_id], (err, rows) => {
                connection.release()

                if (!err) {
                    res.render('view_prod', { rows })
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

// НЕ НАЙДЕНО
exports.not_found = async (req, res) => {
    res.render('not_found')
}

exports.view_orders = async (req, res) => {

    if (adminIsAuth) {

        pool.getConnection((err, connection) => {
            if (err) throw err
            else console.log('Connected as ID ' + connection.threadId)
            connection.query('SELECT o.order_id, u.user_email, GROUP_CONCAT(p.food_name SEPARATOR ", ") AS products, SUM(p.food_price) AS price FROM orders o LEFT JOIN users u ON o.user_id = u.user_id LEFT JOIN products_orders po ON o.order_id = po.order_id LEFT JOIN products p ON po.food_id = p.food_id WHERE po.status = "processing" GROUP BY order_id HAVING COUNT(1) > 1', [], (err, rows) => {
                connection.release()
                if (!err) {
                    res.render('orders', { rows })
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


exports.logout_admin = async (req, res) => {
    if (adminIsAuth) {
        adminIsAuth = false
        res.render('logout_admin', { title: 'Welcome', layout: 'start' })
    }
    else {
        res.redirect('/')
    }
}