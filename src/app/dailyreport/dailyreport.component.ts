import { Component, OnInit, AfterViewInit, ElementRef, ViewChild,Inject} from '@angular/core';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../services/format-datepicker';
import { DatasourceService } from '../services/datasource.service';
import { PdfImage } from '../services/pdf-image';
import { PreviewImage } from '../services/preview-image';
import { Observable } from 'rxjs';
import swal from 'sweetalert2';
// import * as Chartist from 'chartist';
import { Input } from '@angular/core';
//import * as $$ from 'jQuery';
import { NgxSpinnerService } from "ngx-spinner";
import { AuthenticationService } from '../shared/authentication.service';
import {FormBuilder, FormGroup, Validators, FormArray, FormControl} from "@angular/forms";
import { DatePipe } from '@angular/common';
// 16 import {MatLegacyChipInputEvent as MatChipInputEvent} from '@angular/material/legacy-chips';
import {ActivatedRoute, Params, Router} from '@angular/router';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import {ENTER, COMMA} from '@angular/cdk/keycodes';
// import { ImageCompressorService, CompressorConfig } from 'ngx-image-compressor';
import imageCompression from 'browser-image-compression'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

declare const $: any;

@Component({
  selector: 'app-dailyreport',
  templateUrl: './dailyreport.component.html',
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS},
    DatePipe
  ]
})
export class DailyReportComponent implements OnInit {

  public projectList:any = [];
  public siteSupervisors:any = [];
  public altSupervisors:any = [];

  constructor(
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    public authService: AuthenticationService,
    private formBuilder: FormBuilder,
    public pdfImage: PdfImage,
    private previewImage: PreviewImage,
    public datepipe: DatePipe,
    private router: Router,
    // private imageCompressor: ImageCompressorService,
    public dialog: MatDialog,
    ) { }

  public ngOnInit() {
    //this.validateToken();
    let currentUser = JSON.parse((localStorage.getItem('currentUser')));
    console.log(currentUser);

    if(currentUser.userRole=='app_admin'){
        this.getFBProjects();
    }else if(currentUser.userRole=='project_supervisor'){
        this.getSupervisorProjects(currentUser.user_id);
        this.getAltSupervisorProjects(currentUser.user_id);
    }

    this.getProjectSupervisors();

  }    

  getFBProjects(): void {
    this.spinnerService.show();
    this.data_api.getFBProjects().subscribe(data => {
      console.log(data);

        if(data){
          this.projectList = data;
          this.spinnerService.hide();
        }

    });
  }

  public getProjectSupervisors(){
    
      this.data_api.getFBSupervisors().subscribe((data) => {
            console.log(data);
              if(data){
                  data.forEach(data =>{      
                    if(!data.password){  
                        // if(data.userRole == 'project_owner' ){
                        //   this.projectOwners.push({id:data.id,name: data.userFirstName + ' ' + data.userLastName,email: data.userEmail})
                        // }

                        // if(data.userRole == 'project_worker' ){
                        //   this.projectWorkers.push({id:data.id,name: data.userFirstName + ' ' + data.userLastName})
                        // }

                        // if(data.userRole == 'project_supervisor' ){
                          this.siteSupervisors.push({id:data.id,name: data.userFirstName + ' ' + data.userLastName})
                          this.altSupervisors.push({id:data.id,name: data.userFirstName + ' ' + data.userLastName})
                        // }
                    }
                  })
              }
        }
      );
  }

  getSupervisor(id){
    if(this.siteSupervisors){
  
      if(id){
        let supervisorData = this.siteSupervisors.find(x => x.id === id);
        if(supervisorData){
          return supervisorData.name;
        }else{
          return;
        }
        
      }else{
        return;
      }

    }else{
      return;
    }

  }

  public getActiveProjects(){
      this.spinnerService.show();
      
      this.data_api.getActiveProjects().subscribe((data) => {

          this.projectList = data;
          this.spinnerService.hide();
          console.log(data);
      });
  }

