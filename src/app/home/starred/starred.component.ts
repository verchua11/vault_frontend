import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Project } from 'src/app/core/models/project.model';
import { ProjectService } from 'src/app/core/project.service';
import { VaultStateService } from 'src/app/core/vault-state.service';
import { VaultService } from 'src/app/core/vault.service';
import { VaultFolderService } from 'src/app/core/vault-folder.service';
import { UserAuthService } from 'src/app/core/user-auth.service';
import * as moment from 'moment';

declare var $;

@Component({
  selector: 'app-starred',
  templateUrl: './starred.component.html',
  styleUrls: ['./starred.component.scss'],
})
export class StarredComponent implements OnInit {
  projects: Array<Project> = [];
  selectedProject: Project;
  recentItems: any;
  userInfo: any;

  isFolder = false;
  isFile = false;
  allowDelete = false;
  isLoadingVault = true;
  isMobile = false;
  isDownloading = false;
  isDeleting = false;
  prevent = false;

  timer: any;
  folderFile = [];
  fileList = [];
  folderList = [];
  files = [];
  selectedFile: any;

  subscriptions: Subscription[] = [];
  constructor(
    private ProjectService: ProjectService,
    private VaultStateService: VaultStateService,
    private VaultService: VaultService,
    private VaultFolderService: VaultFolderService,
    private router: Router,
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
      this.VaultService.getUserStarred().subscribe((response:any) => {
        this.prepareStarredItems(response);
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

  public prepareStarredItems(recentItems) {
    this.folderList = [];
    this.fileList = [];
    if(recentItems.starred) {
      recentItems.starred.forEach(item => {
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
              "starred_type": "folder",
            }
            if(segment.length <= 5){
              folderInfo["isProject"] = 1;
            }
            this.folderList.push(folderInfo);
          } else { //else, file
            fileInfo = {
              "name": segment[segment.length-1],
              "Key": item.path,
              "project_id": item.project_id,
              "starred_type": "file",
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

    this.subscriptions.push(
      this.VaultService.updateUserViewed(folder.Key).subscribe((response:any) => {
      })
    );
  }

  public getFormattedDate(date: string) {
    return moment(date).format('MMM DD, YYYY');
  }

  public generateRecentItems(section: any) {
    if (this.folderFile[section]) {
      return this.folderFile[section].reverse();
    }
  }
  
  public openProject(project: Project) {
    if (this.selectedProject !== project)
      this.VaultStateService.updateSelectedProject(project);
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

  public removeFromStarred(folder: any) {
    this.subscriptions.push(
      this.VaultService.toggleStarStatus(folder.Key, '', 'remove').subscribe(
        (response: any) => {
          this.regenerateStarred();
        }
      )
    );
  }

  public regenerateStarred() {
    this.subscriptions.push(
      this.VaultService.getUserStarred().subscribe((response:any) => {
        this.prepareStarredItems(response);
      })
    );
  }

  public deleteFile(item: any) {
    this.isDeleting = true;
    this.subscriptions.push(
      this.VaultService.deleteFile(item.Key, '').subscribe(
        (response: any) => {
          this.regenerateStarred();
          // this.VaultFolderService.refreshPage('starred');
        }
      )
    );
    this.viewDeletedFile();
  }

  public viewDeletedFile() {
    this.subscriptions.push(
      this.VaultService.viewDeletedFile().subscribe(
        (response: any) => {
          this.isDeleting = false;
          // this.VaultFolderService.refreshPage('starred');
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
