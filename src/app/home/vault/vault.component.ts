import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProjectService } from 'src/app/core/project.service';
import { VaultService } from 'src/app/core/vault.service';
import { NzUploadFile } from 'ng-zorro-antd/upload';

declare var $;
@Component({
  selector: 'app-vault',
  templateUrl: './vault.component.html',
  styleUrls: ['./vault.component.scss'],
})
export class VaultComponent implements OnInit, OnDestroy {
  nodes = [];
  selectedNode = null;
  breadcrumbs = [];

  folders = [];
  directoryLevel = 0;

  isVisible = false;

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
    private VaultService: VaultService
  ) {}

  beforeUpload = (file: NzUploadFile): boolean => {
    console.log(file);
    this.fileList = [file];
    this.uploadForm.patchValue({
      uploadedFile: file,
    });
    return false;
  };

  ngOnInit(): void {
    this.subscriptions.push(
      this.ProjectService.getProjects().subscribe((response: any) => {
        const ids = [];
        response.projects.forEach((p) => {
          ids.push(p.project_id);
        });

        this.subscriptions.push(
          this.VaultService.getFolders(ids).subscribe((response: any) => {
            console.log(response);
            this.folders = [];
            response.results.forEach((result) => {
              result.forEach((res) => {
                let folders = res
                  .split('/')
                  .filter((v) => v !== '' && v !== 'projects');

                this.folders.push(folders);
              });
            });
          })
        );
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
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

  public openUploadModal() {
    this.isVisible = true;
  }

  public submitUpload() {
    if (this.uploadForm.value.uploadType === '1') {
      this.subscriptions.push(
        this.VaultService.uploadFile(
          this.uploadForm.value.uploadedFile,
          'projects/' + this.breadcrumbs.join('/')
        ).subscribe((response) => {
          console.log(response);
        })
      );
    } else {
      this.subscriptions.push(
        this.VaultService.uploadFolder(
          this.uploadForm.value.folderName,
          'projects/' + this.breadcrumbs.join('/')
        ).subscribe((response) => {
          console.log(response);
        })
      );
    }
  }

  public navigateBreadcrumb(node: any, index: number) {
    this.selectedNode = node;
    this.directoryLevel -= this.breadcrumbs.splice(index + 1).length;
  }
}
