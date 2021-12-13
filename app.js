const express = require('express')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser') // middleware (прежде чем запрос обработается сервером, запрос проходит через middleware (является ли пользователь админом))
const fileUpload = require('express-fileupload')

require('dotenv').config() //Конфигурация БД

const app = express()

// Промежуточный разбор запроса bodyParser (parsing middleware)
// Parse application/x-www-form-urlencoded (разбираем входящий url запрос)
app.use(bodyParser.urlencoded({ extended: false }))

//Parse application/json (разбираем json)
app.use(bodyParser.json())

app.use(fileUpload())

// Подгружаем статичные файлы
app.use(express.static('public'))

// Шаблонизатор (генерация html страниц через шаблоны) Templating Engine
app.engine('hbs', exphbs({ extname: '.hbs' }))  // Настраиваем расширение файла (handlebars --> hbs)

const directories = [
    './views/categories',
    './views/login',
    './views/logout',
    './views/main',
    './views/orders',
    './views/partials',
    './views/products',
    './views/register',
    './views/shop'
]

app.set('views', directories) // указываем путь к директории с представлениями
app.set('view engine', 'hbs')

//Маршрутизация (Routing) для пользователя
const user_routes = require('./server/routes/user')
app.use('/', user_routes)

//Маршрутизация (Routing) для админа
const admin_routes = require('./server/routes/admin')
app.use('/', admin_routes)

const port = process.env.PORT || 5000

app.listen(port, () => {
    console.log('Server operating... PORT: ' + port)
})