import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  
  @Post('register') 
  @ApiOperation({ summary: 'Register a customer' }) 
  register(@Body() dto: RegisterDto) { 
    return this.auth.register(dto); 
  }
  
  @Post('login') 
  @ApiOperation({ summary: 'Login' }) 
  login(@Body() dto: LoginDto) { 
    return this.auth.login(dto); 
  }
  
  @Get('me') 
  @ApiBearerAuth() 
  @UseGuards(JwtAuthGuard) 
  me(@Req() req: any) { 
    return this.auth.me(req.user.id); 
  }

  // NEW: Google Login endpoint
  @Post('google')
  @ApiOperation({ summary: 'Login/Register with Google' })
  googleLogin(@Body() body: { googleToken: string }) {
    return this.auth.validateGoogleToken(body.googleToken);
  }
}