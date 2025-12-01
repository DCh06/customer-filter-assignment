import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { LayoutComponent } from '../../components/layout/layout.component';
import { HttpClient } from '@angular/common/http';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { FilterDropdownComponent } from '../../components/filter-dropdown/filter-dropdown.component';
import { StepHeaderComponent } from '../../components/step-header/step-header.component';
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

type OptionFormGroup = FormGroup<{
    option: FormControl<string>;
    type: FormControl<string>;
    value: FormControl<string>;
}>;

type PropertyFormGroup = FormGroup<{
    property: FormControl<string>;
    typeToDisplay: FormControl<string>;
    optionToDisplay: FormControl<string>;
    options: FormArray<OptionFormGroup>;
}>;

type EventFormGroup = FormGroup<{
    type: FormControl<string>;
    properties: FormArray<PropertyFormGroup>;
}>;

type CustomerFilterForm = FormGroup<{
    events: FormArray<EventFormGroup>;
}>;

@Component({
    selector: 'app-customer-filter',
    imports: [LayoutComponent, ReactiveFormsModule, AsyncPipe, FilterDropdownComponent, StepHeaderComponent],
    templateUrl: './customer-filter.component.html',
    styleUrl: './customer-filter.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerFilterComponent {
    http = inject(HttpClient);
    fb = inject(FormBuilder);
    destroyRef = inject(DestroyRef);
    cd = inject(ChangeDetectorRef);

    data$ = this.http.get<Data>('https://br-fe-assignment.github.io/customer-events/events.json');
    form: CustomerFilterForm = this.fb.group({
        events: this.fb.nonNullable.array<EventFormGroup>([]),
    });

    get events(): FormArray<EventFormGroup> {
        return this.form.controls.events;
    }

    ngOnInit() {
        this.addEvent();
    }

    addEvent() {
        const event: EventFormGroup = this.fb.nonNullable.group({
            type: this.fb.nonNullable.control(''),
            properties: this.fb.nonNullable.array<PropertyFormGroup>([]),
        });

        event.controls.type.valueChanges
            .pipe(
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((val) => event.controls.properties.clear());

        this.events.push(event);
    }

    addProp(eventControl: AbstractControl) {
        const prop: PropertyFormGroup = this.fb.nonNullable.group({
            property: this.fb.nonNullable.control(''),
            typeToDisplay: this.fb.nonNullable.control('string'),
            optionToDisplay: this.fb.nonNullable.control(''),
            options: this.fb.nonNullable.array<OptionFormGroup>([]),
        });

        const control = <FormArray>eventControl.get('properties');
        control.push(prop);
    }

    setOption(propControl: AbstractControl, event: any) {
        console.log(propControl, event);
        const x = <FormArray>propControl.get('options');
        x.clear();

        propControl.patchValue({
            typeToDisplay: event.type,
            optionToDisplay: event.option.value,
        });

        if (event.option.value === 'btw') {
            const gtGroup: OptionFormGroup = this.fb.nonNullable.group({
                value: this.fb.nonNullable.control(''),
                option: this.fb.nonNullable.control('gt'),
                type: this.fb.nonNullable.control('number'),
            });
            const ltGroup: OptionFormGroup = this.fb.nonNullable.group({
                value: this.fb.nonNullable.control(''),
                option: this.fb.nonNullable.control('lt'),
                type: this.fb.nonNullable.control('number'),
            });
            x.push(gtGroup);
            x.push(ltGroup);
        } else {
            const y: OptionFormGroup = this.fb.nonNullable.group({
                option: this.fb.nonNullable.control(event.option.value),
                type: this.fb.nonNullable.control(event.type),
                value: this.fb.nonNullable.control(''),
            });

            x.push(y);
        }
    }

    deleteEvent(eventControlIndex: number) {
        if (this.events.length === 1) {
            return;
        }
        this.events.removeAt(eventControlIndex);
    }

    // todo split so it can be reused for creation
    copyEvent(eventControlIndex: number) {
        const x = this.events.at(eventControlIndex);
        const clone: EventFormGroup = this.fb.nonNullable.group({
            type: this.fb.nonNullable.control(x.controls.type.value),
            properties: this.fb.nonNullable.array<PropertyFormGroup>(
                (x.controls.properties.getRawValue() || []).map((prop) =>
                    this.fb.nonNullable.group({
                        property: this.fb.nonNullable.control(prop.property),
                        typeToDisplay: this.fb.nonNullable.control(prop.typeToDisplay),
                        optionToDisplay: this.fb.nonNullable.control(prop.optionToDisplay),
                        options: this.fb.nonNullable.array<OptionFormGroup>(
                            prop.options.map((option) =>
                                this.fb.nonNullable.group({
                                    option: this.fb.nonNullable.control(option.option),
                                    type: this.fb.nonNullable.control(option.type),
                                    value: this.fb.nonNullable.control(option.value),
                                }),
                            ),
                        ),
                    }),
                ),
            ),
        });
        
        clone.controls.type.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((val) => {
                clone.controls.properties.clear();
            });
        
        this.events.push(clone);
    }

    deleteProp(propControls: FormArray, index: number) {
        propControls.removeAt(index);
    }

    removeAllFilters() {
        this.events.clear();
        this.form.reset();
        this.addEvent();
    }

    applyFilters(data: Data) {
        console.log(this.form.value);
    }
}
