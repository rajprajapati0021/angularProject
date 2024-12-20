import { CommonModule, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { LoaderService } from '../guards/loader.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [NgIf,CommonModule],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.css'
})
export class LoaderComponent  {
  loaderService = inject(LoaderService)
  isLoading = this.loaderService.loader$;

  
}
