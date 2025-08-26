import mongoose,{Schema} from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema({
    fullName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minlength:6
    },
    bio:{
        type:String,
        default:""
    },
    profilePic:{
        type:String,
        default:""
    },
    nativeLang:{
        type:String,
        default:""
    },
    learningLang:{
        type:String,
        default:""
    },
    location:{
        type:String,
        default:""
    },
    isOnborded:{
        type:Boolean,
        default:false
    },
    friends:[
        {
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    ]
},{timestamps:true});


// pre hook for encrypting password
userSchema.pre("save", async function(next){
    
    if(!this.isModified("password")) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password,salt);
        next();
    } catch (error) {
        next(error);
    }
})

userSchema.methods.matchPassword = async function(enteredpassword){
    return await bcrypt.compare(enteredpassword,this.password);
}

const User = mongoose.model("User",userSchema);

export default User;