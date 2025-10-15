const Log = require('../models/log')

const logUserAction = async ( req, res ) => {
    
    try {

        const userId = req.user._id
        const { event, metadata } = req.body

        await Log.create({
            user: userId,
            event: event,
            metadata: metadata,
            timestamp: new Date()
        })

        res.status(200).json({success: true})

    } catch (error) {
        res.status(500).json({success: false, message: "Server Error"})
    }


}


module.exports = { logUserAction }