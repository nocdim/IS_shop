const bodyParser = require('body-parser')
const mysql = require('mysql')
const { check, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const sha256 = require('sha256')
const e = require('express')

let userUsername = ''
let userEmail = ''
let userId = 0
let page = ''

//Создаем пул подключений (Connection Pool)
const pool = mysql.createPool({
    connectionLimit: 100,
    host:            process.env.DB_HOST, // передаем конфигурацию через .env
    user:            process.env.DB_USER, // передаем конфигурацию через .env
    password:        process.env.DB_PASS, // передаем конфигурацию через .env
    database:        process.env.DB_NAME  // передаем конфигурацию через .env
})

// показываем информацию (пользователей)
exports.view = (req, res) => {
//Подключаемся к БД
pool.getConnection((err, connection) => {
    if(err) throw err
    else console.log('Connected as ID ' + connection.threadId)

    //Query запросы к БД
    connection.query('SELECT * FROM products', (err, rows) => {
        connection.release()

        if (!err){
            let removedProduct = req.query.removed
            res.render('home', { rows, removedProduct })
        }
        else {
            console.log(err)
        }
    })
})

}

// Поиск
exports.search = (req, res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err
        else console.log('Connected as ID ' + connection.threadId)
    

        let search = req.body.search
        //Query запросы к БД
        connection.query('SELECT * FROM products WHERE food_name LIKE ? OR food_type LIKE ?', ['%' + search + '%', search], (err, rows) => {
            connection.release()
    
            if (!err){
                if (rows.length != 0){
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
exports.add_product = (req, res) => {
    res.render('add_prod')
}

exports.create_product = (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        let errs = []
        for(let objs of errors.array()){
            errs.push(' ' + objs.msg + ' ')
        }
        res.render('add_prod', {errs})
    }
    else {
        const { food_name, food_comment, food_storage_conditions, food_manufacturer, food_price, food_type } = req.body

        pool.getConnection((err, connection) => {
            if(err) throw err
            else console.log('Connected as ID ' + connection.threadId)
        
            //Query запросы к БД
            connection.query('INSERT INTO products SET food_name = ?, food_comment = ?, food_storage_conditions = ?, food_manufacturer = ?, food_price = ?, food_type = ?', [food_name, food_comment, food_storage_conditions, food_manufacturer, food_price, food_type] ,(err, rows) => {
                connection.release()
        
                if (!err){ 
                    res.render('add_prod', { alert: 'Food item added successfully.' })
                }
                else {
                    console.log(err)
                }
            })
        })
    }
    
}
// Изменение 
exports.edit_product = (req, res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err
        else console.log('Connected as ID ' + connection.threadId)
    
        //Query запросы к БД
        connection.query('SELECT * FROM products WHERE food_id = ?', [req.params.food_id], (err, rows) => {
            connection.release()
            
            if (!err){
                res.render('edit_prod', { rows })
            }
            else {
                console.log(err)
            }
        })
    })
}
// Обновление 
exports.update_product = (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        let errs = []
        for(let objs of errors.array()){
            errs.push(' ' + objs.msg + ' ')
        }
        res.render('add_prod', {errs})
    }
    else {
        const { food_name, food_comment, food_storage_conditions, food_manufacturer, food_price, food_type } = req.body

    pool.getConnection((err, connection) => {
        if(err) throw err
        else console.log('Connected as ID ' + connection.threadId)
    
        //Query запросы к БД
        connection.query('UPDATE products SET food_name = ?, food_comment = ?, food_storage_conditions = ?, food_manufacturer = ?, food_price = ?, food_type = ? WHERE food_id = ?', [food_name, food_comment, food_storage_conditions, food_manufacturer, food_price, food_type, req.params.food_id] ,(err, rows) => {
            connection.release()
    
            if (!err){
                pool.getConnection((err, connection) => {
                    if(err) throw err
                    else console.log('Connected as ID ' + connection.threadId)
                
                    //Query запросы к БД
                    connection.query('SELECT * FROM products WHERE food_id = ?', [req.params.food_id], (err, rows) => {
                        connection.release()
                
                        if (!err){
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


// Удаление 
exports.delete_product = (req, res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err
        else console.log('Connected as ID ' + connection.threadId)
    
        //Query запросы к БД


        connection.query('DELETE FROM products WHERE food_id = ?', [req.params.food_id], (err, rows) => {
            connection.release()
    
            if (!err){
                let removedProduct = encodeURIComponent('Food item successfully removed.')
                res.redirect('/products?removed=' + removedProduct)
            }
            else {
                console.log(err)
            }
        })
    })
}

exports.view_product = (req, res) => {
    //Подключаемся к БД
    pool.getConnection((err, connection) => {
        if(err) throw err
        else console.log('Connected as ID ' + connection.threadId)
    
        //Query запросы к БД
        connection.query('SELECT * FROM products WHERE food_id = ?', [req.params.food_id], (err, rows) => {
            connection.release()
    
            if (!err){
                res.render('view_prod', { rows })
            }
            else {
                console.log(err)
            }
        })
    })
    
    }

// НЕ НАЙДЕНО
exports.not_found = (req, res) => {
    res.render('not_found')
}

// 1-ая страница
exports.welcome = (req, res) => {
    userUsername = ''
    userEmail = ''
    res.render('welcome', { title: 'Welcome', layout: 'start' })
}

// Страница регистрации
exports.register = (req, res) => {
    res.render('register', { title: 'Welcome', layout: 'start' })
}

// Регистрация завершена
exports.register_complete = (req, res) => {
    
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        let errs = []
        for(let objs of errors.array()){
            errs.push(' ' + objs.msg + ' ')
        }
        res.render('register', {errs, title: 'Welcome', layout: 'start' })
    }
    else {
        const { user_username, user_email, user_password } = req.body

    pool.getConnection((err, connection) => {
        if(err) throw err
        else console.log('Connected as ID ' + connection.threadId)

        connection.query('SELECT user_username, user_email FROM users WHERE user_username = ? OR user_email = ?', [user_username, user_email], (err, result) => {
            if(err) console.log(err)
            if(result.length > 0){
                return res.render('register', {warning: 'That username/email is already being used', title: 'Welcome', layout: 'start'})
            }
            else {
                let hashedPassword = sha256(user_password)
                //Query запросы к БД
        connection.query('INSERT INTO users SET user_username = ?, user_email = ?, user_password = ?', [user_username, user_email, hashedPassword] ,(err) => {
            connection.release()
    
            if (!err){ 
                res.render('register', {success: 'Account has been created successfully', title: 'Welcome', layout: 'start' })
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
    
exports.login = (req, res) => {
    res.render('login', { title: 'Welcome', layout: 'start' })
    
}

exports.login_complete = (req, res) => {



    const errors = validationResult(req)
    if(!errors.isEmpty()){
        let errs = []
        for(let objs of errors.array()){
            errs.push(' ' + objs.msg + ' ')
        }
        res.render('login', {errs, title: 'Welcome', layout: 'start' })
    }
    else {
        let { user_username, user_password } = req.body

        pool.getConnection((err, connection) => {
            if(err) throw err
            else console.log('Connected as ID ' + connection.threadId)
            
    
            //Query запросы к БД
            connection.query('SELECT user_id ,user_username, user_password, user_email FROM users WHERE user_username = ?', [user_username], (err, result) => {
                if(err) console.log(err)
    
                if(result.length > 0){
    
                    if(!(sha256(user_password) === result[0].user_password)){
                        return res.render('login', {warning: 'Incorrect login/password', title: 'Welcome', layout: 'start'})
                    }
                    else {
                        userUsername = result[0].user_username
                        userEmail = result[0].user_email
                        userId = result[0].user_id  
                        res.redirect('/shop')
                    }
                }
                else {
                    return res.render('login', {warning: 'No such user registered', title: 'Welcome', layout: 'start'})
                }
            })
        })
    }
    
}

exports.shop = (req, res) => {
    

    let addedProduct = req.query.added
    res.render('shop', {userUsername, addedProduct, title: 'Shopping', layout: 'shopping' })
}

exports.get_product = (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err
        else console.log('Connected as ID ' + connection.threadId)
    
        //Query запросы к БД
                if (!err){ 
                    pool.getConnection((err, connection) => {
                        if(err) throw err
                        else console.log('Connected as ID ' + connection.threadId)

                        connection.query('INSERT INTO products_orders SET food_id = ?', [req.params.food_id] ,(err, rows) => {
                            connection.release()
    
                            if (!err){
                                let addedProduct = encodeURIComponent('Food item successfully added to your shopping cart.')
                               
                                res.redirect('' + page + '?added=' + addedProduct)
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
        }
           

exports.login_employee = (req, res) => {
    res.render('login_employee', { title: 'Welcome', layout: 'start' })
}
exports.login_employee_complete = (req, res) => {

    const errors = validationResult(req)
    if(!errors.isEmpty()){
        let errs = []
        for(let objs of errors.array()){
            errs.push(' ' + objs.msg + ' ')
        }
        res.render('login_employee', {errs, title: 'Welcome', layout: 'start' })
    }
    else {
        let { user_username, user_password } = req.body

        pool.getConnection((err, connection) => {
            if(err) throw err
            else console.log('Connected as ID ' + connection.threadId)
            
            
            //Query запросы к БД
            connection.query('SELECT user_username, user_password, user_status FROM users WHERE user_username = ?', [user_username], (err, result) => {
                if(err) console.log(err)
    
                if(result.length > 0){
    
                    if(sha256(user_password) === result[0].user_password){
                        if (result[0].user_status === 'admin'){
                            res.redirect('/products')
                        }
                        else {
                            return res.render('login_employee', {warning: 'No permission', title: 'Welcome', layout: 'start'})
                        }
                    }
                    else {
                        return res.render('login_employee', {warning: 'Incorrect login/password', title: 'Welcome', layout: 'start'})
                    }
                }
                else {
                    return res.render('login_employee', {warning: 'No such user registered', title: 'Welcome', layout: 'start'})
                }
            })
        })
    }
}

exports.bakery = (req, res) => {
    page = req.url
    let addedProduct = req.query.added
    pool.getConnection((err, connection) => {
        if(err) throw err
        else console.log('Connected as ID ' + connection.threadId)
    
        //Query запросы к БД
        connection.query('SELECT * FROM products WHERE food_type = "bakery"', (err, rows) => {
            connection.release()
    
            if (!err){
                if (rows.length != 0){
                    res.render('products/bakery', {rows, addedProduct, userUsername, title: 'Shopping', layout: 'shopping' })
                }
                else {
                    res.render('not_found', {rows, userUsername, title: 'Shopping', layout: 'shopping' })
                }
            }
            else {
                console.log(err)
            }
        })
    })
    
}

exports.cheese = (req, res) => {
    page = req.url
    let addedProduct = req.query.added
    pool.getConnection((err, connection) => {
        if(err) throw err
        else console.log('Connected as ID ' + connection.threadId)
    
        //Query запросы к БД
        connection.query('SELECT * FROM products WHERE food_type = "cheese"', (err, rows) => {
            connection.release()
    
            if (!err){
                if (rows.length != 0){
                    res.render('products/cheese', {rows, addedProduct, userUsername, title: 'Shopping', layout: 'shopping' })
                }
                else {
                    res.render('not_found', {rows, userUsername, title: 'Shopping', layout: 'shopping' })
                }
            }
            else {
                console.log(err)
            }
        })
    })
    
}

exports.meat = (req, res) => {
    page = req.url
    let addedProduct = req.query.added
    pool.getConnection((err, connection) => {
        if(err) throw err
        else console.log('Connected as ID ' + connection.threadId)
    
        //Query запросы к БД
        connection.query('SELECT * FROM products WHERE food_type = "meat"', (err, rows) => {
            connection.release()
    
            if (!err){
                if (rows.length != 0){
                    res.render('products/meat', {rows, addedProduct, userUsername, title: 'Shopping', layout: 'shopping' })
                }
                else {
                    res.render('not_found', {rows, userUsername, title: 'Shopping', layout: 'shopping' })
                }
            }
            else {
                console.log(err)
            }
        })
    })
    
}

exports.fish = (req, res) => {
    page = req.url
    let addedProduct = req.query.added
    pool.getConnection((err, connection) => {
        if(err) throw err
        else console.log('Connected as ID ' + connection.threadId)
    
        //Query запросы к БД
        connection.query('SELECT * FROM products WHERE food_type = "fish"', (err, rows) => {
            connection.release()
    
            if (!err){
                if (rows.length != 0){
                    res.render('products/fish', {rows, addedProduct, userUsername, title: 'Shopping', layout: 'shopping' })
                }
                else {
                    res.render('not_found', {rows, userUsername, title: 'Shopping', layout: 'shopping' })
                }
            }
            else {
                console.log(err)
            }
        })
    })   
}

exports.vegetables_fruits = (req, res) => {
    page = req.url
    let addedProduct = req.query.added
    pool.getConnection((err, connection) => {
        if(err) throw err
        else console.log('Connected as ID ' + connection.threadId)
    
        //Query запросы к БД
        connection.query('SELECT * FROM products WHERE food_type = "Fruits/Vegetables"', (err, rows) => {
            connection.release()
    
            if (!err){
                if (rows.length != 0){
                    res.render('products/vegetables_fruits', {rows, addedProduct, userUsername, title: 'Shopping', layout: 'shopping' })
                }
                else {
                    res.render('not_found', {rows, userUsername, title: 'Shopping', layout: 'shopping' })
                }
            }
            else {
                console.log(err)
            }
        })
    })
    
}

exports.coffee_tea = (req, res) => {
    page = req.url
    let addedProduct = req.query.added
    pool.getConnection((err, connection) => {
        if(err) throw err
        else console.log('Connected as ID ' + connection.threadId)
    
        //Query запросы к БД
        connection.query('SELECT * FROM products WHERE food_type = "Coffee/Tea"', (err, rows) => {
            connection.release()
    
            if (!err){
                if (rows.length != 0){
                    res.render('products/coffee_tea', {rows, addedProduct, userUsername, title: 'Shopping', layout: 'shopping' })
                }
                else {
                    res.render('not_found', {rows, userUsername, title: 'Shopping', layout: 'shopping' })
                }
            }
            else {
                console.log(err)
            }
        })
    })
    
}

exports.shopping_cart = (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err
        else console.log('Connected as ID ' + connection.threadId)
    
        //Query запросы к БД
        connection.query('SELECT u.user_email, o.order_id, po.id, p.food_name, p.food_manufacturer, p.food_price FROM users u LEFT JOIN orders o ON o.user_id = u.user_id RIGHT JOIN products_orders po ON po.order_id = o.order_id LEFT JOIN products p ON p.food_id = po.food_id WHERE po.status = "cart"', [], (err, rows) => {
            connection.release()
    
            if (!err){
                res.render('shopping_cart', {rows, userUsername, title: 'Shopping', layout: 'shopping' })
            }
            else {
                console.log(err)
            }
        })
    })
                
}

exports.shopping_cart_delete = (req, res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err
        else console.log('Connected as ID ' + connection.threadId)
    
        //Query запросы к БД


        connection.query('DELETE FROM products_orders WHERE id = ?', [req.params.id], (err, rows) => {
            connection.release()
    
            if (!err){
                res.redirect('/shopping_cart')
            }
            else {
                console.log(err)
            }
        })
    })
}

exports.buy = (req, res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err
        else console.log('Connected as ID ' + connection.threadId)

        connection.query('INSERT INTO orders SET user_id = ?', [userId] ,(err, rows) => {
            connection.release()
        })
    })
    
        pool.getConnection((err, connection) => {
            if(err) throw err
            else console.log('Connected as ID ' + connection.threadId)
                
        //Query запросы к БД
        connection.query('UPDATE products_orders SET status = "processing", order_id = (SELECT order_id FROM orders ORDER BY order_id DESC LIMIT 1) WHERE status = "cart" AND order_id IS NULL', (err, rows) => {
            connection.release()
            
            if (!err){
                let success_buy = 'Your order is now processing. We will contact you through email as soon as possible!'
                res.render('shopping_cart', {userUsername, success_buy, title: 'Shopping', layout: 'shopping' })
            }
            else {
                console.log(err)
            }
        })
    })
}

exports.view_orders = (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err
        else console.log('Connected as ID ' + connection.threadId)
    
        //Query запросы к БД
        connection.query('SELECT u.user_email, o.order_id, po.id, p.food_name, p.food_manufacturer, p.food_price FROM users u LEFT JOIN orders o ON o.user_id = u.user_id RIGHT JOIN products_orders po ON po.order_id = o.order_id LEFT JOIN products p ON p.food_id = po.food_id WHERE po.status = "processing"', [], (err, rows) => {
            connection.release()

            if (!err){
                res.render('orders', { rows })
            }
            else {
                console.log(err)
            }
        })
    })
                
}
