import { Component, inject } from '@angular/core';
import { LayoutComponent } from '../../components/layout/layout.component';
import { FilterRowComponent } from '../../components/filter-row/filter-row.component';
import { HttpClient } from '@angular/common/http';
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';

interface CustomerPropFilters {
    name: string;
    type: 'string' | 'number';
}

interface CustomerEventFilters {
    name: string;
    // props: CustomerPropFilters[];
}

interface CustomerFilters {
    events: FormArray<FormControl<CustomerEventFilters | null>>;
}
@Component({
    selector: 'app-customer-filter',
    imports: [LayoutComponent, FilterRowComponent, ReactiveFormsModule, AsyncPipe],
    templateUrl: './customer-filter.component.html',
    styleUrl: './customer-filter.component.scss',
})
export class CustomerFilterComponent {
    http = inject(HttpClient);
    fb = inject(FormBuilder);

    data$ = this.http.get<{ events: any[] }>('https://br-fe-assignment.github.io/customer-events/events.json');

    form = this.fb.group<CustomerFilters>({
        events: this.fb.array<CustomerEventFilters>([]),
    });

    get events() {
        return this.form.get('events') as FormArray;
    }

    ngOnInit() {
        this.data$.subscribe((x) => console.log(x));
    }

    addEvent() {
        const x = this.fb.control({
            name: '',
            // props: [],
        });

        this.events!.push(x);

        console.log(this.form.value);
    }
}
