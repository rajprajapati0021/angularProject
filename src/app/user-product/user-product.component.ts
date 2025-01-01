import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FlexLayoutServerModule } from '@angular/flex-layout/server';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { Product } from '../models/product';
import { ProductService } from '../services/product.service';
import { SharedModule } from '../shared/shared.module';
import { ProductCardComponent } from "../product-card/product-card.component";
import { CardTypeEnum } from '../enums/card-type.enum';
@Component({
  selector: 'app-user-product',
  standalone: true,
  imports: [ReactiveFormsModule, SharedModule, FlexLayoutModule, FlexLayoutServerModule, MatExpansionModule, ProductCardComponent],
  templateUrl: './user-product.component.html',
  styleUrl: './user-product.component.css',
})
export class UserProductComponent implements OnInit {
  selectedFile: string | ArrayBuffer | null | undefined = null;
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('addProductBtnTxt') addProductBtnTxt! : ElementRef;
  isSmallScreen: boolean = false;
  addProductForm!: FormGroup;
  products : Product[] = [];
  cardType : CardTypeEnum = CardTypeEnum.UserProductCard

  constructor(private breakpointObserver: BreakpointObserver,private productService: ProductService) {
    this.breakpointObserver.observe([Breakpoints.Tablet]).subscribe(result => {
      this.isSmallScreen = result.matches; // True for small screens
    });
  }

  ngOnInit(){
   
    this.initialiseForm();
    this.getProducts()
  }

  initialiseForm(){
    this.addProductForm = new FormGroup({
      id: new FormControl(0),
      name: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      price: new FormControl('', [Validators.required]),
      stock: new FormControl('', [Validators.required]),
      imageUrl: new FormControl(null, [Validators.required]),
      file: new FormControl(null) // File control, it will hold the file object
    });
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  selectFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {

      const file = input.files[0];
      this.addProductForm.patchValue({ file }); 
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedFile = e.target?.result;
      };
      reader.readAsDataURL(file);
    }
  }

  addProduct(): void {

    var formData = new FormData();
    formData.append('id', this.addProductForm.get('id')?.value);
    formData.append('name', this.addProductForm.get('name')?.value);
    formData.append('description', this.addProductForm.get('description')?.value);
    formData.append('price', this.addProductForm.get('price')?.value);
    formData.append('stock', this.addProductForm.get('stock')?.value);
    if(this.addProductForm.get('imageUrl')?.value){
      formData.append('imageUrl', this.addProductForm.get('imageUrl')?.value);
    }

    const file = this.addProductForm.get('file')?.value;
    if (file) {
      formData.append('file', file, file.name); // 'file' is the name of the form control
    }


    this.productService.addProduct(formData).subscribe({
      next: () => {
        console.log('Product added successfully');
        this.getProducts();
        this.initialiseForm();
        this.selectedFile = ''
        this.addProductBtnTxt.nativeElement.innerText = 'Add Product'
        this.addProductForm.markAsPristine();
        console.log(this.addProductForm);
      },
      error: (error) => {
        console.error('Error adding product:', error);
      },
    });
  }

  getProducts(){

    this.productService.getProducts(null).subscribe({
      next: (productList: Product[]) => {
        this.products = productList || []; 
      },
      error: (error) => {
        this.products = []; // Reset the products on error
        console.error('Failed to load products:', error.message);
      },
    });
    
  }

  deleteProduct(productId : bigint){
        this.products = this.products.filter(product => product.id != productId)
  }

  editProduct(product : Product){
    this.addProductForm.setValue({
      "id":product.id,
      "name":product.name,
      "description": product.description,
      "price" : product.price,
      "stock" : product.stock,
      "imageUrl" : product.imageUrl,
      "file" : null

    })
    this.selectedFile = product.imageUrl
    this.addProductBtnTxt.nativeElement.innerText = 'Edit Product'

  }

}
