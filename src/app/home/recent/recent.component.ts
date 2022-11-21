import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Project } from 'src/app/core/models/project.model';
import { ProjectService } from 'src/app/core/project.service';
import { VaultStateService } from 'src/app/core/vault-state.service';
import { VaultService } from 'src/app/core/vault.service';
import { VaultFolderService } from 'src/app/core/vault-folder.service';
import { UserAuthService } from 'src/app/core/user-auth.service';
import * as moment from 'moment';

@Component({
  selector: 'app-recent',
  templateUrl: './recent.component.html',
  styleUrls: ['./recent.component.scss'],
})
export class RecentComponent implements OnInit {
  projects: Array<Project> = [];
  selectedProject: Project;
  recentItems: any;
  folderFile = [];
  files = [];
  selectedFile: any;
  starredList: any;
  userInfo: any;

  allowDelete = false;
  isDownloading = false;
  isLoadingVault = true;
  isMobile = false;
  isDeleting = false;
  isLoaded = false;
  prevent = false;
  timer: any;

  subscriptions: Subscription[] = [];

  constructor(
    private ProjectService: ProjectService,
    private VaultStateService: VaultStateService,
    private VaultService: VaultService,
    private VaultFolderService: VaultFolderService,
    private UserAuthService: UserAuthService,
  ) {}

  ngOnInit(): void {
    this.userInfo = this.UserAuthService.getUserInfo();
    if(window.innerWidth <= 768) {
      this.isMobile = true;
    }
    if(this.userInfo.role != 3 && this.userInfo.role !== '4') {
      this.allowDelete = true;
    }

    this.subscriptions.push(
      this.VaultService.getUserViewed().subscribe((response:any) => {
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
    const arr = [];
    // if(this.isLoaded == false) {
      recentItems.viewed.forEach(item => {
        if(item.is_deleted != 1) {
          let segment = item.path.split('/');
          let fileInfo = {};
          if (segment[segment.length-1] != '') {
            fileInfo = {
              "name": segment[segment.length-1],
              "Key": item.path,
              "project_id": item.project_id,
              "isDeleted": 0,
            }
            this.checkStarred(item, fileInfo);
          }
        }
      });
    // }
    this.isLoadingVault = false;
    this.isDeleting = false;
    this.isLoaded = true;
  }

  public checkStarred(dir, fileInfo) {
    var found = 0;
    this.subscriptions.push(
      this.VaultService.getUserStarred().subscribe((response:any) => {
        this.starredList = response.starred;
        this.starredList.forEach(item => {
          if (dir.path == item.path) {
            if (dir.is_starred) {
              if (dir.is_starred == item.is_starred) {
                fileInfo['finalStarred'] = item.is_starred;
                found = 1;
              } else {
                fileInfo['finalStarred'] = (item.is_starred) ? item.is_starred : 0;
                found = 1;
              }
            } else {
              fileInfo['finalStarred'] = item.is_starred;
              found = 1;
            }
          }
        });
        if ( found == 0 ) {
          fileInfo['finalStarred'] = 0;
        }
      })
    );
    this.folderFile.push(fileInfo);
  }

  public copyLocation(file: any) {
    let fullPath = file.Key;
    let pathSegment = fullPath.split('/');
    let pathProject = pathSegment.splice(2);
    pathProject = pathProject.join('/');
    let fullProject = pathSegment[1].split('-');

    fullProject.pop();
    for(var i = 0; i < fullProject.length; i++) {
      fullProject[i] = fullProject[i].charAt(0).toUpperCase() + fullProject[i].slice(1);
    }

    let projectName = fullProject.join(' ');
    let finalClipboardText = `Project: "` + projectName + `"\nFile path: "` + pathProject +`"`;
    
    navigator.clipboard.writeText(finalClipboardText).then(function() {
      console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
      console.error('Async: Could not copy text: ', err);
    });

    var x = document.getElementById("clipboard-toast");
    x.className = "show";
    x.style.zIndex = "9999";
    setTimeout(function(){ x.className = x.className.replace("show", ""); x.style.zIndex= "-9999"}, 3000);
  }
  
  public selectFile(folder: any) {
    const _this = this;
    this.timer = setTimeout(function () {
      if (!_this.prevent) {
        _this.selectedFile = _this.folderFile.find(
          (dir) => dir.Key === folder.Key
        );
      }
      _this.prevent = false;
    }, 200);
    this.subscriptions.push(
      this.VaultService.updateUserViewed(folder.Key).subscribe((response:any) => {
      })
    );
    this.subscriptions.push(
      this.VaultService.getUserViewed().subscribe((response:any) => {
      })
    );
  }

  public getFormattedDate(date: string) {
    return moment(date).format('MMM DD, YYYY');
  }

  public regenerateRecent() {
    this.subscriptions.push(
      this.VaultService.getUserViewed().subscribe((response:any) => {
        this.isLoaded = false;
        this.prepareRecentItems(response);
      })
    );
  }

  public deleteFile(folder: any, isFolder: boolean) {
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

    this.subscriptions.push(
      this.VaultService.deleteFile(path, objectTarget).subscribe(
        (response: any) => {
          this.folderFile = [];
          this.regenerateRecent();
        }
      )
    );
  }

  public generateRecentItems() {
    return this.folderFile.reverse();
  }
  
  public openProject(project: Project) {
    if (this.selectedProject !== project)
      this.VaultStateService.updateSelectedProject(project);
  }

  public downloadFile(file: any) {
    this.isDownloading = true;
    this.subscriptions.push(
      this.VaultService.downloadFile(
        file.Key.split('/')
          .slice(0, file.Key.split('/').length - 1)
          .join('/') + '/',
        file.name
      ).subscribe(async (response: any) => {
        this.VaultService.download(response.results.effectiveUri).subscribe(
          (blob) => {
            const a = document.createElement('a');
            const objectUrl = URL.createObjectURL(blob);
            a.href = objectUrl;
            a.download = file.name;
            a.click();
            URL.revokeObjectURL(objectUrl);

            // this.VaultStateService.addToRecent(
            //   file.Key,
            //   file.project_id
            // );
          }
        );

        this.isDownloading = false;
      })
    );
  }

  public addToStarred(folder: any) {
    var objectTarget = '';
    this.subscriptions.push(
      this.VaultService.toggleStarStatus(folder.Key, objectTarget, 'add').subscribe(
        (response: any) => {
          folder.finalStarred = 1;
        }
      )
    );
  }

  public removeFromStarred(folder: any) {
    var objectTarget = '';
    this.subscriptions.push(
      this.VaultService.toggleStarStatus(folder.Key, objectTarget, 'remove').subscribe(
        (response: any) => {
          folder.finalStarred = 0;
        }
      )
    );
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
