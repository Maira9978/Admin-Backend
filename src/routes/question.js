const express = require("express");
const router = express.Router();
const Question = require("../models/question");
const Result = require("../models/result")
const Topic = require("../models/topic");
const Difficulty = require("../models/difficulty");
const Category = require("../models/category");
const path = require("path");
const axios = require("axios");
const User=require("../models/user");
const multiplayerResults=require("../models/multiplayerResult")




router.get('/viewquestion',(req, res)=>{
  Question.find().exec((error, question)=> {
      if(error){
          return res.status(400).json({
              message: "Error in Displaying question",
              Err: error
          });
      }
      else{
          return res.status(200).json({
              question
          })
      }
  })
});

router.post('/addQuestion', (req, res) => {
  const { topic, difficulty, category, questionContent, options, correctAnswer } = req.body;
  
  if (!topic || !difficulty || !category || !questionContent || !options || !correctAnswer) {
    return res.status(400).json({ message: "All fields are required" });
  }
  
  const newQuestion = new Question({
    topic,
    difficulty,
    category,
    questionContent,
    options,
    correctAnswer
  });

  newQuestion.save((error, question) => {
    if (error) {
      console.error("Error in adding question:", error);
      return res.status(400).json({ message: "Error in adding question" });
    } else {
      return res.status(200).json({
        message: "Question added successfully",
        question: question
      });
    }
  });
});


router.get("/selectFile", (req, res) => {
  let ind = path.join(__dirname, "..", "views", "index.html");
  res.sendFile(ind);
});

