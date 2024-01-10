import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User ,UserSchema} from 'src/schemas/user.schema';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private readonly userModel:Model<User>){}

    async getUserByTelegramId(id:number): Promise<User>{
        const users = await this.userModel.findOne({telegram_id:id}).exec()
        return users
    }

    async findUser(filter){
        const users = await this.userModel.find(filter).exec()
        return users
    }

    async createuser(data:any){
        const newUser = new this.userModel(data);
          await newUser.save();
    }

    async findUserAndUpdateByTelegramId(id:number,updatedData){
        await this.userModel.findOneAndUpdate(
            { telegram_id: id },
            updatedData,
          ).exec();
    }

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
