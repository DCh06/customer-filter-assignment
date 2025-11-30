import { ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { LayoutComponent } from '../../components/layout/layout.component';
import { HttpClient } from '@angular/common/http';
import { AbstractControl, FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { FilterDropdownComponent } from '../../components/filter-dropdown/filter-dropdown.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
    destroyRef = inject(DestroyRef);
    cd = inject(ChangeDetectorRef);

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
            properties: this.fb.nonNullable.array([]),
        });

        const control = <FormArray>this.form.get('events');
        x.get('type')?.valueChanges
            .pipe(
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((val) => (<FormArray>x.get('properties'))?.clear());

        control.push(x);
    }

    addProp(eventControl: AbstractControl) {
        const x = this.fb.group({
            property: '',
            typeToDisplay: 'string',
            optionToDisplay: '',
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

        propControl.patchValue({
            typeToDisplay: event.type,
            optionToDisplay: event.option.value,
        });

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

    deleteEvent(eventControlIndex: number) {
        console.log(eventControlIndex);
        this.events.removeAt(eventControlIndex);
    }

    copyEvent(eventControlIndex: number) {
        const x = this.events.at(eventControlIndex);
        const clone = this.fb.group({
            type: x.get('type')?.value.toString(),
            properties: this.fb.array(
                x.get('properties')?.value.map((prop: any) =>
                    this.fb.group({
                        property: prop.property.toString(),
                        typeToDisplay: prop.typeToDisplay.toString(),
                        optionToDisplay: prop.optionToDisplay.toString(),
                        options: this.fb.array(
                            prop.options.map((option: any) =>
                                this.fb.group({
                                    option: option.option,
                                    type: option.type,
                                    value: option.value,
                                }),
                            ),
                        ),
                    }),
                ),
            ),
        });
        
        clone.get('type')?.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((val) => {
                (<FormArray>clone.get('properties'))?.clear();
            });
        
        this.events.push(clone, { emitEvent: true });
    }

    deleteProp(propControls: FormArray, index: number) {
        propControls.removeAt(index);
    }

    removeAllFilters() {
        this.events.clear();
        this.form.reset();
    }

    applyFilters() {
        console.log(this.form.value);
    }
}
