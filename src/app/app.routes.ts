import { Routes } from '@angular/router';
import { CustomerFilterComponent } from './pages/customer-filter/customer-filter.component';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => CustomerFilterComponent,
    },
];
