import { Routes } from "@angular/router";
import { ExpenseComponent } from "../pages/expense/expense.component";
import { ExpenseFormComponent } from "../pages/expense-form/expense-form.component";
import { LoginComponent } from "../pages/authentication/login/login.component";
import { RegisterComponent } from "../pages/authentication/register/register.component";
import { TransactionsComponent } from "../pages/transactions/transactions.component";
import { authGuard } from "../guards/auth.guard";
import { AuthLayoutComponent } from "../pages/layouts/auth-layout/auth-layout.component";
import { MainLayoutComponent } from "../pages/layouts/main-layout/main-layout.component";
import { ConfigurationsComponent } from "../pages/configurations/configurations/configurations.component";

// Importando os layouts

export const routes: Routes = [
  {
    path: "",
    component: AuthLayoutComponent, // Layout sem sidebar
    children: [
      { path: "login", component: LoginComponent },
      { path: "register", component: RegisterComponent },
    ],
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: "",
    component: MainLayoutComponent, 
    canActivate: [authGuard],
    children: [
      { path: "dashboard", component: ExpenseComponent },
      { path: "configurations", component: ConfigurationsComponent },
      { path: "transactions", component: TransactionsComponent },
      { path: "expense-form", component: ExpenseFormComponent },
      { path: "expense-form/:id", component: ExpenseFormComponent },
    ]
  },

  { path: '**', redirectTo: '/login' }
];
