import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-modal-generic',
  standalone: false,
  templateUrl: './modal.html',
})

export class ModalComponent {
  @Input() title: string = 'Título';
  @Input() actionText: string = 'Confirmar';
  @Input() actionText2: string = 'Cancelar';
  @Input() actionFunction: () => void = () => { };
  @Input() canCloseOnAction: boolean = false;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  @ViewChild('content', { static: true }) content!: TemplateRef<any>;

  constructor() { }

  open() {
    // Modal functionality removed
  }

  onAction() {
    this.actionFunction();
    this.confirmed.emit();
    if(this.canCloseOnAction) {
      // Modal dismiss functionality removed
    }
  }

  onCancel() {
    this.cancelled.emit();
    // Modal dismiss functionality removed
  }
}