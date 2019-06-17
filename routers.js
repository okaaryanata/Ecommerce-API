const express = require('express');
const router = express.Router();
const User = require('./models/user');
const Item = require('./models/item');
const Basket = require('./models/basket');
const Reward = require('./models/reward');
var jwt = require('jsonwebtoken');

// Universal routers
router.get('/test', function(req,res){
    res.send("REST API RUNNING");
})
router.get('/list-items', function(req,res){
    Item.find({}).then(function(result){
        res.send({
            method: "GET all item",
            result: result
        })
    });
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

router.get('/get-item/:id', function(req,res){
    Item.findOne({_id:req.params.id}).then(function(result){
        res.send({
            method: "GET Item by id",
            result: result
        });
    });
});

// Admin routers
router.post('/add-reward', function(req,res,next){
    Reward.findOne({name: req.body.name}).exec(function(err,reward){
        if (reward){
            res.status(400).send({
                method: "POST",
                message: "Reward already exist"
            })
        } else {
            var newReward = {
                name: req.body.name,
                point: req.body.point,
                status: 1
            }
            Reward.create(newReward)
            .then(function(result){
                res.send({
                    method : "POST",
                    message : "Success add reward",
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
                            color: reqBody.color,
                            price: reqBody.price,
                            merchant_name: user.user.name
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
                res.status(403).send({
                    method: "POST add item",
                    message: "Forbidden role"
                })
            }
        }
    })
});

router.delete('/delete-item/:id', ensureToken, function(req,res,next){
    jwt.verify(req.token,"secret_key", function(err,user){
        if(err){
            res.status(403).send({
                method: "DELETE item",
                message: "Token error"
            });
        } else if(user["user"]["role"] !== 2) {
            res.status(403).send({
                method : "DELETE item",
                message: "Forbidden role"
            });
        } else { 
            Item.findOne({_id:req.params.id}).exec(function(err,item){
                if(item){
                    // if(item["merchant_id"].equals(user["user"]["_id"])){
                    if(item.merchant_id.equals(user.user._id)){
                        Item.findOneAndRemove({_id:req.params.id}).then(function(result){
                            res.send({
                                method : "DELETE item",
                                message: "Success delete item"
                            });
                        })
                        .catch(next);
                    } else {
                        res.status(403).send({
                            method: "DELETE item",
                            message: "Forbidden, that is not your item"
                        })
                    }
                } else{
                    res.status(404).send({
                        method: "DELETE item",
                        message: "Item not found"
                    });
                }
            });
        }
    });
});

router.put('/edit-item/:id', ensureToken, function(req,res,next){
    jwt.verify(req.token,"secret_key", function(err,user){
        if(err){
            res.status(403).send({
                method: "PUT item",
                message: "Token error"
            });
        } else if(user["user"]["role"] !== 2) {
            res.status(403).send({
                method : "PUT item",
                message: "Forbidden role"
            });
        } else { 
            Item.findOne({_id:req.params.id}).exec(function(err,item){
                if(item){
                    // if(item["merchant_id"].equals(user["user"]["_id"])){
                    if(item.merchant_id.equals(user.user._id)){
                        Item.updateOne({_id:req.params.id},{$set:req.body}).then(function(result){
                            res.send({
                                method : "PUT item",
                                message: "Success edit item",
                                result: result
                            });
                        })
                        .catch(next);
                    } else {
                        res.status(403).send({
                            method: "PUT item",
                            message: "Forbidden, that is not your item"
                        })
                    }
                } else{
                    res.status(404).send({
                        method: "PUT item",
                        message: "Item not found"
                    });
                }
            });
        }
    });
});

router.get('/get-merchant-item', ensureToken, function(req,res){
    jwt.verify(req.token, "secret_key", function(err,user){
        if(err){
            res.status(403).send({
                method: "GET merchant item",
                message: "Token error"
            });
        } else {
            if(user.user.role === 1){
                res.status(403).send({
                    method: "GET merchant item",
                    message: "Forbidden role"
                });
            } else {
                Item.find({merchant_id:user.user._id}).then(function(result){
                    res.send({
                        method: "GET merchant item",
                        merchant_id : user.user._id,
                        result: result
                    });
                });
            }
        }
    });
});

router.get('/get-buyer', ensureToken, function(req,res){
    jwt.verify(req.token, "secret_key", function(err,user){
        if(err){
            res.status(403).send({
                method: "GET buyer",
                message: "Token error"
            });
        } else {
            if(user.user.role === 1){
                res.status(403).send({
                    method: "GET buyer",
                    message: "Forbidden role"
                });
            } else {
                Basket.find({merchant_id:user.user._id,status:1}).then(function(result){
                    var arrBuyer = []
                    result.forEach(function(item){
                        var newResult = {
                            customer_name: item.customer_name,
                            item_code: item.item_code,
                            price: item.price,
                            merchant_name: item.merchant_name,
                            item_id: item.item_id,
                            status: item.status
                        }
                        arrBuyer.push(newResult);
                    })
                    res.send({
                        method: "GET buyer",
                        merchant_id : user.user._id,
                        result: arrBuyer
                    });
                });
            }
        }
    });
});

// customer router
router.put('/pay-items',ensureToken,randomReward, function(req, res){
    jwt.verify(req.token, "secret_key", function(err,user){
        if(err){
            res.status(403).send({
                method:"PUT pay items",
                message: "Token Error"
            });
        } else {
            if(user.user.role !== 1){
                res.status(403).send({
                    method: "PUT pay items",
                    message: "Forbidden Role"
                });
            } else {
                Basket.find({status:0,customer_id:user.user._id}).then(function(result){
                    if(result === undefined || result.length === 0){
                        res.status(404).send({
                            method: "PUT pay items",
                            message: "Your basket is empty"
                        });
                    } else {
                        Basket.updateMany({status:0},{$set:{status:1}}).then(function(updated){
                            console.log(updated)
                            if(!updated){
                                res.status(400).send({
                                    method:"PUT pay items",
                                    message: "Error pay item"
                                })
                            } else {
                                User.updateOne({_id:user.user._id},{$set:{point:req.reward.point}}).then(function(result){})
                                res.send({
                                    method:"PUT pay items",
                                    customer_id: user.user._id,
                                    message: "Success pay items"
                                });
                            }
                        });
                    }
                });
            }
        }
    });
});

router.get('/get-items-basket',ensureToken, function(req,res){
    jwt.verify(req.token,"secret_key", function(err,user){
        if(err){
            res.status(403).send({
                method:"GET items on basket",
                message: "Token Error"
            });
        } else {
            if(user.user.role !== 1){
                res.status(403).send({
                    method: "GET item on basket",
                    message: "Forbidden role"
                });
            } else {
                Basket.find({status:0,customer_id:user.user._id}).then(function(result){
                    res.send({
                        method: "GET items on basket",
                        customer_id : user.user._id,
                        result : result
                    });
                });
            }
        }
    });
});

router.delete('/delete-item-basket/:id', ensureToken, function(req,res,next){
    jwt.verify(req.token,"secret_key", function(err,user){
        if(err){
            res.status(403).send({
                method: "DELETE item from basket",
                message: "Token error"
            });
        } else if(user.user.role !== 1){
            res.status(403).send({
                method: "DELETE item from basket",
                message: "Forbidden Role"
            });
        } else {
            Basket.findOne({_id:req.params.id}).exec(function(err,item){
                if(item){
                    if(item.customer_id.equals(user.user._id)){
                        Basket.findOneAndRemove({_id:req.params.id}).then(function(result){
                            res.send({
                                method: "DELETE item from basket",
                                item_id: req.params.id,
                                customer_id: user.user._id,
                                message: "Success delete item from basket"
                            });
                        })
                        .catch(next);
                    } else{
                        res.status(404).send({
                            method:"DELETE item from basket",
                            item_id: req.params.id,
                            customer_id: user.user._id,
                            message: "Item not found in the basket"
                        })
                    }
                } else {
                    res.status(404).send({
                        method:"DELETE item from basket",
                        item_id: req.params.id,
                        customer_id: user.user._id,
                        message: "Item not found in the basket"
                    })
                }
            });
        }
    });
});

router.post('/add-item-basket/:id', ensureToken, function(req,res,next){
    jwt.verify(req.token, "secret_key", function(err,user){
        if(err){
            res.status(403).send({
                method: "POST add item to basket",
                message: "Token error"
            });
        } else {
            if(user.user.role === 1){
                Item.findOne({_id:req.params.id}).exec(function(err,item){
                    if(item){
                        User.findOne({_id:item.merchant_id}).then(function(seller){
                            var newItem = {
                                item_id:req.params.id,
                                merchant_id:item.merchant_id,
                                customer_id:user.user._id,
                                price: item.price,
                                merchant_name:seller.name,
                                item_code: item.item_code,
                                customer_name: user.user.name,
                                status: 0
                            }
                            Basket.create(newItem)
                            .then(function(result){
                                res.send({
                                    method:"POST add item to basket",
                                    item_id:req.params.id,
                                    customer_id: user.user._id,
                                    message: "Success add item to basket"
                                });
                            })
                            .catch(next);
                        });
                    } else {
                        res.status(404).send({
                            method:"POST Item to basket",
                            message: "Item not found"
                        })
                    }
                })
            } else {
                res.status(403).send({
                    method: "POST add item",
                    message: "Forbidden role"
                });
            }
        }
    });
});

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

function randomReward(req,res,next){
    Reward.count().exec(function(err,count){
        var random = Math.floor(Math.random()*count)
        // reward with status = 1, meaning that reward still valid
        Reward.findOne({status:1}).skip(random).exec(function(err,result){
            req.reward = result;
            next()
        });
    });
}

module.exports = router;

