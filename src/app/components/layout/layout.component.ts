import { Component, output } from '@angular/core';
import { FilterWrapperComponent } from '../filter-wrapper/filter-wrapper.component';

@Component({
    selector: 'app-layout',
    imports: [FilterWrapperComponent],
    templateUrl: './layout.component.html',
    styleUrl: './layout.component.scss',
})
export class LayoutComponent {
    discardFilters = output<void>();
    applyFilters = output<void>();
}
