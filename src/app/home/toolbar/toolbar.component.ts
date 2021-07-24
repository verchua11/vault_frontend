import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { isObservable, Subscription } from 'rxjs';
import { UserAuthService } from 'src/app/core/user-auth.service';
import { ProjectService } from 'src/app/core/project.service';
import { VaultService } from 'src/app/core/vault.service';
import { VaultStateService } from 'src/app/core/vault-state.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Project } from 'src/app/core/models/project.model';
import {Location} from '@angular/common';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent implements OnInit {
  selectedNav: string;
  userInfo: any;
  currentProjectName: any;
  isVisible = false;
  selectedProject: Project;
  projects: Array<Project> = [];
  subscriptions: Subscription[] = [];

  constructor(
    private UserAuthService: UserAuthService,
    private router: Router,
    private ProjectService: ProjectService,
    private VaultStateService: VaultStateService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.userInfo = this.UserAuthService.getUserInfo();
    this.currentProjectName = 'Browse Project Here';

    this.subscriptions.push(
      this.ProjectService.getProjects().subscribe((response: any) => {
        this.projects = response.projects.filter(
          (p) => p.status === 'Approved'
        );
        const projectVaultPaths = [];
        this.projects.forEach((p) => {
          if (p.vault_path) {
            projectVaultPaths.push(p.vault_path);
          }
        });
      })
    );

    this.subscriptions.push(
      this.VaultStateService.newSelectedProject.subscribe(
        (project) => {
          console.log('vault state service is:', this.VaultStateService);
          // console.log('The project is:',project);
          if (project) {
            this.selectedProject = project;
            this.currentProjectName = this.selectedProject.project_name;
          }
        }
      )
    );
   
  }

  public openLogoutModal() {
    this.isVisible = true;
  }
  //detect selected project and navigate back to my-vault page
  public openProject(project: Project) {
    console.log('selected project is:', project);
    if (this.selectedProject !== project) {
      this.VaultStateService.updateSelectedProject(project);
    } else {
    }
    this.setSelectedProject(project);
  }
  public setSelectedProject(project: Project) {
    this.VaultStateService.updateSelectedProject(project);
    this.selectedNav = project.project_name;
    this.router.navigateByUrl('/home/my-vault');
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
