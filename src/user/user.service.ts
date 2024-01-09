import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User ,UserSchema} from 'src/schemas/user.schema';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private readonly userModel:Model<User>){}

    async getAllUsers() : Promise<User[]>{
        const users = await this.userModel.find().exec()
        return users;
    }
    async updateUser(data:{userId:string,updatedData:Partial<User>}){
        try{
            this.userModel.findByIdAndUpdate(data.userId,data.updatedData,{new:false}).exec()
            return true
        }catch(error){
            return false
        }
    }
    async deleteUser(id:string){
        try{
            this.userModel.deleteOne({_id:id}).exec()
            return true
        }catch(err){
            return false
        }
    }
}
