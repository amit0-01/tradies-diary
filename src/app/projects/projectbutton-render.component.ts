import { Component, Input, OnInit, Inject } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import swal from 'sweetalert2';
// import {MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { DatasourceService} from '../services/datasource.service';
import { NgxSpinnerService } from "ngx-spinner";
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../services/format-datepicker';
import {FormBuilder, FormGroup, Validators, FormArray, FormControl} from "@angular/forms";
import { ConfirmedValidator  } from '../services/confirm-password.validator';
// 16 import {MatLegacyChipInputEvent as MatChipInputEvent} from '@angular/material/legacy-chips';
import {ENTER, COMMA} from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  template: `
    <a [routerLink]="[]" (click)="openDialog()"><i class="material-icons">edit</i></a>
    <a [routerLink]="[]" (click)="openDeleteDialog()"><i class="material-icons">delete</i></a>
  `
})
export class ProjectRenderComponent implements ViewCell, OnInit {

  public renderValue;

 @Input() value: string | number;
 @Input() rowData: any;

  animal: string;
  name: string;

  constructor(
    public dialog: MatDialog,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
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
        const dialogRef = this.dialog.open(ProjectDialog, {
            width: '400px',
            data: this.renderValue
        });

        dialogRef.afterClosed().subscribe(result => {
          
          if(result == 'success'){   
              setTimeout(function(){
                window.location.reload();
              }, 1000);  
          }
        });
    }

    
    openDeleteDialog(): void {

      const dialogRef = this.dialog.open(ProjectDeleteDialog, {
          width: '400px',
          data: this.renderValue
      });
  
      dialogRef.afterClosed().subscribe(result => {
        console.log(result);
        
          if(result.fest_confirm=='DELETE'){ 

              console.log(result.id);
              this.spinnerService.show();   
                  console.log(result);
                  this.data_api.deleteProject(result.id)
                  .subscribe((data3) => {
                            // alert(data2);   
                            // if(data2){
                            //     alert("Updated Successfully");
                            // }
                            // alert("Updated Successfully");
                            swal.fire({
                                title: "Project Deleted!",
                                // text: "You clicked the button!",
                                buttonsStyling: false,
                                customClass: {
                                  confirmButton: 'btn btn-success',
                                },
                                icon: "success"
                            })
                            this.spinnerService.hide();
                            window.location.reload();
                  }); 
  
          }else{
            this.renderValue["fest_confirm"] = "";
              swal.fire({
                  title: "Confirmation Failed!",
                  // text: "You clicked the button!",
                  buttonsStyling: false,
                  customClass: {
                    confirmButton: 'btn btn-success',
                  },
                  icon: "warning"
              })
              
          }
      });
  }

}

