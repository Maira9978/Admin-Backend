const express = require("express");
const router = express.Router();
const Question = require("../models/question");
const Topic = require("../models/topic");
const Difficulty = require("../models/difficulty");
const Category = require("../models/category");
const path = require("path");
const axios = require("axios");




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

router.post("/addQuestion", (req, res) => {
  const x = Topic.findOne({ tName: req.body["topic"] })
    .then((topic) => {
      req.body["topic"] = topic._id.valueOf();

      const ques = Question.insert(req.body);

      if (ques)
        return res.status(201).json({
          message: "Questions has added",
          Questions: ques,
        });
    })
    .catch((err) => console.log(err));
});

router.get("/selectFile", (req, res) => {
  let ind = path.join(__dirname, "..", "views", "index.html");
  res.sendFile(ind);
});

router.post("/Parser", (req, res) => {
  console.log("Its Called..");
  if (req.files) {
        console.log("File Selected");
        var temp = req.files.myFile.data;

        const removeEmptyLines = (str) =>
        str
            .split(/\r?\n/)
            .filter((line) => line.trim() !== "")
            .join("\n");
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

        // // Loop data
        for (let i = 0; i < data.length; i++) {
        // Remove empty lines
        if (/^\s*$/.test(data[i])) continue;
        // Split data line on cells
        const quesProp = data[i].split(",").map((s) =>s.trim());
        // Checking if any property of question missing
        if (quesProp.length < 3 || i + 2 >= data.length) {
            console.log("Issue in any of the Question Properties");
            continue;
        }
        // Checking if the Question-content in right format
        if (data[i + 1][1]=='.' || data[i + 1][2]=='.') {
            console.log("Issue in any of the Question-Content");
            continue;
        }
        const quesContent = data[i + 1].trim();
        var quesAns = "";
        var totalOpts=0;
        var quesOpts=[];
        while(data[i + 2+ totalOpts][1]=='.' || data[i + 2 + totalOpts][2]=='.'){
          if(data[i + 2+ totalOpts][0]=='*'){

            var tmp = data[i + 2+ totalOpts].split("");
            tmp.splice(0, 3);
            data[i + 2+ totalOpts] = tmp.join("").trim();

            quesAns = data[i + 2+ totalOpts];
            quesOpts.push(quesAns);
            totalOpts++;
            if((i + 2+ totalOpts)>=data.length){
              break;
            }
            continue;
          }
          var tmp = data[i + 2+ totalOpts].split("");
            tmp.splice(0, 2);
            data[i + 2+ totalOpts] = tmp.join("").trim();
            quesOpts.push( data[i + 2+ totalOpts]);

          totalOpts++;
          if((i + 2+ totalOpts)>=data.length){
            break;
          }
        }

        // var quesOpts = data[i + 2].split("|").map((s) => s.trim());
        if (quesOpts.length < 2) {
            console.log("Issue in any of the Question Option");
            continue;
        }
        

        // for (let i = 0; i < quesOpts.length; i++) {
        //     // Searching for the Answer (having *- at the start)
        //     if (quesOpts[i][0] == "*" && quesOpts[i][1] == "-") {
        //     // Removing and Answer identification and storing it in Answer
        //     var tmp = quesOpts[i].split("");
        //     tmp.splice(0, 2);
        //     quesOpts[i] = tmp.join("").trim();

        //     quesAns = quesOpts[i];
        //     break;
        //     }
        // }
        // // Loop cells
        let jsonLine = {};
        for (let i = 0; i < quesProp.length; i++)
            jsonLine[headers[i]] = quesProp[i].toLowerCase();

        jsonLine[headers[quesProp.length]] = quesContent;

        jsonLine[headers[quesProp.length + 1]] = quesOpts;

        jsonLine[headers[quesProp.length + 2]] = quesAns;

        // // Push new line to json array
        json.push(jsonLine);
        i = i + 1+ quesOpts.length;
        }

        // Result
        console.log("Going to Upload on Database:",json);
        axios
        .post("http://localhost:2000/api/uploadQuesList", {
            quesList: json,
        })
        // Print response
        .then((response) => {
            return res.status(200).json({
            Message: response.data.body,
            });
        })
        // Print error message if occur
        .catch((error) => console.log(error));
  }
  else{
    return res.status(400).json({ message: "File could not be Uploaded" });
  }
     
});

router.post("/uploadQuesList", (req, res) => {
  console.log(req.body.quesList);
  for (const ques in req.body.quesList) {
    // Replacing the 'Name' of Topic with it's ID
    Topic.findOne({ tName: req.body.quesList[ques].topic })
      .then((topic) => {
        if (topic) {
          req.body.quesList[ques].topic = topic._id;

          // Replacing the 'Name' of Difficulty-level with it's ID
          Difficulty.findOne({ dName: req.body.quesList[ques].difficulty })
            .then((difficulty) => {
              if (difficulty) {
                req.body.quesList[ques].difficulty = difficulty._id;

                // Replacing the 'Name' of Category with it's ID
                console.log("Searching  a: ", req.body.quesList[ques].category);
                Category.findOne({ cName: req.body.quesList[ques].category })
                  .then((category) => {
                    if (category) {
                      req.body.quesList[ques].category = category._id;

                      // Adding the Question to Database
                      Question.create(
                        req.body.quesList[ques],
                        function (err, res) {
                          if (err) throw err;
                          console.log("Ques added:", res);
                        }
                      );
                    } else {
                      console.log("Given Category not found in Database");
                    }
                  })
                  .catch((err) =>
                    console.log(
                      "Error From adding Category in ques.......",
                      err
                    )
                  );
              } else {
                console.log("Given Difficulty-level not found in Database");
              }
            })
            .catch((err) =>
              console.log("Error From adding diff-level in ques.......", err)
            );
        } else {
          console.log("Given Topic "+req.body.quesList[ques].topic +" not found in Database");
        }
      })
      .catch((err) =>
        console.log("Error From adding topic in ques.......", err)
      );
  }
  // Storing list of all Questions in Database
  // const ques=  Question.insertMany(req.body);
  // if(ques)
  return res.status(201).json({
    message: "Questions has added",
    // Questions: ques
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

      return res.status(200).json({
        message: 'Question deleted successfully',
      }); */
    }
    });
});

router.put("/editQuestion/:id", async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    // Check if the question exists
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Update the question properties
    question.questionContent = req.body.questionContent;
    question.category = req.body.category;
    question.topic = req.body.topic;

    // Save the updated question
    await question.save();

    return res.status(200).json({
      message: "Question updated successfully",
      question,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error updating question" });
  }
});


module.exports = router;
