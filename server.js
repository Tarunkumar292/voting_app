//Express
const express = require('express')
const app = express()
require('dotenv').config();

// database
const db = require('./db')

const bodyparser = require('body-parser')
app.use(bodyparser.json())
const PORT = process.env.PORT || 3000

//jwt
// const { jwtAuthMiddleware } = require('./jwt');

//routes
const userRoutes = require('./routes/userRoutes')
const candidateRoutes = require('./routes/candidateRoutes')

app.use('/user', userRoutes)
app.use('/candidate', candidateRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
