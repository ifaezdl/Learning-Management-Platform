import api from "./api";

export interface CartCourse {
  Id: number;
  Title: string;
  Thumbnail: string | null;
  Price: number;
  DiscountPrice: number | null;
  Slug: string | null;
  ShortDescription: string | null;
}

export interface CartItem {
  Id: number;
  User_Id: number;
  Course_Id: number;
  CreatedAt: string;
  Courses: CartCourse;
}

class CartService {
  async getCart(): Promise<CartItem[]> {
    debugger;
    const response = await api.get("/cart");
    return response.data;
  }

  async addToCart(courseId: number): Promise<CartItem> {
    debugger;
    const response = await api.post(`/cart/${courseId}`);
    return response.data;
  }

  async removeFromCart(courseId: number): Promise<void> {
    await api.delete(`/cart/${courseId}`);
  }

  async clearCart(): Promise<void> {
    await api.delete("/cart");
  }
}

export default new CartService();
