import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-step-header',
    imports: [],
    templateUrl: './step-header.component.html',
    styleUrl: './step-header.component.scss',
})
export class StepHeaderComponent {
    @Input() stepNumber: number = 0;
    @Input() stepName: string = 'Unnamed step';

    @Output() copy = new EventEmitter<void>();
    @Output() delete = new EventEmitter<void>();

    onCopy() {
        this.copy.emit();
    }

    onDelete() {
        this.delete.emit();
    }
}