  public getSupervisorProjects(curUserID){
    this.spinnerService.show();

    this.data_api.getFBProjectsSupervisor(curUserID).subscribe((data) => {

        data.forEach(data =>{ 
          if (!this.projectList.find(item => item.id === data.id)) {
            this.projectList.push(data)            
          }
        })

        this.spinnerService.hide();
        console.log(data);
    }
      )
  }

  public getAltSupervisorProjects(curUserID){
    this.spinnerService.show();

    this.data_api.getFBProjectsAltSupervisor(curUserID).subscribe((data) => {

        data.forEach(data =>{ 
          if (!this.projectList.find(item => item.id === data.id)) {
            this.projectList.push(data)            
          }
        })

        this.spinnerService.hide();
        console.log(data);
    }
      )
  }

    public setDateDialog(data): void {
      const dialogRef = this.dialog.open(SetDateDialog, {
          width: '320px',
          data: data
      });

      dialogRef.afterClosed().subscribe(result => {

          console.log(result);

          if(result){  

            if(result){
              let selectedDate = result;
              let selecteddd = String(selectedDate.getDate()).padStart(2, '0');
              let selectedmm = String(selectedDate.getMonth() + 1).padStart(2, '0'); //January is 0!
              let selectedyyyy = selectedDate.getFullYear();

              let selecteddateToday = selectedyyyy + '-' + selectedmm + '-' + selecteddd;

              this.router.navigate(['/daily-report/project/'+data], { queryParams: { date: selecteddateToday } });
            }

          }
      });
    
  }

  // public validateToken(){
  //   this.spinnerService.show();
  //     this.data_api.checkToken().subscribe((data) => {
  //         console.log(data);
  //         if(data.code =='jwt_auth_valid_token'){
  //             return;
  //         }else{

  //           this.spinnerService.hide();

  //           swal.fire({
  //               title: "Session Expired.",
  //               text: "Please log in again.",
  //               buttonsStyling: false,
  //               customClass: {
  //                 confirmButton: 'btn btn-success',
  //               },
  //               icon: "error"
  //           }).then((result) => {
  //             this.authService.logoutMe();
  //           })

  //         }
  //     },
  //     (error) =>{

  //       console.log(error);
  //       if(error.error.code == "jwt_auth_invalid_token"){
  //         this.spinnerService.hide();
  //         swal.fire({
  //             title: "Session Expired.",
  //             text: "Please log in again.",
  //             buttonsStyling: false,
  //             customClass: {
  //               confirmButton: 'btn btn-success',
  //             },
  //             icon: "error"
  //         }).then((result) => {
  //           this.authService.logoutMe();
  //           })

  //       }else{
  //         this.spinnerService.hide();
  //         swal.fire({
  //             title: error.error.message,
  //             // text: "You clicked the button!",
  //             buttonsStyling: false,
  //             customClass: {
  //               confirmButton: 'btn btn-success',
  //             },
  //             icon: "error"
  //         })

  //       } 


  //       }
  //     );

  // }  



}

@Component({
  selector: 'dailyreport-datedialog',
  templateUrl: 'dailyreport-datedialog.html',
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS},
    DatePipe
  ]
})

  export class SetDateDialog implements OnInit {
  
    addFestForm: FormGroup;
    selectedDate;

    adminData;

    colorBtnDefault;

    constructor(
      private formBuilder: FormBuilder,
      public dialogRef: MatDialogRef<SetDateDialog>,
      private data_api: DatasourceService,
      private spinnerService: NgxSpinnerService,
      public datepipe: DatePipe,
      @Inject(MAT_DIALOG_DATA) public data) {}
  
    onNoClick(): void {
      this.dialogRef.close();
    }
  
    get g(){
      return this.addFestForm.controls;
    }
      
    ngOnInit() {
      this.getAdminSettings();
      console.log(this.data)
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
  

}