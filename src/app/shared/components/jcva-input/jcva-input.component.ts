import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'jcva-input',
  templateUrl: './jcva-input.component.html',
  styleUrls: ['./jcva-input.component.scss'],
})
export class JcvaInputComponent implements OnInit {
  @Input() type: string;
  @Input() label: string;
  @Input() placeholder: string;
  @Input() disabled: boolean;
  @Input() hasError: boolean;
  @Input() successful: boolean;
  @Input() mode: string;
  @Input() parentFormControl: FormControl;

  constructor() {}

  ngOnInit(): void {}

  input(value: string) {
    this.parentFormControl.setValue(value);
  }
}
