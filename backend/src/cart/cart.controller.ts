import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CartService } from './cart.service';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CartController {
  constructor(private readonly cartService: CartService) { }

  @Get()
  @ApiOperation({ summary: "Get current user's cart" })
  @ApiResponse({ status: 200, description: 'Returns cart items' })
  async getCart(@CurrentUser() user: any) {
    console.log('controller');
    console.log(user);
    return this.cartService.getCart(user.id);
  }

  @Post(':courseId')
  @ApiOperation({ summary: 'Add a course to cart' })
  @ApiResponse({ status: 201, description: 'Course added to cart' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async addToCart(
    @Param('courseId', ParseIntPipe) courseId: number,
    @CurrentUser() user: any,
  ) {
    return this.cartService.addToCart(user.id, courseId);
  }

  @Delete(':courseId')
  @ApiOperation({ summary: 'Remove a course from cart' })
  @ApiResponse({ status: 200, description: 'Course removed from cart' })
  async removeFromCart(
    @Param('courseId', ParseIntPipe) courseId: number,
    @CurrentUser() user: any,
  ) {
    return this.cartService.removeFromCart(user.id, courseId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear the entire cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared' })
  async clearCart(@CurrentUser() user: any) {
    return this.cartService.clearCart(user.id);
  }
}
