const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());
const SECRET_KEY = "your_secret_key"; 
app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
//Write the authenication mechanism here
const token = req.headers['authorization'];
if (!token) {
    return res.status(403).json({ message: 'No token provided' });
}

jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
        return res.status(500).json({ message: 'Failed to authenticate token' });
    }
    req.user = decoded; // Save decoded user information to request
    next();
});
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"+" "+PORT));
