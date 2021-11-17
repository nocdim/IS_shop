const express = require('express')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser') // middleware (прежде чем запрос обработается сервером, запрос проходит через middleware (является ли пользователь админом))
const mysql = require('mysql')


require('dotenv').config() //Конфигурация БД


const app = express()
const port = process.env.PORT || 5000

// Промежуточный разбор запроса bodyParser (parsing middleware)
// Parse application/x-www-form-urlencoded (разбираем входящий url запрос)
app.use(bodyParser.urlencoded({ extended: false }))

//Parse application/json (разбираем json)
app.use(bodyParser.json())


// Подгружаем статичные файлы
app.use(express.static('public'))

// Шаблонизатор (генерация html страниц через шаблоны) Templating Engine
app.engine('hbs', exphbs( { extname: '.hbs' } ))  // Настраиваем расширение файла (handlebars --> hbs)
app.set('views', './views') // указываем путь к директории с шаблонами
app.set('view engine', 'hbs')

//Создаем пул подключений (Connection Pool)
const pool = mysql.createPool({
    connectionLimit: 100,
    host:            process.env.DB_HOST, // передаем конфигурацию через .env
    user:            process.env.DB_USER, // передаем конфигурацию через .env
    password:        process.env.DB_PASS, // передаем конфигурацию через .env
    database:        process.env.DB_NAME
})

//Подключаемся к БД

pool.getConnection((err, connection) => {
    if(err) throw err
    else console.log('Connected as ID ' + connection.threadId)
})






//Маршрутизация (Routing)
const routes = require('./server/routes/user')
app.use('/', routes)




app.listen(port, () => {
    console.log('Server operating... PORT: ' + port)
})