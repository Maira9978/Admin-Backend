const Admin = require('../../models/admin');
const jwt = require('jsonwebtoken');
exports.signup=(req, res ) =>
{
    Admin.findOne({ email: req.body.email})
    .exec((error,admin) => {
        if(admin) return res.status(400).json({
        message: 'Admin already registered'
     });

     const {
        firstName,
        lastName,
        email,
        password

     } = req.body;

     const _admin = new Admin({
        firstName ,
        lastName , 
        email, 
        password,
        adminname: Math.random().toString(),
        role:'admin'
    });
    _admin.save((error , data)=>{
        if(error){
            return res.status(400).json({
                message: 'Admin could not be registered...Something went wrong',
                error
            });
        }
        if(data)
        {
            return res.status(200).json({
                message:'Admin created Successfully'
            })
        }
      });
    });
}
exports.signin = (req , res ) => {
    Admin.findOne({email: req.body.email})
    .exec((error, admin) => {
        if (error) return res.status(400).json({error});
        if(admin){
           if(admin.authenticate(req.body.password) && admin.role === 'admin'){
             const token = jwt.sign({id:admin._id}, process.env.JWT_SECRET,{expiresIn:'1h'}); 
             const {_id ,firstName,lastName,email,role,fullName} = admin;
             res.status(200).json({
                token,
                admin: {
                   _id, firstName,lastName,email,role,fullName
                }
             });
           }else{
            return res.status(400).json({
               message: 'Invalid Password'
            })
           }
        }else{
            return res.status(400).json({message:'Something went wrong'})
        }
     });
}
exports.requireSignin = (req , res , next) =>
{
    const token = req.headers.authorization.split("")[1];

   // console.log(token);
    // const  jwt.decode(token,process.JWT_SECRET);
    const admin = jwt.verify(token, process.JWT_SECRET);
    req.admin= admin;
    next();
    //jwt.decode()
}