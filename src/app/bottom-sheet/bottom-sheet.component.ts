import { Component, inject, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { Product } from '../models/product';
import { AuthService } from '../services/auth.service';
import { ProductService } from '../services/product.service';
import { FlexLayoutModule, FlexModule } from '@angular/flex-layout';
import { MatListModule } from '@angular/material/list';
import { SharedModule } from '../shared/shared.module';
import { Comment } from '../models/comment';

@Component({
  selector: 'app-bottom-sheet',
  standalone: true,
  imports: [MatListModule,SharedModule,FlexLayoutModule, FlexModule],
  templateUrl: './bottom-sheet.component.html',
  styleUrl: './bottom-sheet.component.css'
})
export class BottomSheetComponent {
  comments : Comment[] | null = null
  userDetail : any
  authService = inject(AuthService);
  isShowCommentLoader : boolean = false
  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: { productId: bigint; product: Product },private productService : ProductService) {
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
    this.isShowCommentLoader = true;
    this.productService.GetAllComments(this.data.productId).subscribe({
      next: (comments : Comment[]) => {
        this.comments = comments
        this.data.product.comments?.splice(0);
        this.data.product.comments = this.comments
        this.isShowCommentLoader = false
      },
      error: (error) => {
        console.log(error)
        this.isShowCommentLoader = false
      }
    })
  }

  addComment(){
    this.isShowCommentLoader = true
    this.productService.addComment(this.comment).subscribe({
      next: (comment : Comment) => {
        // if (this.data.product.comments) {
        //   this.data.product.comments.push(comment); // Push the new comment to the product's comments array
        // }
        this.comment.id = 0;
        this.comment.commentText = null;
        this.initialiseComments();

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
