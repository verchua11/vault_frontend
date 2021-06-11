import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProjectService } from 'src/app/core/project.service';
import { VaultStateService } from 'src/app/core/vault-state.service';
import { VaultService } from 'src/app/core/vault.service';

declare var $;

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent implements OnInit, OnDestroy {
  selectedNav: string;
  selectedProject: string;
  folders = [];

  storageSize = 0;

  subscriptions: Subscription[] = [];
  constructor(
    private renderer: Renderer2,
    private router: Router,
    private ProjectService: ProjectService,
    private VaultService: VaultService,
    private VaultStateService: VaultStateService
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.ProjectService.getProjects().subscribe((response: any) => {
        const ids = [];
        response.projects.forEach((p) => {
          ids.push(p.project_id);
        });

        this.subscriptions.push(
          this.VaultService.getFolders(ids).subscribe((response: any) => {
            this.folders = [];
            response.results.forEach((result) => {
              result.forEach((res) => {
                let folders = res
                  .split('/')
                  .filter((v) => v !== '' && v !== 'projects');

                if (this.folders.indexOf(folders[0]) === -1)
                  this.folders.push(folders[0]);
              });
            });
          })
        );
      })
    );

    this.subscriptions.push(
      this.VaultStateService.newSelectedProject.subscribe((project) => {
        if (project) {
          this.selectedProject = project;
          this.selectedNav = project;
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

  public setSelectedProject(project: string) {
    this.VaultStateService.updateSelectedProject(project);
    this.selectedNav = project;
  }

  sidenavOverlayClicked() {
    // this.StateService.sidenavStateUpdated(false);
  }

  navItemClicked(navItem) {
    if ($(navItem).attr('class').indexOf('subnavi-open') !== -1)
      this.renderer.removeClass(navItem, 'subnavi-open');
    else this.renderer.addClass(navItem, 'subnavi-open');
  }

  navigateTo(route: string) {
    this.selectedNav = route;
    this.router.navigateByUrl(`/agile/${route}`);
  }
}
