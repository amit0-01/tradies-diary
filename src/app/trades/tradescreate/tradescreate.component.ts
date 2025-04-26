import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Inject} from '@angular/core';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../services/format-datepicker';
import { DatasourceService } from '../../services/datasource.service';
import { PdfImage } from '../../services/pdf-image';
import { PreviewImage } from '../../services/preview-image';
import { Observable, Observer } from "rxjs";
import swal from 'sweetalert2';
// import * as Chartist from 'chartist';
//import { MatDialog, MatDialogRef, MatCalendarBody } from '@angular/material';
import { Input } from '@angular/core';
//import * as $$ from 'jQuery';
import { NgxSpinnerService } from "ngx-spinner";
import { AuthenticationService } from '../../shared/authentication.service';
import {FormBuilder, FormGroup, Validators, FormArray, FormControl} from "@angular/forms";
import { DatePipe } from '@angular/common';
import {MatChipInputEvent} from '@angular/material/chips';
import {ActivatedRoute, Params, Router} from '@angular/router';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import {ENTER, COMMA} from '@angular/cdk/keycodes';
import { ConfirmedValidator  } from '../../services/confirm-password.validator';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
// import {NgxImageCompressService} from 'ngx-image-compress';
import {countries} from '../../services/country-data-store'
import { RoleChecker } from '../../services/role-checker.service';
import imageCompression from 'browser-image-compression';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil, startWith } from 'rxjs/operators';
import { MatSelect } from '@angular/material/select';
import * as moment from 'moment';

declare const $: any;


@Component({
  selector: 'app-tradescreate',
  templateUrl: './tradescreate.component.html',
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS},
    DatePipe
  ]
})
export class TradesCreateComponent implements OnInit {

    addFestForm: FormGroup;
    public listCostCentres= [];
    public userDetails;
    
    adminData;

    colorBtnDefault;
    
    breaktimes=[
      {value: '00:00', viewValue: 'No Breaks'},
      {value: '00:15', viewValue: '15 minutes'},
      {value: '00:30', viewValue: '30 minutes'},
      {value: '00:45', viewValue: '45 minute'},
      {value: '01:00', viewValue: '1 hour'},
    ]
    
    defaultWorkers='[{"staffName":"Worker 1","start":"7:00 AM","break":"00:30","finish":"3:30 PM"},{"staffName":"Worker 2","start":"7:00 AM","break":"00:30","finish":"3:30 PM"},{"staffName":"Worker 3","start":"7:00 AM","break":"00:30","finish":"3:30 PM"},{"staffName":"Worker 4","start":"7:00 AM","break":"00:30","finish":"3:30 PM"},{"staffName":"Worker 5","start":"7:00 AM","break":"00:30","finish":"3:30 PM"}]';

    constructor(
      private formBuilder: FormBuilder,
      private router: Router,
      public dialog: MatDialog,
      private data_api: DatasourceService,
      private spinnerService: NgxSpinnerService,
      ) {}
  

      public addLog(id){
          let today = new Date();
          let passData = {
              todaysDate: today,
              log: 'Created New Trade - Global List',
              method: 'create',
              subject: 'trade',
              subjectID: id,
              data: this.addFestForm.value,
              url: window.location.href,
              userID: this.userDetails.user_id,
              userName: this.userDetails.name
          }
          this.data_api.addFBActivityLog(passData).then(() => {
            this.spinnerService.hide();
            this.router.navigate(['/trades']);
          });
      }

