import express from 'express'
import Page from './models/Page.mjs'

let router = express.Router()

/* 
LOOKUPS 
GET     /pages/:page - returns page
*/
router.get('/:page', async (req, res) => {
    let { page } = req.params    

    let foundpage = await Page.findOne({ title: page })
    if (foundpage == null) res.render("error", { error: "Could not find page " + page})

    res.render('page', { page: foundpage });    
})

export default router