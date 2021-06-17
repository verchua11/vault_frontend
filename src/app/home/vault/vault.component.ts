import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProjectService } from 'src/app/core/project.service';
import { VaultService } from 'src/app/core/vault.service';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { VaultStateService } from 'src/app/core/vault-state.service';
import * as moment from 'moment';
import { NzMessageService } from 'ng-zorro-antd/message';

declare var $;
@Component({
  selector: 'app-vault',
  templateUrl: './vault.component.html',
  styleUrls: ['./vault.component.scss'],
})
export class VaultComponent implements OnInit, OnDestroy {
  selectedProject: string;
  projects = [];

  selectedNode = null;
  breadcrumbs = [];

  folders = [];
  metadata = [];
  directoryLevel = null;
  deletedFiles = [];

  selectedFile: any;

  isVisible = false;
  isLoadingVault = true;
  isDownloading = false;
  isDeleting = false;
  isSubmitting = false;
  prevent = false;
  timer: any;

  uploadForm = new FormGroup({
    uploadType: new FormControl('1'),
    path: new FormControl(''),
    uploadedFile: new FormControl(''),
    folderName: new FormControl(''),
  });

  subscriptions: Subscription[] = [];

  fileList: NzUploadFile[] = [];

  constructor(
    private ProjectService: ProjectService,
    private VaultService: VaultService,
    private VaultStateService: VaultStateService,
    private message: NzMessageService
  ) {}

  beforeUpload = (file: NzUploadFile): boolean => {
    this.fileList = this.fileList.concat(file);
    this.uploadForm.patchValue({
      uploadedFile: this.fileList,
    });
    return false;
  };

  ngOnInit(): void {
    this.isLoadingVault = true;

    this.subscriptions.push(
      this.VaultService.getDeletedFiles().subscribe((response: any) => {
        this.deletedFiles = response.items;

        this.subscriptions.push(
          this.VaultService.getFiles().subscribe((response: any) => {
            this.metadata = response.results;

            this.projects = [];
            this.folders = [];
            response.results.forEach((res) => {
              if (this.deletedFiles.indexOf(res.Key) === -1) {
                let folders = res.Key.split('/');

                if (folders[0] === 'projects') {
                  folders = folders.filter((v) => v !== '' && v !== 'projects');

                  if (folders.length > 0) {
                    this.folders.push(folders);

                    if (this.projects.indexOf(folders[0]) === -1)
                      this.projects.push(folders[0]);
                  }
                }
              }
            });
            this.isLoadingVault = false;

            this.subscriptions.push(
              this.VaultStateService.newSelectedProject.subscribe((project) => {
                if (project) {
                  this.selectedProject = project;
                  this.openProjectFolder(this.selectedProject);
                  this.prevent = false;
                }
              })
            );
          })
        );
      })
    );

    // this.subscriptions.push(
    //   this.VaultService.getFiles().subscribe((response: any) => {
    //
    //     this.metadata = response.results;
    //   })
    // );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public getProjectName(node: string) {
    return this.metadata.find((m) => m.Key === 'projects/' + node + '/')
      .ProjectDetails;
  }

  public getFormattedDate(date: string) {
    return moment(date).format('MMM DD, YYYY');
  }

  public getFolderClass(node: string) {
    if (this.selectedFile) {
      if (node.indexOf('.') === -1) {
        return 'projects/' + this.breadcrumbs.join('/') + '/' + node + '/' ===
          this.selectedFile.Key
          ? 'selected-node'
          : '';
      } else {
        return 'projects/' + this.breadcrumbs.join('/') + '/' + node ===
          this.selectedFile.Key
          ? 'selected-node'
          : '';
      }
    } else return '';
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
    return arr.filter((v) => v.indexOf('.') === -1);
  }

  public getFiles() {
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
    return arr.filter((v) => v.indexOf('.') !== -1);
  }

