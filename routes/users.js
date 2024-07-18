const Router = require("express").Router;
const router = new Router();
const {ensureLoggedIn, ensureCorrectUser} = require("../middleware/auth")
const User = require("../models/user")
const ExpressError = require("../expressError");
const { json } = require("body-parser");



/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/

router.get("/", ensureLoggedIn, async(req,res,next) =>{
    try{
        let result = await User.all();
        return res.json({result});
    }
    catch(err){
        next(err)
    }
})

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/

router.get("/:username", ensureCorrectUser, async (req, res, next)=>{
    try{
        let username = req.params.username
        let result = await User.get(username)
        if(result.rows.length === 0){
            throw new ExpressError(`${username} cannot be found`, 400)
        }

        return res.json({result})
    }
    catch(err){
        next(err)
    }
})

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get("/:username/to", ensureCorrectUser, async (req,res,next)=>{
    try{
        let username = req.params.username;
        let msg = await User.messagesTo(username);
        return res.json({messsage: msg})
        

    }
    catch(err){
        next(err)
    }
})
/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get("/:username/from", ensureCorrectUser, async(req, res, next)=>{
    try{
        let username = req.params.username
        let msg = await User.messagesFrom(username)
        return res.json({message: msg})
    }
    catch(err){
        return next(err)
    }
})


module.exports = router;