import mongoose from 'mongoose'

const User = mongoose.model('User', {
    email: { 
        type: String,
        required: true 
    },
    encryptedPassword: { 
        type: String
    },
    role: { 
        type: String, 
        enum: ['admin', 'restricted'],
        required: true 
    },
})

export default User