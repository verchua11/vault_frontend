import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Project } from 'src/app/core/models/project.model';
import { ProjectService } from 'src/app/core/project.service';
import { VaultStateService } from 'src/app/core/vault-state.service';
import { VaultService } from 'src/app/core/vault.service';

declare var $;

@Component({
  selector: 'app-trashed',
  templateUrl: './trashed.component.html',
  styleUrls: ['./trashed.component.scss'],
})
export class TrashedComponent implements OnInit, OnDestroy {
  selectedNav: string;
  selectedProject: Project;
  projects: Array<Project> = [];

  isFolder = false;
  isFile = false;

  metadata = [];
  folderFile = [];
  fileList = [];
  folderList = [];

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
      this.VaultService.viewDeletedFile().subscribe((response:any) => {
        this.prepareRecentItems(response);
      })
    );
    this.subscriptions.push(
      this.VaultStateService.newSelectedProject.subscribe(
        (project) => {
          if (project) {
            this.selectedProject = project;
          }
        }
      )
    );
  }

  public prepareRecentItems(recentItems) {
    console.log('recentItems are:', recentItems);
    if (recentItems.trashed) {
      recentItems.trashed.forEach(item => {
        let segment = item.path.split('/');
        let fileInfo = {};
        let folderInfo = {};
  
        if (segment.length > 2) {
          //if folder
          if (segment[segment.length-1] == "") {
            folderInfo = {
              "name": segment[segment.length-2],
              "Key": item.path,
              "project_id": item.project_id,
              "deleted_type": "folder",
            }
            this.folderList.push(folderInfo);
          } else { //else, file
            fileInfo = {
              "name": segment[segment.length-1],
              "Key": item.path,
              "project_id": item.project_id,
              "deleted_type": "file"
            }
            this.fileList.push(fileInfo);
          }
        }
      });
  
      this.folderFile['folder'] = this.folderList;
      this.folderFile['file'] = this.fileList;
  
      if (this.folderFile['folder'].length > 0) {
        this.isFolder = true;
      }
  
      if (this.folderFile['file'].length > 0) {
        this.isFile = true;
      }
    }
  }

  public generateRecentItems(section: any) {
    if (this.folderFile[section]) {
      return this.folderFile[section].reverse();
    }
  }

  public untrash(item: any) {
    let project_id = item.project_id;
    let path = item.path;
    this.subscriptions.push(
      this.VaultService.unDeleteFile(project_id, path).subscribe((response:any) => {
        this.prepareRecentItems(response);
      })
    );
  }

  public deleteForever(item: any) {
    let path = item.path;
    this.subscriptions.push(
      this.VaultService.deleteForever(path).subscribe((response:any) => {
        this.prepareRecentItems(response);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public setSelectedProject(project: Project) {
    this.VaultStateService.updateSelectedProject(project);
    this.selectedNav = project.project_name;
    this.router.navigateByUrl('/home/my-vault');
  }
}
