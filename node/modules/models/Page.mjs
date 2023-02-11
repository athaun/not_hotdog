import mongoose from 'mongoose'

const Page = mongoose.model('Page', {
    title: String,
    searchDescription: String,
    content: String,
})

export default Page