const express = require('express')
const { addImage } = require('../controllers/awsController')

const router = express.Router()

router.post('/image',addImage)