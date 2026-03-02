import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: false,
  templateUrl: './button.html',
  styleUrls: ['./button.css']
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'outline' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Output() buttonClick = new EventEmitter<Event>();

  get buttonClasses(): string {
    const baseClass =
      'inline-flex items-center gap-2 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variantClasses = {
      primary:
        'bg-primary text-white hover:bg-primary/80 focus:ring-blue-500',
      secondary:
        'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      outline:
        'border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500'
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };

    const disabledClass = this.disabled
      ? 'opacity-50 cursor-not-allowed pointer-events-none'
      : '';

    return [
      baseClass,
      variantClasses[this.variant],
      sizeClasses[this.size],
      disabledClass
    ]
      .filter(Boolean)
      .join(' ');
  }

  onClick(event: Event) {
    if (!this.disabled) {
      this.buttonClick.emit(event);
    }
  }
}