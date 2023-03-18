const express = require('express');
const router = express.Router();
const Category = require('../models/category');

router.get('/viewcategory',(req, res)=>{
    Category.find().exec((error, category)=> {
        if(error){
            return res.status(400).json({
                message: "Error in Displaying category",
                Err: error
            });
        }
        else{
            return res.status(200).json({
                category
            })
        }
    })
});



router.post('/addCategory',(req, res) =>{
    req.body.cName=req.body.cName.toLowerCase();
   
    Category.findOne({ cName: req.body.cName})
    .exec((error,category) => {
        if(category) return res.status(400).json({
        message: 'Given Category already added'
     });
     const {
        cName
     } = req.body;
     console.log("Sent request of Category: "+req.body.cName);
     const _category = new Category({
        cName
    });
    _category.save((error , data)=>{
        if(error){
            return res.status(400).json({
                message: 'Category could not be added...Something went wrong'
            });
        }
        if(data)
        {
            return res.status(200).json({
                category:data
            })
        }
      });
    });
});


router.delete('/deletecategory/:id', (req, res) => {
    const id = req.params.id;
    Category.findByIdAndRemove(id, (error, data) => {
      if (error) {
        return res.status(400).json({
          message: 'Category could not be deleted...Something went wrong',
          error,
        });
      }
      if (data) {
        return res.status(200).json({
          message: 'Category deleted successfully',
        });
      }
    });
  });
  router.get('/searchCategory', (req, res) => {
    const query = req.query.q;
  
    if (!query) {
      return res.status(400).json({ message: 'Query string is missing' });
    }
  
    const regex = new RegExp(query, 'i');
  
    Category.find({ cName: regex }).exec((error, categories) => {
      if (error) {
        return res.status(400).json({
          message: 'Error in searching categories',
          error,
        });
      }
  
      if (categories.length === 0) {
        return res.status(404).json({ message: 'No categories found' });
      }
  
      return res.status(200).json({ categories });
    });
  });
  router.put('/editcategory/:id', (req, res) => {
    const id = req.params.id;
    const { cName } = req.body;
  
    Category.findById(id, (error, category) => {
      if (error) {
        return res.status(400).json({
          message: 'Category could not be found...Something went wrong',
          error,
        });
      }
  
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
  
      category.cName = cName;
  
      category.save((error, data) => {
        if (error) {
          return res.status(400).json({
            message: 'Category could not be updated...Something went wrong',
            error,
          });
        }
  
        if (data) {
          return res.status(200).json({
            message: 'Category updated successfully',
            category: data,
          });
        }
      });
    });
  });
  

module.exports = router;