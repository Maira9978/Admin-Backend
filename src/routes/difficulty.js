const express = require('express');
const router = express.Router();
const Difficulty = require('../models/difficulty');

router.get('/viewDifficulty',(req, res)=>{
    Difficulty.find().exec((error, difficulty)=> {
        if(error){
            return res.status(400).json({
                message: "Error in Displaying difficulty",
                Err: error
            });
        }
        else{
            return res.status(200).json({
                difficulty
            })
        }
    })
});

router.post('/addDifficulty',(req, res) =>{
   
    req.body.dName=req.body.dName.toLowerCase();
    Difficulty.findOne({ dName: req.body.dName})
    .exec((error,difficulty) => {
        if(difficulty) return res.status(400).json({
        message: 'Given Difficulty-level already added'
     });
     const {
        dName
     } = req.body;
     console.log("Sent request of difficulty: "+req.body.dName);
     const _difficulty = new Difficulty({
        dName
    });
    _difficulty.save((error , data)=>{
        if(error){
            return res.status(400).json({
                message: 'Difficulty-level could not be added...Something went wrong'
            });
        }
        if(data)
        {
            return res.status(200).json({
                difficulty:data
            })
        }
      });
    });
});

module.exports = router;