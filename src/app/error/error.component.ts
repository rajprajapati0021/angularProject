import { Component } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { Router } from 'express';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './error.component.html',
  styleUrl: './error.component.css'
})
export class ErrorComponent {

}
