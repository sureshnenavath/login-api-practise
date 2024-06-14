const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')
const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'goodreads.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

// Get Books API
app.get('/books/', async (request, response) => {
  const getBooksQuery = `
  SELECT
    *
  FROM
    book
  ORDER BY
    book_id;`
  const booksArray = await db.all(getBooksQuery)
  response.send(booksArray)
})

//Regester API
app.post('/users/', async (request, response) => {
  const {username, name, password, gender, location} = request.body
  const encryptPass = await bcrypt.hash(password, 10)
  let userCheck = await db.get(
    `SELECT * FROM user WHERE username = '${username}'`,
  )

  if (userCheck === undefined) {
    let query = `INSERT INTO
    user (username, name, password, gender, location)
  VALUES
    (
      '${username}',
      '${name}',
      '${encryptPass}',
      '${gender}',
      '${location}'  
    );`
    let result = await db.run(query)
    console.log('Data inserted succesfully')
    response.send('Data inserted succesfully')
  } else {
    response.status(400)
    console.log('Alredy username is exist')
    response.send('user name alredy exitst')
  }
})

//Login API

app.post('/login/', async (request, response) => {
  let {username, password} = request.body
  let retriveUserName = await db.get(
    `SELECT * FROM user WHERE username = '${username}'`,
  )
  let retrivePassword = await db.get(
    `SELECT * FROM user WHERE username = '${username}'`,
  )
  if (retriveUserName === undefined) {
    console.log('username is not exist')
    response.status(400)
    response.send('user name is not exist')
  } else {
    let passwordConvert = await bcrypt.compare(
      password,
      retrivePassword.password,
    )
    if (passwordConvert === true) {
      console.log('Login success')
      response.send('Login Success')
    } else {
      response.status(400)
      console.log('Invalid password')
      response.send('Invalid password')
    }
  }
})
