import { Component, OnInit } from '@angular/core';
import { ProductCardComponent } from '../product-card/product-card.component';
import { CardTypeEnum } from '../enums/card-type.enum';
import { SharedModule } from '../shared/shared.module';
import { Product } from '../models/product';
import { Cart } from '../models/cart';
import { ProductService } from '../services/product.service';
import { ToastrService } from '../services/toastr.service';
import { FlexLayoutModule, FlexModule } from '@angular/flex-layout';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [ProductCardComponent,SharedModule,FlexLayoutModule,FlexModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {

  cardType : CardTypeEnum = CardTypeEnum.CartItem
  cartItems : Cart[] = []

  constructor(private productService : ProductService,private toastr : ToastrService){}

  ngOnInit(): void {
    this.initialiseCartItems();
  }

  initialiseCartItems(){
    this.productService.getCartItems().subscribe({
      next: (cartItems : Cart[]) => {
        this.cartItems = cartItems;
      },
      error: () => {
        this.toastr.openSnackBar('error in getting cart items')
      }
    })
  }

  deleteCartItem(cartItemId : bigint){
    this.cartItems = this.cartItems.filter((cartItem) => {
     return cartItem.id != cartItemId
    })
    console.log(this.cartItems,"sfsdf")
  }

  
  orderProducts(){

    let productIds : bigint[]  = [];
    this.cartItems.forEach(cartItem => {

      productIds.push(cartItem.product.id);
 
    });
    this.productService.addOrder(productIds).subscribe({
      next: () => {

        this.toastr.openSnackBar('order placed!')
        this.cartItems = [];
      },
      error: () => {
        this.toastr.openSnackBar('Error occured order not placed!')
      }
    })
  }
}
