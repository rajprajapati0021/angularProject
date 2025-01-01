import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { FlexLayoutModule, FlexModule } from '@angular/flex-layout';
import { Product } from '../models/product';
import { ProductCardComponent } from "../product-card/product-card.component";
import { ProductService } from '../services/product.service';
import { CardTypeEnum } from '../enums/card-type.enum';


@Component({
  selector: 'app-artistic-product',
  standalone: true,
  imports: [FlexLayoutModule, CommonModule, FlexModule, ProductCardComponent],
  templateUrl: './artistic-product.component.html',
  styleUrl: './artistic-product.component.css'
})
export class ArtisticProductComponent implements OnInit {

  products : Product[] = []
  isSmallScreen: boolean = false;
  likeLoading : boolean = false;
  cardType = CardTypeEnum; 

  constructor(private productService : ProductService, breakpointObserver : BreakpointObserver, private renderer : Renderer2){
    breakpointObserver.observe([Breakpoints.Tablet]).subscribe(result => {
      this.isSmallScreen = result.matches
    })
  }

  ngOnInit(): void {
    this.getAllProducts()
    console.log(this.products)
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
}

// @Component({
//   selector: 'bottom-sheet-overview-example-sheet',
//   templateUrl: 'bottom-sheet-overview-example-sheet.html',
//   standalone: true,
//   imports: [MatListModule,SharedModule,FlexLayoutModule, FlexModule],
// })
// export class BottomSheetOverviewExampleSheet implements OnInit {
//   comments : Comment[] | null = null
//   userDetail : any
//   authService = inject(AuthService);
//   constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: { productId: bigint; product: Product },private productService : ProductService) {
//   }
//   ngOnInit(): void {
//     this.initialiseComments();
//     this.userDetail = this.authService.userClaims();
//   }
//   comment : Comment = {
//     id : 0,
//     commentText : null,
//     datetime : null,
//     productId : this.data.productId,
//     user : null
//   }

//   initialiseComments(){
//     this.productService.GetAllComments(this.data.productId).subscribe({
//       next: (comments : Comment[]) => {
//         this.comments = comments
//       },
//       error: (error) => {
//         console.log(error)
//       }
//     })
//   }

//   addComment(){
//     this.comment.datetime = new Date();
//     this.productService.addComment(this.comment).subscribe({
//       next: (comment : Comment) => {
//         if (this.data.product.comments) {
//           this.data.product.comments.push(comment); // Push the new comment to the product's comments array
//         }
//         this.comment.commentText = null;
//         this.comment.commentText = null;

//       },
//       error: (error) => {
//         console.log(error)
//       }
//     })
//   }

//   editComment(comment : Comment){
//     this.comment.id = comment.id
//     this.comment.commentText = comment.commentText;
//   }

//   deleteComment(commentId : number){
//     this.productService.deleteComment(commentId).subscribe({
//       next: () => {
//         this.initialiseComments();
//       },
//       error: (error) => {
//         console.log(error);
//       }
//     })
//   }

// }