@Component({
    selector: 'projects-dialog',
    templateUrl: 'projectsdialog.html',
    providers: [
      {provide: DateAdapter, useClass: AppDateAdapter},
      {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ]
  })
export class ProjectDialog implements OnInit {
  
    public agentData;
    editForm: FormGroup;
    visible: boolean = true;
    selectable: boolean = true;
    removable: boolean = true;
    addOnBlur: boolean = true;
    separatorKeysCodes = [ENTER, COMMA];
    public projectOwners = [];
    
    statusOption = [
      {value: 'active', viewValue: 'Active'},
      {value: 'inactive', viewValue: 'Inactive'},
      {value: 'complete', viewValue: 'Complete'},
    ]

    constructor(
      private data_api: DatasourceService,
      private spinnerService: NgxSpinnerService,
      private formBuilder: FormBuilder,
      public dialogRef: MatDialogRef<ProjectDialog>,
      @Inject(MAT_DIALOG_DATA) public data
      ) {}
  
    onNoClick(): void {
      this.dialogRef.close();
    }
    ngOnInit() {
        console.log(this.data);
        
        this.editForm = this.formBuilder.group({
          projectName: ['', Validators.required],
          clientName: [''],
          jobNumber: [''], 
          projectAddress: [''],
          projectStatus: [''],
          projectOwner: [''],
          clientEmail: this.formBuilder.array([]),
          clientEmailCC: this.formBuilder.array([]),
          clientEmailBCC: this.formBuilder.array([]),
      });
      this.getProject();
      this.getProjectOwners();
        
        
    }

    public getProjectOwners(){
      this.spinnerService.show();
      this.data_api.getProjectOwners().subscribe((data) => {

              data.forEach(data =>{      
                  this.projectOwners.push({id:JSON.stringify(data.id),name: data.name})  
              })
              console.log(this.projectOwners);
              this.spinnerService.hide();
        }
      );
    }

    addClientEmail(event: MatChipInputEvent): void {
        let input = event.input;
        let value = event.value;

        // Add our dcbAccThisWeek
        if ((value || '').trim()) {
            const clientEmail = this.editForm.get('clientEmail') as FormArray;
            clientEmail.push(this.formBuilder.control(value.trim()));
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }
    }

    removeClientEmail(index: number): void {
        const clientEmail = this.editForm.get('clientEmail') as FormArray;

        if (index >= 0) {
          clientEmail.removeAt(index);
        }
    }

    addClientEmailCC(event: MatChipInputEvent): void {
        let input = event.input;
        let value = event.value;

        // Add our dcbAccThisWeek
        if ((value || '').trim()) {
            const clientEmailCC = this.editForm.get('clientEmailCC') as FormArray;
            clientEmailCC.push(this.formBuilder.control(value.trim()));
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }
    }

    removeClientEmailCC(index: number): void {
        const clientEmailCC = this.editForm.get('clientEmailCC') as FormArray;

        if (index >= 0) {
          clientEmailCC.removeAt(index);
        }
    }

    addClientEmailBCC(event: MatChipInputEvent): void {
      let input = event.input;
      let value = event.value;

      // Add our dcbAccThisWeek
      if ((value || '').trim()) {
          const clientEmailBCC = this.editForm.get('clientEmailBCC') as FormArray;
          clientEmailBCC.push(this.formBuilder.control(value.trim()));
      }

      // Reset the input value
      if (input) {
          input.value = '';
      }
    }

    removeClientEmailBCC(index: number): void {
      const clientEmailBCC = this.editForm.get('clientEmailBCC') as FormArray;

      if (index >= 0) {
        clientEmailBCC.removeAt(index);
      }
    }

    public updateProject() {

      if (this.editForm.invalid) {
        alert('invalid');
        return;
      }
  
      console.log(this.editForm.value);

      this.spinnerService.show();

      this.data_api.updateProject(this.data.id, this.editForm.value)
          .subscribe(
            (result) => {
                console.log(result);
              if(result){

                  swal.fire({
                      title: "Project Name Updated",
                      // text: "You clicked the button!",
                      buttonsStyling: false,
                      customClass: {
                        confirmButton: 'btn btn-success',
                      },
                      icon: "success"
                  })

                  this.spinnerService.hide();

                  this.dialogRef.close('success');

              }else{

                  swal.fire({
                      title: "Error in Updating Project",
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
    
    public getProject(){
      this.spinnerService.show();
      this.data_api.getProject(this.data.id).subscribe((data) => {
              console.log(data);
              this.agentData = data;
              let clientEmailsCC;
              let clientEmailsBCC;

              let clientEmails = JSON.parse(this.agentData[0].client_email);
              console.log(this.agentData[0].project_owner_id,);
              this.editForm.patchValue({
                projectName: this.agentData[0].project_name,
                clientName: this.agentData[0].client_name,
                jobNumber:  this.agentData[0].job_number,
                projectOwner:  this.agentData[0].project_owner_id,
                projectAddress:  this.agentData[0].project_address,
                projectStatus:  this.agentData[0].status,
                // clientEmail: JSON.parse(this.agentData[0].client_email),
              });

              
              clientEmails.forEach(value => {
                  const ClientEmails = this.editForm.get('clientEmail') as FormArray;
                  ClientEmails.push(this.formBuilder.control(value));
              });

              if(this.agentData[0].client_email_cc){
                clientEmailsCC = JSON.parse(this.agentData[0].client_email_cc);

                clientEmailsCC.forEach(value => {
                    const ClientEmailCC = this.editForm.get('clientEmailCC') as FormArray;
                    ClientEmailCC.push(this.formBuilder.control(value));
                });

              }
              
              if(this.agentData[0].client_email_bcc){
                clientEmailsBCC = JSON.parse(this.agentData[0].client_email_bcc);

                clientEmailsBCC.forEach(value => {
                    const ClientEmailBCC = this.editForm.get('clientEmailBCC') as FormArray;
                    ClientEmailBCC.push(this.formBuilder.control(value));
                });
              }
                 
              this.spinnerService.hide();
        }
      );
    }
}

@Component({
  selector: 'projects-deletedialog',
  templateUrl: 'projects-deletedialog.html',
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
  ]
})

export class ProjectDeleteDialog implements OnInit {

  deleteFestForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<ProjectDeleteDialog>,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    // this.deleteFestForm = this.formBuilder.group({
    //     // id: [''],
    //     fest_confirm: ['', Validators.required],
    // });
    
  }
}