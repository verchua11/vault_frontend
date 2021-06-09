import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProjectService } from 'src/app/core/project.service';
import { VaultService } from 'src/app/core/vault.service';

@Component({
  selector: 'app-vault',
  templateUrl: './vault.component.html',
  styleUrls: ['./vault.component.scss'],
})
export class VaultComponent implements OnInit {
  nodes = [];
  selectedNode = null;
  breadcrumbs = [];

  folders = [];
  directoryLevel = 0;

  subscriptions: Subscription[] = [];

  constructor(
    private ProjectService: ProjectService,
    private VaultService: VaultService
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.ProjectService.getProjects().subscribe((response: any) => {
        const ids = [];
        response.projects.forEach((p) => {
          ids.push(p.project_id);
        });

        // this.subscriptions.push(
        //   this.VaultService.getFolders(ids).subscribe((response: any) => {
        //     console.log(response);
        //   })
        // );

        this.subscriptions.push(
          this.VaultService.getFolders(
            ids,
            response.projects[ids.length - 1].project_name
          ).subscribe((response: any) => {
            this.folders = [];
            response.results.forEach((res) => {
              let folders = res
                .split('/')
                .filter((v) => v !== '' && v !== 'projects');

              this.folders.push(folders);
            });
          })
        );
      })
    );
  }

  public getFolders() {
    const arr = [];
    this.folders.forEach((f) => {
      if (f[this.directoryLevel])
        if (this.selectedNode) {
          if (
            arr.indexOf(f[this.directoryLevel]) === -1 &&
            this.selectedNode === f[this.directoryLevel - 1]
          )
            arr.push(f[this.directoryLevel]);
        } else {
          if (arr.indexOf(f[this.directoryLevel]) === -1)
            arr.push(f[this.directoryLevel]);
        }
    });
    return arr;
  }

  public openFolder(node: any) {
    this.selectedNode = node;
    this.directoryLevel++;
    this.breadcrumbs.push(node);
  }

  public navigateBreadcrumb(node: any, index: number) {
    this.selectedNode = node;
    this.directoryLevel -= this.breadcrumbs.splice(index + 1).length;
  }

  private isExisting(nodes: Array<any>, node: any, isExisting: boolean) {}
}

export class Node {
  name: string;
  parent: Node;

  constructor(name: string) {
    this.name = name;
    this.parent = null;
  }
}
