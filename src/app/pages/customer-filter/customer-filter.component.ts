import { Component, inject } from '@angular/core';
import { LayoutComponent } from '../../components/layout/layout.component';
import { HttpClient } from '@angular/common/http';
import { AbstractControl, FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { FilterDropdownComponent } from '../../components/filter-dropdown/filter-dropdown.component';

// interface CustomerPropFilters {
//     name: string;
//     type: 'string' | 'number';
// }

// interface CustomerEventFilters {
//     name: string;
//     props: FormArray<FormControl<CustomerPropFilters | null>>;
// }

// interface CustomerFilters {
//     events: FormArray<FormGroup<any>>;
// }
interface Data {
    events: {
        type: string;
        properties: {
            property: string;
            type: 'string' | 'number';
        }[];
    }[];
}

@Component({
    selector: 'app-customer-filter',
    imports: [LayoutComponent, ReactiveFormsModule, AsyncPipe, FilterDropdownComponent],
    templateUrl: './customer-filter.component.html',
    styleUrl: './customer-filter.component.scss',
})
export class CustomerFilterComponent {
    http = inject(HttpClient);
    fb = inject(FormBuilder);

    data$ = this.http.get<Data>('https://br-fe-assignment.github.io/customer-events/events.json');

    form = this.fb.group({
        events: this.fb.nonNullable.array([]),
    });

    get events() {
        return this.form.controls.events as FormArray;
    }

    ngOnInit() {
        this.data$.subscribe((x) => console.log(x));
    }

    addEvent() {
        const x = this.fb.group({
            type: '',
            properties: this.fb.array([]),
        });

        const control = <FormArray>this.form.get('events');
        control.push(x);
    }

    addProp(eventControl: AbstractControl) {
        const x = this.fb.group({
            property: '',
            type: 'string',
            options: this.fb.nonNullable.array([]),
        });

        const control = <FormArray>eventControl.get('properties');
        control.push(x);
    }

    getProps(eventControl: AbstractControl) {
        return eventControl.get('properties') as FormArray;
    }

    getOptions(propControl: AbstractControl) {
        return propControl.get('options') as FormArray;
    }

    getPropOptions(eventControl: AbstractControl, data: Data) {
        const x = eventControl.get('type')?.value;
        return data.events[x]?.properties;
    }

    setOption(propControl: AbstractControl, event: any) {
        const x = <FormArray>propControl.get('options');
        x.clear();

        // TODO if more edgecases just change to array in filters
        if (event.option.value === 'btw') {
            const gtGroup = this.fb.group({
                value: '',
                option: 'gt',
                type: 'number',
            });
            const ltGroup = this.fb.group({
                value: '',
                option: 'lt',
                type: 'number',
            });
            x.push(gtGroup);
            x.push(ltGroup);
        } else {
            const y = this.fb.group({
                option: event.option.value,
                type: event.type,
                value: '',
            });

            x.push(y);
        }
    }

    tttt1123(eventControl: any) {
        console.log(eventControl.get('props'));
    }

    applyFilters() {
        console.log(this.form.value);
    }
}
