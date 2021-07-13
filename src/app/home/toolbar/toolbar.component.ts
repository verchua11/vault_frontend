import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserAuthService } from 'src/app/core/user-auth.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent implements OnInit {
  userInfo: any;
  isVisible = false;

  constructor(
    private UserAuthService: UserAuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userInfo = this.UserAuthService.getUserInfo();
  }

  public openLogoutModal() {
    this.isVisible = true;
  }

  public closeLogoutModal() {
    this.isVisible = false;
  }

  public logout() {
    this.UserAuthService.doLogout();
    this.closeLogoutModal();
    this.router.navigateByUrl('/');
  }
}
