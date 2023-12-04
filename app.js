const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')

const app = express()
app.listen(3000,(req,res) => {
    console.log('listning to port 3000')
})
