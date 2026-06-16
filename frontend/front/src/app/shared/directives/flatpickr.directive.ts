import { Directive, ElementRef, Input, OnDestroy, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import flatpickr from 'flatpickr';
import { Spanish } from 'flatpickr/dist/l10n/es.js';

@Directive({
  selector: '[appFlatpickr]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FlatpickrDirective),
      multi: true
    }
  ]
})
export class FlatpickrDirective implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() appFlatpickr: any = {}; // Opciones adicionales

  private fpInstance: any;
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    const defaultOptions = {
      locale: Spanish,
      dateFormat: 'Y-m-d',
      altInput: true,
      altFormat: 'j M, Y', // Formato bonito "14 Jun, 2026"
      allowInput: true,
      onChange: (selectedDates: Date[], dateStr: string) => {
        this.onChange(dateStr);
      }
    };

    const finalOptions = { ...defaultOptions, ...this.appFlatpickr };
    this.fpInstance = flatpickr(this.el.nativeElement, finalOptions);
  }

  ngOnDestroy(): void {
    if (this.fpInstance) {
      this.fpInstance.destroy();
    }
  }

  // Métodos de ControlValueAccessor
  writeValue(value: any): void {
    if (this.fpInstance) {
      this.fpInstance.setDate(value, false); // false para no lanzar evento onChange
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (this.fpInstance) {
      if (isDisabled) {
        this.fpInstance._input.disabled = true;
        if (this.fpInstance.altInput) {
          this.fpInstance.altInput.disabled = true;
        }
      } else {
        this.fpInstance._input.disabled = false;
        if (this.fpInstance.altInput) {
          this.fpInstance.altInput.disabled = false;
        }
      }
    }
  }
}
