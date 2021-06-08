import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserAuthService } from '../core/user-auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, AfterViewInit {
  @ViewChild('backgroundVideo') backgroundVideo: ElementRef;

  subscriptions$: Subscription[] = [];

  loginForm = new FormGroup({
    username: new FormControl(''),
    password: new FormControl(''),
  });

  errorMessage: string;
  showForgotPassword = false;

  constructor(
    private Router: Router,
    private UserAuthService: UserAuthService
  ) {}

  ngAfterViewInit(): void {
    this.backgroundVideo.nativeElement.muted = true;
    this.backgroundVideo.nativeElement.loop = true;
    this.backgroundVideo.nativeElement.play();
  }

  ngOnInit(): void {}

  login() {
    this.Router.navigateByUrl('/home');
    // if (this.isFormValid()) {
    //   this.subscriptions$.push(
    //     this.UserAuthService.doLogin(
    //       this.loginForm.value.username,
    //       this.loginForm.value.password
    //     ).subscribe(
    //       (response: any) => {
    //         localStorage.setItem(
    //           'expiry',
    //           response.authentication.expires_in + 3600000
    //         );
    //         localStorage.setItem('token', response.authentication.access_token);
    //         localStorage.setItem(
    //           'user_info',
    //           JSON.stringify(response.user_info)
    //         );

    //         this.UserAuthService.userRole.next(
    //           this.UserAuthService.getUserInfo().role
    //         );
    //         this.resetForm();
    //         this.Router.navigateByUrl('/agile/project-summary');
    //       },
    //       (error) => {
    //         this.errorMessage = error.error;
    //       }
    //     )
    //   );
    // }
  }

  isFormValid() {
    let isValid = true;

    if (!this.loginForm.get('username').value) {
      isValid = false;
    }

    if (!this.loginForm.get('password').value) {
      isValid = false;
    }

    this.errorMessage = isValid ? '' : 'Provide email and password.';
    return isValid;
  }

  resetForm() {
    this.loginForm.reset();
    this.errorMessage = null;
  }
}
