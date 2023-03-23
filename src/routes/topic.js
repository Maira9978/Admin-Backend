const express = require('express');
const router = express.Router();
const Topic = require('../models/topic');
const Question = require("../models/question");
const User = require('../models/user');
const mongoose = require('mongoose');

router.get('/viewTopic',(req, res)=>{
    Topic.find().exec((error, topic)=> {
        if(error){
            return res.status(400).json({
                message: "Error in Displaying Topics",
                Err: error
            });
        }
        else{
            return res.status(200).json({
                topic
            })
        }
    })
});


router.post('/addTopic',(req, res) =>{
   
    req.body.tName=req.body.tName.toLowerCase();
    Topic.findOne({ tName: req.body.tName})
    .exec((error,topic) => {
        if(topic) return res.status(400).json({
        message: 'Given Topic already added'
     });
     const {
        tName
     } = req.body;
     console.log("Sent request of topic: "+ req.body.tName);
     const _topic = new Topic({
        tName
    });
    _topic.save((error , data)=>{
        if(error){
            return res.status(400).json({
                message: 'Topic could not be added...Something went wrong',
                e:error
            });
        }
        if(data)
        {

          const updateUsers = { $push: { personalTopics: data } }; // update to be applied

          User.updateMany({}, updateUsers, function(err, result) {
            if (err) throw err;
            console.log(`${result.modifiedCount} records updated`);
            return res.status(200).json({
              topic:data,
              result
          })
          });
   
        }
      });
    });
});
router.delete('/deleteTopic/:id', (req, res) => {
    const id = req.params.id;
    Topic.findByIdAndRemove(id, (error, data) => {
      if (error) {
        return res.status(400).json({
          message: 'Topic could not be deleted...Something went wrong',
          error,
        });
      }
      if (data) {

        Question.deleteMany({topic: id}, (err, dat) => {
            if (err) {
              return res.status(400).json({
                message: 'Question of corresponding topic could not be deleted...Something went wrong',
                error,
              });
            }

          });
         
          let topic_id=mongoose.Types.ObjectId(id);
        const updateUsers = { $pull: { personalTopics: { _id: topic_id } } }; // update to be applied
        console.log("going to del: ",updateUsers)
          User.updateMany({}, updateUsers, function(err, result) {
            if (err) throw err;
            console.log(`${result.modifiedCount} records updated`);
            console.log(result);
          });

        return res.status(200).json({
          message: 'Topic deleted successfully',
        });
      }
    });
  });

  router.get('/searchTopic', (req, res) => {
    const query = req.query.q;
  
    if (!query) {
      return res.status(400).json({ message: 'Query string is missing' });
    }
  
    const regex = new RegExp(query, 'i');
  
    Topic.find({ tName: regex }).exec((error, topics) => {
      if (error) {
        return res.status(400).json({
          message: 'Error in searching topics',
          error,
        });
      }
  
      if (topics.length === 0) {
        return res.status(404).json({ message: 'No topics found' });
      }
  
      return res.status(200).json({ topics });
    });
  });

  router.put('/editTopic/:id', (req, res) => {
  const id = req.params.id;
  const { tName } = req.body;

  Topic.findById(id, (error, topic) => {
    if (error) {
      return res.status(400).json({
        message: 'Topic could not be found',
        error,
      });
    }

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    // Update the topic name
    topic.tName = tName;
    topic.save((error, updatedTopic) => {
      if (error) {
        return res.status(400).json({
          message: 'Topic could not be updated...Something went wrong',
          error,
        });
      }
      return res.status(200).json({ topic: updatedTopic });
    });
  });
});
module.exports = router;