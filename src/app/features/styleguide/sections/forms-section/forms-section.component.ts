import { Component } from '@angular/core';
import { ChoicesDemoComponent } from './choices-demo/choices-demo.component';
import { SignupFormExampleComponent } from './signup-form-example/signup-form-example.component';
import { TextFieldsDemoComponent } from './text-fields-demo/text-fields-demo.component';

@Component({
  selector: 'app-styleguide-forms-section',
  imports: [ChoicesDemoComponent, SignupFormExampleComponent, TextFieldsDemoComponent],
  templateUrl: './forms-section.component.html',
  styleUrl: './forms-section.component.scss',
})
export class FormsSectionComponent {}
