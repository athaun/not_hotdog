import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import Jimp from 'jimp'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url)
export const __dirname = path.dirname(__filename)

const app = express();

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))

app.use(express.static(path.join(__dirname, 'public')))

app.use(express.urlencoded({ extended: true }))

app.post("/upload", (req, res) => {
    console.log(req.body.image.slice(0, 30) + "...")

    let webp = false;
    let id = uuidv4()
    let fn = path.join(__dirname, `../uploaded_images/img_${id}.png`)

    // Remove the data:image/*/;base64, from the beginning of the string
    if (req.body.image.includes("data:image/jpeg")) {
        req.body.image = req.body.image.replace(/^data:image\/jpeg+;base64,/, "");
    } else if (req.body.image.includes("data:image/png")) {
        req.body.image = req.body.image.replace(/^data:image\/png+;base64,/, "");
    } else if (req.body.image.includes("data:image/webp")) {
        webp = true;
        req.body.image = req.body.image.replace(/^data:image\/webp+;base64,/, "");
        
        // Replace all spaces with + signs
        req.body.image = req.body.image.replace(/ /g, '+');

        // Save the wepb image to a buffer
        const buffer = Buffer.from(req.body.image, 'base64');

        // Convert the wepb buffer to a png
        sharp(buffer)
        .png()
        .toBuffer()
        .then(function (outputBuffer) {
            // Save the png buffer to a file
            fs.writeFileSync(fn, outputBuffer);
            console.log("webp conversion completed");
        })
        .catch(function (err) {
            console.log("An error occurred converting wepb: ", err);
            res.send("An error occurred converting wepb: ", err);
            return;
        });
    }

    if (!webp) {
        // Replace all spaces with + signs
        req.body.image = req.body.image.replace(/ /g, '+');

        const buffer = Buffer.from(req.body.image, "base64")

        Jimp.read(buffer, (err, res) => {
            if (err) throw new Error(err);
            res.quality(5).write(fn);
        });
    }

    res.send("Image uploaded successfully")
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
