import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
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
  isMobile = false;
  isLoadingVault = true;
  isDownloading = false;
  isDeleting = false;
  prevent = false;

  selectedFile: any;
  timer: any;

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
    if(window.innerWidth <= 768) {
      this.isMobile = true;
    }
    this.subscriptions.push(
      this.VaultService.viewDeletedFile().subscribe((response:any) => {
        this.trashedItems(response);
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

  public trashedItems(recentItems) {
    console.log('Trashed items are:', recentItems);
    if (recentItems.trashed) {
      recentItems.trashed.forEach(item => {
        let segment = item.path.split('/');
        let fileInfo = {};
        let folderInfo = {};
        if (segment.length > 2) {
          //if folder
          if (segment[segment.length-1] == "" || segment[segment.length-1].indexOf('.') == -1) {
            if(segment[segment.length-1] == "") {
              folderInfo = {
                "name": segment[segment.length-2],
                "Key": item.path,
                "project_id": item.project_id,
                "deleted_type": "folder",
                "Size": item.Size,
                "LastModified": item.LastModified,
                "DisplayName": (item.Owner) ? item.Owner.DisplayName : ''
              }
            } else {
              folderInfo = {
                "name": segment[segment.length-1],
                "Key": item.path,
                "project_id": item.project_id,
                "deleted_type": "folder"
              }
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
    this.isLoadingVault = false;
  }

  public generateRecentItems(section: any) {
    if (this.folderFile[section]) {
      return this.folderFile[section].reverse();
    }
  }

  public getFormattedDate(date: string) {
    return moment(date).format('MMM DD, YYYY');
  }

  public untrash(folder: any, isFolder: boolean) {
    var objectTarget = '';
    var path = '';
    var segment = folder.Key.split('/');

    if (isFolder) {
      if (segment[segment.length-1] == "") {
        objectTarget = segment[segment.length-2];
        segment.pop();
        segment.pop();
      } else {
        objectTarget = segment[segment.length-1];
        segment.pop();
      }
    } else {
      objectTarget = segment[segment.length-1];
      segment.pop();
    }
    path = segment.join('/');
    path = path + '/';
    console.log(path, objectTarget);
    this.subscriptions.push(
      this.VaultService.unDeleteFile(path, objectTarget).subscribe((response:any) => {
        this.subscriptions.push(
          this.VaultService.viewDeletedFile().subscribe((response2:any) => {
            this.fileList = [];
            this.folderList = [];
            this.trashedItems(response2);
          })
        );
      })
    );
  }

  public deleteForever(folder: any, isFolder: boolean) {
    var objectTarget = '';
    var path = '';
    var segment = folder.Key.split('/');
    this.isDeleting = true;

    if (isFolder) {
      if (segment[segment.length-1] == "") {
        objectTarget = segment[segment.length-2];
        segment.pop();
        segment.pop();
      } else {
        objectTarget = segment[segment.length-1];
        segment.pop();
      }
    } else {
      objectTarget = segment[segment.length-1];
      segment.pop();
    }
    path = segment.join('/');
    path = path + '/';
    objectTarget = objectTarget + '/';

    this.subscriptions.push(
      this.VaultService.deleteForever(path, objectTarget).subscribe((response:any) => {
        console.log(response);

        this.subscriptions.push(
          this.VaultService.viewDeletedFile().subscribe((response2:any) => {
            this.fileList = [];
            this.folderList = [];
            this.trashedItems(response2);
            this.isDeleting = false;
          })
        );
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public selectDirectory(folder: any) {
    const _this = this;
    this.timer = setTimeout(function () {
      if (!_this.prevent) {
        _this.selectedFile = _this.folderList.find(
          (dir) => dir.Key === folder.Key
        );
      }
      _this.prevent = false;
    }, 200);
  }

  public selectFile(folder: any) {
    const _this = this;
    this.timer = setTimeout(function () {
      if (!_this.prevent) {
        _this.selectedFile = _this.fileList.find(
          (dir) => dir.Key === folder.Key
        );
      }
      _this.prevent = false;
    }, 200);
  }

  public setSelectedProject(project: Project) {
    this.VaultStateService.updateSelectedProject(project);
    this.selectedNav = project.project_name;
    this.router.navigateByUrl('/home/my-vault');
  }

  public getFileIcon(fileName: string) {
    switch (fileName.split('.')[1].toLowerCase()) {
      case 'csv':
      case 'xls':
      case 'xlsx':
        return 'file-excel';
      case 'pdf':
        return 'file-pdf';
      case 'doc':
      case 'docx':
        return 'file-word';
      case 'ppt':
      case 'pptx':
        return 'file-ppt';
      case 'jpeg':
      case 'jpg':
      case 'png':
      case 'gif':
        return 'file-image';
      case 'txt':
        return 'file-text';
      case 'zip':
      case 'rar':
        return 'file-zip';
      default:
        return 'file';
    }
  }
}
