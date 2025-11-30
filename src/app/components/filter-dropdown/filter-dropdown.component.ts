import { CommonModule } from '@angular/common';
import { Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

export type FilterType = 'string' | 'number';

export interface FilterOption {
    label: string;
    value: string;
}

@Component({
    selector: 'app-filter-dropdown',
    imports: [CommonModule, FormsModule],
    templateUrl: './filter-dropdown.component.html' ,
    styleUrls: ['./filter-dropdown.component.scss'],
})
export class FilterDropdownComponent {
    activeType = signal<FilterType>('string');
    selectionChange = output<{
        type: FilterType;
        option: FilterOption;
    }>();

    isOpen = signal(false);
    selectedOption = signal<FilterOption | null>(null);

    private optionsMap: Record<FilterType, FilterOption[]> = {
        string: [
            { label: 'equals', value: 'eq' },
            { label: 'does not equal', value: 'neq' },
            { label: 'contains', value: 'contains' },
            { label: 'does not contain', value: 'not_contains' },
        ],
        number: [
            { label: 'equals', value: 'eq' },
            { label: 'greater than', value: 'gt' },
            { label: 'less than', value: 'lt' },
            { label: 'between', value: 'btw' },
        ],
    };

    get currentOptions(): FilterOption[] {
        return this.optionsMap[this.activeType()];
    }

    toggleDropdown() {
        this.isOpen.set(!this.isOpen());
    }

    setType(type: FilterType) {
        this.activeType.set(type);
    }

    selectOption(option: FilterOption) {
        this.selectedOption.set(option);
        this.selectionChange.emit({ type: this.activeType(), option });
        this.isOpen.set(false);
    }
}