  public getFileIcon(node: string) {
    switch (node.split('.')[1].toLowerCase()) {
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

  public openNode(node: any) {
    clearTimeout(this.timer);
    this.prevent = true;
    if (node.indexOf('.') === -1) this.openFolder(node);
    else this.openFile(node);
  }

  public selectNode(node: any) {
    const _this = this;
    this.timer = setTimeout(function () {
      if (!_this.prevent) {
        if (node.indexOf('.') === -1) {
          _this.selectedFile = _this.metadata.find(
            (m) =>
              m.Key ===
              'projects/' + _this.breadcrumbs.join('/') + '/' + node + '/'
          );
        } else {
          _this.selectedFile = _this.metadata.find(
            (m) =>
              m.Key === 'projects/' + _this.breadcrumbs.join('/') + '/' + node
          );
        }
      }
      _this.prevent = false;
    }, 200);
  }

  public openProject(project: string) {
    if (this.selectedProject !== project)
      this.VaultStateService.updateSelectedProject(project);
  }

  public openFolderUploadModal() {
    this.resetForm();
    this.uploadForm.patchValue({
      uploadType: '2',
    });
    this.isVisible = true;
  }

  public openFileUploadModal() {
    this.resetForm();
    this.uploadForm.patchValue({
      uploadType: '1',
    });
    this.isVisible = true;
  }

  public closeUploadModal() {
    this.isVisible = false;
  }

  public submitUpload() {
    this.isSubmitting = true;
    if (this.uploadForm.value.uploadType === '1') {
      this.subscriptions.push(
        this.VaultService.uploadFile(
          this.uploadForm.value.uploadedFile,
          'projects/' + this.breadcrumbs.join('/') + '/'
        ).subscribe((response) => {
          this.uploadForm.value.uploadedFile.forEach((file: any) => {
            this.folders.push(
              ('projects/' + this.breadcrumbs.join('/') + '/' + file.name)
                .split('/')
                .filter((v) => v !== '' && v !== 'projects')
            );
          });
          this.isSubmitting = false;
          this.closeUploadModal();
          this.displayMessage('Uploading file complete.');
        })
      );
    } else {
      this.subscriptions.push(
        this.VaultService.uploadFolder(
          this.uploadForm.value.folderName,
          'projects/' + this.breadcrumbs.join('/') + '/'
        ).subscribe((response) => {
          this.folders.push(
            (
              'projects/' +
              this.breadcrumbs.join('/') +
              '/' +
              this.uploadForm.value.folderName +
              '/'
            )
              .split('/')
              .filter((v) => v !== '' && v !== 'projects')
          );
          this.isSubmitting = false;
          this.closeUploadModal();
          this.displayMessage('Creating new folder complete.');
        })
      );
    }
  }

  public downloadFile(node: string) {
    this.isDownloading = true;
    this.subscriptions.push(
      this.VaultService.downloadFile(
        'projects/' + this.breadcrumbs.join('/') + '/',
        node
      ).subscribe(async (response: any) => {
        this.VaultService.download(response.results.effectiveUri).subscribe(
          (blob) => {
            const a = document.createElement('a');
            const objectUrl = URL.createObjectURL(blob);
            a.href = objectUrl;
            a.download = node;
            a.click();
            URL.revokeObjectURL(objectUrl);
          }
        );

        this.isDownloading = false;
      })
    );
  }

  public deleteFile(node: string) {
    this.isDeleting = true;
    const url = 'projects/' + this.breadcrumbs.join('/') + '/' + node;

    this.subscriptions.push(
      this.VaultService.deleteFile(url).subscribe((response) => {
        const del = this.breadcrumbs.concat([node]);

        this.folders.forEach((folder, idx) => {
          let isMatch = true;
          folder.forEach((f, i) => {
            if (f !== del[i]) {
              isMatch = false;
            }
          });

          if (isMatch) {
            this.folders.splice(idx, 1);
          }
        });

        this.isDeleting = false;
        this.displayMessage('Deleting file complete.');
      })
    );
  }

  public navigateBreadcrumb(node: any, index: number) {
    this.selectedNode = node;
    this.directoryLevel -= this.breadcrumbs.splice(index + 1).length;
  }

  private displayMessage(msg: string): void {
    this.message.info(msg);
  }

  private openProjectFolder(project: string) {
    this.selectedNode = project;
    this.directoryLevel = 1;
    this.breadcrumbs = [project];
  }

  private openFolder(node: string) {
    this.selectedNode = node;
    this.directoryLevel++;
    this.breadcrumbs.push(node);
  }

  private openFile(node: string) {}

  private resetForm() {
    this.uploadForm.reset();
    this.fileList = [];
  }
}