router.post("/parser", (req, res) => {
  console.log("It's Called..");
  if (req.files) {
    console.log("File Selected");
    var temp = req.files.myFile.data;

    const removeEmptyLines = (str) =>
      str.split(/\r?\n/).filter((line) => line.trim() !== "").join("\n");
    var raw = temp.toString();
    raw = removeEmptyLines(raw);
    // Split data by lines
    const data = raw.split("\n");
    const headers = [
      "topic",
      "difficulty",
      "category",
      "questionContent",
      "options",
      "correctAnswer",
    ];
    // Define target JSON array
    let json = [];

    // Loop data
    for (let i = 0; i < data.length; i++) {
      // Remove empty lines
      if (/^\s*$/.test(data[i])) continue;
      // Split data line on cells
      const quesProp = data[i].split(",").map((s) => s.trim());
      // Checking if any property of question missing
      console.log(quesProp);
      if (quesProp.length < 3 || i + 2 >= data.length) {
        console.log("Issue in any of the Question Properties");
        return res.status(400).json({ message: "Invalid question properties" });
      }
      // Checking if the Question-content in the right format
      if (data[i + 1][1] === "." || data[i + 1][2] === ".") {
        console.log("Issue in any of the Question-Content");
        return res
          .status(400)
          .json({ message: "Invalid question content format" });
      }
      const quesContent = data[i + 1].trim();
      var quesAns = "";
      var totalOpts = 0;
      var quesOpts = [];
      while (
        data[i + 2 + totalOpts][1] === "." ||
        data[i + 2 + totalOpts][2] === "."
      ) {
        if (data[i + 2 + totalOpts][0] === "*") {
          var tmp = data[i + 2 + totalOpts].split("");
          tmp.splice(0, 3);
          data[i + 2 + totalOpts] = tmp.join("").trim();

          quesAns = data[i + 2 + totalOpts];
          quesOpts.push(quesAns);
          totalOpts++;
          if (i + 2 + totalOpts >= data.length) {
            break;
          }
          continue;
        }
        var tmp = data[i + 2 + totalOpts].split("");
        tmp.splice(0, 2);
        data[i + 2 + totalOpts] = tmp.join("").trim();
        quesOpts.push(data[i + 2 + totalOpts]);

        totalOpts++;
        if (i + 2 + totalOpts >= data.length) {
          break;
        }
      }

      if (quesOpts.length < 2) {
        console.log("Issue in any of the Question Option");
        return res
          .status(400)
          .json({ message: "Invalid question options format" });
      }

      let jsonLine = {};
      for (let i = 0; i < quesProp.length; i++)
        jsonLine[headers[i]] = quesProp[i].toLowerCase();

      jsonLine[headers[quesProp.length]] = quesContent;
      jsonLine[headers[quesProp.length + 1]] = quesOpts;

      jsonLine[headers[quesProp.length + 2]] = quesAns;
    
      json.push(jsonLine);
      i = i + 1 + quesOpts.length;
    }
    
    console.log("Going to Upload on Database:", json);
    axios
      .post("http://localhost:2000/api/uploadQuesList", {
        quesList: json,
      })
      .then((response) => {
        return res.status(200).json({
          message: response.data.body,
        });
      })
      .catch((error) => {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
      });
    } else {
      return res.status(400).json({ message: "File could not be uploaded" });
      }
      });    


      router.post("/uploadQuesList", (req, res) => {
        console.log(req.body.quesList);
        const errorMessages = [];
      
        const promises = req.body.quesList.map((ques) => {
          return Topic.findOne({ tName: ques.topic })
            .then((topic) => {
              if (topic) {
                ques.topic = topic._id;
                return Difficulty.findOne({ dName: ques.difficulty })
                  .then((difficulty) => {
                    if (difficulty) {
                      ques.difficulty = difficulty._id;
                      return Category.findOne({ cName: ques.category })
                        .then((category) => {
                          if (category) {
                            ques.category = category._id;
                            return Question.create(ques)
                              .then((createdQuestion) => {
                                console.log("Ques added:", createdQuestion);
                              })
                              .catch((err) => {
                                console.log("Error From adding question: ", err);
                                errorMessages.push(err.message);
                              });
                          } else {
                            console.log("Given Category not found in Database");
                            errorMessages.push("Given Category not found in Database");
                          }
                        })
                        .catch((err) => {
                          console.log("Error From adding Category in ques: ", err);
                          errorMessages.push(err.message);
                        });
                    } else {
                      console.log("Given Difficulty-level not found in Database");
                      errorMessages.push("Given Difficulty-level not found in Database");
                    }
                  })
                  .catch((err) => {
                    console.log("Error From adding diff-level in ques: ", err);
                    errorMessages.push(err.message);
                  });
              } else {
                console.log("Given Topic not found in Database");
                errorMessages.push("Given Topic not found in Database");
              }
            })
            .catch((err) => {
              console.log("Error From adding topic in ques: ", err);
              errorMessages.push(err.message);
            });
        });
      
        Promise.all(promises)
          .then(() => {
            if (errorMessages.length > 0) {
              return res.status(400).json({
                message: "Error in adding questions",
                errors: errorMessages
              });
            } else {
              return res.status(201).json({
                message: "Questions added successfully"
              });
            }
          })
          .catch((err) => {
            console.log("Error while processing questions: ", err);
            return res.status(500).json({
              message: "Internal Server Error"
            });
          });
      });
      
      

router.get('/searchQuestion', (req, res) => {
  const searchQuery = req.query.q;
  if(!searchQuery){
    return res.status(400).json({
      message: "Invalid search query",
    });
  }
  const regex = new RegExp(searchQuery, "i");
  Question.find({ questionContent: regex }).exec((error, question) => {
    if (error) {
      return res.status(400).json({
        message: "Error in searching question",
        Err: error,
      });
    } else {
      return res.status(200).json({
        question,
      });
    }
  });
});


router.delete('/deleteQuestion/:id', (req, res) => {
  const id = req.params.id;
  Question.findByIdAndRemove(id, (error, data) => {
    if (error) {
      return res.status(400).json({
        message: 'Question could not be deleted...Something went wrong',
        error,
      });
    }
    if (data) {

     /*  Question.deleteMany({topic: id}, (err, dat) => {
          if (err) {
            return res.status(400).json({
              message: 'Question of corresponding topic could not be deleted...Something went wrong',
              error,
            });
          }

        });
*/
      return res.status(200).json({
        message: 'Question deleted successfully',
      }); 
    }
    });
});

