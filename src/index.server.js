const express = require('express');
const env = require ('dotenv');
const app = express();
var cors = require('cors');
const bodyParse = require('body-parser');
const mongoose = require('mongoose');
var multiparty = require('multiparty');
const upload = require('express-fileupload');
const axios = require('axios');

app.use(upload());

app.use(cors({origin: true, credentials: true}));

//routes
/* const loggedin=window.localStorage.getItem("islogin") */

const authRoutes= require('./routes/auth');
const adminRoutes= require('./routes/admin/auth');
const QuesRoutes= require('./routes/question');
const topicRoutes= require('./routes/topic');
const difficultyRoutes= require('./routes/difficulty');
const categoryRoutes= require('./routes/category');
const userRoutes= require('./routes/user');

//environment variable
env.config();
//mongo connection
mongoose.connect(
    //mongodb+srv://root:<password>@cluster0.sf0pb7x.mongodb.net/?retryWrites=true&w=majority
    `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@cluster0.07v8s.mongodb.net/${process.env.MONGO_DB_DATABASE}?retryWrites=true&w=majority`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
        //useCreateIndex: true
    }).then(() => {
      console.log('Database connected');
});

app.use(bodyParse.urlencoded({
    extended: true
  }));
app.use(bodyParse.json());

app.use('/api', authRoutes);
app.use('/api', adminRoutes);
app.use('/api', QuesRoutes);
app.use('/api', topicRoutes);
app.use('/api', difficultyRoutes);
app.use('/api', categoryRoutes);
app.use('/api', userRoutes);


app.listen(process.env.PORT, () => {
    
    console.log(`Server is running on port ${process.env.PORT}`);
});