import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { UserProductComponent } from './user-product/user-product.component';
import { authGuard } from './guards/auth.guard';
import { ProfileComponent } from './profile/profile.component';
import { ErrorComponent } from './error/error.component';
import { ArtisticProductComponent } from './artistic-product/artistic-product.component';
import { LoaderComponent } from './loader/loader.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path : 'home', component: HomeComponent, canActivate: [authGuard]},
  { path : 'your-product', component: UserProductComponent, canActivate: [authGuard]},
  { path : 'artistic-products', component: ArtisticProductComponent, canActivate: [authGuard]},
  { path : 'profile', component: ProfileComponent, canActivate: [authGuard]},
  { path: '**', component: ErrorComponent } 
];
