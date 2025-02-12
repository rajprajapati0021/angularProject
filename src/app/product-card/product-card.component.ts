import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, Renderer2, SimpleChanges } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { BottomSheetComponent } from '../bottom-sheet/bottom-sheet.component';
import { CardTypeEnum } from '../enums/card-type.enum';
import { Cart } from '../models/cart';
import { Like } from '../models/like';
import { Product } from '../models/product';
import { AuthService } from '../services/auth.service';
import { ProductService } from '../services/product.service';
import { ToastrService } from '../services/toastr.service';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [SharedModule, CommonModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent implements OnChanges{

  isSmallScreen: boolean = false;
  user : any;
  isLiked!: boolean | undefined;
  isLoaderShow : boolean = false;
  isAddLoaderShow : boolean = false;
  @Output() deleteCartItem = new EventEmitter<bigint>();
  @Output() deleteProductEvent = new EventEmitter<bigint>(); 
  @Output() editProductEvent = new  EventEmitter<Product>();
  @Output() orderProductEvent = new EventEmitter<bigint>();
  @Input() product: Product | null = null;
  @Input() cartItem: Cart | null = null;
  @Input() cardType: CardTypeEnum = CardTypeEnum.ArtisticProductCard;
  constructor(
    private productService: ProductService,
    private _bottomSheet: MatBottomSheet,
    private authService: AuthService,
    private renderer: Renderer2,
    private toastrService : ToastrService
    
  ) {
    // Check if the userClaims method is synchronous or asynchronous
    this.user = authService.userClaims();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] && changes['product'].currentValue) {
      this.isLiked = this.checkIsLiked();
    }

    if(changes['cartItem'] && changes['cartItem'].currentValue){
      this.product = this.cartItem!.product
    }
  }
  


  like(event : Event,productId : bigint | undefined){
    let likebtn = event.currentTarget as HTMLButtonElement
    this.isLoaderShow = true;
    let like : Like = {datetime: null ,productId : productId!, likedByUser : this.user.id};
    this.productService.likeUnlikeProduct(like)
    .subscribe({
      next: (result) => {
        if(result){
          this.product?.likes?.push(like);
          this.isLiked = this.checkIsLiked()
        }
        else{
          let likeIndex = this.product?.likes?.findIndex(like => like.likedByUser == this.user.id)
          if(likeIndex != undefined && likeIndex !== -1){
            this.product?.likes?.splice(likeIndex,1);
            this.isLiked = this.checkIsLiked()
          }
        }
      },
      error: () => {
        console.log('Error occure in like');
      },
      complete : () => {
        this.isLoaderShow = false
      }
    })
  }

  checkIsLiked() : boolean | undefined{
    console.log(this.product,"----<>")
    return this.product?.likes?.some((like : Like) => like.likedByUser == this.user.id);
  }

  openBottomSheet(productId: bigint | undefined): void {
    this._bottomSheet.open(BottomSheetComponent, {
      data: {
        productId,
        product: this.product
      }
    });
  }

  deleteProduct(productId : bigint | undefined){
    this.productService.deleteProduct(productId!).subscribe({
      next: () => {
        console.log("deleted sucessfully!")
        this.deleteProductEvent.emit(productId)
        // this.products = this.products.filter(product => product.id != productId)
      },
      error: (error) => {
        console.log(error)
      }
    })
  }

  editProduct(product : Product | null){
    this.editProductEvent.emit(product!)
  }

  addToCart(productId : bigint | undefined){
    this.isAddLoaderShow = true;
    this.productService.addToCart(productId!).subscribe({
      next: () => {
        this.toastrService.openSnackBar('Product added successfully in cart')
        this.isAddLoaderShow = false;
      },
      error: (error) => {
        this.isAddLoaderShow = false;
        this.toastrService.openSnackBar('Product not added in cart')
      }
    })
  }

  removeFromCart(cartItemId : bigint ){
    this.isLoaderShow = true;
    console.log(cartItemId)
    this.productService.removeFromCart(cartItemId!).subscribe({
      next: () => {
        this.toastrService.openSnackBar('removed from cart')
        this.deleteCartItem.emit(cartItemId);
        this.isLoaderShow = false;
      },
      error: (error) => {
        this.toastrService.openSnackBar('error')
        this.isLoaderShow = false;
      }
    })
  }


}
