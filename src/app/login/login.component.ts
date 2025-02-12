import { CommonModule, NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { LoginService } from '../services/login.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NgIf, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  signUpForm: FormGroup
  signInForm: FormGroup;



  constructor(private logInSignUpService: LoginService, private router: Router, private authService : AuthService) {
    this.signUpForm = new FormGroup({
      id : new FormControl(0),
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      age: new FormControl('', Validators.required),
      phoneNumber: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]),
      password: new FormControl('', Validators.required)
    })

    this.signInForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]),
      password: new FormControl('', Validators.required)
    })
  }

  ngOnInit(): void {
    this.signInForm.reset();
  }

  @ViewChild('container') container!: ElementRef;

  signInClick() {
    console.log("signInClick")
    this.container.nativeElement.classList.remove("right-panel-active")
  }

  signUpClick() {
    console.log("signUpClick")
    this.container.nativeElement.classList.add("right-panel-active");
  }
  tokenObject: any;
  async signIn() {   

    this.tokenObject = await firstValueFrom(this.logInSignUpService.signIn(this.signInForm.value)) 
    var isValid: boolean = false;
    if(this.tokenObject.token != null && this.tokenObject.token != "") isValid = true;
    localStorage.setItem("token",this.tokenObject.token)
    if (isValid) {
      // Navigate to home page
      this.authService.authStatus.next(true)
      this.router.navigate(['home']);
    } else {
      // Handle invalid sign-in
      console.log('Invalid credentials');
    }
  }

  async signUp() {
    this.logInSignUpService.signUp(this.signUpForm.value).subscribe({
      next: async () => {
          this.router.navigate(['/login']); // Replace with the desired route
          this.signUpForm.reset();
          this.signInForm.reset();
          await this.signInClick();

      },
      error: (error: HttpErrorResponse) => {
        // Log the error or show an error message to the user
        console.error('Signup failed', error);
        
        // Optionally, display an error message to the user
        alert("An error occurred during sign up. Please try again.");
      }
    })
  }

}
