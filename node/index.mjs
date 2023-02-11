import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'

import pages from './modules/pages.mjs'

const __filename = fileURLToPath(import.meta.url)
export const __dirname = path.dirname(__filename)

const app = express();
// await mongoose.connect('mongodb://localhost:27017/hotdog')


app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))

app.use(express.static(path.join(__dirname, 'public')))

app.use(express.json())
app.use(express.urlencoded({ extended: true}))

app.use("/pages", pages)

app.post("/upload", (req, res) => { 
    console.log(req.body)
})

app.get('/', (req, res) => {
    res.render("home")
})

app.all("*", (req, res) => {
    res.render("error", { error: `<h1>404</h1><br><p>The page you are looking for doesn't exist.</p>` })
})

app.listen(8090, () => {
    console.log("Listening")
})

export default app