      createTrades(): void {

        if (this.addFestForm.invalid) {

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

        console.log(this.addFestForm.value);
        this.data_api.createTrades(this.addFestForm.value).then((result) => {
          console.log(result);
            console.log('Created new item successfully!');
            // this.spinnerService.hide();
            // this.router.navigate(['/trades']);
          this.addLog(result);
            $.notify({
              icon: 'notifications',
              message: 'New Trades Created'
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
            
          });
        this.spinnerService.hide();
    }


    // public addNewTrade() {
  
     
    //     if (this.addFestForm.invalid) {
    //       alert('invalid');
    //       return;
    //     }
  
    //     console.log(this.addFestForm.value);
        
    //     this.spinnerService.show();
  
    //     // let agentData = {
    //     //     "name": this.addFestForm.value.firstName,
    //     // };
  
    //     this.data_api.addTrade(this.addFestForm.value)
    //     .subscribe(
    //       (result) => {
    //         if(result){
  
    //             swal.fire({
    //                 title: "New Trade Created!",
    //                 // text: "You clicked the button!",
    //                 buttonsStyling: false,
    //                 customClass: {
    //                   confirmButton: 'btn btn-success',
    //                 },
    //                 icon: "success"
    //             })
  
    //             this.spinnerService.hide();

    //             this.addLog(result);
    //             // setTimeout(function(){
    //             //   window.location.reload();
    //             // }, 1000);  
  
    //         }else{
  
    //           swal.fire({
    //               title: "Error in Creating New Trade",
    //               // text: "You clicked the button!",
    //               buttonsStyling: false,
    //               customClass: {
    //                 confirmButton: 'btn btn-success',
    //               },
    //               icon: "error"
    //           })
  
    //           this.spinnerService.hide();
  
    //         }
    //     },
    //     (error) => {
    //         console.log(error)
    //         swal.fire({
    //             title: error.error.message,
    //             // text: "You clicked the button!",
    //             buttonsStyling: false,
    //             customClass: {
    //               confirmButton: 'btn btn-success',
    //             },
    //             icon: "error"
    //         })
            
    //     }
        
    //   );  
    // }
  
    public onTradeWorkerName(){
        this.staffFormArray().at(0).get('staffName').patchValue(this.addFestForm.value.tradeName);
    }

    // public addLog(id){
    //       // let newDetails;
    //       // newDetails += 'Company:';
      
    //       let today = new Date();
    //       let passData = {
    //           todaysDate: today,
    //           log: 'Created New Trade Global List',
    //           data: this.addFestForm.value,
    //           url: window.location.href,
    //           method: 'create',
    //           subject: 'trade',
    //           subjectID: id
    //       }
          
    //       this.data_api.addActivityLog(this.userDetails.user_id,passData)
    //         .subscribe(
    //           (result) => {
    //             console.log(result);
    //             // this.dialogRef.close('success');

    //             this.router.navigate(['/trades']);

    //           }
    //       ); 
    // }
    
    ngOnInit() {
      this.getAdminSettings();
      if (localStorage.getItem('currentUser')) {
          this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
      }
  
      this.addFestForm = this.formBuilder.group({
        tradeCompanyName: ['', Validators.required],
        trade: [''],
        tradeName: [''],
        tradeEmail: [''],
        tradePhone: [''],
        tradedefaultCostcode: [''],
        staffFormArray: this.formBuilder.array([]),
      }, {
      });

      this.getFBCostcentres();

      if (this.defaultWorkers){
        this.staffFormArray().clear()
        let i = 0;
        JSON.parse(this.defaultWorkers).forEach(t => {

          var teacher: FormGroup = this.createStaffForm();
          this.staffFormArray().push(teacher);

          i++;
        });
        this.staffFormArray().patchValue(JSON.parse(this.defaultWorkers));

      }
    }

    getAdminSettings(){
        this.data_api.getFBAdminSettings().subscribe((data) => {
            console.log(data);
            this.adminData = data;
            this.colorBtnDefault = data.colourEnabledButton ? data.colourEnabledButton : '';
        }); 
    }

    onButtonEnter(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
      console.log(hoverName);
    }

    onButtonOut(hoverName: HTMLElement) {
        hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
    }

    staffFormArray(): FormArray {
      return this.addFestForm.get("staffFormArray") as FormArray
    }

    addStaffForm(): void {
      // this.staffFormArray = this.editForm.get('staffFormArray') as FormArray;
      this.staffFormArray().push(this.createStaffForm());
    }

    removeStaffForm(i): void {
      // this.staffFormArray = this.editForm.get('staffFormArray') as FormArray;
      this.staffFormArray().removeAt(i)
    }

    duplicateStaffForm(i): void {
      // this.staffFormArray = this.editForm.get('staffFormArray') as FormArray;

        this.staffFormArray().push(this.createStaffForm());

        let len = (this.staffFormArray().length - 1)

        this.staffFormArray().at(len).get('start').patchValue(this.staffFormArray().at(i).get('start').value);
        this.staffFormArray().at(len).get('break').patchValue(this.staffFormArray().at(i).get('break').value);
        this.staffFormArray().at(len).get('finish').patchValue(this.staffFormArray().at(i).get('finish').value);

    }

    public  createStaffForm(): FormGroup {
      return this.formBuilder.group({
          staffID: Math.random().toString(36).substr(2, 9),
          staffName: '',
          start: '',
          break: '',
          finish: '',
      });
    }

    public getFBCostcentres(): void {
      this.data_api.getFBCostcentres().subscribe(data => {
          if(data){
            if(data.costcentreArray){
                data.costcentreArray.forEach(data =>{ 
                    this.listCostCentres.push(data)
                })
            }
          }
      });
    }
    
    openAddCostCentresDialog(): void {
        const dialogRef = this.dialog.open(CostcentresAddDialog, {
            width: '400px',
            // data: this.renderValue
        });
  
        dialogRef.afterClosed().subscribe(result => {
            console.log(result);
            if(result){   
                this.getFBCostcentres();
                this.addFestForm.patchValue({
                  defaultCostcode: result.toString()
                });
            }
        });
    }

    public changeTimeDialog(control, empIndex, data): void {
      const dialogRef = this.dialog.open(ChangeTimeDialog, {
          width: '320px',
          data: data
      });

      dialogRef.afterClosed().subscribe(result => {

          console.log(result);

          if(result){  

            this.staffFormArray().at(empIndex).get(control).patchValue(result);

              // if(control == 'start'){

              //   this.addFestForm.patchValue({
              //     start: result,
              // });
              // }else if(control == 'finish'){

              //   this.addFestForm.patchValue({
              //     finish: result,
              //   });

              // }


          }
      });
    
  }

}

@Component({
  selector: 'changetime-adddialog',
  templateUrl: 'changetime-adddialog.html',
})

  export class ChangeTimeDialog implements OnInit {
  
    addFestForm: FormGroup;
    mytime;

    constructor(
      private formBuilder: FormBuilder,
      public dialogRef: MatDialogRef<ChangeTimeDialog>,
      private data_api: DatasourceService,
      private spinnerService: NgxSpinnerService,
      @Inject(MAT_DIALOG_DATA) public data) {}
  
    onNoClick(): void {
      this.dialogRef.close();
    }
  
    get g(){
      return this.addFestForm.controls;
    }
    
    public setTime() {
        console.log(moment(this.mytime).format('hh:mm A'));
        this.dialogRef.close(moment(this.mytime).format('hh:mm A'));
    }
  
    ngOnInit() {
      console.log(this.data)
      let t = this.data; 
      let cdt = moment(t, 'hh:mm A');
      console.log(cdt.format('YYYY-MM-DD HH:mm'));
      this.mytime = cdt.format('YYYY-MM-DD HH:mm');
    }
    

}

@Component({
    selector: 'costcentres-adddialog',
    templateUrl: 'costcentres-adddialog.html',
  })
  
  export class CostcentresAddDialog implements OnInit {
  
    addFestForm: FormGroup;
    userDetails;

    constructor(
      private formBuilder: FormBuilder,
      public dialogRef: MatDialogRef<CostcentresAddDialog>,
      private data_api: DatasourceService,
      private spinnerService: NgxSpinnerService,
      @Inject(MAT_DIALOG_DATA) public data) {}
  
    onNoClick(): void {
      this.dialogRef.close();
    }
  
    get g(){
      return this.addFestForm.controls;
    }
    
    public addNewCostcentre() {
  
     
        if (this.addFestForm.invalid) {
          alert('invalid');
          return;
        }
  
        console.log(this.addFestForm.value);
        
        this.spinnerService.show();
  
        // let agentData = {
        //     "name": this.addFestForm.value.firstName,
        // };
  
        this.data_api.addCostcentre(this.addFestForm.value)
        .subscribe(
          (result) => {
            if(result){
  
                swal.fire({
                    title: "New Cost Centre Created!",
                    // text: "You clicked the button!",
                    buttonsStyling: false,
                    customClass: {
                      confirmButton: 'btn btn-success',
                    },
                    icon: "success"
                })
                
                this.addCostLog(result)

                this.spinnerService.hide();
  
            }else{
  
              swal.fire({
                  title: "Error in Creating New Cost Centre",
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
            
        }
        
      );  
    }
  
    public addCostLog(id){
        // let newDetails;
        // newDetails += 'Company:';

        let today = new Date();
        let passData = {
            todaysDate: today,
            log: 'Created New Cost Centre - Global List',
            method: 'create',
            subject: 'costcentre',
            subjectID: id,
            data: this.addFestForm.value,
            url: window.location.href
        }
        
        this.data_api.addActivityLog(this.userDetails.user_id,passData)
          .subscribe(
            (result) => {
              console.log(result);
              this.dialogRef.close('success');
            }
        ); 
    }

    ngOnInit() {
      this.addFestForm = this.formBuilder.group({
        name: ['', Validators.required],
      }, {
      });

      if (localStorage.getItem('currentUser')) {
          this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
      }
    }
  }