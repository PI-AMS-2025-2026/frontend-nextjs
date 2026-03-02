import { Meta, moduleMetadata, StoryFn } from '@storybook/angular';
import { Login } from './login';
import { ButtonComponent } from '../../components/button/button'; 
import { CommonModule } from '@angular/common';
import { InputComponent } from '../../components/input/input';

export default {
  title: 'Pages/Login',
  component: Login,
  decorators: [
    moduleMetadata({
      imports: [CommonModule],
      declarations: [Login, ButtonComponent, InputComponent], 
    }),
  ],
} as Meta<Login>;

const Template: StoryFn<Login> = (args) => ({
  props: args,
  template: `
     <app-login
        [background]="background"
        (login)="onLogin($event)"
        (forgotPassword)="onForgotPassword()"
      ></app-login>


  `
});

export const Default = Template.bind({});
Default.args = {
  background: '#f5f5f5',
};


