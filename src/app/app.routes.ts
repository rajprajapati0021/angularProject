import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { UserProductComponent } from './user-product/user-product.component';
import { authGuard } from './guards/auth.guard';
import { ProfileComponent } from './profile/profile.component';
import { ErrorComponent } from './error/error.component';
import { ArtisticProductComponent } from './artistic-product/artistic-product.component';
import { LoaderComponent } from './loader/loader.component';
import { CartComponent } from './cart/cart.component';
import { OrderComponent } from './order/order.component';
import { ChatComponent } from './chat/chat.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path : 'home', component: HomeComponent, canActivate: [authGuard]},
  { path : 'your-product', component: UserProductComponent, canActivate: [authGuard]},
  { path : 'artistic-products', component: ArtisticProductComponent, canActivate: [authGuard]},
  { path : 'profile', component: ProfileComponent, canActivate: [authGuard]},
  { path : 'cart', component: CartComponent, canActivate: [authGuard]},
  { path : 'order', component: OrderComponent, canActivate: [authGuard]},
  { path : 'chat', component: ChatComponent, canActivate: [authGuard]},
  { path: '**', component: ErrorComponent } 
];
