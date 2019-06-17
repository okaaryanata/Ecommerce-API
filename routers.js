const express = require('express');
const router = express.Router();
const User = require('./models/user');
const Item = require('./models/item');
const Basket = require('./models/basket');
var jwt = require('jsonwebtoken');

// Universal routers
router.get('/list-items', function(req,res){
    res.send('Get Items')
});

router.post('/login', function(req,res){
    User.findOne({
        name: req.body.name,
        password: req.body.password
    }).exec(function(err,user){
        if (user){
            const token = jwt.sign({user},"secret_key");
            res.send({
                method:"GET",
                message: "Success login",
                token : token
            });
        } else{
            res.status(404).send({
                method:"GET",
                message: "User not found, username or pass wrong"
            });
        }
    });
});

router.post('/signup', function(req,res,next){
    User.findOne({name: req.body.name}).exec(function(err,user){
        if (user){
            res.status(400).send({
                method: "POST",
                message: "Username already exist"
            })
        } else {
            User.create(req.body)
            .then(function(result){
                res.send({
                    method : "POST",
                    message : "Success add user",
                    result: result
                });
            })
            .catch(next);
        }
    })
});

router.delete('/delete-user/:id', function(req,res,next){
    User.findOne({_id: req.params.id}).exec(function(err,user){
        if (!user){
            res.status(404).send({
                method: "DELETE",
                message: "User not found"
            })
        } else {
            User.findOneAndRemove({_id:req.params.id}).then(function(result){
                res.send({
                    method: "DELETE",
                    message : "Success delete user",
                    result : result
                });
            })
            .catch(next);
        }
    });
});

// merchants routers
router.post('/add-item', ensureToken, function(req,res,next){
    jwt.verify(req.token, "secret_key", function(err,user){
        if(err){
            res.status(403).send({
                method: "POST add item",
                message: "Token error"
            });
        } else {
            console.log(user);
            if (user["user"]["role"] === 2){
                Item.findOne({
                    name: req.body.name,
                    merchant_id: user["user"]["_id"],
                }).exec(function(err,item){
                    if(item){
                        res.status(400).send({
                            method:"POST add item",
                            message: "Item already exist"
                        })
                    } else{
                        const reqBody = req.body;
                        const newItem = {
                            name: reqBody.name,
                            item_code: reqBody.item_code,
                            merchant_id: user["user"]["_id"],
                            color: reqBody.color
                        }
                        Item.create(newItem)
                        .then(function(result){
                            res.send({
                                method:"POST add item",
                                message: "Success add item",
                                result: result
                            });
                        })
                        .catch(next);
                    }
                });
            } else {
                res.status(400).send({
                    method: "POST add item",
                    message: "Forbidden role"
                })
            }
        }
    })
});

router.put('/edit-item/:id',function(req,res){
    res.send('Edit Item');
});

router.delete('/delete-item/:id', function(req,res){
    Item.findOneAndRemove({_id:req.params.id}).then(function(result){
        res.send(result);
    });
});

// customer router

router.put('/pay-items/:id', function(req, res){
    res.send('Pay Items');
});

router.get('/get-items-basket', function(req,res){
    res.send('get list items from basket');
});

router.delete('/delete-item-basket/:id', function(req,res){
    Basket.findOneAndRemove({_id:req.params.id}).then(function(result){
        res.send(result);
    });
});

router.post('/add-item-basket', function(req,res,next){
    Basket.create(req.body)
        .then(function(result){
            res.send({
                method : "POST",
                message : "Success",
                result: result
            });
        })
        .catch(next);
})

function ensureToken(req,res,next){
    const bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined'){
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.status(403).send("Forbidden");
    }
}

module.exports = router;

