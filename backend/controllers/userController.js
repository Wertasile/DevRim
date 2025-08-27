const User = require("../models/user")

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const saltRounds = 10;
require('dotenv').config()

const fetchUser = async (req, res) => {
    try {
        const id = req.params.userid
        const data = await User.findOne({_id:id}).exec()
        res.send(data)
    } catch (error) {
        console.log(error)
    }
}

const createUser = async (req, res) => {
    try {
        const { email, password, username } = req.body
        bcrypt.hash(password, saltRounds, async function(err, hash) {
            const data = await User.create({
            email: email,
            username: username,
            timestamp: Date.now(),
            password: hash,
            status: "",
            bio: "",
            posts : []
            })

            res.redirect("http://localhost:5500/frontend/Pages/Home");
        });
        
        
    } catch (error) {
        console.log(error)
    }
}

const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body
        const data = await User.findOne({email: email}).exec()
        
        if (!data){
            return res.status(401).send("User cannot be found. Produce new email")
        }
        const hashed_pass = data.password
        // bcrypt.compare(password, hash, function(err, result) {
        //     if (result===true){
        //         res.redirect("http://localhost:5500/frontend/Pages/Home");
        //     } else{
        //         res.status(404).send('Sorry, we cannot find that!')
        //     }
        // });
        const valid = await bcrypt.compare(password, hashed_pass);

        if (!valid){
            return res.status(401).send('Invalid Username or Password');
        }

        const accessToken = jwt.sign({ id: data._id }, process.env.SECRET_KEY, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: data._id }, process.env.SECRET_KEY, { expiresIn: '7d'});

        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure:false,sameSite: 'Lax', maxAge: 7 * 24 * 60 * 60 * 1000})

        res.json({accessToken, id:data._id})
        
    } catch (error) {
        console.log(error)
    }
}

const logoutUser = async (req, res) => {
    res.clearCookie('refreshToken', { httpOnly: true, secure:false,sameSite: 'Lax', maxAge: 7 * 24 * 60 * 60 * 1000})
    return res.json({ message: 'Logged out' });

}

const deleteUser = async (req, res) => {
    try {
        const id = req.params._id
        const data = await User.findByIdAndDelete(id).exec()
        res.send(data)
    } catch (error) {
        console.log(error)
    }
}

module.exports = {fetchUser, createUser, loginUser, logoutUser, deleteUser}