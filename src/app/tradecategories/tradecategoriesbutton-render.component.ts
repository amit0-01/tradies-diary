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
    <a [routerLink]="[]" (click)="openDialog()"><i class="material-icons">edit</i></a>
    <a [routerLink]="[]" (click)="openDeleteDialog()"><i class="material-icons">delete</i></a>
  `
})
export class TradeCategoriesRenderComponent implements ViewCell, OnInit {

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
        const dialogRef = this.dialog.open(TradeCategoriesDialog, {
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

      const dialogRef = this.dialog.open(TradeCategoriesDeleteDialog, {
          width: '400px',
          data: this.renderValue
      });
  
      dialogRef.afterClosed().subscribe(result => {
        console.log(result);
        
          if(result.fest_confirm=='DELETE'){ 

              console.log(result.id);
              this.spinnerService.show();   
                  console.log(result);
                  this.data_api.deleteTradeCategory(result.id)
                  .subscribe((data3) => {
                            // alert(data2);   
                            // if(data2){
                            //     alert("Updated Successfully");
                            // }
                            // alert("Updated Successfully");
                          swal.fire({
                              title: "Trade Category Deleted!",
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
      });
  }

}

@Component({
    selector: 'tradecategories-dialog',
    templateUrl: 'tradecategoriesdialog.html',
    providers: [
      {provide: DateAdapter, useClass: AppDateAdapter},
      {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ]
  })
export class TradeCategoriesDialog implements OnInit {
  
    public agentData;
    editForm: FormGroup;
    pickupChoices= [
      {value: 'admin', viewValue: 'Admin'},
      {value: 'operator', viewValue: 'Operator'},
      {value: 'crew', viewValue: 'Crew'},
    ]

    constructor(
      private data_api: DatasourceService,
      private spinnerService: NgxSpinnerService,
      private formBuilder: FormBuilder,
      public dialogRef: MatDialogRef<TradeCategoriesDialog>,
      @Inject(MAT_DIALOG_DATA) public data
      ) {}
  
    onNoClick(): void {
      this.dialogRef.close();
    }
    ngOnInit() {
        console.log(this.data);
        
        this.editForm = this.formBuilder.group({
          tradecategory: ['', Validators.required],
      });
        this.getTradeCategory();

    }
    public updateTradeCategory() {

      if (this.editForm.invalid) {
        alert('invalid');
        return;
      }
  
      console.log(this.editForm.value);

      this.spinnerService.show();

      this.data_api.updateTradeCategory(this.data.id, this.editForm.value)
          .subscribe(
            (result) => {
                console.log(result);
              if(result){

                  swal.fire({
                      title: "Trade Category Updated",
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
                    title: "Error in Updating Trade Category",
                    // text: "You clicked the button!",
                    buttonsStyling: false,
                    customClass: {
                      confirmButton: 'btn btn-success',
                    },
                    icon: "error"
                })

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
              
          }
          
        );   

    }
    
    public getTradeCategory(){
      this.spinnerService.show();
      this.data_api.getTradeCategory(this.data.id).subscribe((data) => {
              console.log(data);
              this.agentData = data;
              console.log(data);
              this.editForm.patchValue({
                tradecategory: this.agentData[0].trade_category,
              });
              this.spinnerService.hide();
        }
      );
    }
}

@Component({
  selector: 'tradecategories-deletedialog',
  templateUrl: 'tradecategories-deletedialog.html',
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
  ]
})

export class TradeCategoriesDeleteDialog implements OnInit {

  deleteFestForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<TradeCategoriesDeleteDialog>,
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