import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Project } from 'src/app/core/models/project.model';
import { ProjectService } from 'src/app/core/project.service';
import { VaultStateService } from 'src/app/core/vault-state.service';
import { VaultService } from 'src/app/core/vault.service';
import { UserAuthService } from 'src/app/core/user-auth.service';

declare var $;

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent implements OnInit, OnDestroy {
  selectedNav: string;
  selectedProject: Project;
  projects: Array<Project> = [];
  metadata = [];
  userInfo: any;
  allowTrash = false;

  storageSize = 0;

  subscriptions: Subscription[] = [];
  constructor(
    private renderer: Renderer2,
    private router: Router,
    private ProjectService: ProjectService,
    private VaultService: VaultService,
    private VaultStateService: VaultStateService,
    private UserAuthService: UserAuthService,
  ) {}

  ngOnInit(): void {
    this.userInfo = this.UserAuthService.getUserInfo();

    if(this.userInfo.role != 3) {
      this.allowTrash = true;
    }
    
    this.subscriptions.push(
      this.ProjectService.getProjects().subscribe((response: any) => {
        this.projects = response.projects.filter(
          (p) => p.status === 'Approved'
        );
      })
    );

    this.subscriptions.push(
      this.VaultStateService.newSelectedProject.subscribe((project) => {
        if (project) {
          this.selectedProject = project;
          this.selectedNav = project.project_name;
        }
      })
    );

    this.subscriptions.push(
      this.VaultService.getStorageUsed().subscribe((response: any) => {
        this.storageSize = parseFloat(response.results.split(' ')[0]) * 1000;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public getProjectName(node: string) {
    return this.metadata.find((m) => m.Key === 'projects/' + node + '/')
      .ProjectDetails;
  }

  public setSelectedProject(project: Project) {
    if (window.innerWidth <= 768) {
      $('.sidenav').removeClass('show-sidenav');
    }
    this.VaultStateService.updateSelectedProject(project);
    this.selectedNav = project.project_name;
    this.router.navigateByUrl('/home/my-vault');
  }

  sidenavOverlayClicked() {
    $('.sidenav').removeClass('show-sidenav');
  }

  navItemClicked(navItem) {
    if ($(navItem).attr('class').indexOf('subnavi-open') !== -1)
      this.renderer.removeClass(navItem, 'subnavi-open');
    else this.renderer.addClass(navItem, 'subnavi-open');
  }

  navigateTo(route: string) {
    if (window.innerWidth <= 768) {
      $('.sidenav').removeClass('show-sidenav');
    }
    this.selectedNav = route;
    this.router.navigateByUrl(`/home/${route}`);
  }
}
