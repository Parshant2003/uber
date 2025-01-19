const userModel=require('../models/user.model')


const createUser=async({firstname,lastname,password,email})=>{
        if(!firstname || !password || !email){
            throw new Error("All field are required")
        }

        const user=userModel.create({
            fullname:{
                firstname,
                lastname
            },
            email,
            password
        })
        return user;
}

module.exports={createUser};