import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import Jimp from 'jimp'

import pages from './modules/pages.mjs'

const __filename = fileURLToPath(import.meta.url)
export const __dirname = path.dirname(__filename)

const app = express();
// await mongoose.connect('mongodb://localhost:27017/hotdog')

app.use(express.json({limit: '100mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000}));

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))

app.use(express.static(path.join(__dirname, 'public')))

app.use(express.urlencoded({ extended: true}))

app.use("/pages", pages)

app.post("/upload", (req, res) => { 
    console.log(req.body.slice(0, 20))

    req.body.image = req.body.image.replace(/^data:image\/png+;base64,/, "");
    req.body.image = req.body.image.replace(/ /g, '+');

    // Convert base64 to buffer => <Buffer ff d8 ff db 00 43 00 ...
    const buffer = Buffer.from(req.body.image, "base64")

    Jimp.read(buffer, (err, res) => {
        if (err) throw new Error(err);
        res.quality(5).write(path.join(__dirname, '../uploaded_images/out.png'));
    });


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
