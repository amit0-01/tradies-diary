import { Component, Input, OnInit, Inject } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import swal from 'sweetalert2';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { DatasourceService} from '../services/datasource.service';
import { NgxSpinnerService } from "ngx-spinner";
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../services/format-datepicker';
import {FormBuilder, FormGroup, Validators, FormArray, FormControl} from "@angular/forms";
import { ConfirmedValidator  } from '../services/confirm-password.validator';
import * as moment from 'moment';
import {ActivatedRoute, Params, Router} from '@angular/router';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';

declare const $: any;

@Component({
  template: `
    <a [routerLink]="[]" (click)="openDialog()"><i class="material-icons">preview</i></a>
  `
})
export class ProjectApprovalRenderComponent implements ViewCell, OnInit {

  public renderValue;

 @Input() value: string | number;
 @Input() rowData: any;

  animal: string;
  name: string;

  constructor(
    public dialog: MatDialog,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    private afs: AngularFirestore,
    ) {  }

  ngOnInit() {
    this.renderValue = this.value;
    console.log(this.renderValue);
  }

  showSwal() {
        // swal({
        //     title: 'Input something',
        //     html: '<div class="form-group">' +
        //         '<input id="input-field" type="text" class="form-control" /><input matInput formControlName="lastName" type="text">' +
        //         '</div>',
        //     showCancelButton: true,
        //     confirmButtonClass: 'btn btn-success',
        //     cancelButtonClass: 'btn btn-danger',
        //     buttonsStyling: false
        // }).then(function(result) {
        //     swal({
        //         type: 'success',
        //         html: 'You entered: <strong>' +
        //             $('#input-field').val() +
        //             '</strong>',
        //         confirmButtonClass: 'btn btn-success',
        //         buttonsStyling: false

        //     })
        // }).catch(swal.noop)
    }

    openDialog(): void {
        console.log(this.renderValue);
        const dialogRef = this.dialog.open(ProjectApprovalDialog, {
            width: '400px',
            data: this.renderValue
        });

        dialogRef.afterClosed().subscribe(result => {
          
          // if(result == 'success'){   
          //     setTimeout(function(){
          //       window.location.reload();
          //     }, 1000);  
          // }
        });
    }
}

