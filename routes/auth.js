const jwt = require("jsonwebtoken");
const Router = require("express").Router;
const router = new Router();

const User = require("../models/user");
const {SECRET_KEY} = require("../config");
const ExpressError = require("../expressError");

router.get("/", (req, res, next)=>{
    res.send("APP IS WORKING!!!")
})

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post("/login", async(req, res ,next)=>{
    try{
        let {username, password} = req.body
        if (await User.authenticate(username, password)){
        let token = jwt.sign({username}, SECRET_KEY)
        User.updateLoginTimestamp(username)
        return res.json({token})
       }else{
        throw new ExpressError(`unauthorize user`, 404)
       }  
    }
    catch(err){
        next (err)
    }
})

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post("/register", async (req, res, next)=>{
    try{
        let {username, password, first_name, last_name, phone} = req.body
        if (await User.register(username, password, first_name, last_name, phone)){
            User.updateLoginTimestamp(username)
            let token = jwt.sign({username}, SECRET_KEY)
            res.json({token})
        }
    }
    catch(err){
        next(err)
    }
})


module.exports = router;