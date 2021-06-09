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
import { AuthService } from '../core/auth.service';

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

  constructor(private Router: Router, private AuthService: AuthService) {}

  ngAfterViewInit(): void {
    this.backgroundVideo.nativeElement.muted = true;
    this.backgroundVideo.nativeElement.loop = true;
    this.backgroundVideo.nativeElement.play();
  }

  ngOnInit(): void {}

  login() {
    if (this.isFormValid()) {
      this.subscriptions$.push(
        this.AuthService.login(
          this.loginForm.value.username,
          this.loginForm.value.password
        ).subscribe(
          (response: any) => {
            console.log(response);
            // localStorage.setItem(
            //   'expiry',
            //   response.authentication.expires_in + 3600000
            // );
            // localStorage.setItem('token', response.authentication.access_token);
            // localStorage.setItem(
            //   'user_info',
            //   JSON.stringify(response.user_info)
            // );

            // this.UserAuthService.userRole.next(
            //   this.UserAuthService.getUserInfo().role
            // );
            this.resetForm();
            this.Router.navigateByUrl('/home/vault');
          },
          (error) => {
            this.errorMessage = 'Invalid username/password.';
          }
        )
      );
    }
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
