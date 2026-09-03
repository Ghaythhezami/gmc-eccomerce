// apps/server/src/auth/admin.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // PUBLIC (only for admins to login)
  @Post('auth/login')
  @ApiOperation({ summary: 'Admin login' })
  adminLogin(@Body() body: { email: string; password: string }) {
    return this.adminService.adminLogin(body.email, body.password);
  }

  // PUBLIC (only for admins to register - use with caution!)
  @Post('auth/register')
  @ApiOperation({ summary: 'Admin register' })
  adminRegister(@Body() body: { firstName: string; lastName: string; email: string; password: string }) {
    return this.adminService.adminRegister(body);
  }

  // PROTECTED: Check if current admin exists
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('me')
  @ApiOperation({ summary: 'Get current admin profile' })
  async me(@Req() req: any) {
    return this.adminService.getAdminById(req.user.id);
  }

  // PROTECTED (requires ADMIN role)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('users')
  @ApiOperation({ summary: 'Get all users (with pagination)' })
  getAllUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '10', 10);

    return this.adminService.getAllUsers(pageNum, limitNum);
  }

  // PROTECTED (requires ADMIN role)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete a user' })
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

    // PUBLIC: Client app needs to fetch this without login
  @Get('storefront-access')
  @ApiOperation({ summary: 'Get allowed storefront roles (Public)' })
  getStorefrontAccess() {
    return this.adminService.getStorefrontAccess();
    //  return { allowedRoles: access?.allowedRoles ?? ['CUSTOMER'] }; // Default to CUSTOMER
  }

  // PROTECTED: Only admin can update the allowed roles
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put('storefront-access')
  @ApiOperation({ summary: 'Update allowed storefront roles' })
  updateStorefrontAccess(@Body() body: { allowedRoles: string[] }) {
    return this.adminService.updateStorefrontAccess(body.allowedRoles);
  }


  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('stats')
  @ApiOperation({ summary: 'Dashboard counts across users, catalog and push' })
  getStats() {
    return this.adminService.getStats();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('roles')
  @ApiOperation({ summary: 'Get all available roles' })
  getAllRoles() {
    return this.adminService.getAllRoles();
  }

  @Post('auth/google')
  @ApiOperation({ summary: 'Admin Login with Google' })
  async adminGoogleLogin(@Body() body: { googleToken: string }) {
    return this.adminService.validateAdminGoogleToken(body.googleToken);
  }
}

