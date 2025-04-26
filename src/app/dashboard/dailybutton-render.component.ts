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
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  template: `
    <a [routerLink]="[]" (click)="openDeleteDialog()"><i class="material-icons">delete</i></a>
  `
})
export class DailyDeleteRenderComponent implements ViewCell, OnInit {

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

    // openDialog(): void {
    //     console.log(this.renderValue);
    //     const dialogRef = this.dialog.open(VisitorsDialog, {
    //         width: '400px',
    //         data: this.renderValue
    //     });

    //     dialogRef.afterClosed().subscribe(result => {
          
    //       if(result == 'success'){   
    //           setTimeout(function(){
    //             window.location.reload();
    //           }, 1000);  
    //       }
    //     });
    // }

    
    openDeleteDialog(): void {

      const dialogRef = this.dialog.open(DailyDeleteDialog, {
          width: '400px',
          data: this.renderValue
      });
  
      dialogRef.afterClosed().subscribe(result => {
        console.log(result);
        
          if(result){

                if(result.fest_confirm=='DELETE'){ 

                    console.log(result.id);
                    this.spinnerService.show();   
                        console.log(result);
                        this.data_api.deleteDailyReport(result.id)
                        .subscribe((data3) => {
                                  // alert(data2);   
                                  // if(data2){
                                  //     alert("Updated Successfully");
                                  // }
                                  // alert("Updated Successfully");
                                swal.fire({
                                    title: "Daily Report Deleted!",
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
                    this.spinnerService.hide();
                }

          }
      });
  }

}

// @Component({
//     selector: 'visitors-dialog',
//     templateUrl: 'visitorsdialog.html',
//     providers: [
//       {provide: DateAdapter, useClass: AppDateAdapter},
//       {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
//     ]
//   })
// export class VisitorsDialog implements OnInit {
  
//     public agentData;
//     editForm: FormGroup;
//     pickupChoices= [
//       {value: 'admin', viewValue: 'Admin'},
//       {value: 'operator', viewValue: 'Operator'},
//       {value: 'crew', viewValue: 'Crew'},
//     ]

//     public userDetails;
//     public prevdata;

//     constructor(
//       private data_api: DatasourceService,
//       private spinnerService: NgxSpinnerService,
//       private formBuilder: FormBuilder,
//       public dialogRef: MatDialogRef<VisitorsDialog>,
//       @Inject(MAT_DIALOG_DATA) public data
//       ) {}
  
//     onNoClick(): void {
//       this.dialogRef.close();
//     }
//     ngOnInit() {
//         console.log(this.data);
        
//         this.editForm = this.formBuilder.group({
//           name: ['', Validators.required],
//       });
//         this.getVisitor();

//         if (localStorage.getItem('currentUser')) {
//           this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
//         }

//     }

//     public addLog(){
//       // let newDetails;
//       // newDetails += 'Company:';

//       let today = new Date();
//       let passData = {
//           todaysDate: today,
//           log: 'Updated a Visitor - Global List',
//           method: 'update',
//           subject: 'visitor',
//           subjectID: this.data.id,
//           prevdata: this.prevdata,
//           data: this.editForm.value,
//           url: window.location.href
//       }
      
//       this.data_api.addActivityLog(this.userDetails.user_id,passData)
//             .subscribe(
//               (result) => {
//                 console.log(result);
//                 this.dialogRef.close('success');
//               }
//           ); 
//     }

//     public updateVisitor() {

//       if (this.editForm.invalid) {
//         alert('invalid');
//         return;
//       }
  
//       console.log(this.editForm.value);

//       this.spinnerService.show();

//       this.data_api.updateVisitor(this.data.id, this.editForm.value)
//           .subscribe(
//             (result) => {
//                 console.log(result);
//               if(result){

//                   swal.fire({
//                       title: "Visitor Name Updated",
//                       // text: "You clicked the button!",
//                       buttonsStyling: false,
//                       customClass: {
//                         confirmButton: 'btn btn-success',
//                       },
//                       icon: "success"
//                   })

//                   this.addLog();

//                   this.spinnerService.hide();

                  

//               }else{
//                 swal.fire({
//                     title: "Error in Updating Visitor",
//                     // text: "You clicked the button!",
//                     buttonsStyling: false,
//                     customClass: {
//                       confirmButton: 'btn btn-success',
//                     },
//                     icon: "error"
//                 })

//               }
//           },
//           (error) => {
//               console.log(error)
//               swal.fire({
//                   title: error.error.message,
//                   // text: "You clicked the button!",
//                   buttonsStyling: false,
//                   customClass: {
//                     confirmButton: 'btn btn-success',
//                   },
//                   icon: "error"
//               })
              
//           }
          
//         );   

//     }
    
//     public getVisitor(){
//       this.spinnerService.show();
//       this.data_api.getVisitor(this.data.id).subscribe((data) => {
//               console.log(data);
//               this.agentData = data;
//               console.log(data);
//               this.editForm.patchValue({
//                 name: this.agentData[0].visitor_name,
//               });

//               this.prevdata = this.editForm.value;
              
//               this.spinnerService.hide();
//         }
//       );
//     }
// }

@Component({
  selector: 'daily-deletedialog',
  templateUrl: 'daily-deletedialog.html',
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
  ]
})

export class DailyDeleteDialog implements OnInit {

  deleteFestForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<DailyDeleteDialog>,
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