@Component({
    selector: 'projectapproval-dialog',
    templateUrl: 'projectapprovaldialog.html',
    providers: [
      {provide: DateAdapter, useClass: AppDateAdapter},
      {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ]
  })
export class ProjectApprovalDialog implements OnInit {
  
    approvalForm: FormGroup;
    createProjectForm: FormGroup;

    chkeditmode = false;

    urgencyChoices= [
      {value: 'Low', viewValue: 'Low'},
      {value: 'Medium', viewValue: 'Medium'},
      {value: 'High', viewValue: 'High'},
    ]

    public projectRequestData;
    public userDetails;

    adminData;

    colorBtnDefault;
    colorHlightDefault

    constructor(
      private data_api: DatasourceService,
      private spinnerService: NgxSpinnerService,
      private formBuilder: FormBuilder,
      public dialogRef: MatDialogRef<ProjectApprovalDialog>,
      public dialog: MatDialog,
      private router: Router,
      private afs: AngularFirestore,
      @Inject(MAT_DIALOG_DATA) public data
      ) {}
  
    onNoClick(): void {
      this.dialogRef.close();
    }
    ngOnInit() {
        console.log(this.data);
        this.getAdminSettings();
        this.approvalForm = this.formBuilder.group({
            clientName: ['', Validators.required],
            company: [''],
            individual: [''],
            abn: [''],
            siteAddress: [''],
            siteName: [''],
            contactNumber: [''],
            contactEmail: [''],
            sendInvoicesTo: [''],
            urgency: [''],
            descriptionWorks: [''],
            rates: [''],
            latitude: [''],
            longitude: [''],
      });

      this.createProjectForm = this.formBuilder.group({
          projectName: ['', Validators.required],
          clientName: ['', Validators.required],
          projectAddress: [''],
          latitude: [''],
          longitude: [''],
          clientEmail: [''],
          projectStatus: [''],
          bgName: [''],
          uploadFolder: [''],
      });

      this.getProjectRequest();
        
        if (localStorage.getItem('currentUser')) {
          this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
        }

    }

    getAdminSettings(){
      this.data_api.getFBAdminSettings().subscribe((data) => {
            console.log(data);
            this.adminData = data;
            this.colorBtnDefault = data.colourEnabledButton ? data.colourEnabledButton : '';
            this.colorHlightDefault = data.colourHighlight ? data.colourHighlight : '';
        }); 
    }

    onButtonEnter(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
      console.log(hoverName);
    }

    onButtonOut(hoverName: HTMLElement) {
        hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
    }

    public addLog(id){
        // let newDetails;
        // newDetails += 'Company:';

        let today = new Date();
        let passData = {
            todaysDate: today,
            log: 'Approve a Project',
            method: 'approve',
            subject: 'project-request',
            subjectID: this.data.id,
            data: this.approvalForm.value,
            url: window.location.href
        }
        
        this.data_api.addActivityLog(this.userDetails.user_id,passData)
          .subscribe(
            (result) => {
              console.log(result);
              this.dialogRef.close('success');
              this.router.navigate(['/projects/edit/'+id]);
            }
        ); 
    }

    public approveProject(){
      this.spinnerService.show();
      this.data_api.approveProjectRequest(this.approvalForm.value)
      .subscribe(
        (data1) => {
          if(data1){

              swal.fire({
                  title: "New Project Approved and Created!",
                  // text: "You clicked the button!",
                  buttonsStyling: false,
                  customClass: {
                    confirmButton: 'btn btn-success',
                  },
                  icon: "success"
              })

              this.spinnerService.hide();
              this.addLog(data1);
          }else{
            swal.fire({
                title: "Error in Approving New Project",
                // text: "You clicked the button!",
                buttonsStyling: false,
                customClass: {
                  confirmButton: 'btn btn-success',
                },
                icon: "error"
            })
            this.spinnerService.hide();
          }
      },
      (error) => {
          console.log(error)
          swal.fire({
              title: error.error.message,
              // text: "You clicked the button!",
              buttonsStyling: false,
              customClass: {
                confirmButton: 'btn btn-success',
              },
              icon: "error"
          })
          this.spinnerService.hide();
      }
      
    );  

    }
    public approveFBProject(){
      if (this.approvalForm.invalid) {

          swal.fire({
              title: "Please fill required fields!",
              // text: "You clicked the button!",
              buttonsStyling: false,
              customClass: {
                confirmButton: 'btn btn-success',
              },
              icon: "error"
          })

          return;
      } 

      this.spinnerService.show();

      let clientEmailArray = [];
      let clientNameArray = [];

      clientNameArray.push(this.approvalForm.value.clientName);
      clientEmailArray.push(this.approvalForm.value.contactEmail);

      this.createProjectForm.patchValue({
          projectName: this.approvalForm.value.siteName,
          clientName: clientNameArray,
          projectAddress: this.approvalForm.value.siteAddress,
          latitude: this.approvalForm.value.latitude,
          longitude: this.approvalForm.value.longitude,
          clientEmail: clientEmailArray,
          bgName: 'bgpdf',
          projectStatus: 'active',
          uploadFolder: this.approvalForm.value.siteName + ' - ' +this.afs.createId()
       });

      this.data_api.createProject(this.createProjectForm.value).then(() => {
        this.data_api.updateFBProjectRequestApprove(this.data.id).then(() => {
          this.spinnerService.hide();
            this.spinnerService.hide();
            this.router.navigate(['/projects']);
            $.notify({
              icon: 'notifications',
              message: 'New Project Created'
            }, {
                type: 'success',
                timer: 1000,
                placement: {
                    from: 'top',
                    align: 'center'
                },
                template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0} alert-with-icon" role="alert">' +
                  '<button mat-button type="button" aria-hidden="true" class="close" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
                  '<i class="material-icons" data-notify="icon">notifications</i> ' +
                  '<span data-notify="title">{1}</span> ' +
                  '<span data-notify="message">{2}</span>' +
                  '<div class="progress" data-notify="progressbar">' +
                    '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
                  '</div>' +
                  '<a href="{3}" target="{4}" data-notify="url"></a>' +
                '</div>'
            });
            this.dialogRef.close();
        });
      });

    }

    updateProjectRequest(): void {

        if (this.approvalForm.invalid) {

          swal.fire({
              title: "Please fill required fields!",
              // text: "You clicked the button!",
              buttonsStyling: false,
              customClass: {
                confirmButton: 'btn btn-success',
              },
              icon: "error"
          })

          return;
      } 

        this.spinnerService.show();

        console.log(this.approvalForm.value);
        this.data_api.updateFBProjectRequest(this.data.id, this.approvalForm.value).then(() => {
            console.log('Updated item successfully!');
            this.spinnerService.hide();
            $.notify({
              icon: 'notifications',
              message: 'New Project Request Updated'
            }, {
                type: 'success',
                timer: 1000,
                placement: {
                    from: 'top',
                    align: 'center'
                },
                template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0} alert-with-icon" role="alert">' +
                  '<button mat-button type="button" aria-hidden="true" class="close" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
                  '<i class="material-icons" data-notify="icon">notifications</i> ' +
                  '<span data-notify="title">{1}</span> ' +
                  '<span data-notify="message">{2}</span>' +
                  '<div class="progress" data-notify="progressbar">' +
                    '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
                  '</div>' +
                  '<a href="{3}" target="{4}" data-notify="url"></a>' +
                '</div>'
            });
            this.dialogRef.close();
          });
    }

    public getProjectRequest(){
      this.spinnerService.show();
      // this.data_api.getProjectRequest(this.data.id).subscribe((data) => {
      //         console.log(data);
              this.projectRequestData = this.data;

              this.approvalForm.patchValue({
                clientName: this.data.clientName,
                company: this.data.company,
                individual: this.data.individual,
                abn: this.data.abn,
                siteAddress: this.data.siteAddress,
                siteName: this.data.siteName,
                contactNumber: this.data.contactNumber,
                contactEmail: this.data.contactEmail,
                sendInvoicesTo: this.data.sendInvoicesTo,
                urgency: this.data.urgency,
                descriptionWorks: this.data.descriptionWorks,
                rates: this.data.rates,
                latitude: this.data.latitude,
                longitude: this.data.longitude,
              });
              
              this.spinnerService.hide();
      //   }
      // );
    }
}
 