import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Inject, inject, OnInit } from '@angular/core';
import { FlexLayoutModule, FlexModule } from '@angular/flex-layout';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheet
} from '@angular/material/bottom-sheet';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../guards/auth.service';
import { Comment } from '../models/comment';
import { Like } from '../models/like';
import { Product } from '../models/product';
import { SharedModule } from '../shared/shared.module';
import { ProductService } from '../user-product/product.service';


@Component({
  selector: 'app-artistic-product',
  standalone: true,
  imports: [SharedModule, FlexLayoutModule, FlexModule],
  templateUrl: './artistic-product.component.html',
  styleUrl: './artistic-product.component.css'
})
export class ArtisticProductComponent implements OnInit {

  products : Product[] = []
  isSmallScreen: boolean = false;

  // likeCount : number = 0;
  // commentCount : number = 0;

  private _bottomSheet = inject(MatBottomSheet);
  private authService = inject(AuthService)

  constructor(private productService : ProductService, breakpointObserver : BreakpointObserver){
    breakpointObserver.observe([Breakpoints.Tablet]).subscribe(result => {
      this.isSmallScreen = result.matches
    })
  }
  
  ngOnInit(): void {
    this.getAllProducts()
    console.log(this.products)
  }

  openBottomSheet(productId: bigint): void {
    this._bottomSheet.open(BottomSheetOverviewExampleSheet, {
      data: { 
        productId, 
        products: this.products 
      }
    });
  }
  
  getAllProducts(){
    
    this.productService.getAllProducts().subscribe({
      next : (data : Product[]) => {
        this.products = data
      },
      error : (error) => {
        console.log(error);
      }
    })
  }

  like(productId : bigint){

    let like : Like = {productId : productId, datetime : new Date()};
    this.productService.likeUnlikeProduct(like).subscribe({
      next: (result) => {

        if(result){
          this.products.find(product => product.id == productId)?.likes?.push(like);
        }
        else{
          this.products.find(product => product.id == productId)?.likes?.pop();
        }

      },
      error: () => {
        console.log('Error occure in like');
      }
    })
  }


}

@Component({
  selector: 'bottom-sheet-overview-example-sheet',
  templateUrl: 'bottom-sheet-overview-example-sheet.html',
  standalone: true,
  imports: [MatListModule,SharedModule,FlexLayoutModule, FlexModule],
})
export class BottomSheetOverviewExampleSheet implements OnInit {
  comments : Comment[] = []
  userDetail : any
  authService = inject(AuthService);
  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: { productId: bigint; products: Product[] },private productService : ProductService) {
  }
  ngOnInit(): void {
    this.initialiseComments();
    this.userDetail = this.authService.userClaims();
  }
  comment : Comment = {
    id : 0,
    commentText : null,
    datetime : null,
    productId : this.data.productId,
    user : null
  }

  initialiseComments(){
    this.productService.GetAllComments(this.data.productId).subscribe({
      next: (comments : Comment[]) => {
        this.comments = comments
      },
      error: (error) => {
        console.log(error)
      }
    })
  }

  addComment(){
    this.comment.datetime = new Date();
    this.productService.addComment(this.comment).subscribe({
      next: (comment : Comment) => {
        this.initialiseComments();
        const product = this.data.products.find(x => x.id === this.data.productId);
        if (product?.comments) {
          product.comments.push(comment); // Push the new comment to the product's comments array
        }
        this.comment.commentText = null;
        this.comment.commentText = null;

      },
      error: (error) => {
        console.log(error)
      }
    })
  }

  editComment(comment : Comment){
    this.comment.id = comment.id
    this.comment.commentText = comment.commentText;
  }

  deleteComment(commentId : number){
    this.productService.deleteComment(commentId).subscribe({
      next: () => {
        this.initialiseComments();
      },
      error: (error) => {
        console.log(error);
      }
    })
  }

}