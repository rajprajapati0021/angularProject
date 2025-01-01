import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { LoginService } from '../services/login.service';
import { SignUpFormData } from '../login/sign-up-form-data';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [SharedModule,],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit{

  profileForm!: FormGroup;
  isEditable: boolean = false;
  UserDetail : SignUpFormData | null = null;
  logInService = inject(LoginService)
  authService = inject(AuthService)
  userId: bigint | null;

  constructor() {
    this.initialForm();
    this.userId = this.authService.userClaims().id;
  }

  ngOnInit(): void {
    this.logInService.getUserDetail(this.userId, null).subscribe({
      next: (value: SignUpFormData[]) => {
        this.initialForm(value.at(0)!)
      },
      error: (error: any) => {
        console.error('Error fetching user details:', error);  // Handle error
      }
    });
  }

  initialForm(UserDetail?: SignUpFormData){
    this.profileForm = new FormGroup({
      id: new FormControl({ value: UserDetail?.id || '', disabled: true }),
      firstName: new FormControl({ value: UserDetail?.firstName || '', disabled: true }, [Validators.required]),
      lastName: new FormControl({ value: UserDetail?.lastName || '', disabled: true }, Validators.required),
      age: new FormControl({ value: UserDetail?.age || '', disabled: true }, Validators.required),
      phoneNumber: new FormControl({ value: UserDetail?.phoneNumber || '', disabled: true }, Validators.required),
      email: new FormControl({ value: UserDetail?.email || '', disabled: true }, Validators.required),
    });
  }

  toggleEditMode() {
    this.isEditable = !this.isEditable;
    if (this.isEditable) {
      this.profileForm.enable();
    } else {
      this.profileForm.disable();
    }
  }

  onSubmit(){
    this.isEditable = !this.isEditable;
    this.profileForm.disable();
    this.logInService.signUp(this.profileForm.value).subscribe({
      next : () => {
        
      },
      error : (error : any) => {
        console.log(error);
      }
    })
  }

}

