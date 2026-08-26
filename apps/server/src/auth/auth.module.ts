import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({ 
    imports: [
        ConfigModule, 
        PassportModule, 
        JwtModule.registerAsync({ 
            imports: [ConfigModule], 
            inject: [ConfigService], 
            useFactory: (config: ConfigService) => ({ secret: config.getOrThrow('JWT_SECRET'), signOptions: { expiresIn: '1d' } }) 
        })], 
        controllers: [AuthController, AdminController ], 
        providers: [AuthService, AdminService , JwtStrategy, RolesGuard] })
export class AuthModule {}
