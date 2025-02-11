import { Routes } from '@angular/router';
import { ExpenseComponent } from '../pages/expense/expense.component';
import { ExpenseFormComponent } from '../pages/expense-form/expense-form.component';
import { LoginComponent } from '../pages/authentication/login/login.component';
import { RegisterComponent } from '../pages/authentication/register/register.component';
import { authGuard } from '../guards/auth.guard';
import { TransactionsComponent } from '../pages/transactions/transactions.component';
import { ConfigurationsComponent } from '../pages/configurations/configurations/configurations.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent},
    { path: 'register', component: RegisterComponent},
    // { path: 'dashboard', component: ExpenseComponent , canActivate: [authGuard]}, 
    { path: 'dashboard', component: ExpenseComponent , canActivate: [authGuard]}, 
    { path: '',redirectTo:'/login', pathMatch:'full' }, 
    { path: 'configurations', component: ConfigurationsComponent }, 
    { path: 'transactions', component: TransactionsComponent }, 
    { path: 'expense-form', component: ExpenseFormComponent },
    { path: 'expense-form/:id', component: ExpenseFormComponent },
];

