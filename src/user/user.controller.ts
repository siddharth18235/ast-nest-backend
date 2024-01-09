import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from 'src/schemas/user.schema';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  async findAllUsers() {
    const users = await this.userService.getAllUsers()
    return {
        users:users
    };
  }

  @Post('update')
  async updateUser(@Body() data: {userId:string,updatedData:Partial<User>}){
    const res = this.userService.updateUser(data)
    if(res){
        return {success:true}
    }else{
        return {success: false}
    }
  }

  @Delete('delete/:userId')
  async deleteUser(@Param() param: { userId: string }){
    const res = this.userService.deleteUser(param.userId)
    if(res){
        return {success:true}
    }else{
        return {success: false}
    }
  }
}
