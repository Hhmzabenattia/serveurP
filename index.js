const express  = require("express");
const dotenv = require("dotenv");
const DBConnection = require("./config/DBConnection");
const userRouter = require("./Routes/userRouter");
const authRouter = require("./Routes/authRouter");
const cookieParser = require('cookie-parser');
const adminRouter = require("./Routes/adminRoute");
const documentRouter = require("./Routes/documentRouter");
const cloudinary = require('cloudinary').v2


dotenv.config();
DBConnection();
cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
     

const app = express();
app.use(cookieParser());
app.use(express.json());



        // API
app.use("/api/user",userRouter);
app.use("/api/auth",authRouter);
app.use("/api/admin",adminRouter);
app.use("/api/document",documentRouter);




const port = process.env.PORT || 1000;
app.listen(port, ()=>{
console.log(`Server connected on port ${port}`)
});