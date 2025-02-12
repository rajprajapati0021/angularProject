import { Component, OnInit ,AfterViewInit, ViewChild} from '@angular/core';
import { ProductService } from '../services/product.service';
import { Product } from '../models/product';
import {} from '@angular/core';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { Order } from '../models/order';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [MatTableModule, MatPaginatorModule],
  templateUrl: './order.component.html',
  styleUrl: './order.component.css'
})
export class OrderComponent implements OnInit,AfterViewInit  {

  constructor(private productService : ProductService){

    this.initialiseOrder();

  }

  public dataSource : MatTableDataSource<Order> = new MatTableDataSource<Order>();
  public counter = 1;
  @ViewChild(MatPaginator) paginator!: MatPaginator;



  ngOnInit(): void {
  }

  initialiseOrder(){
    this.productService.getOrders().subscribe({
      next: (data) => {
        // this.ORDERS_DATA = [...data]
        this.dataSource = new MatTableDataSource<Order>(data);
        // this.dataSource.filter = 'these';
      },
      error: (err) => {
        console.log(err)
      }
    })
  }

  displayedColumns: string[] = ['position', 'name', 'description', 'price','Pic'];

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;

    this.dataSource.filterPredicate = (data, filter) => {
      // Custom filter logic: match against `name`, `description`, and `price`
      const searchString = filter.trim().toLowerCase();
      return (
        data.product.name.toLowerCase().includes(searchString) ||
        data.product.description.toLowerCase().includes(searchString) ||
        data.product.price.toString().includes(searchString)
      );
  }
}
}

