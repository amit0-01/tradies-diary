import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input, Inject} from '@angular/core';
import { DatasourceService} from '../services/datasource.service';
import { LocalDataSource } from 'ng2-smart-table';
import {FormBuilder, FormGroup, Validators, FormArray, FormControl} from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import * as ExcelJS from "exceljs/dist/exceljs.min.js"
import * as fs from 'file-saver'
// import {LegacyPageEvent as PageEvent} from '@angular/material/legacy-paginator';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../services/format-datepicker';
// import {MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import swal from 'sweetalert2';
import { RoleChecker } from '../services/role-checker.service';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
// import { HttpHeaders } from '@angular/common/http';
import { HttpClient,HttpHeaders,HttpBackend, HttpParams } from '@angular/common/http';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { MatDialog } from '@angular/material/dialog';

declare const $: any;


@Component({
  selector: 'app-projectrequest',
  templateUrl: './projectrequest.component.html',
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS},
    DatePipe
  ]
})
export class ProjectRequestComponent implements OnInit {

    sendProjectRequestForm: FormGroup;

    adminData;

    colorBtnDefault;
    
    constructor(
        private data_api: DatasourceService,
        private formBuilder: FormBuilder,
        private spinnerService: NgxSpinnerService,
        public dialog: MatDialog,
        private rolechecker: RoleChecker,
        public datepipe: DatePipe,
        private http: HttpClient, 
        private functions: AngularFireFunctions
        ) { }

    public ngOnInit() {
        this.sendProjectRequestForm = this.formBuilder.group({
            clientEmail: ['',[Validators.email,Validators.required]],
            clientName: ['', Validators.required],
            openingMessage: ['', Validators.required],
            rates: ['', Validators.required],
            termsConditions: ['', Validators.required],
            closingMessage: ['', Validators.required],
            varLink: [''],
            emailHeaderNewUser2: [''],
            textSignature: [''],
            emailSignature: [''],
        }, {
        });

        this.getAdminSettings();
        
    }

    getAdminSettings(){
        this.data_api.getFBAdminSettings().subscribe((data) => {
            console.log(data);
            if(data){

              this.adminData = data;
              this.colorBtnDefault = data.colourEnabledButton ? data.colourEnabledButton : '';

              if(data.emailHeaderNewUser2){
                this.sendProjectRequestForm.patchValue({
                  emailHeaderNewUser2: data.logo, //emailHeaderNewUser2,
                  textSignature:  data.textSignature,
                  emailSignature: data.emailSignature,
                });
              }
            }
        }); 
    }

    onButtonEnter(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
      console.log(hoverName);
    }

    onButtonOut(hoverName: HTMLElement) {
        hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
    }
    
    get clientEmail() { return this.sendProjectRequestForm.get('clientEmail'); } 
    get clientName() { return this.sendProjectRequestForm.get('clientName'); } 
    get openingMessage() { return this.sendProjectRequestForm.get('openingMessage'); } 
    get rates() { return this.sendProjectRequestForm.get('rates'); } 
    get termsConditions() { return this.sendProjectRequestForm.get('termsConditions'); } 
    get closingMessage() { return this.sendProjectRequestForm.get('closingMessage'); }

    // public sendToClient(){
        
    //     if (this.sendProjectRequestForm.invalid) {
    //         alert('invalid');
    //         return;
    //     }
    
    //     this.spinnerService.show();

    //     let myURL = window.location.href;
    //     let rep1 = "project-request"
    //     let rep2 = "pages/project-client"
    //     let newUrl = myURL.replace(rep1, rep2)
    //     this.sendProjectRequestForm.patchValue({
    //         varLink: newUrl + "?name="+ this.sendProjectRequestForm.value.clientName  + "&rates="+ this.sendProjectRequestForm.value.rates+ "&email=" + this.sendProjectRequestForm.value.clientEmail
    //     });
        
    //     this.data_api.submitForClientProjectRequest(this.sendProjectRequestForm.value).subscribe((data) => {
    //         console.log(data);
    //         this.spinnerService.hide();
    //         this.reset();
    //     });
    // }
    // public reset(){
    //     this.spinnerService.show();
    //     this.sendProjectRequestForm.reset();
    //     this.spinnerService.hide();
    // }

    sendMail() {

      if (this.sendProjectRequestForm.invalid) {
          alert('invalid');
          return;
      }
      this.spinnerService.show();

      //this.data_api.getCurrentProject();
      let myURL = window.location.href;
      let rep1 = "project-request"
      let rep2 = "pages/project-client"
      let newUrl = myURL.replace(rep1, rep2)
      this.sendProjectRequestForm.patchValue({
          varLink: newUrl + "?name="+ this.sendProjectRequestForm.value.clientName  + "&rates="+ this.sendProjectRequestForm.value.rates+ "&email=" + this.sendProjectRequestForm.value.clientEmail
      });

      const callableTest = this.functions.httpsCallable('sendFBClientProjectRequest');
      callableTest(this.sendProjectRequestForm.value).subscribe(result => {
        console.log(result)
        this.sendProjectRequestForm.reset();
        this.spinnerService.hide();
        $.notify({
          icon: 'notifications',
          message: 'Project request submitted!'
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

      })
      // this.data_api.sendFBClientProjectRequest().subscribe((customer:any) => {
      //   console.log(customer);
      // });
    }
}