router.get('/questionstopics', async (req, res) => {
  try {
    // Find all questions and populate the "topic" field
    const questions = await Question.find().populate('topic');

    // Count the total questions for each topic
    const topicCounts = {};

    questions.forEach((question) => {
      const topicName = question.topic.tName;
      topicCounts[topicName] = (topicCounts[topicName] || 0) + 1;
    });

    res.json(topicCounts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/editQuestion/:id', async (req, res) => {
  const { questionContent, topic, category, difficulty } = req.body;
  try {
    const question = await Question.findById(req.params.id);
    console.log(questionContent)
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    if (questionContent) {
      
      question.questionContent = questionContent;
    }
    
    console.log(topic, "this is")
    if (topic) {
      const topicObj = await Topic.findOne({ _id: topic });
      if (!topicObj) {
        console.log("Topic not found")
        return res.status(404).json({ message: "Topic not found" });
      }
      question.topic = topicObj._id.valueOf();
    }
    if (category) {
      const categoryObj = await Category.findOne({ _id: category });
      if (!categoryObj) {
        console.log("Category not found")
        return res.status(404).json({ message: "Category not found" });
      }
      question.category = categoryObj._id.valueOf();
    }
    if (difficulty) {
      const difficultyObj = await Difficulty.findOne({ _id: difficulty });
      if (!difficultyObj) {
        console.log("Difficulty not found")
        return res.status(404).json({ message: "Difficulty not found" });
      }
      question.difficulty = difficultyObj._id.valueOf();
    }
    
    await question.save();
    return res.status(200).json({ message: "Question updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});
//easy , medium , hard there questions and correct and incorrect
router.get("/question-stats", async(req, res) => {
  try {
    const stats = await Result.aggregate([
      {
        $unwind: "$Options_Res"
      },
      {
        $lookup: {
          from: "difficulties",
          localField: "Options_Res.difficulty",
          foreignField: "_id",
          as: "difficulty"
        }
      },
      {
        $unwind: "$difficulty"
      },
      {
        $group: {
          _id: "$Options_Res.difficulty",
          correct: {
            $sum: {
              $cond: [
                { $eq: ["$Options_Res.IsCorrect", true] },
                1,
                0
              ]
            }
          },
          incorrect: {
            $sum: {
              $cond: [
                { $eq: ["$Options_Res.IsCorrect", false] },
                1,
                0
              ]
            }
          },
          total: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "difficulties",
          localField: "_id",
          foreignField: "_id",
          as: "difficulty"
        }
      },
      {
        $unwind: "$difficulty"
      },
      {
        $project: {
          _id: 0,
          difficulty: "$difficulty.dName",
          correct: 1,
          incorrect: 1,
          total: 1
        }
      }
    ]);

    const statsObj = {};
    stats.forEach(stat => {
      statsObj[stat.difficulty] = {
        correct: stat.correct,
        incorrect: stat.incorrect,
        total: stat.total
      };
    });

    res.json(statsObj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
    }
  });
router.get('/multiplayerMatchResults', async (req, res) => {
  try {
    const users = await User.find();
    const playerResults = {};

    await Promise.all(users.map(async (user) => {
      const playerId = user._id;
      const playerName = user.firstName; // Assuming the player name field is 'name'

      try {
        const results = await multiplayerResults.aggregate([
          { $match: { 'players': { $elemMatch: { [playerId]: { $exists: true } } } } },
          {
            $group: {
              _id: playerName, // Group by player name
              gamesWon: {
                $sum: {
                  $cond: {
                    if: {
                      $and: [
                        { $eq: ['$winner', playerId] }
                      ]
                    },
                    then: 1,
                    else: 0
                  }
                }
              },
              gamesLost: {
                $sum: {
                  $cond: {
                    if: {
                      $and: [
                        { $ne: ['$winner', playerId] }
                      ]
                    },
                    then: 1,
                    else: 0
                  }
                }
              },
              totalGames: { $sum: 1 }
            }
          },
          { $project: { _id: 0, playerName: '$_id', gamesWon: 1, gamesLost: 1, totalGames: 1 } } // Include playerName field in the projection
        ]);

        playerResults[playerName] = results;
      } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving results');
      }
    }));

    res.json(playerResults);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving results');
  }
});

router.get('/playerScores', async (req, res) => {

  Result.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'player',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $group: {
        _id: '$player',
        playerName: { $first: '$user.firstName' },
        scores: { $push: '$Total_Score' }
      }
    }
  ]).exec()
  .then((result) => {
    return res.status(200).json(result);
  })
  .catch((error) => {
    return res.status(400).json(error );
  });

});
module.exports = router;
