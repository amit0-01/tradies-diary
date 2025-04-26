import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Inject, HostListener} from '@angular/core';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../services/format-datepicker';
import { DatasourceService } from '../../services/datasource.service';
import { PdfImage } from '../../services/pdf-image';
import { PreviewImage } from '../../services/preview-image';
import { PDFIcons } from '../../services/pdf-icons';
import { Observable, Observer } from "rxjs";
import swal from 'sweetalert2';
// import * as Chartist from 'chartist';
import { Input } from '@angular/core';
//import * as $$ from 'jQuery';
import * as fs from 'file-saver'
import { NgxSpinnerService } from "ngx-spinner";
import { AuthenticationService } from '../../shared/authentication.service';
import {FormBuilder, FormGroup, Validators, FormArray, FormControl, NgModel} from "@angular/forms";
import { DatePipe } from '@angular/common';
import {MatChipInputEvent} from '@angular/material/chips';
import {ActivatedRoute, Params, Router, withDebugTracing} from '@angular/router';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import {ENTER, COMMA} from '@angular/cdk/keycodes';
// import { ImageCompressorService, CompressorConfig } from 'ngx-image-compressor';
import imageCompression from 'browser-image-compression'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { IfStmt } from '@angular/compiler';
import * as moment from 'moment';
import {MyService} from '../../services/image-upload-service'; 
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDragEnter } from "@angular/cdk/drag-drop";
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from '@angular/fire/compat/storage';
import {  first, reduce, map, finalize  } from 'rxjs/operators';
import { NgxProgressOverlayService } from 'ngx-progress-overlay';
import { Clipboard } from '@angular/cdk/clipboard';
import { DeviceDetectorService } from 'ngx-device-detector';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { AngularFireFunctions } from '@angular/fire/compat/functions';

declare const $: any;

@Component({
  selector: 'app-weeklyreportedit',
  templateUrl: './weeklyreportedit.component.html',
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS},
    DatePipe
  ]
})
export class WeeklyReportEditComponent implements OnInit {

  // @HostListener("window:beforeunload")  
  // SamplecanDeactivate(): Observable<boolean> | boolean {  
  //     return (  
  //         !this.editForm.dirty  
  //     );  
  // }  
  
  public passID: any;
  public modalAnswer;
  editForm: FormGroup;
  imageUpload: FormArray;
  customQuestion: FormArray;
  public friDate;
  public friDateRaw;
  public aimDateRaw;
  public aimDate;
  public pdfProjectName;
  public projectID;
  public pdfLink;
  public pdfSupervisorName;
  public pdfSupervisorEmail;
  public pdfSupervisorMobile;

  public projectNames = [];
  public siteSupervisors = [];
  public customQuestions = [];
  public isOthersAllWeek = 'hide';
  public isOthersSaturday = 'hide';
  public isOthersSunday = 'hide';
  public isOthersMonday = 'hide';
  public isOthersTuesday = 'hide';
  public isOthersWednesday = 'hide';
  public isOthersThursday = 'hide';
  public isOthersFriday = 'hide';
  public imageURLRaw = [];
  public imageURL = [];
  public imageURLTBD = [];
  public imageOrientations = [];
  public imageSize = [];
  public totalImageSize = 0;
  public emailData;
  public clientEmailData;
  public clientEmailCcData;
  public clientEmailBccData;
  public prevdata;
  
  base64DefaultURL: string;
  public folderName =  [];
  public lostHoursWeek;
  public totalHours;
  public rawTotalHrs;
  public rawAimedDate;
  public projectData;
  public adminData;
  public colorBtnDefault;

  public rawLostTotalDays = 0;
  public rawLostTotalHours = 0;

  public rawLostWeekDays = 0;
  public rawLostWeekHours = 0;

  public rawImageUpload;
  public isImageChange = false;
  public projJobNumber;
  public projaddress;
  public projUploadSource;
  public projUploadFolder;

  public projImageBackground;
  breakpoint: number;

  public taskList = [];
  public tradesTaskList = [];

  public visitorList = [];
  public visitorData = [];

  public listVisitors = [];

  public weeklyImagesWorker = [];
  public showAddTaskWorkerButton = false;
  public showAddTaskTradeButton = false;
  public showAddImageWorkerButton = false;
  public showAddImageDailyButton = false;

  public weeklyImagesDiary = [];
  public weeklyWorkerLogs = [];

  public showWeatherSundayButton = false;
  public showWeatherMondayButton = false;
  public showWeatherTuesdayButton = false;
  public showWeatherWednesdayButton = false;
  public showWeatherThursdayButton = false;
  public showWeatherFridayButton = false;
  public showWeatherSaturdayButton = false;

  public saturdayData = [];
  public sundayData = [];
  public mondayData = [];
  public tuesdayData= [];
  public wednesdayData= [];
  public thursdayData = [];
  public fridayData = [];

  public saturdayWeath = [];
  public sundayWeath = [];
  public mondayWeath = [];
  public tuesdayWeath = [];
  public wednesdayWeath = [];
  public thursdayWeath = [];
  public fridayWeath = [];

  public userDetails;

  public max_date;
  
  imgSrc:string;
  imgStampString:string;
  
  weatherOptions = [
    {value: 'weatherSunny', viewValue: 'Sunny'},
    {value: 'weatherRainy', viewValue: 'Rainy'},
    {value: 'weatherCloudy', viewValue: 'Cloudy'},
    {value: 'weatherStormy', viewValue: 'Stormy'},
    {value: 'weatherSnowy', viewValue: 'Snowy'},
    {value: 'weatherPartial', viewValue: 'Full and Partial'},
    {value: 'weatherOthers', viewValue: 'Other'},
  ]

  currentWebWorker: true
  maxSizeMB: number = 1
  maxWidthOrHeight: number = 1024
  // webWorkerLog: string = ''
  // mainThreadLog: string = ''
  // webWorkerProgress: string = ''
  // mainThreadProgress: string = ''
  // webWorkerDownloadLink: SafeUrl
  // mainThreadDownloadLink: SafeUrl
  // preview: SafeUrl = ''

  pdfHeaderImage1;
  pdfHeaderImage2;
  pdfFooterImage;
  pdfLogo;
  pdfCompanyName;

  //chips
  visible: boolean = true;
  selectable: boolean = true;
  removable: boolean = true;
  addOnBlur: boolean = true;
  // Enter, comma
  separatorKeysCodes = [ENTER, COMMA];

  // public imageUpload = new FormArray([]);
  public download_mode = false;

  uploadProgress: Observable<number>;
  allUploadProgress: number[]= [];
  totalPercentage: number;
  allPercentage: Observable<number>[] = [];
  downloadArray= [] ;
  downloadURLs= [] ;
  accountFirebase;
  recentImages;
  recentEntryWeekly = [];
  deviceInfo;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    public authService: AuthenticationService,
    private formBuilder: FormBuilder,
    public pdfImage: PdfImage,
    public pdfIcons:PDFIcons,
    private previewImage: PreviewImage,
    public datepipe: DatePipe,
    // private imageCompressor: ImageCompressorService,
    private sanitizer: DomSanitizer,
    public dialog: MatDialog,
    private myService: MyService,
    private afStorage: AngularFireStorage,
    private progressOverlay: NgxProgressOverlayService,
    private clipboard: Clipboard,
    private deviceService: DeviceDetectorService,
    private functions: AngularFireFunctions
    ) { }

  public ngOnInit() {
    this.deviceInfo = this.deviceService.getDeviceInfo();
    console.log(this.deviceInfo);
          this.passID = {
              id: this.route.snapshot.params['id'],
          };
          this.route.params

          .subscribe(
              (params: Params) => {
                  this.passID.id = params['id'];
              }
          );

          this.route.queryParams
            //.filter(params => params.date)
            .subscribe(params => {
              //console.log(params.date); // { order: "popular" }
              console.log(params.downloadmode);

              if(params.downloadmode == 'true'){
                  this.download_mode = true;
                  window.parent.postMessage({"message":"start"}, '*');
              }

            }
          );

          this.editForm = this.formBuilder.group({
              // imageUploadList: this.imageUpload,
              weekendDate: [''],
              projectId: [''],
              siteSupervisor: [''],
              aimedComDate: [{ value: '', disabled: true }],
              weatherAllWeek: [''],
              weatherSaturday: [''],
              weatherSunday: [''],
              weatherMonday: [''],
              weatherTuesday: [''],
              weatherWednesday: [''],
              weatherThursday: [''],
              weatherFriday: [''],
              weatherOthersAllWeek: [''],
              weatherOthersSaturday: [''],
              weatherOthersSunday: [''],
              weatherOthersMonday: [''],
              weatherOthersTuesday: [''],
              weatherOthersWednesday: [''],
              weatherOthersThursday: [''],
              weatherOthersFriday: [''],
              lostWeekDays: [''],
              lostWeekHours: [''],
              lostTotalDays: [{ value: '', disabled: true }],
              lostTotalHours: [{ value: '', disabled: true }],
              totalFileSize: [''],
              folderName: [''],
              folderId: [''],
              dcbAccThisWeek: [''],
              dcbAccNextWeek: [''],
              subAccThisWeek: [''],
              subAccNextWeek: [''],
              conSiteThisWeek: [''],
              conSiteNeedWeek: [''],
              requestedChanges: [''],
              clarificationArchEng: [''],
              informationNeeded: [''],
              upcomingMeetings: [''],
              uploadFolder: [''],
              uploadSource: [''],
              projWeeklyFolderId: [''],
              pdfLink: [''],
              reportNumber: [''],
              // dcbAccThisWeek: this.formBuilder.array([]),
              // dcbAccNextWeek: this.formBuilder.array([]),
              // subAccThisWeek: this.formBuilder.array([]),
              // subAccNextWeek: this.formBuilder.array([]),
              // conSiteThisWeek: this.formBuilder.array([]),
              // conSiteNeedWeek: this.formBuilder.array([]),
              // requestedChanges: this.formBuilder.array([]),
              // clarificationArchEng: this.formBuilder.array([]),
              // informationNeeded: this.formBuilder.array([]),
              imageUpload: this.formBuilder.array([]),
              customQuestion: this.formBuilder.array([])
          });

          let curr;
          curr = new Date();
          let fridayDateWeek;
          fridayDateWeek = new Date();
          let friday;
          friday = 5 - curr.getDay();
          fridayDateWeek.setDate(fridayDateWeek.getDate()+friday);

          this.max_date = fridayDateWeek;
          // this.editForm.patchValue({
          //   fridayDate: fridayDateWeek
          // });
          this.getWeeklyReport();
          this.getAdminSettings();
          // this.getProjects();
          //this.getSupervisors();
          //this.getQuestions();
          //this.getEmailSettings();
          
          
          if(window.innerWidth <= 430){
            this.breakpoint = 1;
          }else if(window.innerWidth <= 600){
            this.breakpoint = 2;
          }else if(window.innerWidth <= 768){
            this.breakpoint = 3;
          }else if(window.innerWidth <= 1200){
            this.breakpoint = 4;
          }else if(window.innerWidth <= 1700){
            this.breakpoint = 5;
          }else if(window.innerWidth > 1700){
            this.breakpoint = 8;
          }

          // this.getBase64ImageFromURL(this.data_api.getPDFURL1()).subscribe((base64Data: string) => {   
          //   this.pdfHeaderImage1 = base64Data;
          // });

          // this.getBase64ImageFromURL(this.data_api.getPDFURL2()).subscribe((base64Data: string) => {   
          //   this.pdfHeaderImage2 = base64Data;
          // });

          // this.getBase64ImageFromURL(this.data_api.getPDFFooterURL()).subscribe((base64Data: string) => {   
          //   this.pdfFooterImage = base64Data;
          // });

          this.accountFirebase = this.data_api.getCurrentProject();
          this.getRecentImagesWeeklyReport();

          if (localStorage.getItem('currentUser')) {
            this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
          }

         

    }

    onResize(event) {
      // this.breakpoint = event.target.innerWidth <= 1024 ? 4 : 8;
      // this.breakpoint = event.target.innerWidth <= 768 ? 1 : 8;
      if(event.target.innerWidth <= 430){
        this.breakpoint = 1;
      }else if(event.target.innerWidth <= 600){
        this.breakpoint = 2;
      }else if(event.target.innerWidth <= 768){
        this.breakpoint = 3;
      }else if(event.target.innerWidth <= 1200){
        this.breakpoint = 4;
      }else if(event.target.innerWidth <= 1700){
        this.breakpoint = 5;
      }else if(event.target.innerWidth > 1700){
        this.breakpoint = 8;
      }
    }

    
    dragEntered(event: CdkDragEnter<number>) {

      console.log(event);
        const drag = event.item;
        const dropList = event.container;
        const dragIndex = drag.data;
        const dropIndex = dropList.data;
    
        const phContainer = dropList.element.nativeElement;
        const phElement = phContainer.querySelector('.cdk-drag-placeholder');
        phContainer.removeChild(phElement);
        phContainer.parentElement.insertBefore(phElement, phContainer);
  
        // // console.log(drag);
        
        moveItemInArray(this.editForm.get('imageUpload')['controls'], dragIndex, dropIndex);
        moveItemInArray(this.editForm.value.imageUpload, dragIndex, dropIndex);
        moveItemInArray(this.imageURL, dragIndex, dropIndex);
        moveItemInArray(this.imageSize, dragIndex, dropIndex);

        console.log(this.editForm.get('imageUpload'));
    }

    public getVisitors(){
        this.data_api.getVisitors().subscribe((data) => {
          console.log(data);
        if(data){
          data.forEach(data2 =>{      
            this.listVisitors.push({id: data2.id,visitor_name: data2.visitor_name})  
          });
        } 

        this.getProjectOwners();

        });
    }
    
    public getProjectOwners(){
      
      this.data_api.getProjectOwners().subscribe((data) => {
        console.log(data);
        if(data){
          data.forEach(data2 =>{      
            this.listVisitors.push({id: data2.user_email, visitor_name: data2.name})  
          });
        } 

        if(this.download_mode == true ){
                
            setTimeout(() => {
              this.generatePdf();
            }, 1000);
          
            console.log('activate');
        }

        });
      console.log(this.listVisitors);
    }

    changeDate(){
      // this.spinnerService.show();
      //   console.log('test');

      this.data_api.getFBWeeklyReport(this.editForm.value.projectId, this.editForm.value.weekendDate).subscribe((data2) => {
        console.log(data2);
            if(data2.length > 0){

               
                this.editForm.markAsPristine()

                this.router.routeReuseStrategy.shouldReuseRoute = function() { return false; };

                this.router.navigate(['/weekly-report/edit/'+data2[0].id]);
                // window.location.href = '#/weekly-report/edit/'+data[0].id;

            }else{

                let _formattedDate = this.formatDate2(this.editForm.value.weekendDate);

                window.location.href = '#/weekly-report?project='+this.editForm.value.projectId+'&date='+_formattedDate;
            }

      });

      //   let passData = {
      //       endDate: this.editForm.value.weekendDate,
      //       projectName: this.editForm.value.projectId,
      //   }

      // this.data_api.checkExistWeeklyReport(passData).subscribe((data) => {
      //   console.log(data) 
      //   this.spinnerService.hide();
      //       if(data.length > 0){

      //         console.log(data);
      //         this.editForm.markAsPristine()

      //         this.router.routeReuseStrategy.shouldReuseRoute = function() { return false; };

      //         this.router.navigate(['/weekly-report/edit/'+data[0].id]);
      //         // window.location.href = '#/weekly-report/edit/'+data[0].id;

      //       }else{

      //         let _formattedDate = this.formatDate2(this.editForm.value.fridayDate);

      //         window.location.href = '#/weekly-report?project='+this.editForm.value.projectName+'&date='+_formattedDate;
      //       }
      // });

    }

    public formatDate2(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
    
        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
    
        // return [year, month, day].join('-');
        return [year, month, day ].join('-');
    }

    public formatDate3(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
    
        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
    
        // return [year, month, day].join('-');
        return [day, month, year].join('/');
    }


    getFBDiaryData(){

      this.spinnerService.show();
      let end_date= this.editForm.value.weekendDate;
      let dateSaturday = new Date(end_date);
      let dateSunday = new Date(end_date);
      let dateMonday = new Date(end_date);
      let dateTuesday= new Date(end_date);
      let dateWednesday = new Date(end_date);
      let dateThursday= new Date(end_date);
      let dateFriday = new Date(end_date);
  
      dateSaturday.setDate( dateSaturday.getDate() - 6 );
      dateSunday.setDate( dateSunday.getDate() - 5 );
      dateMonday.setDate( dateMonday.getDate() - 4 );
      dateTuesday.setDate( dateTuesday.getDate() - 3  );
      dateWednesday.setDate( dateWednesday.getDate() - 2 );
      dateThursday.setDate( dateThursday.getDate() - 1 );
      dateFriday.setDate( dateFriday.getDate());
  
      // let passData = {
      //   dateSaturday:  dateSaturday,
      //   dateSunday:  dateSunday,
      //   dateMonday:  dateMonday,
      //   dateTuesday:  dateTuesday,
      //   dateWednesday:  dateWednesday,
      //   dateThursday:  dateThursday,
      //   dateFriday:  dateFriday,
      // }
      console.log(dateSaturday);

      this.getFBSaturdayData(dateSaturday);
      this.getFBSundayData(dateSunday);
      this.getFBMondayData(dateMonday);
      this.getFBTuesdayData(dateTuesday);
      this.getFBWednesdayData(dateWednesday);
      this.getFBThursdayData(dateThursday);
      this.getFBFridayData(dateFriday);

      this.spinnerService.hide();
    }
    //this.showAddImageDailyButton = true;
    getFBSaturdayData(dateSaturday){
      this.data_api.getFBDailyReport(this.projectID,dateSaturday).subscribe(data => {
          console.log(data);
          this.saturdayData = data[0];
          if(this.saturdayData){

            if(this.saturdayData['imageUpload'].length != 0){
              this.weeklyImagesDiary = this.weeklyImagesDiary.concat(this.saturdayData['imageUpload']);
              this.showAddImageDailyButton= true;
            }
            if(this.saturdayData['staffFormArray'].length != 0){
              let staffData = this.saturdayData['staffFormArray'];
              staffData.forEach(data =>{ 
                  if(data.taskStaffFormArray){
                    data.taskStaffFormArray.forEach(data2 =>{ 
                        if (!this.taskList.find(o => o === data2.taskDescription)){
                          this.taskList.push(data2.taskDescription);
                        }
                    });
                  }       
              });
              this.showAddTaskWorkerButton= true;
            }
            if(this.saturdayData['tradeFormArray'].length != 0){
              let tradeData = this.saturdayData['tradeFormArray'];
              tradeData.forEach(data =>{ 
                data.tradeStaffFormArray.forEach(data2 =>{ 
                  data2.taskTradeFormArray.forEach(data3 =>{ 
                    if (!this.tradesTaskList.find(o => o === data3.taskDescription)) {
                        this.tradesTaskList.push(data3.taskDescription);
                    }
                  });
                });
              });
              this.showAddTaskTradeButton= true;
            }
            if(this.saturdayData['visitorFormArray'].length != 0){
              let visitorDatum = this.saturdayData['visitorFormArray'];
              visitorDatum.forEach(async data =>{
                if( (data.visitorsOnSite) && (data.visitorsOnSite != '')  ){
   
                 // let selectedVisitor = await this.getVisitor(data.visitorsOnSite)
                  //console.log(selectedVisitor);
                  if(data.visitorsOnSite){
                      this.visitorData.push( data.visitorsOnSite );
                  }
  
                }
              });
              console.log(this.visitorData);
            }
          }
      });
    }
    getFBSundayData(dateSunday){
      this.data_api.getFBDailyReport(this.projectID,dateSunday).subscribe(data => {
          console.log(data);
          this.sundayData = data[0];
          if(this.sundayData){

            if(this.sundayData['imageUpload'].length != 0){
              this.weeklyImagesDiary = this.weeklyImagesDiary.concat(this.sundayData['imageUpload']);
              this.showAddImageDailyButton= true;
            }
            if(this.sundayData['staffFormArray'].length != 0){
              let staffData = this.sundayData['staffFormArray'];
              staffData.forEach(data =>{ 
                  if(data.taskStaffFormArray){
                    data.taskStaffFormArray.forEach(data2 =>{ 
                        if (!this.taskList.find(o => o === data2.taskDescription)){
                          this.taskList.push(data2.taskDescription);
                        }
                    });
                  }       
              });
              this.showAddTaskWorkerButton= true;
            }
            if(this.sundayData['tradeFormArray'].length != 0){
              let tradeData = this.sundayData['tradeFormArray'];
              tradeData.forEach(data =>{ 
                data.tradeStaffFormArray.forEach(data2 =>{ 
                  data2.taskTradeFormArray.forEach(data3 =>{ 
                    if (!this.tradesTaskList.find(o => o === data3.taskDescription)) {
                        this.tradesTaskList.push(data3.taskDescription);
                    }
                  });
                });
              });
              this.showAddTaskTradeButton= true;
            }
            if(this.sundayData['visitorFormArray'].length != 0){
              let visitorDatum = this.sundayData['visitorFormArray'];
              visitorDatum.forEach(async data =>{
                if( (data.visitorsOnSite) && (data.visitorsOnSite != '')  ){
   
                 // let selectedVisitor = await this.getVisitor(data.visitorsOnSite)
                  //console.log(selectedVisitor);
                  if(data.visitorsOnSite){
                      this.visitorData.push( data.visitorsOnSite );
                  }
  
                }
              });
              console.log(this.visitorData);
            }
          }
      });
    }
    getFBMondayData(dateMonday){
      this.data_api.getFBDailyReport(this.projectID,dateMonday).subscribe(data => {
          console.log(data);
          this.mondayData = data[0];
          if(this.mondayData){

            if(this.mondayData['imageUpload'].length != 0){
              this.weeklyImagesDiary = this.weeklyImagesDiary.concat(this.mondayData['imageUpload']);
              this.showAddImageDailyButton= true;
            }
            if(this.mondayData['staffFormArray'].length != 0){
              let staffData = this.mondayData['staffFormArray'];
              staffData.forEach(data =>{ 
                  if(data.taskStaffFormArray){
                    data.taskStaffFormArray.forEach(data2 =>{ 
                        if (!this.taskList.find(o => o === data2.taskDescription)){
                          this.taskList.push(data2.taskDescription);
                        }
                    });
                  }       
              });
              this.showAddTaskWorkerButton= true;
            }
            if(this.mondayData['tradeFormArray'].length != 0){
              let tradeData = this.mondayData['tradeFormArray'];
              tradeData.forEach(data =>{ 
                data.tradeStaffFormArray.forEach(data2 =>{ 
                  data2.taskTradeFormArray.forEach(data3 =>{ 
                    if (!this.tradesTaskList.find(o => o === data3.taskDescription)) {
                        this.tradesTaskList.push(data3.taskDescription);
                    }
                  });
                });
              });
              this.showAddTaskTradeButton= true;
            }
            if(this.mondayData['visitorFormArray'].length != 0){
              let visitorDatum = this.mondayData['visitorFormArray'];
              visitorDatum.forEach(async data =>{
                if( (data.visitorsOnSite) && (data.visitorsOnSite != '')  ){
   
                 // let selectedVisitor = await this.getVisitor(data.visitorsOnSite)
                  //console.log(selectedVisitor);
                  if(data.visitorsOnSite){
                      this.visitorData.push( data.visitorsOnSite );
                  }
  
                }
              });
              console.log(this.visitorData);
            }
          }
      });
    }
    getFBTuesdayData(dateTuesday){
      this.data_api.getFBDailyReport(this.projectID,dateTuesday).subscribe(data => {
          console.log(data);
          this.tuesdayData = data[0];
          if(this.tuesdayData){

            if(this.tuesdayData['imageUpload'].length != 0){
              this.weeklyImagesDiary = this.weeklyImagesDiary.concat(this.tuesdayData['imageUpload']);
              this.showAddImageDailyButton= true;
            }
            if(this.tuesdayData['staffFormArray'].length != 0){
              let staffData = this.tuesdayData['staffFormArray'];
              staffData.forEach(data =>{ 
                  if(data.taskStaffFormArray){
                    data.taskStaffFormArray.forEach(data2 =>{ 
                        if (!this.taskList.find(o => o === data2.taskDescription)){
                          this.taskList.push(data2.taskDescription);
                        }
                    });
                  }       
              });
              this.showAddTaskWorkerButton= true;
            }
            if(this.tuesdayData['tradeFormArray'].length != 0){
              let tradeData = this.tuesdayData['tradeFormArray'];
              tradeData.forEach(data =>{ 
                data.tradeStaffFormArray.forEach(data2 =>{ 
                  data2.taskTradeFormArray.forEach(data3 =>{ 
                    if (!this.tradesTaskList.find(o => o === data3.taskDescription)) {
                        this.tradesTaskList.push(data3.taskDescription);
                    }
                  });
                });
              });
              this.showAddTaskTradeButton= true;
            }
            if(this.tuesdayData['visitorFormArray'].length != 0){
              let visitorDatum = this.tuesdayData['visitorFormArray'];
              visitorDatum.forEach(async data =>{
                if( (data.visitorsOnSite) && (data.visitorsOnSite != '')  ){
   
                 // let selectedVisitor = await this.getVisitor(data.visitorsOnSite)
                  //console.log(selectedVisitor);
                  if(data.visitorsOnSite){
                      this.visitorData.push( data.visitorsOnSite );
                  }
  
                }
              });
              console.log(this.visitorData);
            }

          }
      });
    }
    getFBWednesdayData(dateWednesday){
      this.data_api.getFBDailyReport(this.projectID,dateWednesday).subscribe(data => {
          console.log(data);
          this.wednesdayData = data[0];
          if(this.wednesdayData){

            if(this.wednesdayData['imageUpload'].length != 0){
              this.weeklyImagesDiary = this.weeklyImagesDiary.concat(this.wednesdayData['imageUpload']);
              this.showAddImageDailyButton= true;
            }
            if(this.wednesdayData['staffFormArray'].length != 0){
              let staffData = this.wednesdayData['staffFormArray'];
              staffData.forEach(data =>{ 
                  if(data.taskStaffFormArray){
                    data.taskStaffFormArray.forEach(data2 =>{ 
                        if (!this.taskList.find(o => o === data2.taskDescription)){
                          this.taskList.push(data2.taskDescription);
                        }
                    });
                  }       
              });
              this.showAddTaskWorkerButton= true;
            }
            if(this.wednesdayData['tradeFormArray'].length != 0){
              let tradeData = this.wednesdayData['tradeFormArray'];
              tradeData.forEach(data =>{ 
                data.tradeStaffFormArray.forEach(data2 =>{ 
                  data2.taskTradeFormArray.forEach(data3 =>{ 
                    if (!this.tradesTaskList.find(o => o === data3.taskDescription)) {
                        this.tradesTaskList.push(data3.taskDescription);
                    }
                  });
                });
              });
              this.showAddTaskTradeButton= true;
            }
            if(this.wednesdayData['visitorFormArray'].length != 0){
              let visitorDatum = this.wednesdayData['visitorFormArray'];
              visitorDatum.forEach(async data =>{
                if( (data.visitorsOnSite) && (data.visitorsOnSite != '')  ){
   
                 // let selectedVisitor = await this.getVisitor(data.visitorsOnSite)
                  //console.log(selectedVisitor);
                  if(data.visitorsOnSite){
                      this.visitorData.push( data.visitorsOnSite );
                  }
  
                }
              });
              console.log(this.visitorData);
            }

          }
      });
    }
    getFBThursdayData(dateThursday){
      this.data_api.getFBDailyReport(this.projectID,dateThursday).subscribe(data => {
          console.log(data);
          this.thursdayData = data[0];
          if(this.thursdayData){

            if(this.thursdayData['imageUpload'].length != 0){
              this.weeklyImagesDiary = this.weeklyImagesDiary.concat(this.thursdayData['imageUpload']);
              this.showAddImageDailyButton= true;
            }
            if(this.thursdayData['staffFormArray'].length != 0){
              let staffData = this.thursdayData['staffFormArray'];
              staffData.forEach(data =>{ 
                  if(data.taskStaffFormArray){
                    data.taskStaffFormArray.forEach(data2 =>{ 
                        if (!this.taskList.find(o => o === data2.taskDescription)){
                          this.taskList.push(data2.taskDescription);
                        }
                    });
                  }       
              });
              this.showAddTaskWorkerButton= true;
            }
            if(this.thursdayData['tradeFormArray'].length != 0){
              let tradeData = this.thursdayData['tradeFormArray'];
              tradeData.forEach(data =>{ 
                data.tradeStaffFormArray.forEach(data2 =>{ 
                  data2.taskTradeFormArray.forEach(data3 =>{ 
                    if (!this.tradesTaskList.find(o => o === data3.taskDescription)) {
                        this.tradesTaskList.push(data3.taskDescription);
                    }
                  });
                });
              });
              this.showAddTaskTradeButton= true;
            }
            if(this.thursdayData['visitorFormArray'].length != 0){
              let visitorDatum = this.thursdayData['visitorFormArray'];
              visitorDatum.forEach(async data =>{
                if( (data.visitorsOnSite) && (data.visitorsOnSite != '')  ){
   
                 // let selectedVisitor = await this.getVisitor(data.visitorsOnSite)
                  //console.log(selectedVisitor);
                  if(data.visitorsOnSite){
                      this.visitorData.push( data.visitorsOnSite );
                  }
  
                }
              });
              console.log(this.visitorData);
            }
          }
      });
    }
    getFBFridayData(dateFriday){
      this.data_api.getFBDailyReport(this.projectID,dateFriday).subscribe(data => {
          console.log(data);
          this.fridayData = data[0];
          if(this.fridayData){

            if(this.fridayData['imageUpload'].length != 0){
              this.weeklyImagesDiary = this.weeklyImagesDiary.concat(this.fridayData['imageUpload']);
              this.showAddImageDailyButton= true;
            }
            if(this.fridayData['staffFormArray'].length != 0){
              let staffData = this.fridayData['staffFormArray'];
              staffData.forEach(data =>{ 
                  if(data.taskStaffFormArray){
                    data.taskStaffFormArray.forEach(data2 =>{ 
                        if (!this.taskList.find(o => o === data2.taskDescription)){
                          this.taskList.push(data2.taskDescription);
                        }
                    });
                  }       
              });
              this.showAddTaskWorkerButton= true;
            }
            if(this.fridayData['tradeFormArray'].length != 0){
              let tradeData = this.fridayData['tradeFormArray'];
              tradeData.forEach(data =>{ 
                data.tradeStaffFormArray.forEach(data2 =>{ 
                  data2.taskTradeFormArray.forEach(data3 =>{ 
                    if (!this.tradesTaskList.find(o => o === data3.taskDescription)) {
                        this.tradesTaskList.push(data3.taskDescription);
                    }
                  });
                });
              });
              this.showAddTaskTradeButton= true;
            }
            if(this.fridayData['visitorFormArray'].length != 0){
              let visitorDatum = this.fridayData['visitorFormArray'];
              visitorDatum.forEach(async data =>{
                if( (data.visitorsOnSite) && (data.visitorsOnSite != '')  ){
   
                 // let selectedVisitor = await this.getVisitor(data.visitorsOnSite)
                  //console.log(selectedVisitor);
                  if(data.visitorsOnSite){
                      this.visitorData.push( data.visitorsOnSite );
                  }
  
                }
              });
              console.log(this.visitorData);
            }
          }
      });
    }


    getDiaryData(){

      this.spinnerService.show();
      let end_date= this.editForm.value.fridayDate;
      let dateSaturday = new Date(end_date);
      let dateSunday = new Date(end_date);
      let dateMonday = new Date(end_date);
      let dateTuesday= new Date(end_date);
      let dateWednesday = new Date(end_date);
      let dateThursday= new Date(end_date);
      let dateFriday = new Date(end_date);
  
      dateSaturday.setDate( dateSaturday.getDate() - 6 );
      dateSunday.setDate( dateSunday.getDate() - 5 );
      dateMonday.setDate( dateMonday.getDate() - 4 );
      dateTuesday.setDate( dateTuesday.getDate() - 3  );
      dateWednesday.setDate( dateWednesday.getDate() - 2 );
      dateThursday.setDate( dateThursday.getDate() - 1 );
      dateFriday.setDate( dateFriday.getDate());
  
      let passData = {
        dateSaturday:  dateSaturday,
        dateSunday:  dateSunday,
        dateMonday:  dateMonday,
        dateTuesday:  dateTuesday,
        dateWednesday:  dateWednesday,
        dateThursday:  dateThursday,
        dateFriday:  dateFriday,
      }
  
      this.data_api.getDiaryData(this.projectID, passData).subscribe((data) => {
        if(data){ 
          console.log(data);
                this.saturdayWeath = data[0];
                this.sundayWeath = data[1];
                this.mondayWeath = data[2];
                this.tuesdayWeath = data[3];
                this.wednesdayWeath = data[4];
                this.thursdayWeath = data[5];
                this.fridayWeath = data[6];
                this.visitorData =  data[7];
                let staffData =  data[8];
                let tradeData =  data[9];

                if(this.saturdayWeath.length != 0){this.showWeatherSaturdayButton= true;}
                if(this.sundayWeath.length != 0){this.showWeatherSundayButton= true;}
                if(this.mondayWeath.length != 0){this.showWeatherMondayButton= true;}
                if(this.tuesdayWeath.length != 0){this.showWeatherTuesdayButton= true;}
                if(this.wednesdayWeath.length != 0){this.showWeatherWednesdayButton= true;}
                if(this.thursdayWeath.length != 0){this.showWeatherThursdayButton= true;}
                if(this.fridayWeath.length != 0){this.showWeatherFridayButton= true;}

                // if(visitorData){ 
                
                //       this.visitorList = []
                //       console.log(visitorData);
                //       console.log(this.listVisitors);
                //       visitorData.forEach(data =>{ 
                //           // test.push(...data2)  
                //           if(JSON.parse(data.visitors_site).length > 0){

                //                 console.log(JSON.parse(data.visitors_site).length);
                                
                //                 JSON.parse(data.visitors_site).forEach(data3 =>{
                //                     console.log(data3);
                //                     if( (data3.visitorsOnSite) && (data3.visitorsOnSite != '')  ){
   
                //                       let selectedVisitor = this.listVisitors.find(o => o.id === data3.visitorsOnSite);
                //                       console.log(selectedVisitor);
                //                       console.log(data3.visitorsOnSite);
                //                       if(selectedVisitor){
                //                         this.visitorList.push(selectedVisitor);
                //                       }
                                      
                //                       console.log(this.visitorList);
                //                     }
                //                 });
      
                //           }

                //           console.log(this.visitorList);
      
                //           if(this.visitorList.length > 1){
    
                //             this.visitorList = Object.values(this.visitorList.reduce((acc,cur)=>Object.assign(acc,{[cur.id]:cur}),{}))
    
                //           }

                        
                //       });
                      
                     
      
                //       console.log(this.visitorList);
      
                // }

                if(staffData){ 
                  console.log(this.taskList);
                      staffData.forEach(data =>{ 
   
                          if(data.staff_site){

                                console.log(this.taskList);

                                let staffData_ = JSON.parse(data.staff_site);

                                staffData_.forEach(data2 =>{ 
                                  // staffTask.push(data2.taskDescription);
                                  console.log(data2);

                                  data2.taskStaffFormArray.forEach(data3 =>{ 
                                      console.log(data3.taskDescription);

                                      if (!this.taskList.find(o => o === data3.taskDescription)){
                                        this.taskList.push(data3.taskDescription);
                                      }

                                  });

                                });

                          }
                        
                      });
                      
                      console.log(this.taskList);
        
                }


                if(tradeData){ 
                  console.log(this.tradesTaskList);
                      tradeData.forEach(data =>{ 
                        
                          if(data.trades_site){


                                let tradeData_ = JSON.parse(data.trades_site);

                                tradeData_.forEach(data2 =>{ 
                                  // staffTask.push(data2.taskDescription);
                                  console.log(data2); 

                                  data2.tradeStaffFormArray.forEach(data3 =>{ 

                                      data3.taskTradeFormArray.forEach(data4 =>{ 
                                          console.log(data4.taskDescription);

                                          if (!this.tradesTaskList.find(o => o === data4.taskDescription))
                                          {
                                              this.tradesTaskList.push(data4.taskDescription);
                                          }

                                      });


                                  });

                                });

                          }
                        
                      });
                      
                      console.log(this.tradesTaskList);
        
                }

          }
          
          console.log(this.saturdayWeath);
          console.log(this.sundayWeath);
          console.log(this.mondayWeath);
          console.log(this.tuesdayWeath);
          console.log(this.wednesdayWeath);
          console.log(this.thursdayWeath);
          console.log(this.fridayWeath);
  
          this.getWeeklyWorkerLogs();

          this.spinnerService.hide();
      });
  
  }
  
  checkWeatherOption(dayValue,weather){
  
  if(dayValue == 'Saturday'){
    console.log(weather);
    if(this.saturdayWeath.length != 0){
        if(this.saturdayWeath[0].weather_allday == weather){
          return true;
        }else if(this.saturdayWeath[0].weather_morning == weather){
          return true;
        }else if(this.saturdayWeath[0].weather_midday == weather){
          return true;
        }else if(this.saturdayWeath[0].weather_afternoon == weather){
          return true;
        }else if(this.saturdayWeath[0].weather_evening == weather){
          return true;
        }else if(this.saturdayWeath[0].weather_onoff == weather){
          return true;
        }else if(this.saturdayWeath[0].weather_restofday == weather){
          return true;
        }else{
          return false;
        }
    }
  }else if(dayValue == 'Sunday'){
  
    if(this.sundayWeath.length != 0){
        if(this.sundayWeath[0].weather_allday == weather){
          return true;
        }else if(this.sundayWeath[0].weather_morning == weather){
          return true;
        }else if(this.sundayWeath[0].weather_midday == weather){
          return true;
        }else if(this.sundayWeath[0].weather_afternoon == weather){
          return true;
        }else if(this.sundayWeath[0].weather_evening == weather){
          return true;
        }else if(this.sundayWeath[0].weather_onoff == weather){
          return true;
        }else if(this.sundayWeath[0].weather_restofday == weather){
          return true;
        }
    }
  
  }else if(dayValue == 'Monday'){
  
    if(this.mondayWeath.length != 0){
        if(this.mondayWeath[0].weather_allday == weather){
          return true;
        }else if(this.mondayWeath[0].weather_morning == weather){
          return true;
        }else if(this.mondayWeath[0].weather_midday == weather){
          return true;
        }else if(this.mondayWeath[0].weather_afternoon == weather){
          return true;
        }else if(this.mondayWeath[0].weather_evening == weather){
          return true;
        }else if(this.mondayWeath[0].weather_onoff == weather){
          return true;
        }else if(this.mondayWeath[0].weather_restofday == weather){
          return true;
        }
    }
  }else if(dayValue == 'Tuesday'){
  
      if(this.tuesdayWeath.length != 0){
          if(this.tuesdayWeath[0].weather_allday == weather){
            return true;
          }else if(this.tuesdayWeath[0].weather_morning == weather){
            return true;
          }else if(this.tuesdayWeath[0].weather_midday == weather){
            return true;
          }else if(this.tuesdayWeath[0].weather_afternoon == weather){
            return true;
          }else if(this.tuesdayWeath[0].weather_evening == weather){
            return true;
          }else if(this.tuesdayWeath[0].weather_onoff == weather){
            return true;
          }else if(this.tuesdayWeath[0].weather_restofday == weather){
            return true;
          }
      }
  
  }else if(dayValue == 'Wednesday'){
  
      if(this.wednesdayWeath.length != 0){
          if(this.wednesdayWeath[0].weather_allday == weather){
            return true;
          }else if(this.wednesdayWeath[0].weather_morning == weather){
            return true;
          }else if(this.wednesdayWeath[0].weather_midday == weather){
            return true;
          }else if(this.wednesdayWeath[0].weather_afternoon == weather){
            return true;
          }else if(this.wednesdayWeath[0].weather_evening == weather){
            return true;
          }else if(this.wednesdayWeath[0].weather_onoff == weather){
            return true;
          }else if(this.wednesdayWeath[0].weather_restofday == weather){
            return true;
          }
      }
  
  }else if(dayValue == 'Thursday'){
  
      if(this.thursdayWeath.length != 0){
          if(this.thursdayWeath[0].weather_allday == weather){
            return true;
          }else if(this.thursdayWeath[0].weather_morning == weather){
            return true;
          }else if(this.thursdayWeath[0].weather_midday == weather){
            return true;
          }else if(this.thursdayWeath[0].weather_afternoon == weather){
            return true;
          }else if(this.thursdayWeath[0].weather_evening == weather){
            return true;
          }else if(this.thursdayWeath[0].weather_onoff == weather){
            return true;
          }else if(this.thursdayWeath[0].weather_restofday == weather){
            return true;
          }
      }
  
  }else if(dayValue == 'Friday'){
  
      if(this.fridayWeath.length != 0){
          if(this.fridayWeath[0].weather_allday == weather){
            return true;
          }else if(this.fridayWeath[0].weather_morning == weather){
            return true;
          }else if(this.fridayWeath[0].weather_midday == weather){
            return true;
          }else if(this.fridayWeath[0].weather_afternoon == weather){
            return true;
          }else if(this.fridayWeath[0].weather_evening == weather){
            return true;
          }else if(this.fridayWeath[0].weather_onoff == weather){
            return true;
          }else if(this.fridayWeath[0].weather_restofday == weather){
            return true;
          }
      }
  
  }
  
  return false;
  
  }
  
  getWeatherName(rawName){

    return rawName.replace("weather", "");

  }

  getWeatherIcon(rawName){

    if(rawName=="weatherPerfect"){
      return './assets/img/weather-icons/sunny.png';
    }else if(rawName=="weatherSunny"){
        return './assets/img/weather-icons/sunny.png';
    }else if(rawName=="weatherRainy"){
        return './assets/img/weather-icons/rainy.png';
    }else if(rawName=="weatherCloudy"){
        return './assets/img/weather-icons/cloudy.png';      
    }else if(rawName=="weatherStormy"){
        return './assets/img/weather-icons/stormy.png';      
    }else if(rawName=="weatherSnowy"){
        return './assets/img/weather-icons/snowy.png';      
    }else if(rawName=="weatherPartial"){
        return './assets/img/weather-icons/full-and-partial.png';     
    }

  }

  getDiaryWeather(dayValue){
  
  let showWeatherDate;
  
  if(dayValue == 'Saturday'){
    showWeatherDate = this.saturdayWeath;
  }else if(dayValue == 'Sunday'){
    showWeatherDate = this.sundayWeath;
  }else if(dayValue == 'Monday'){
    showWeatherDate = this.mondayWeath;
  }else if(dayValue == 'Tuesday'){
    showWeatherDate = this.tuesdayWeath;
  }else if(dayValue == 'Wednesday'){
    showWeatherDate = this.wednesdayWeath;
  }else if(dayValue == 'Thursday'){
    showWeatherDate = this.thursdayWeath;
  }else if(dayValue == 'Friday'){
   showWeatherDate = this.fridayWeath;
  }
  
  console.log(showWeatherDate);
  
    if(showWeatherDate){  
  
          let weatherContent = '';
          
          if(showWeatherDate[0].weather_allday){
              if(showWeatherDate[0].weather_allday == 'weatherOthers'){
                weatherContent += '<p>All Day: ' +showWeatherDate[0].weather_others_allday+ '</p>';
              }else{
                weatherContent += '<p>All Day: ' +showWeatherDate[0].weather_allday.replace("weather", "")+ '</p>';
              }      
          }
          
          if(showWeatherDate[0].weather_morning){
              if(showWeatherDate[0].weather_morning == 'weatherOthers'){
                weatherContent += '<p>Morning: ' +showWeatherDate[0].weather_others_morning+ '</p>';
              }else{
                weatherContent += '<p>Morning: ' +showWeatherDate[0].weather_morning.replace("weather", "")+ '</p>';
              }      
          }
  
          if(showWeatherDate[0].weather_midday){
              if(showWeatherDate[0].weather_midday == 'weatherOthers'){
                weatherContent += '<p>Midday: ' +showWeatherDate[0].weather_others_midday+ '</p>';
              }else{
                weatherContent += '<p>Midday: ' +showWeatherDate[0].weather_midday.replace("weather", "")+ '</p>';
              }      
          }
  
          if(showWeatherDate[0].weather_afternoon){
              if(showWeatherDate[0].weather_afternoon == 'weatherOthers'){
                weatherContent += '<p>Afternoon: ' +showWeatherDate[0].weather_others_afternoon+ '</p>';
              }else{
                weatherContent += '<p>Afternoon: ' +showWeatherDate[0].weather_afternoon.replace("weather", "")+ '</p>';
              }      
          }
  
          
          if(showWeatherDate[0].weather_evening){
              if(showWeatherDate[0].weather_evening == 'weatherOthers'){
                weatherContent += '<p>Evening: ' +showWeatherDate[0].weather_others_evening+ '</p>';
              }else{
                weatherContent += '<p>Evening: ' +showWeatherDate[0].weather_evening.replace("weather", "")+ '</p>';
              }      
          }
  
          if(showWeatherDate[0].weather_onoff){
              if(showWeatherDate[0].weather_onoff == 'weatherOthers'){
                weatherContent += '<p>OnOff: ' +showWeatherDate[0].weather_others_onoff+ '</p>';
              }else{
                weatherContent += '<p>OnOff: ' +showWeatherDate[0].weather_onoff.replace("weather", "")+ '</p>';
              }      
          }
  
          if(showWeatherDate[0].weather_restofday){
              if(showWeatherDate[0].weather_restofday == 'weatherOthers'){
                weatherContent += '<p>Rest of Day: ' +showWeatherDate[0].weather_others_restofday+ '</p>';
              }else{
                weatherContent += '<p>Rest of Day: ' +showWeatherDate[0].weather_restofday.replace("weather", "")+ '</p>';
              }      
          }
  
          swal.fire({
            title: dayValue + ' Weather',
            icon: 'info',
            html: weatherContent,
            buttonsStyling: false,
            customClass:{
              confirmButton: "btn btn-success"
            }
        });
    }
  
  }

  //   getDiaryWeather(dayValue){
      
  //     this.spinnerService.show();
  //     let end_date= this.editForm.value.fridayDate;
  //     let weatherDate = new Date(end_date);

  //     if(dayValue == 'Saturday'){
  //       weatherDate.setDate( weatherDate.getDate() - 6 );
  //     }else if(dayValue == 'Sunday'){
  //         weatherDate.setDate( weatherDate.getDate() - 5 );
  //     }else if(dayValue == 'Monday'){
  //         weatherDate.setDate( weatherDate.getDate() - 4 );
  //     }else if(dayValue == 'Tuesday'){
  //         weatherDate.setDate( weatherDate.getDate() - 3 );
  //     }else if(dayValue == 'Wednesday'){
  //         weatherDate.setDate( weatherDate.getDate() - 2 );
  //     }else if(dayValue == 'Thursday'){
  //         weatherDate.setDate( weatherDate.getDate() - 1 );
  //     }else if(dayValue == 'Friday'){
  //         weatherDate.setDate( weatherDate.getDate());
  //     }


      

  //     console.log(weatherDate);

  //     let passData = {
  //       weatherDate:  weatherDate,
  //     }

  //     console.log(passData);

  //     this.data_api.getDiaryWeather(this.projectID, passData).subscribe((data) => {
  //         if(data){  
  //               console.log(data);

  //               let weatherContent = '';
                
  //               if(data[0].weather_allday){
  //                   if(data[0].weather_allday == 'weatherOthers'){
  //                     weatherContent += '<p>All Day: ' +data[0].weather_others_allday+ '</p>';
  //                   }else{
  //                     weatherContent += '<p>All Day: ' +data[0].weather_allday.replace("weather", "")+ '</p>';
  //                   }      
  //               }
                
  //               if(data[0].weather_morning){
  //                   if(data[0].weather_morning == 'weatherOthers'){
  //                     weatherContent += '<p>Morning: ' +data[0].weather_others_morning+ '</p>';
  //                   }else{
  //                     weatherContent += '<p>Morning: ' +data[0].weather_morning.replace("weather", "")+ '</p>';
  //                   }      
  //               }

  //               if(data[0].weather_midday){
  //                   if(data[0].weather_midday == 'weatherOthers'){
  //                     weatherContent += '<p>Midday: ' +data[0].weather_others_midday+ '</p>';
  //                   }else{
  //                     weatherContent += '<p>Midday: ' +data[0].weather_midday.replace("weather", "")+ '</p>';
  //                   }      
  //               }

  //               if(data[0].weather_afternoon){
  //                   if(data[0].weather_afternoon == 'weatherOthers'){
  //                     weatherContent += '<p>Afternoon: ' +data[0].weather_others_afternoon+ '</p>';
  //                   }else{
  //                     weatherContent += '<p>Afternoon: ' +data[0].weather_afternoon.replace("weather", "")+ '</p>';
  //                   }      
  //               }

                
  //               if(data[0].weather_evening){
  //                   if(data[0].weather_evening == 'weatherOthers'){
  //                     weatherContent += '<p>Evening: ' +data[0].weather_others_evening+ '</p>';
  //                   }else{
  //                     weatherContent += '<p>Evening: ' +data[0].weather_evening.replace("weather", "")+ '</p>';
  //                   }      
  //               }

  //               if(data[0].weather_onoff){
  //                   if(data[0].weather_onoff == 'weatherOthers'){
  //                     weatherContent += '<p>OnOff: ' +data[0].weather_others_onoff+ '</p>';
  //                   }else{
  //                     weatherContent += '<p>OnOff: ' +data[0].weather_onoff.replace("weather", "")+ '</p>';
  //                   }      
  //               }

  //               if(data[0].weather_restofday){
  //                   if(data[0].weather_restofday == 'weatherOthers'){
  //                     weatherContent += '<p>Rest of Day: ' +data[0].weather_others_restofday+ '</p>';
  //                   }else{
  //                     weatherContent += '<p>Rest of Day: ' +data[0].weather_restofday.replace("weather", "")+ '</p>';
  //                   }      
  //               }

  //               this.spinnerService.hide();

  //               swal.fire({
  //                 title: dayValue + ' Weather',
  //                 icon: 'info',
  //                 html: weatherContent,
  //                 buttonsStyling: false,
  //                 customClass:{
  //                   confirmButton: "btn btn-success"
  //                 }
  //             });
  //         }
  //         this.spinnerService.hide();
  //     })



  // }

    public getWeeklyReport(): void {
      // this.myService.nextMessage("loadslow");
        this.spinnerService.show();

        this.data_api.getFBWeeklyReportSpec(this.passID.id).subscribe(async data => {

          console.log(data);
  
            // let data;
            // let projData;
            // if(rawdata[0]){ 
            //   data = rawdata[0];
            //   projData = rawdata[1]
            // }else{
            //   return;
            // }
            console.log(data);
            //this.lostHoursWeek = data[0].lost_hours_week;
            this.rawImageUpload = data.imageUpload;
            this.projectID = data.projectId;
            this.pdfLink = data.pdfLink;
            let dcbAccThisWeekData = data.dcbAccThisWeek;
            let dcbAccNextWeekData = data.dcbAccNextWeek;
            let subAccThisWeekData = data.subAccThisWeek;
            let subAccNextWeekData = data.subAccNextWeek;
            let conSiteThisWeekData = data.conSiteThisWeek;
            let conSiteNeedWeekData = data.conSiteNeedWeek;
            let requestedChangesData = data.requestedChanges;
            let clarificationArchEngData = data.clarificationArchEng;
            let informationNeededData = data.informationNeeded;  
            let upcomingMeetingsData = data.upcomingMeetings; 
            this.rawLostWeekDays = data.lostWeekDays;
            this.rawLostWeekHours = data.lostWeekHours;

            this.editForm.patchValue({
              weekendDate:  data.weekendDate.toDate(),
              projectId: data.projectId,
              // siteSupervisor: data[0].supervisor_id,
              weatherAllWeek: data.weatherAllWeek,
              weatherSaturday: data.weatherSaturday,
              weatherSunday: data.weatherSunday,
              weatherMonday: data.weatherMonday,
              weatherTuesday: data.weatherTuesday,
              weatherWednesday: data.weatherWednesday,
              weatherThursday: data.weatherThursday,
              weatherFriday: data.weatherFriday,
              weatherOthersAllWeek: data.weatherOthersAllWeek,
              weatherOthersSaturday: data.weatherOthersSaturday,
              weatherOthersSunday: data.weatherOthersSunday,
              weatherOthersMonday: data.weatherOthersMonday,
              weatherOthersTuesday: data.weatherOthersTuesday,
              weatherOthersWednesday: data.weatherOthersWednesday,
              weatherOthersThursday: data.weatherOthersThursday,
              weatherOthersFriday: data.weatherOthersFriday,
              reportNumber: data.reportNumber,
              lostWeekDays: data.lostWeekDays,
              lostWeekHours: data.lostWeekHours,
              //lostWeekDays: Math.floor( (this.lostHoursWeek/8) ),
              //folderName: data[0].folder_name,
              //folderId: data[0].folder_id,
              totalFileSize: data.totalFileSize,
              //lostWeekHours: ( (this.lostHoursWeek/8) - Math.floor( (this.lostHoursWeek/8) ) ) * 8,
              dcbAccThisWeek: dcbAccThisWeekData,
              dcbAccNextWeek: dcbAccNextWeekData,
              subAccThisWeek: subAccThisWeekData,
              subAccNextWeek: subAccNextWeekData,
              conSiteThisWeek: conSiteThisWeekData,
              conSiteNeedWeek: conSiteNeedWeekData,
              requestedChanges: requestedChangesData,
              clarificationArchEng: clarificationArchEngData,
              informationNeeded: informationNeededData,
              upcomingMeetings: upcomingMeetingsData,
              //imageFolderId: data[0].folder_id,
            });

            this.projectSelect(data.projectId);

            // this.getSupervisor(data[0].supervisor_id);

            // dcbAccThisWeekData.forEach(value => {
            //     const dcbAccThisWeek = this.editForm.get('dcbAccThisWeek') as FormArray;
            //     dcbAccThisWeek.push(this.formBuilder.control(value));
            // });

            // dcbAccNextWeekData.forEach(value => {
            //     const dcbAccNextWeek = this.editForm.get('dcbAccNextWeek') as FormArray;
            //     dcbAccNextWeek.push(this.formBuilder.control(value));
            // });

            // subAccThisWeekData.forEach(value => {
            //     const subAccThisWeek = this.editForm.get('subAccThisWeek') as FormArray;
            //     subAccThisWeek.push(this.formBuilder.control(value));
            // });

            // subAccNextWeekData.forEach(value => {
            //     const subAccNextWeek = this.editForm.get('subAccNextWeek') as FormArray;
            //     subAccNextWeek.push(this.formBuilder.control(value));
            // });

            // conSiteThisWeekData.forEach(value => {
            //     const conSiteThisWeek = this.editForm.get('conSiteThisWeek') as FormArray;
            //     conSiteThisWeek.push(this.formBuilder.control(value));
            // });

            // conSiteNeedWeekData.forEach(value => {
            //     const conSiteNeedWeek = this.editForm.get('conSiteNeedWeek') as FormArray;
            //     conSiteNeedWeek.push(this.formBuilder.control(value));
            // });

            // requestedChangesData.forEach(value => {
            //     const requestedChanges = this.editForm.get('requestedChanges') as FormArray;
            //     requestedChanges.push(this.formBuilder.control(value));
            // });

            // clarificationArchEngData.forEach(value => {
            //     const clarificationArchEng = this.editForm.get('clarificationArchEng') as FormArray;
            //     clarificationArchEng.push(this.formBuilder.control(value));
            // });

            // informationNeededData.forEach(value => {
            //     const informationNeeded = this.editForm.get('informationNeeded') as FormArray;
            //     informationNeeded.push(this.formBuilder.control(value));
            // });

            this.checkOthersValue();

            console.log(data.imageUpload);
            if (data.imageUpload){
                if(data.imageUpload != " " && data.imageUpload != ""){

                      this.imageUpload = this.editForm.get('imageUpload') as FormArray;

                      let newImageUploadArray = [];

                      for (let img of data.imageUpload) {  

                        let splitName = img.imageFile.split(/%2..*%2F(.*?)\?alt/);

                        console.log(splitName[1]);

                        newImageUploadArray.push({
                            imageCaption: img.imageCaption,
                            imageFile: img.imageFile,
                            nameIndex: splitName[1],
                            imageSize: img.imageSize,
                            imageStamp: img.imageStamp,
                        });      

                      }

                      newImageUploadArray.sort((a, b) => {
                        return a.nameIndex - b.nameIndex;
                      });

                      console.log(newImageUploadArray);

                      for (let img of newImageUploadArray) {  
                          this.imageURL.push(img.imageFile);
                          this.imageURLRaw.push(img.imageFile);
                          // console.log(awaitData);
                          this.imageUpload.push(
                            new FormGroup({
                              'imageCaption': new FormControl(img.imageCaption),
                              'imageFile': new FormControl(img.imageFile),
                              'imageSize': new FormControl(img.imageSize),
                              'imageStamp': new FormControl(img.imageStamp)
                            })
                          );

                          this.imageSize.push(img.imageSize);
                      }
                      this.convertImages();

                     // let reader = new FileReader();

                      // for (let img of data.imageUpload) {                
                                
                      //           // reader.readAsDataURL(test.image_file);
                        
                      //           // reader.onload = () => {

                      //          // console.log('Start')

                                
                                
                      //           // this.getBase64ImageFromURL(test.image_file).subscribe((base64Data: string) => {   

                      //           //       this.imageURL.push(base64Data);
                      //           //       this.imageURLRaw.push(base64Data);
                                      
                      //           //       this.imageUpload.push(
                      //           //         new FormGroup({
                      //           //           'imageCaption': new FormControl(test.image_caption),
                      //           //           'imageFile': new FormControl(base64Data),
                      //           //           'imageSize': new FormControl(test.image_size),
                      //           //         })
                      //           //       );
                      //           // });
                      //           console.log(this.editForm.value.uploadSource);
                     

                               
                      //               //const awaitData = await this.getBase64ImageFromURLTwo(test.image_file); 
                      //               this.imageURLTBD.push(img.imageFile);
    
                      //               // this.getBase64ImageFromURL(img.imageFile).subscribe((base64Data: string) => {   
                  
                      //               //       this.imageURL.push(base64Data);
                      //               //       this.imageURLRaw.push(base64Data);
                                          
                      //               //       this.imageUpload.push(
                      //               //         new FormGroup({
                      //               //           'imageCaption': new FormControl(img.imageCaption),
                      //               //           'imageFile': new FormControl(base64Data),
                      //               //           'imageSize': new FormControl(img.imageSize),
                      //               //         })
                      //               //       );
                      //               // });

                      //               const awaitData = await this.getBase64ImageFromURL(img.imageFile).toPromise(); 
                      //               console.log(awaitData);
                      //                 this.imageURL.push(awaitData);
                      //                 this.imageURLRaw.push(awaitData);
                      //                 // console.log(awaitData);
                      //                 this.imageUpload.push(
                      //                   new FormGroup({
                      //                     'imageCaption': new FormControl(img.imageCaption),
                      //                     'imageFile': new FormControl(awaitData),
                      //                     'imageSize': new FormControl(img.imageSize),
                      //                   })
                      //                 );
                                

                      //           //console.log('Finish');

                      //           this.imageSize.push(img.imageSize);
                      // }
                }
            }

            if (data.customQuestion){

              this.customQuestion = this.editForm.get('customQuestion') as FormArray;
              for (let quest of data.customQuestion) {
                       
                        this.customQuestion.push(
                          new FormGroup({
                            'custQuestion': new FormControl(quest.custQuestion),
                            'custAnswer': new FormControl(quest.custAnswer),
                          })
                        );
              }
            }
            // this.calculateTotalSize();
            // // this.getTask();
            // this.getWeeklyImagesDiary();
            // // this.getWeeklyImagesWorker();
            this.getFBWeeklyWorkerLogs();
            this.getFBDiaryData();
            // this.spinnerService.hide();
            // console.log(this.imageSize);

            let tempVal = JSON.parse(JSON.stringify(this.editForm.value));

            let imgCount = this.editForm.value.imageUpload.length;
            
            tempVal.imageUpload = imgCount;

            this.prevdata = tempVal;
            // this.myService.nextMessage("false");
        });
    }

    convertImages(){
      if(this.editForm.value.imageUpload.length > 0){
          let i = 0;
          for (let img of this.editForm.value.imageUpload) {
            console.log(img.imageFile);  
            const myForm =  (<FormArray>this.editForm.get("imageUpload")).at(i);
            // const awaitData = this.getBase64ImageFromURL(img.imageFile).subscribe((base64Data: string) => {   return base64Data}); 
            // myForm.patchValue({
            //   imageCaption: i,
            // });

            this.getBase64ImageFromURL(img.imageFile).subscribe((base64Data: string) => {  
                 
                // this.imageURL[i] = base64Data;
                // this.imageURLRaw[i] = base64Data;
                myForm.patchValue({
                  imageFile: base64Data,
                });
            });

            i++;

          }
      }
    }
    
    getAdminSettings(){
        this.data_api.getFBAdminSettings().subscribe((data) => {
            console.log(data);

            this.adminData = data;
            this.colorBtnDefault = data.colourEnabledButton ? data.colourEnabledButton : '';

            if(data.pdfHeader1){
              this.getBase64ImageFromURL(data.pdfHeader1).subscribe((base64Data: string) => {   
                this.pdfHeaderImage1 = base64Data;
              });
            }
            
            if(data.pdfHeader1){
              this.getBase64ImageFromURL(data.pdfHeader2).subscribe((base64Data: string) => {   
                this.pdfHeaderImage2 = base64Data;
              });
            }

            if(data.pdfFooter){
              this.getBase64ImageFromURL(data.pdfFooter).subscribe((base64Data: string) => {   
                this.pdfFooterImage = base64Data;
              });
            }

            if(data.logo){
              this.getBase64ImageFromURL(data.logo).subscribe((base64Data: string) => {   
                this.pdfLogo = base64Data;
              });
            }

            if(data.pdfCompanyName){
              this.pdfCompanyName = data.pdfCompanyName;
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
    
    getImage(imageUrl: string) {
      this.getBase64ImageFromURL(imageUrl).subscribe((base64Data: string) => {
        // this.base64TrimmedURL = base64Data;
        // this.createBlobImageFileAndShow();
        return base64Data;
      });
    }

    getBase64ImageFromURL(url: string): Observable<string> {
      return Observable.create((observer: Observer<string>) => {
        // create an image object
        let img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = url;
        if (!img.complete) {
          // This will call another method that will create image from url
          img.onload = () => {
            observer.next(this.getBase64Image(img));
            observer.complete();
          };
          img.onerror = err => {
            observer.error(err);
          };
        } else {
          observer.next(this.getBase64Image(img));
          observer.complete();
        }
      });
    }

    getBase64Image(img: HTMLImageElement): string {
      // We create a HTML canvas object that will create a 2d image
      var canvas: HTMLCanvasElement = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      let ctx: CanvasRenderingContext2D = canvas.getContext("2d");
      // This will draw image
      ctx.drawImage(img, 0, 0);
      // Convert the drawn image to Data URL
      let dataURL: string = canvas.toDataURL("image/png");
      return dataURL;
      // this.base64DefaultURL = dataURL;
      // return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    }

    // public uploadImage(){
    //     console.log(this.editForm.value.imageUpload);

    //       this.data_api.uploadImage(this.editForm.value.imageUpload).subscribe((result) => { 
    //           console.log(result);
    //       });
    // }
    public addLog(){
        // let newDetails;
        // newDetails += 'Company:';

        const tempVal = JSON.parse(JSON.stringify(this.editForm.value));

        let imgCount = this.editForm.value.imageUpload.length;
        
        tempVal.imageUpload = imgCount;
       
        let today = new Date();
        // let passData = {
        //     todaysDate: today,
        //     log: 'Updated a Weekly Report',
        //     method: 'update',
        //     subject: 'weekly-report',
        //     subjectID: this.projectID,
        //     subjectDate: this.editForm.value.weekendDate,
        //     prevdata: this.prevdata,
        //     data: tempVal,
        //     url: window.location.href
        // }

        let passData = {
            todaysDate: today,
            log: 'Updated a Weekly Report',
            method: 'update',
            subject: 'weekly-report',
            subjectID: this.projectID,
            subjectDate: this.editForm.value.weekendDate,
            prevdata: this.prevdata,
            data: tempVal,
            url: window.location.href,
            userID: this.userDetails.user_id,
            userName: this.userDetails.name
        }

        this.data_api.addFBActivityLog(passData).then(() => {
          this.spinnerService.hide();
           window.location.reload()
        });

        // this.data_api.addActivityLog(this.userDetails.user_id,passData)
        //   .subscribe(
        //     (result) => {
        //       console.log(result);

        //       const tempVal2 = JSON.parse(JSON.stringify(this.editForm.value));

        //         let imgCount2 = this.editForm.value.imageUpload.length;
                
        //         tempVal2.imageUpload = imgCount2;

        //         this.prevdata = tempVal2;

        //     }
        // ); 
    }

    public saveStep1Test(message){  // Generate and Upload PDF to Firebase

      // if(message=="preview"){
      //     var importantStuff = window.open('', '_blank');
      //     importantStuff.document.write('Loading preview...Please wait');
      // }
        console.log(this.editForm.value);
        
        this.friDateRaw = this.editForm.value.weekendDate;
        this.friDate = ('0' + (this.friDateRaw.getDate())).slice(-2) + '-' + ('0' + (this.friDateRaw.getMonth() + 1) ).slice( -2 ) + '-' + this.friDateRaw.getFullYear() ;

        //transform Aimed Completion Date 
        let convertedDateFormat = (this.editForm.getRawValue().aimedComDate).split("/").reverse().join("-");

        this.aimDateRaw = new Date(convertedDateFormat);
        this.aimDate = ('0' + (this.aimDateRaw.getDate())).slice(-2) + '-' + ('0' + (this.aimDateRaw.getMonth() + 1) ).slice( -2 ) + '-' + this.aimDateRaw.getFullYear() ;
        console.log(this.aimDate);
        const documentDefinition = this.getDocumentDefinition2();
        console.log(documentDefinition);
        const pdfDocGenerator = pdfMake.createPdf(documentDefinition);
    
        //let selectedDate = this.editForm.value.todaysDate
        let folderName =  moment(this.friDateRaw).format('YYYY-MM-DD');
        //let formattedDate = ('0' + (this.todaysDateRaw.getDate())).slice(-2) + '-' + ('0' + (this.todaysDateRaw.getMonth() + 1) ).slice( -2 ) + '-' + this.todaysDateRaw.getFullYear();

        let id = this.friDate +'-'+this.projJobNumber+'.pdf'

        pdfDocGenerator.open();

        // if(message=="download"){
        //   pdfDocGenerator.download(id); 
        // }else if(message=="preview"){
        //   pdfDocGenerator.open();
        // }

  }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public async saveStep1(message){  // Generate and Upload PDF to Firebase
      this.progressOverlay.show('Generating Report PDF','#0771DE','white','lightslategray',1); 
      await this.delay(250);
      // if(message=="preview"){
      //     var importantStuff = window.open('', '_blank');
      //     importantStuff.document.write('Loading preview...Please wait');
      // }

        // Initiate PDF Generation
        
        if(!this.editForm.value.reportNumber){
          this.editForm.patchValue({
            reportNumber: ''
          });

        }

        this.friDateRaw = this.editForm.value.weekendDate;
        this.friDate = ('0' + (this.friDateRaw.getDate())).slice(-2) + '-' + ('0' + (this.friDateRaw.getMonth() + 1) ).slice( -2 ) + '-' + this.friDateRaw.getFullYear() ;

        //transform Aimed Completion Date 
        let convertedDateFormat = (this.editForm.getRawValue().aimedComDate).split("/").reverse().join("-");

        this.aimDateRaw = new Date(convertedDateFormat);
        this.aimDate = ('0' + (this.aimDateRaw.getDate())).slice(-2) + '-' + ('0' + (this.aimDateRaw.getMonth() + 1) ).slice( -2 ) + '-' + this.aimDateRaw.getFullYear() ;

        const documentDefinition = this.getDocumentDefinition2();

        const pdfDocGenerator = pdfMake.createPdf(documentDefinition);
    
        this.progressOverlay.hide();
        this.progressOverlay.show('Uploading Report PDF','#0771DE','white','lightslategray',1);

        //let selectedDate = this.editForm.value.todaysDate
        let folderName =  moment(this.friDateRaw).format('YYYY-MM-DD');
        //let formattedDate = ('0' + (this.todaysDateRaw.getDate())).slice(-2) + '-' + ('0' + (this.todaysDateRaw.getMonth() + 1) ).slice( -2 ) + '-' + this.todaysDateRaw.getFullYear();

        let id = this.friDate +'-'+this.projJobNumber+'.pdf'

        // if(message=="download"){
        //   pdfDocGenerator.download(id); 
        // }else if(message=="preview"){
        //   pdfDocGenerator.open();
        // }

        pdfDocGenerator.getBase64((data) => {
          console.log(data);
          let ref = this.afStorage.ref(this.accountFirebase+'/'+this.projUploadFolder+'/Weekly Report/'+folderName+'/'+id);
          let task = ref.putString(data, 'base64',{contentType:"application/pdf"});
          let _percentage$ = task.percentageChanges();
          _percentage$.subscribe(
            (prog: number) => {
              this.progressOverlay.setProgress(Math.ceil(prog));
          });

          task.snapshotChanges().pipe(
            finalize(() => {
              ref.getDownloadURL().subscribe((url) => { 
                this.progressOverlay.hide();
                console.log(url);
                this.editForm.patchValue({
                  pdfLink: url
                });

                if(message=="download"){
                  console.log('detect download');
                  if( (this.deviceInfo.browser == 'Safari') && (this.deviceInfo.device == 'iPhone') ){
                    window.open(url, "_blank");
                  }else{
                    this.downloadPDF(data,id);
                  }

                  //pdfDocGenerator.download();
                  //this.downloadPDF(url,id);
                  // pdfDocGenerator.download();

                  // var promise = pdfDocGenerator.getBlob();
                  // promise.then((blob) => {
                  //   try{
                  //       fs.saveAs(blob, id);
                  //   }catch(e){
                  //       console.log('Download failed from a call to external library "saveAs".');
                  //       return false;
                  //   }
                  //   return true;
                  // });
                }else if(message=="preview"){
                  
                  console.log('preview download');
                  window.open(url, "_blank");
                  // return;
                  // importantStuff.location.href = url;
                 //this.newTabPDF(url);
                  // setTimeout(function() {
                  //   console.log(url);
                  //   window.open(url, '_blank');
                  // }, 500);

                }else if(message=="copy"){

                         navigator.clipboard.writeText(url)
                        .then(() => 
                            $.notify({
                              icon: 'notifications',
                              message: 'PDF link copied.'
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
                              })
                        )
                      .catch(err => 
                              $.notify({
                                icon: 'notifications',
                                message: 'Error copying PDF link.'
                                }, {
                                  type: 'error',
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
                                })
                      );
                }

                this.saveStep2();
              });
          })).subscribe();

        });


  }

  public copyPdfLink(){
    this.clipboard.copy(this.pdfLink);

    $.notify({
      icon: 'notifications',
      message: 'PDF link copied.'
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

  }

  public downloadPDF(pdf, fileName) {
    const linkSource = `data:application/pdf;base64,${pdf}`;
    const element = document.createElement('a');
    element.href = linkSource;
    element.download = fileName;

    element.style.display = 'none';
    element.click();
  }

  // public base64toBlob(base64Data, contentType) {
  //     contentType = contentType || '';
  //     var sliceSize = 1024;
  //     var byteCharacters = atob(base64Data);
  //     var bytesLength = byteCharacters.length;
  //     var slicesCount = Math.ceil(bytesLength / sliceSize);
  //     var byteArrays = new Array(slicesCount);

  //     for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
  //         var begin = sliceIndex * sliceSize;
  //         var end = Math.min(begin + sliceSize, bytesLength);

  //         var bytes = new Array(end - begin);
  //         for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
  //             bytes[i] = byteCharacters[offset].charCodeAt(0);
  //         }
  //         byteArrays[sliceIndex] = new Uint8Array(bytes);
  //     }
  //     return new Blob(byteArrays, { type: contentType });
  // }

  // public newTabPDF(link) {
    // const element = document.getElementById('vcardTrigger');
    // element.setAttribute('href', link);
    // element.setAttribute('target', '_blank');
    // // element.style.cursor = 'pointer';
    // // element.style.display = 'none';
    // // element.click();
    // console.log(link);
    // console.log(element);
    // // setTimeout(function() {
    // //   console.log(element);
    //   document.getElementById('vcardTrigger').click();
    // // }, 500);
  // }


    public async saveStep2(){   // Upload Files to Firebase

      console.log(this.editForm.value);

      // this.calculateTotalSize();

      // console.log(this.editForm.value);

      // this.editForm.markAllAsTouched();

      // if (this.editForm.invalid) {
      //       swal.fire({
      //           title: "Please fill required fields!",
      //           // text: "You clicked the button!",
      //           buttonsStyling: false,
      //           customClass: {
      //             confirmButton: 'btn dcb-btn',
      //           },
      //           icon: "error"
      //       })
      //       return;
      // }

      if(this.editForm.controls.imageUpload.dirty == true && this.editForm.value.imageUpload.length >= 1){

            this.progressOverlay.show('Uploading Images','#0771DE','white','lightslategray',1); 

            this.allPercentage = [];
            let imageLen = this.editForm.value.imageUpload.length;
            let imageDone = 0;
            let i = 0;

            let selectedDate = this.editForm.value.weekendDate
            let folderName =  moment(selectedDate).format('YYYY-MM-DD');

            this.editForm.patchValue({
              folderName: folderName
            });
           
            // // DELETE OLD images
            // for (let imageTBD of this.imageURLTBD) { 
            //   await this.afStorage.storage.refFromURL(imageTBD).delete();
            // }

            for (let image of this.editForm.value.imageUpload) { 

                let base64image = image.imageFile;
                let id = Math.random().toString(36).substring(2);
                let ref = this.afStorage.ref( this.accountFirebase+'/'+this.projUploadFolder+'/Weekly Report/'+folderName+'/'+i);
                //let base64String = base64image.split(',').pop();
                let task = ref.putString(base64image, 'data_url');
                let _percentage$ = task.percentageChanges();
                this.allPercentage.push(_percentage$);
                
                task.snapshotChanges().pipe(
                  finalize(() => {
                    ref.getDownloadURL().subscribe((url) => { 
                      // this.downloadURLs = this.downloadURLs.concat([url]);

                      let splitName = url.split(/%2..*%2F(.*?)\?alt/);
                      console.log(splitName[1]);

                      this.downloadArray.push({
                          url: url,
                          nameIndex: splitName[1]
                      });

                      imageDone = imageDone + 1;
                      if(imageDone == imageLen){
                        this.progressOverlay.hide();
                        this.savestep3();
                      } 
                    });
                })).subscribe();
                i++;
            }

            this.allPercentage.map((questions, index) => 
                questions.subscribe(
                  response => {
                    this.allUploadProgress[index] = response;
                    const sum = this.allUploadProgress.reduce((partialSum, a) => partialSum + a, 0);
                    this.totalPercentage = ( sum / ( this.allPercentage.length * 100) ) * 100;
                    console.log('sum: '+sum);
                    console.log('totalPercentage: '+this.totalPercentage);
                    this.progressOverlay.setProgress(Math.ceil(this.totalPercentage));
                    // if(this.totalPercentage == 100){
                      
                    // }
                  }
                )
            );

      // }else if(this.editForm.controls.imageUpload.dirty == true && this.editForm.value.imageUpload.length < 1){

      //      this.savestep3();

      }else{
        this.updateReport();
      }
  }

  savestep3(){   // SET RECENT IMAGES FOR DASHBOARD

    if( this.downloadArray){
        //Sort Download URLS by filename
        this.downloadArray.sort((a, b) => {
          return a.nameIndex - b.nameIndex;
        });

        console.log(this.downloadArray);

        this.downloadArray.forEach((data) => {
          this.downloadURLs.push(data.url);
        });
        console.log(this.downloadURLs);
    }


    if(this.editForm.controls.imageUpload.dirty == true && this.editForm.value.imageUpload.length >= 1){

        // CONVERT IMAGEUPLOAD IMAGES TO FIREBASE DOWNLOAD URLS BEFORE SAVING TO FIREBASE
        let i = 0;
        this.downloadURLs.forEach(imageUrl => {
          console.log(imageUrl);
          const myForm =  (<FormArray>this.editForm.get("imageUpload")).at(i);
          myForm.patchValue({
            imageFile: imageUrl
          });
          i++;
        });

        console.log(this.downloadURLs);
            //console.log(this.downloadURLs.length);
            console.log(this.recentImages);
           // console.log(this.recentImages.length);
            let tempImages = [];    

            if(this.downloadURLs.length >= 10){

              for (let i = 1; i <= 10; i++) {
                tempImages.push(
                  {
                    imageUrl: this.downloadURLs[i - 1],
                    order: i,
                  }); 
              }

            }else{

              for (let i = 1; i <= this.downloadURLs.length; i++) {
                tempImages.push(
                  {
                    imageUrl: this.downloadURLs[i - 1],
                    order: i,
                  }); 
              }

              if(this.recentImages){
                  for (let i = 1; i <= (10 - this.downloadURLs.length); i++) {

                    if ( i > this.recentImages.length) {
                      break;
                    }
                    
                    tempImages.push(
                      {
                        imageUrl: this.recentImages[i - 1].imageUrl,
                        order: i + this.downloadURLs.length,
                      }); 
                  }
              }

              console.log(tempImages);

            }

            this.data_api.setRecentImagesWeeklyReport(tempImages).then(() => {
                 this.updateReport();
            })
            .catch(err => {
              console.log(err);
            });  

    // }else if(this.editForm.controls.imageUpload.dirty == true && this.editForm.value.imageUpload.length >= 1){
    //   this.updateReport();
    }else{
      this.updateReport();
    }

  }

  getRecentImagesWeeklyReport(){

    this.data_api.getFBRecent().pipe(first()).subscribe(data => {
      console.log(data);
        if(data.recentImagesDailyReport){
            this.recentImages = data.recentImagesWeeklyReport;
            //this.recentImages = data.recentImagesDailyReport.sort((a, b) => (a.order > b.order) ? -1 : 1);
            console.log(this.recentImages);
        }
        if(data.recentEntryWeekly){
            this.recentEntryWeekly = [];
            this.recentEntryWeekly = data.recentEntryWeekly;
            //this.recentImages = data.recentImagesDailyReport.sort((a, b) => (a.order > b.order) ? -1 : 1);
            console.log(this.recentEntryWeekly);
        }
    });

  }

    updateReport(): void {   // Update Report in Firebase

          this.spinnerService.show();

          

          if( (!this.editForm.value.imageUpload) || (this.editForm.controls.imageUpload.dirty != true) ){
            this.editForm.controls.imageUpload.disable();
          }


          console.log(this.editForm.value);
              this.data_api.updateFBWeeklyReport(this.passID.id, this.editForm.value).then(() => {
                  console.log('Updated item successfully!');
                  // this.spinnerService.hide();
                  $.notify({
                    icon: 'notifications',
                    message: 'Weekly Report Updated.'
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

  
                  if(this.editForm.controls.imageUpload.dirty != true){
                      this.editForm.controls.imageUpload.enable();
                  }

                    
                  if(this.editForm.controls.imageUpload.dirty == true){

                      // DELETE OLD images
                      // for (let imageTBD of this.imageURLTBD) { 
                      //   this.afStorage.storage.refFromURL(imageTBD).delete();
                      // }

                      // CONVERT BACK  IMAGEUPLOAD IMAGES FROM FIREBASE DOWNLOAD URLS TO ORIGINAL BASE64 AFTER SAVING TO FIREBASE
                      let i = 0;
                      this.imageURL.forEach(imageUrl => {
                      const myForm =  (<FormArray>this.editForm.get("imageUpload")).at(i);
                      myForm.patchValue({
                        imageFile: imageUrl
                      });
                      i++;
                      });

                      this.imageURLTBD = [];
                      // this.imageURLTBD = this.downloadURLs;
                      this.downloadURLs = [];

                  } 

                  let tempEntries = [];  

                  tempEntries.push(
                    {
                      projectName: this.pdfProjectName,
                      weeklyReportId: this.passID.id,
                      weekendDate: this.editForm.value.weekendDate,
                      lostTotalDays: this.editForm.value.lostWeekDays,
                      lostTotalHours: this.editForm.value.lostWeekHours,
                      order: 1,
                    }); 
                    if(this.recentEntryWeekly){
                      if(this.recentEntryWeekly.length > 0){
                          for (let i = 1; i <= (5 - 1); i++) {

                            if ( i > this.recentEntryWeekly.length) {
                              break;
                            }

                            tempEntries.push(
                              { 
                                projectName: this.recentEntryWeekly[i - 1].projectName,
                                weeklyReportId: this.recentEntryWeekly[i - 1].weeklyReportId,
                                weekendDate: this.recentEntryWeekly[i - 1].weekendDate,
                                lostTotalDays: this.recentEntryWeekly[i - 1].lostTotalDays,
                                lostTotalHours: this.recentEntryWeekly[i - 1].lostTotalHours,
                                order: i + 1,
                              }); 
                          }
                      }
                    }
                  this.data_api.setRecentEntryWeeklyReport(tempEntries).then(() => {
                      // this.getRecentImagesWeeklyReport();
                      // this.editForm.markAsPristine();
                      //window.location.reload()
                      this.data_api.updateFBProjectLostDaysHours( this.projectID, this.editForm.getRawValue().lostTotalDays, this.editForm.getRawValue().lostTotalHours).then(() => {
                        this.addLog();
                      })
                  })


                });
    }

    // public getProjects(){
    //       // this.spinnerService.show();

    //       this.data_api.getProjects().subscribe((data) => {
    //           data.forEach(data =>{ 
    //               this.projectNames.push(data)
    //           })
    //       });
    // }

    public getSupervisors(){
          // this.spinnerService.show();

          this.data_api.getProjectSupervisors().subscribe((data) => {
              data.forEach(data =>{ 
                  this.siteSupervisors.push(data)
              })
              console.log(this.siteSupervisors);
              this.getVisitors();
         
          });
           
    }

    public getQuestions(){
        // this.spinnerService.show();

        this.data_api.getQuestions().subscribe((data) => {
            data.forEach(data =>{ 
                this.customQuestions.push(data)
            })
        });
  }

  public getEmailSettings(){

      this.data_api.getEmailSettings().subscribe((data) => {
            console.log(data);
            this.emailData = data[0];
        }
      );

  }

  public addLostDaysHrs(){

    let lostWeekDays = this.editForm.value.lostWeekDays;
    if (lostWeekDays){
      if(lostWeekDays > 0){
   
      }else{
        lostWeekDays = 0;
      }
    }else{
      lostWeekDays = 0;
    }

    let lostWeekHours = this.editForm.value.lostWeekHours;
    if (lostWeekHours){
      if(lostWeekHours > 0){
   
      }else{
        lostWeekHours = 0;
      }
    }else{
      lostWeekHours = 0;
    }

    let totalLostWeekHours = (+lostWeekDays * 8) + +lostWeekHours;
    let rawTotalLostWeekHours = (+this.rawLostWeekDays * 8) + +this.rawLostWeekHours;

    let totalLostProjectHours  = 0;

    if( totalLostWeekHours > rawTotalLostWeekHours  ){
      totalLostProjectHours = ((+this.rawLostTotalDays * 8) + +this.rawLostTotalHours) + (totalLostWeekHours - rawTotalLostWeekHours);
    }else if(totalLostWeekHours < rawTotalLostWeekHours){
      totalLostProjectHours = ((+this.rawLostTotalDays * 8) + +this.rawLostTotalHours) - (rawTotalLostWeekHours - totalLostWeekHours);
    }else{
      totalLostProjectHours = (+this.rawLostTotalDays * 8) + +this.rawLostTotalHours;
    }

    let newTotalLostProjectDay = Math.floor(totalLostProjectHours/8);
    let newTotalLostProjectHours = Math.floor(totalLostProjectHours % 8);

    console.log(newTotalLostProjectDay);
    console.log(newTotalLostProjectHours);
    
    this.editForm.patchValue({
        lostTotalDays: newTotalLostProjectDay,
        lostTotalHours: newTotalLostProjectHours, //( (this.totalHours/8) - Math.floor( (this.totalHours/8) ) ) * 8,
        aimedComDate: this.getFinalAimedDate(this.rawAimedDate,newTotalLostProjectDay)
    });
    
  }


  // public addLostDaysHrs(){

  //   this.totalHours = +this.rawTotalHrs + (+this.editForm.value.lostWeekDays * 8) + +this.editForm.value.lostWeekHours;
  //   let totalDays  = (+this.editForm.value.lostTotalDays) + (+this.editForm.value.lostWeekDays)
  //   let totalHours = (+this.editForm.value.lostTotalHours) + (+this.editForm.value.lostWeekHours);

  //   this.editForm.patchValue({
  //       lostTotalDays: totalDays,
  //       lostTotalHours: totalHours, //( (this.totalHours/8) - Math.floor( (this.totalHours/8) ) ) * 8,
  //       aimedComDate: this.getFinalAimedDate(this.rawAimedDate,totalDays, totalHours)
  //   });

  // }

  public projectSelect(id){

        this.data_api.getFBProject(id).subscribe((data) => {
            console.log(data);
 
       
                console.log(data);
                this.projectData = data;
                //this.rawTotalHrs = data.total_hours;
                this.rawAimedDate = data.aimedComDate.toDate();
                this.pdfProjectName = data.projectName;
                this.clientEmailData = data.clientEmail;
                this.clientEmailCcData = data.clientEmailCC;
                this.clientEmailBccData = data.clientEmailBCC;
                this.projJobNumber = data.jobNumber;
                this.projaddress = data.projectAddress;
                this.projImageBackground = data.bgName;
                this.projUploadFolder = data.uploadFolder;
                //this.projUploadSource = data.upload_source;
                // this.projImageBackground = data.file_name

                if(data.lostTotalDays){
                    if(data.lostTotalDays > 0){
                      this.rawLostTotalDays = data.lostTotalDays;
                    }else{
                      this.rawLostTotalDays = 0;
                    }
                }
                if(data.lostTotalHours){
                  if(data.lostTotalDays > 0){
                    this.rawLostTotalHours = data.lostTotalHours;
                  }else{
                    this.rawLostTotalHours = 0;
                  }   
                }

                this.editForm.patchValue({
                    lostTotalDays: data.lostTotalDays, //Math.floor( (this.rawTotalHrs/8) ),
                    lostTotalHours: data.lostTotalHours, //( (this.rawTotalHrs/8) - Math.floor( (this.rawTotalHrs/8) ) ) * 8,
                    aimedComDate: this.getFinalAimedDate(this.rawAimedDate,this.rawLostTotalDays),
                    siteSupervisor: data.siteSupervisor
                });

                if((data.folder_weekly_id) && (data.folder_weekly_id != 'null') ){
                    this.editForm.patchValue({
                      projWeeklyFolderId: data.folder_weekly_id
                    });
                }

                if((data.upload_folder) && (data.upload_folder != 'null') ){
                    this.editForm.patchValue({
                      uploadFolder: data.upload_folder
                    });
                }

                if((data.upload_source) && (data.upload_source != 'null') ){
                  this.editForm.patchValue({
                    uploadSource: data.upload_source
                  });
                }
                
                this.getSupervisor(data.siteSupervisor);
                // if(data.file_name){

                //       this.getBase64ImageFromURL(data.file_name).subscribe((base64Data: string) => {  
 
                //         this.projImageBackground = base64Data;
            
                //       });

                // }

  
        });
    }

    disableWeekend(d: Date) {
      //if(d.getDay() != 0 && d.getDay() != 6) {
      if(d) {
        if(d.getDay() == 5) {
          return d;
        }
      }
    }

    public getFinalAimedDate(aimedDate,totalDays){

        let rawAimedDate2 = new Date(aimedDate);
      
        if(totalDays > 0){
          return this.formatDate(rawAimedDate2.setDate(rawAimedDate2.getDate() + totalDays));
        }else{
          return this.formatDate(aimedDate);
        }

    }

    // public getFinalAimedDate(aimedDate,totalDays, totalHours){
    //   let plusHours = totalHours;
    //   let plusDay = Math.ceil(totalDays + plusHours);
      
    //   let rawAimedDate2 = new Date(aimedDate);
    //   console.log(plusDay);
    //   if(plusDay > 1){
    //     console.log();
    //     return this.formatDate(rawAimedDate2.setDate(rawAimedDate2.getDate() + plusDay));
    //   }else{
    //     return this.formatDate(aimedDate);
    //   }
    // }

    public formatDate(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
    
        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
    
        // return [year, month, day].join('-');
        return [day, month, year].join('/');
    }

    public getSupervisor(id){

      if(id){
          this.data_api.getFBUser(id).subscribe((data) => {
                  console.log(data);
                this.pdfSupervisorName = data.userFirstName + ' ' + data.userLastName;
                this.pdfSupervisorEmail =  data.userEmail;
                this.pdfSupervisorMobile = data.userMobile ? data.userMobile: ' ';

            }
          );
      }

    }

    public getVisitor(id){

      if(id){
          this.data_api.getFBUser(id).subscribe((data) => {
                  console.log(data);
                return data.userFirstName + ' ' + data.userLastName;
            }
          );
      }

    }

    async onFileChange(event, index) {

      this.myService.nextMessage("true");
      this.spinnerService.show();
      if(event.target.files && event.target.files.length) {

            const imageFile = event.target.files[0];
            
            const myForm =  (<FormArray>this.editForm.get("imageUpload")).at(index);

            var options = {
              maxSizeMB: this.maxSizeMB,
              maxWidthOrHeight: this.maxWidthOrHeight,
              useWebWorker: this.currentWebWorker,
              maxIteration: 50,
              onProgress: (p) => {
                
                if(p == 100){
                  this.spinnerService.hide();
                  this.myService.nextMessage("false");
                }
              }
            }

            // console.log(imageFile);

            // // Crop Lnadscape images and convert to base64
            // const imageCropped = await this.fileListToBase64(event.target.files);

            // // Convert Base64 to File
           
            // console.log(imageCropped);

            // // Convert Base64 to File
            // const compressedFiles = await  Promise.all(
            //   imageCropped.map(async (dataUrl: string) => await imageCompression.getFilefromDataUrl(dataUrl, 'test'))
            // )


            // // Compress File
            // const compressedFiles2 = await  Promise.all(
            //   await compressedFiles.map(async (imageFile: File) => await imageCompression(imageFile, options))
            // )
            
            // console.log(compressedFiles2);

            // this.imageSize[index] = compressedFiles2[0].size;

            // let reader = new FileReader();

            // reader.readAsDataURL(compressedFiles2[0]);

            // reader.onload = () => {

            //     myForm.patchValue({
            //       imageFile: reader.result
            //     });
                
            //     this.imageURL[index] = reader.result;

            // }

            const imageFiles = Array.from(event.target.files);

                  try {
                  const compressedFiles = await Promise.all(
                    await imageFiles.map(async (imageFile: File) => await imageCompression(imageFile, options))
                  )

                    this.imageSize[index] = compressedFiles[0].size;
        
                    let reader = new FileReader();
        
                    reader.readAsDataURL(compressedFiles[0]);
        
                    reader.onload = () => {
        
                        myForm.patchValue({
                          imageFile: reader.result
                        });
                        
                        this.imageURL[index] = reader.result;
        
                    }

                  } catch (error) {
                  console.log(error);
                  }

            this.editForm.controls.imageUpload.markAsDirty();

      }
    }

    async onSelectFile(event) {

      if(event.target.files){
        this.progressOverlay.show('Compressing Images','#0771DE','white','lightslategray',1);
        console.log(event);
      // this.myService.nextMessage("true");

      // this.spinnerService.show();
      
      // var options = {
      //   maxSizeMB: this.maxSizeMB,
      //   maxWidthOrHeight: 500,
      //   useWebWorker: this.currentWebWorker,
      //   maxIteration: 50,
      //   onProgress: (p) => {
      //     this.spinnerService.show();
      //     if(p == 100){
      //       setTimeout(() => {
      //         this.spinnerService.hide();
      //         this.myService.nextMessage("false");
      //       }, 3000);
      //     }
      //   }
      // }

      // // Crop Lnadscape images and convert to base64
      // const imageCropped = await this.fileListToBase64(event.target.files)

      // // Convert Base64 to File
      // const compressedFiles = await  Promise.all(
      //   imageCropped.map(async (dataUrl: string) => await imageCompression.getFilefromDataUrl(dataUrl, 'dcb-images'))
      // )

      // // Compress File
      // const compressedFiles2 = await  Promise.all(
      //   await compressedFiles.map(async (imageFile: File) => await imageCompression(imageFile, options))
      // )


      // console.log(imageCropped);
      // await console.log(compressedFiles);

      // await this.processImages(compressedFiles2);

      const imageFiles = Array.from(event.target.files);

      // try {
      //   const compressedFiles = await Promise.all(
      //       await imageFiles.map(async (imageFile: File) => await imageCompression(imageFile, options))
      //   )

      //   await this.processImages(compressedFiles);

      // } catch (error) {
      //   console.log(error);
      // }

      const compressedFiles = await this.allProgress(imageFiles,
        (p) => {
            console.log(`% Done = ${p.toFixed(2)}`);
            this.progressOverlay.setProgress(Math.ceil(p));
      });
      console.log(compressedFiles);
      this.processImages(compressedFiles);
      this.progressOverlay.hide();
      this.editForm.controls.imageUpload.markAsDirty();
    }
  }

  async allProgress(proms, progress_cb) {
      let d = 0;
      let compressedFiles = [];

      var options = {
        maxSizeMB: this.maxSizeMB,
        maxWidthOrHeight: this.maxWidthOrHeight,
        useWebWorker: this.currentWebWorker,
        maxIteration: 50,
        // onProgress: (p) => {
        //   console.log(p);
        //   this.progressOverlay.setProgress(p);
        //   if(p == 100){
        //     this.progressOverlay.hide();
        //   }
        // }
      }
      progress_cb(0);
      for (const p of proms) {
        await imageCompression(p, options).then((test)=> {  
          d ++;
          progress_cb( (d * 100) / proms.length );
          compressedFiles.push(test);
        });
      }
      return Promise.all(compressedFiles);
  }


  public processImages(imageFiles){

      let imagesLength = this.editForm.value.imageUpload.length;
    
      imageFiles.forEach(imageFile => {
      
          this.addImageUpload();

          this.imageSize.push(imageFile.size);

          let reader = new FileReader(); 
          const myForm =  (<FormArray>this.editForm.get("imageUpload")).at(imagesLength);

          myForm.patchValue({
            imageSize: imageFile.size
          });

          reader.readAsDataURL(imageFile);

          reader.onload = (event:any) => {
              myForm.patchValue({
                imageFile: event.target.result,
              });
              
              this.imageURL.push(event.target.result);
          } 
          imagesLength++   
      });

  }

  async fileListToBase64(fileList) {
    // create function which return resolved promise
    // with data:base64 string

    function crop(url, aspectRatio) {

      return new Promise(resolve => {
    
        // this image will hold our source image data
        const inputImage = new Image();
    
        // we want to wait for our image to load
        inputImage.onload = () => {
    
          // let's store the width and height of our image
          const inputWidth = inputImage.naturalWidth;
          const inputHeight = inputImage.naturalHeight;
    
          // get the aspect ratio of the input image
          const inputImageAspectRatio = inputWidth / inputHeight;
    
          // if it's bigger than our target aspect ratio
          let outputWidth = inputWidth;
          let outputHeight = inputHeight;
          if (inputImageAspectRatio > aspectRatio) {
            outputWidth = inputHeight * aspectRatio;
          } else if (inputImageAspectRatio < aspectRatio) {
            outputHeight = inputWidth / aspectRatio;
          }
    
          // calculate the position to draw the image at
          const outputX = (outputWidth - inputWidth) * .5;
          const outputY = (outputHeight - inputHeight) * .5;
    
          // create a canvas that will present the output image
          const outputImage = document.createElement('canvas');
    
          // set it to the same size as the image
          outputImage.width = outputWidth;
          outputImage.height = outputHeight;
    
          // draw our image at position 0, 0 on the canvas
          const ctx = outputImage.getContext('2d');
          ctx.drawImage(inputImage, outputX, outputY);
          resolve(outputImage.toDataURL());
        };
    
        // start loading our image
        inputImage.src = url;
      });
      
    };

    function getBase64(file) {
        const reader = new FileReader()
        return new Promise(resolve => {

          reader.onload = (event:any) => {

              var image = new Image();
              let self = this;
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');

              image.src = event.target.result;

              image.onload = () => {
                                                                                                                  
                        // if(image.height > image.width){
                        //   //this.imageURL.push(event.target.result);
                        //   resolve(event.target.result)

                        // }else{

                          crop(event.target.result, 5/6).then(canvas => {
                            //this.imageURL.push(canvas);
                            resolve(canvas)
                          });
                          
                        // }

                        //self.imageURL.push(event.target.result);     
              };

          
          }

          reader.readAsDataURL(file)
        })
      }
      // here will be array of promisified functions
      const promises = []
    
      // loop through fileList with for loop
      for (let i = 0; i < fileList.length; i++) {
        promises.push(getBase64(fileList[i]))
      }
    
      // array with base64 strings
      return await Promise.all(promises)
    }


    // public onSelectFile(event) {

    //   this.spinnerService.show();

    //   let imagesLength = this.editForm.value.imageUpload.length;

    //   console.log(event.target);

    //   const rawFiles: File[] = [].slice.call(event.target.files);
    //   rawFiles.forEach(async (file: File) => {

    //     this.addImageUpload();

    //     const config: CompressorConfig = { orientation: 1, ratio: 50, quality: 50, enableLogs: true };
    //     const compressedFile: File = await this.imageCompressor.compressFile(file, config);
    //     console.log(compressedFile);

    //     this.imageSize.push(compressedFile.size);

    //     let reader = new FileReader(); 

    //     const myForm =  (<FormArray>this.editForm.get("imageUpload")).at(imagesLength);

    //     myForm.patchValue({
    //       imageSize: compressedFile.size
    //     });

    //     reader.readAsDataURL(compressedFile);

    //     reader.onload = (event:any) => {
    //         console.log(event.target.result);
    //         // console.log(event.target.result);
    //         //  this.urls.push(event.target.result); 
    //         myForm.patchValue({
    //           imageFile: event.target.result,
    //         });
            
    //         this.imageURL.push(event.target.result);
    //     } 

    //     imagesLength++   

    //   });
      
    //   // this.calculateTotalSize();

    //   this.spinnerService.hide();

    //   // if (event.target.files && event.target.files[0]) {

    //   //     var filesAmount = event.target.files.length;

    //   //     for (let i = 0; i < filesAmount; i++) {
                  
    //   //             console.log(i);
    //   //             console.log(event.target.files);
              
    //   //             this.addImageUpload();

    //   //             this.imageSize.push(event.target.files[i].size);

    //   //             let reader = new FileReader();  

    //   //             const myForm =  (<FormArray>this.editForm.get("imageUpload")).at(imagesLength);

    //   //             console.log(event.target.files[i]);
    //   //             console.log(event.target.files[0]);

    //   //             myForm.patchValue({
    //   //               imageSize: event.target.files[i].size
    //   //             });

    //   //             reader.onload = (event:any) => {
    //   //                 console.log(event.target.result);
    //   //                 // console.log(event.target.result);
    //   //                 //  this.urls.push(event.target.result); 
    //   //                 myForm.patchValue({
    //   //                   imageFile: event.target.result,
    //   //                 });
                      
    //   //                 this.imageURL.push(event.target.result);
    //   //             } 

    //   //             reader.readAsDataURL(event.target.files[i]);

    //   //            imagesLength++     
    //   //     }   
    //   // }

    //   // this.calculateTotalSize();
    // }

    public calculateTotalSize(){
        this.totalImageSize = 0;
        //let imagesLength = this.imageSize.length;
        console.log(this.imageSize);
        // console.log(imagesLength);
        // for (let i = 0; i < imagesLength; i++) {
        //   this.totalImageSize = this.totalImageSize + this.imageSize[i];
        // }
        
        this.imageSize.forEach(value => {
          this.totalImageSize = this.totalImageSize + value;
          console.log(value);
        });

        console.log(this.totalImageSize);
        console.log( this.formatBytes(this.totalImageSize) );
        
        this.editForm.patchValue({
          totalFileSize: this.totalImageSize
        });
    }

    public formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
    
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
        const i = Math.floor(Math.log(bytes) / Math.log(k));
    
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }


    trackFn(index) {
      return index;
    }

    addDcbAccThisWeek(event: MatChipInputEvent): void {
        let input = event.input;
        let value = event.value;

        // Add our dcbAccThisWeek
        if ((value || '').trim()) {
            const dcbAccThisWeek = this.editForm.get('dcbAccThisWeek') as FormArray;
            dcbAccThisWeek.push(this.formBuilder.control(value.trim()));
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }
    }

    removeDcbAccThisWeek(index: number): void {
        const dcbAccThisWeek = this.editForm.get('dcbAccThisWeek') as FormArray;

        if (index >= 0) {
          dcbAccThisWeek.removeAt(index);
        }
    }

    removeDcbAccNextWeek(index: number): void {
        const dcbAccNextWeek = this.editForm.get('dcbAccNextWeek') as FormArray;

        if (index >= 0) {
          dcbAccNextWeek.removeAt(index);
        }
    }

    addDcbAccNextWeek(event: MatChipInputEvent): void {
        let input = event.input;
        let value = event.value;

        // Add our dcbAccThisWeek
        if ((value || '').trim()) {
            const dcbAccNextWeek = this.editForm.get('dcbAccNextWeek') as FormArray;
            dcbAccNextWeek.push(this.formBuilder.control(value.trim()));
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }
    }

    addSubAccThisWeek(event: MatChipInputEvent): void {
        let input = event.input;
        let value = event.value;

        // Add our dcbAccThisWeek
        if ((value || '').trim()) {
            const subAccThisWeek = this.editForm.get('subAccThisWeek') as FormArray;
            subAccThisWeek.push(this.formBuilder.control(value.trim()));
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }
    }

    removeSubAccThisWeek(index: number): void {
        const subAccThisWeek = this.editForm.get('subAccThisWeek') as FormArray;

        if (index >= 0) {
          subAccThisWeek.removeAt(index);
        }
    }

    removeSubAccNextWeek(index: number): void {
        const dcbAccNextWeek = this.editForm.get('subAccNextWeek') as FormArray;

        if (index >= 0) {
          dcbAccNextWeek.removeAt(index);
        }
    }

    addSubAccNextWeek(event: MatChipInputEvent): void {
        let input = event.input;
        let value = event.value;

        // Add our dcbAccThisWeek
        if ((value || '').trim()) {
            const subAccNextWeek = this.editForm.get('subAccNextWeek') as FormArray;
            subAccNextWeek.push(this.formBuilder.control(value.trim()));
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }
    }


    removeconSiteThisWeek(index: number): void {
        const conSiteThisWeek = this.editForm.get('conSiteThisWeek') as FormArray;

        if (index >= 0) {
          conSiteThisWeek.removeAt(index);
        }
    }

    addconSiteThisWeek(event: MatChipInputEvent): void {
        let input = event.input;
        let value = event.value;

        // Add our dcbAccThisWeek
        if ((value || '').trim()) {
            const conSiteThisWeek = this.editForm.get('conSiteThisWeek') as FormArray;
            conSiteThisWeek.push(this.formBuilder.control(value.trim()));
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }
    }

    removeconSiteNeedWeek(index: number): void {
        const conSiteNeedWeek = this.editForm.get('conSiteNeedWeek') as FormArray;

        if (index >= 0) {
          conSiteNeedWeek.removeAt(index);
        }
    }

    addconSiteNeedWeek(event: MatChipInputEvent): void {
        let input = event.input;
        let value = event.value;

        // Add our dcbAccThisWeek
        if ((value || '').trim()) {
            const conSiteNeedWeek = this.editForm.get('conSiteNeedWeek') as FormArray;
            conSiteNeedWeek.push(this.formBuilder.control(value.trim()));
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }
    }

    removerequestedChanges(index: number): void {
        const requestedChanges = this.editForm.get('requestedChanges') as FormArray;

        if (index >= 0) {
          requestedChanges.removeAt(index);
        }
    }

    addrequestedChanges(event: MatChipInputEvent): void {
        let input = event.input;
        let value = event.value;

        // Add our dcbAccThisWeek
        if ((value || '').trim()) {
            const requestedChanges = this.editForm.get('requestedChanges') as FormArray;
            requestedChanges.push(this.formBuilder.control(value.trim()));
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }
    }

    removeclarificationArchEng(index: number): void {
        const clarificationArchEng = this.editForm.get('clarificationArchEng') as FormArray;

        if (index >= 0) {
          clarificationArchEng.removeAt(index);
        }
    }

    addclarificationArchEng(event: MatChipInputEvent): void {
        let input = event.input;
        let value = event.value;

        // Add our dcbAccThisWeek
        if ((value || '').trim()) {
            const clarificationArchEng = this.editForm.get('clarificationArchEng') as FormArray;
            clarificationArchEng.push(this.formBuilder.control(value.trim()));
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }
    }

    removeinformationNeeded(index: number): void {
        const informationNeeded = this.editForm.get('informationNeeded') as FormArray;

        if (index >= 0) {
          informationNeeded.removeAt(index);
        }
    }

    addinformationNeeded(event: MatChipInputEvent): void {
        let input = event.input;
        let value = event.value;

        // Add our dcbAccThisWeek
        if ((value || '').trim()) {
            const informationNeeded = this.editForm.get('informationNeeded') as FormArray;
            informationNeeded.push(this.formBuilder.control(value.trim()));
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }
    }

    createImageUpload(): FormGroup {
      return this.formBuilder.group({
        imageCaption: '',
        imageSize: '',
        imageFile: '',
        imageStamp: ''
      });
    }

    addImageUpload(): void {
      this.imageUpload = this.editForm.get('imageUpload') as FormArray;
      this.imageUpload.push(this.createImageUpload());
    }

    removeImageUpload(index) {
      this.imageUpload = this.editForm.get('imageUpload') as FormArray;
      this.imageURL.splice(index,1);
      this.imageSize.splice(index,1);
      this.imageUpload.removeAt(index);

      this.editForm.controls.imageUpload.markAsDirty();
    }

    removeLastImageUpload(): void {
      this.imageUpload = this.editForm.get('imageUpload') as FormArray;
      this.imageUpload.removeAt(this.imageUpload.length - 1)
    }

    createCustomQuestion(): FormGroup {
      return this.formBuilder.group({
        custQuestion: '',
        custAnswer: '',
      });
    }

    addCustomQuestion(): void {
      this.customQuestion = this.editForm.get('customQuestion') as FormArray;
      this.customQuestion.push(this.createCustomQuestion());
    }

    removeCustomQuestion(i): void {
      this.customQuestion = this.editForm.get('customQuestion') as FormArray;
      this.customQuestion.removeAt(i)
    }

    removeLastCustomQuestion(): void {
      this.customQuestion = this.editForm.get('customQuestion') as FormArray;
      this.customQuestion.removeAt(this.customQuestion.length - 1)
    }

    public modalSubmitForApproval(){
      this.modalAnswer = 'submitAdminYes';
      this.saveStep2();
        // swal.fire({
        //     // title: 'Are you sure?',
        //     text: "Would you like SAVE the report before submitting to the Admin",
        //     icon: 'warning',
        //     showDenyButton: true,
        //     showCancelButton: true,
        //     confirmButtonText: 'Save',
        //     denyButtonText: `Don't save`,
        //     cancelButtonText: 'Cancel',
        //     customClass:{
        //       denyButton: 'btn dcb-btn',
        //       confirmButton: 'btn dcb-btn',
        //       cancelButton: 'btn dcb-btn',
        //     },
        //     buttonsStyling: false
        // }).then((result2) => {
        //   if(result2.isConfirmed){
        //       console.log('yes');
        //       this.modalAnswer = 'submitAdminYes';
        //       this.updateReport();
        //     } else if (result2.isDenied) {
        //       console.log('no');
        //       this.modalAnswer = 'submitAdminNo';
        //       this.submitForApproval();
        //   }
        // })

    }

    public submitForApproval(){

      this.spinnerService.show();

        //transform Friday Date
        this.friDateRaw = this.editForm.value.fridayDate;
        this.friDate = ('0' + (this.friDateRaw.getDate())).slice(-2) + '-' + ('0' + (this.friDateRaw.getMonth() + 1) ).slice( -2 ) + '-' + this.friDateRaw.getFullYear() ;
      
        //transform Aimed Completion Date 
        let convertedDateFormat = (this.editForm.getRawValue().aimedComDate).split("/").reverse().join("-");

        this.aimDateRaw = new Date(convertedDateFormat);
        this.aimDate = ('0' + (this.aimDateRaw.getDate())).slice(-2) + '-' + ('0' + (this.aimDateRaw.getMonth() + 1) ).slice( -2 ) + '-' + this.aimDateRaw.getFullYear() ;
        
        // const documentDefinition = { content: 'This is an sample PDF printed with pdfMake' };
        const documentDefinition = this.getDocumentDefinition2();

        const pdfDocGenerator = pdfMake.createPdf(documentDefinition);

        let pdfName = this.friDate+'-'+this.projJobNumber;

        pdfDocGenerator.getBase64((data) => {

              let submitEmailData = {
                "email": this.emailData,
                "pdf": data,
                "id": this.passID.id,
                "projectName": this.pdfProjectName,
                "pdfName":pdfName
              }

              console.log(submitEmailData);

              this.data_api.submitForApproval(submitEmailData).subscribe((result) => {
                
                console.log(result);

                if(result !== null){
      
                    swal.fire({
                        title: "Weekly Report Submitted for Approval",
                        // text: "You clicked the button!",
                        buttonsStyling: false,
                        customClass:{
                          confirmButton: 'btn dcb-btn',
                        },
                        icon: "success"
                    })
      
                  this.spinnerService.hide();
      
                }else{
      
                  swal.fire({
                      title: "Error in Submitting the Weekly Report",
                      // text: "You clicked the button!",
                      buttonsStyling: false,
                      customClass:{
                        confirmButton: 'btn dcb-btn',
                      },
                      icon: "error"
                  })
      
                  this.spinnerService.hide();
      
                }
      
              });

        });

    }

    public modalSubmitForClientApproval(){
      this.modalAnswer = 'submitClientYes';
      this.saveStep2();
        // swal.fire({
        //     // title: 'Are you sure?',
        //     text: "Would you like to SAVE the report before submitting to the Client",
        //     icon: 'warning',
        //     showDenyButton: true,
        //     showCancelButton: true,
        //     confirmButtonText: 'Save',
        //     denyButtonText: `Don't save`,
        //     cancelButtonText: 'Cancel',
        //     customClass:{
        //       denyButton: 'btn dcb-btn',
        //       confirmButton: 'btn dcb-btn',
        //       cancelButton: 'btn dcb-btn',
        //     },
        //     buttonsStyling: false
        // }).then((result2) => {
        //   if(result2.isConfirmed){
        //       console.log('yes');
        //       this.modalAnswer = 'submitClientYes';
        //       this.updateReport();
        //   } else if (result2.isDenied) {
        //       console.log('no');
        //       this.modalAnswer = 'submitClientNo';
        //       this.submitForClientApproval();
        //   }
        // })

    }

    public submitForClientApproval(){

      this.spinnerService.show();

        //transform Friday Date
        this.friDateRaw = this.editForm.value.fridayDate;
        this.friDate = ('0' + (this.friDateRaw.getDate())).slice(-2) + '-' + ('0' + (this.friDateRaw.getMonth() + 1) ).slice( -2 ) + '-' + this.friDateRaw.getFullYear() ;

        //transform Aimed Completion Date 
        let convertedDateFormat = (this.editForm.getRawValue().aimedComDate).split("/").reverse().join("-");

        this.aimDateRaw = new Date(convertedDateFormat);
        this.aimDate = ('0' + (this.aimDateRaw.getDate())).slice(-2) + '-' + ('0' + (this.aimDateRaw.getMonth() + 1) ).slice( -2 ) + '-' + this.aimDateRaw.getFullYear() ;

        // const documentDefinition = { content: 'This is an sample PDF printed with pdfMake' };
        const documentDefinition = this.getDocumentDefinition2();

        const pdfDocGenerator = pdfMake.createPdf(documentDefinition);

        let pdfName = this.friDate+'-'+this.projJobNumber;

        pdfDocGenerator.getBase64((data) => {

              let submitEmailData = {
                "email": this.clientEmailData,
                "emailCc": this.clientEmailCcData,
                "emailBcc": this.clientEmailBccData,
                "pdf": data,
                "id": this.passID.id,
                "projectName": this.pdfProjectName,
                "pdfName":pdfName
              }

              console.log(submitEmailData);
              
              this.data_api.submitForClientApproval(submitEmailData).subscribe((result) => {
                
                console.log(result);

                if(result){
      
                    swal.fire({
                        title: "Weekly Report Submitted to the Client",
                        // text: "You clicked the button!",
                        buttonsStyling: false,
                        customClass:{
                          confirmButton: 'btn dcb-btn',
                        },
                        icon: "success"
                    })
      
                  this.spinnerService.hide();
      
                }else{
      
                  swal.fire({
                      title: "Error in Submitting the Weekly Report",
                      // text: "You clicked the button!",
                      buttonsStyling: false,
                      customClass:{
                        confirmButton: 'btn dcb-btn',
                      },
                      icon: "error"
                  })
      
                  this.spinnerService.hide();
      
                }
      
              });

        });

    }

    public modalGeneratePdf(){

      // swal.fire({
      //   title: 'Are you sure?',
      //   text: "You won't be able to revert this!",
      //   icon: 'warning',
      //   showCancelButton: true,
      //   customClass:{
      //     confirmButton: 'btn btn-success',
      //     cancelButton: 'btn btn-danger',
      //   },
      //   confirmButtonText: 'Yes, delete it!',
      //    buttonsStyling: false
      // }).then((result) => {
      //   if (result.value) {
      //     swal.fire(
      //       {
      //         title: 'Deleted!',
      //         text: 'Your file has been deleted.',
      //         icon: 'success',
      //         customClass:{
      //           confirmButton: "btn btn-success",
      //         },
      //         buttonsStyling: false
      //       }
      //     )
      //   }
      // })
      this.modalAnswer = 'generateYes';
      this.saveStep2();
      
        // swal.fire({
        //     // title: 'Are you sure?',
        //     text: 'Would you like to SAVE the report before viewing the PDF',
        //     icon: 'warning',
        //     showCancelButton: true,
        //     confirmButtonText: 'Yes',
        //     cancelButtonText: 'No',
        //     customClass:{
        //       confirmButton: 'btn dcb-btn',
        //       cancelButton: 'btn dcb-btn',
        //     },
        //     buttonsStyling: false
        // }).then((result2) => {
        //   if(result2.value){
        //       console.log('yes');
        //       this.modalAnswer = 'generateYes';
        //       this.updateReport();
        //   }else{
        //       console.log('no');
        //       this.modalAnswer = 'generateNo';
        //       this.generatePdf();
        //   }
        // })

    }

    public generatePdf(){
        console.log(this.editForm.value.imageUpload);
        //transform Friday Date
        this.friDateRaw = this.editForm.value.fridayDate;
        this.friDate = ('0' + (this.friDateRaw.getDate())).slice(-2) + '-' + ('0' + (this.friDateRaw.getMonth() + 1) ).slice( -2 ) + '-' + this.friDateRaw.getFullYear() ;

        //transform Aimed Completion Date 
        let convertedDateFormat = (this.editForm.getRawValue().aimedComDate).split("/").reverse().join("-");

        this.aimDateRaw = new Date(convertedDateFormat);

        this.aimDate = ('0' + (this.aimDateRaw.getDate())).slice(-2) + '-' + ('0' + (this.aimDateRaw.getMonth() + 1) ).slice( -2 ) + '-' + this.aimDateRaw.getFullYear() ;
  
        // const documentDefinition = { content: 'This is an sample PDF printed with pdfMake' };
        const documentDefinition = this.getDocumentDefinition2();
        //pdfMake.createPdf(documentDefinition).download('test.pdf');

        if(this.download_mode == true){

              pdfMake.createPdf(documentDefinition).download(this.friDate+'-'+this.projJobNumber+'.pdf',
              function() { 
                // setTimeout(function(){ window.reload() }, 2000);
                setTimeout(() => {
                  window.parent.postMessage({"message":"done"}, '*');
                  window.location.href = '';
                }, 1000);
              }
              );

        }else{
          pdfMake.createPdf(documentDefinition).open();
        } 
        



     }

    public checkOthersValue(){

      if(this.editForm.value.weatherAllWeek == 'weatherOthers'){
        this.isOthersAllWeek = 'show';
    }else{
        this.isOthersAllWeek = 'hide';
    }

      if(this.editForm.value.weatherSaturday == 'weatherOthers'){
          this.isOthersSaturday = 'show';
      }else{
          this.isOthersSaturday = 'hide';
      }

      if(this.editForm.value.weatherSunday == 'weatherOthers'){
          this.isOthersSunday = 'show';
      }else{
          this.isOthersSunday = 'hide';
      }

      if(this.editForm.value.weatherMonday == 'weatherOthers'){
          this.isOthersMonday = 'show';
      }else{
          this.isOthersMonday = 'hide';
      }

      if(this.editForm.value.weatherTuesday == 'weatherOthers'){
          this.isOthersTuesday = 'show';
      }else{
          this.isOthersTuesday = 'hide';
      }

      if(this.editForm.value.weatherWednesday == 'weatherOthers'){
          this.isOthersWednesday = 'show';
      }else{
          this.isOthersWednesday = 'hide';
      }

      if(this.editForm.value.weatherThursday == 'weatherOthers'){
          this.isOthersThursday = 'show';
      }else{
          this.isOthersThursday = 'hide';
      }
      
      if(this.editForm.value.weatherFriday == 'weatherOthers'){
          this.isOthersFriday = 'show';
      }else{
          this.isOthersFriday = 'hide';
      }
    }

    public changeDayWeather(){
        this.editForm.controls['weatherAllWeek'].reset();

        if(this.editForm.value.weatherSaturday == 'weatherOthers'){
            this.isOthersSaturday = 'show';
        }else{
            this.isOthersSaturday = 'hide';
        }

        if(this.editForm.value.weatherSunday == 'weatherOthers'){
            this.isOthersSunday = 'show';
        }else{
            this.isOthersSunday = 'hide';
        }

        if(this.editForm.value.weatherMonday == 'weatherOthers'){
            this.isOthersMonday = 'show';
        }else{
            this.isOthersMonday = 'hide';
        }

        if(this.editForm.value.weatherTuesday == 'weatherOthers'){
            this.isOthersTuesday = 'show';
        }else{
            this.isOthersTuesday = 'hide';
        }

        if(this.editForm.value.weatherWednesday == 'weatherOthers'){
            this.isOthersWednesday = 'show';
        }else{
            this.isOthersWednesday = 'hide';
        }

        if(this.editForm.value.weatherThursday == 'weatherOthers'){
            this.isOthersThursday = 'show';
        }else{
            this.isOthersThursday = 'hide';
        }
        
        if(this.editForm.value.weatherFriday == 'weatherOthers'){
            this.isOthersFriday = 'show';
        }else{
            this.isOthersFriday = 'hide';
        }

        this.isOthersAllWeek = 'hide';
    }

    public changeAllWeekWeather(){
      console.log(this.editForm.value.weatherAllWeek);
        this.editForm.controls['weatherSaturday'].reset();
        this.editForm.controls['weatherSunday'].reset();
        this.editForm.controls['weatherMonday'].reset();
        this.editForm.controls['weatherTuesday'].reset();
        this.editForm.controls['weatherWednesday'].reset();
        this.editForm.controls['weatherThursday'].reset();
        this.editForm.controls['weatherFriday'].reset();

        if(this.editForm.value.weatherAllWeek == 'weatherOthers'){
            this.isOthersAllWeek = 'show';
        }else{
            this.isOthersAllWeek = 'hide';
        }

        this.isOthersSaturday = 'hide';
        this.isOthersSunday = 'hide';
        this.isOthersMonday = 'hide';
        this.isOthersTuesday = 'hide';
        this.isOthersWednesday = 'hide';
        this.isOthersThursday = 'hide';
        this.isOthersFriday = 'hide';

    }

    public getWeatherImage(day){
        // if(this.editForm.value.weatherAllWeek){
        //     return this.editForm.value.weatherAllWeek
        // }else{
           return this.editForm.value[day];
        // }
    }
 
    public getWeatherOthers(day){
        // if(this.editForm.value.weatherAllWeek){
        //     return this.editForm.value.weatherOthersAllWeek
        // }else{
          return this.editForm.value[day];
        // }
    }

    getAccThisWeekList() {
      let accsList = this.editForm.value.dcbAccThisWeek

      if(accsList){
          return {
              ul: [
                    ...accsList.map(info => {
                      console.log(info);
                      return [ 
                        {
                          text: info,
                          style: 'test',
                        }
                      ]
                    })
              ],
              margin: [ 0, 10, 0, 0 ],
            };
      }else{
        return;
      }
    }

    getAccThisWeekList2() {
      let accsList = this.editForm.value.dcbAccThisWeek

      if(accsList){

            if(accsList.length > 0){
              let bulletList = [];
              let content = [];

              for (let i = 1; i <= accsList.length; i += 2) {

                if(accsList[i]){
                  bulletList.push([
      
                              {
                                  text: '• '+accsList[i-1], 
                                  style: 'fieldData',
                              },
                              {
                                  text: '• '+accsList[i],
                                  style: 'fieldData',  
                              }
                          
                          
                  ])
                }else{
                  bulletList.push([
                          
                              {
                                  text: '• '+accsList[i-1], 
                                  style: 'fieldData',
                              },
                              {
                                text: '', 
                                style: 'fieldData',
                              }
                         
    
                  ])
                }
              }

              content.push(
                {
                  stack: [
                      {
                        stack: [
                          {
                          text: (this.pdfCompanyName ? this.pdfCompanyName +' ': '') + 'Tasks This Week:',
                          style: 'fieldHeader',
                          margin: [ 5, 10, 0, 0 ],
                          },
                          {canvas: [{ type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 0.1,lineColor: '#A9A9A9' }],margin: [ 0, 2, 0, 2 ],},
                          {
                            table: {
                              widths: [ '50%','50%'],
                              body: bulletList                     
                            },
                            layout: {
                              defaultBorder:false,
                              fillColor: function (i, node) {
                                return (i % 2 === 0) ?  null : '#F1F1F1';
                              },
                              paddingTop: function(i, node) { return 0; }, 
                              paddingBottom: function(i, node) { return 0;},
                            }
                          },
                        ],
                        unbreakable: true,
                      },
                  ],
                },
                
              )

              return content;

            }else{
              return;
            }

        }else{
          return;
        }

    }

    getAccNextWeekList() {
      let accsList = this.editForm.value.dcbAccNextWeek

      if(accsList){
          return {
              ul: [
                    ...accsList.map(info => {
                      console.log(info);
                      return [ 
                        {
                          text: info,
                          style: 'test',
                        }
                      ]
                    })
              ],
              margin: [ 0, 10, 0, 0 ],
            };
      }else{
        return;
      }

    }

    getAccNextWeekList2() {
      let accsList = this.editForm.value.dcbAccNextWeek

      if(accsList){

            if(accsList.length > 0){
              let bulletList = [];
              let content = [];

              for (let i = 1; i <= accsList.length; i += 2) {

                if(accsList[i]){
                  bulletList.push([
      
                              {
                                  text: '• '+accsList[i-1], 
                                  style: 'fieldData',
                              },
                              {
                                  text: '• '+accsList[i],
                                  style: 'fieldData',  
                              }
                          
                          
                  ])
                }else{
                  bulletList.push([
                          
                              {
                                  text: '• '+accsList[i-1], 
                                  style: 'fieldData',
                              },
                              {
                                text: '', 
                                style: 'fieldData',
                              }
                         
    
                  ])
                }
              }

              content.push(
                {
                  stack: [
                      {
                        stack: [
                          {
                          text: (this.pdfCompanyName ? this.pdfCompanyName +' ': '') + 'Tasks Next Week:',
                          style: 'fieldHeader',
                          margin: [ 5, 10, 0, 0 ],
                          },
                          {canvas: [{ type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 0.1,lineColor: '#A9A9A9' }],margin: [ 0, 2, 0, 2 ],},
                          {
                            table: {
                              widths: [ '50%','50%'],
                              body: bulletList                     
                            },
                            layout: {
                              defaultBorder:false,
                              fillColor: function (i, node) {
                                return (i % 2 === 0) ?  null : '#F1F1F1';
                              },
                              paddingTop: function(i, node) { return 0; }, 
                              paddingBottom: function(i, node) { return 0;},
                            }
                          },
                        ],
                        unbreakable: true,
                      },
                  ],
                },
                
              )

              return content;

            }else{
              return;
            }

        }else{
          return;
        }

    }

    getSubThisWeekList() {
      let accsList = this.editForm.value.subAccThisWeek
      
      if(accsList){
          return {
              ul: [
                    ...accsList.map(info => {
                      console.log(info);
                      return [ 
                        {
                          text: info,
                          style: 'test',
                        }
                      ]
                    })
              ],
              margin: [ 0, 10, 0, 0 ],
            };
      }else{
        return;
      }
    }

    getSubThisWeekList2() {
      let accsList = this.editForm.value.subAccThisWeek

      if(accsList){

            if(accsList.length > 0){
              let bulletList = [];
              let content = [];

              for (let i = 1; i <= accsList.length; i += 2) {

                if(accsList[i]){
                  bulletList.push([
      
                              {
                                  text: '• '+accsList[i-1], 
                                  style: 'fieldData',
                              },
                              {
                                  text: '• '+accsList[i],
                                  style: 'fieldData',  
                              }
                          
                          
                  ])
                }else{
                  bulletList.push([
                          
                              {
                                  text: '• '+accsList[i-1], 
                                  style: 'fieldData',
                              },
                              {
                                text: '', 
                                style: 'fieldData',
                              }
                         
    
                  ])
                }
              }

              content.push(
                {
                  stack: [
                      {
                        stack: [
                          {
                          text: 'Trades Tasks This Week:',
                          style: 'fieldHeader',
                          margin: [ 5, 10, 0, 0 ],
                          },
                          {canvas: [{ type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 0.1,lineColor: '#A9A9A9' }],margin: [ 0, 2, 0, 2 ],},
                          {
                            table: {
                              widths: [ '50%','50%'],
                              body: bulletList 
                            },
                            layout: {
                              defaultBorder:false,
                              fillColor: function (i, node) {
                                return (i % 2 === 0) ?  null : '#F1F1F1';
                              },
                              paddingTop: function(i, node) { return 0; }, 
                              paddingBottom: function(i, node) { return 0;},
                            }
                          },
                        ],
                        unbreakable: true,
                      },
                  ],
                },
                
              )

              return content;

            }else{
              return;
            }

        }else{
          return;
        }

    }

    getSubNextWeekList() {
      let accsList = this.editForm.value.subAccNextWeek

      if(accsList){
          return {
              ul: [
                    ...accsList.map(info => {
                      console.log(info);
                      return [ 
                        {
                          text: info,
                          style: 'test',
                        }
                      ]
                    })
              ],
              margin: [ 0, 10, 0, 0 ],
            };
      }else{
        return;
      }

    }

    getSubNextWeekList2() {
      let accsList = this.editForm.value.subAccNextWeek

      if(accsList){

            if(accsList.length > 0){
              let bulletList = [];
              let content = [];

              for (let i = 1; i <= accsList.length; i += 2) {

                if(accsList[i]){
                  bulletList.push([
      
                              {
                                  text: '• '+accsList[i-1], 
                                  style: 'fieldData',
                              },
                              {
                                  text: '• '+accsList[i],
                                  style: 'fieldData',  
                              }
                          
                          
                  ])
                }else{
                  bulletList.push([
                          
                              {
                                  text: '• '+accsList[i-1], 
                                  style: 'fieldData',
                              },
                              {
                                text: '', 
                                style: 'fieldData',
                              }
                         
    
                  ])
                }
              }

              content.push(
                {
                  stack: [
                      {
                        stack: [
                          {
                          text: 'Trades Tasks Next Week:',
                          style: 'fieldHeader',
                          margin: [ 5, 10, 0, 0 ],
                          },
                          {canvas: [{ type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 0.1,lineColor: '#A9A9A9' }],margin: [ 0, 2, 0, 2 ],},
                          {
                            table: {
                              widths: [ '50%','50%'],
                              body: bulletList 
                            },
                            layout: {
                              defaultBorder:false,
                              fillColor: function (i, node) {
                                return (i % 2 === 0) ?  null : '#F1F1F1';
                              },
                              paddingTop: function(i, node) { return 0; }, 
                              paddingBottom: function(i, node) { return 0;},
                            }
                          },
                        ],
                        unbreakable: true,
                      },
                  ],
                },
                
              )

              return content;

            }else{
              return;
            }

        }else{
          return;
        }

    }

    getConSiteThisWeekList() {
      let accsList = this.editForm.value.conSiteThisWeek
      console.log(accsList);
      if(accsList){
          return {
              ul: [
                    ...accsList.map(info => {
                      console.log(info);
                      return [ 
                        {
                          text: info,
                          style: 'test',
                        }
                      ]
                    })
              ],
              margin: [ 0, 10, 0, 0 ],
            };
      }else{
        return;
      }

    }

    getConSiteThisWeekList2() {
      let accsList = this.editForm.value.conSiteThisWeek

      if(accsList){

            if(accsList.length > 0){
              let bulletList = [];
              let content = [];

              for (let i = 1; i <= accsList.length; i += 2) {

                if(accsList[i]){
                  bulletList.push([
      
                              {
                                  text: '• '+accsList[i-1], 
                                  style: 'fieldData',
                              },
                              {
                                  text: '• '+accsList[i],
                                  style: 'fieldData',  
                              }
                          
                          
                  ])
                }else{
                  bulletList.push([
                          
                              {
                                  text: '• '+accsList[i-1], 
                                  style: 'fieldData',
                              },
                              {
                                text: '', 
                                style: 'fieldData',
                              }
                         
    
                  ])
                }
              }

              content.push(
                {
                  stack: [
                      {
                        stack: [
                          {
                          text: 'Consultants On Site This Week:',
                          style: 'fieldHeader',
                          margin: [ 5, 10, 0, 0 ],
                          },
                          {canvas: [{ type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 0.1,lineColor: '#A9A9A9' }],margin: [ 0, 2, 0, 2 ],},
                          {
                            table: {
                              widths: [ '50%','50%'],
                              body: bulletList 
                            },
                            layout: {
                              defaultBorder:false,
                              fillColor: function (i, node) {
                                return (i % 2 === 0) ?  null : '#F1F1F1';
                              },
                              paddingTop: function(i, node) { return 0; }, 
                              paddingBottom: function(i, node) { return 0;},
                            }
                          },
                        ],
                        unbreakable: true,
                      },
                  ],
                },
                
              )

              return content;

            }else{
              return;
            }

        }else{
          return;
        }

    }

    getConSiteNeedWeekList() {
      let accsList = this.editForm.value.conSiteNeedWeek
      
      if(accsList){
          return {
              ul: [
                    ...accsList.map(info => {
                      console.log(info);
                      return [ 
                        {
                          text: info,
                          style: 'test',
                        }
                      ]
                    })
              ],
              margin: [ 0, 10, 0, 0 ],
            };
      }else{
        return;
      }

    }

    getConSiteNeedWeekList2() {
      let accsList = this.editForm.value.conSiteNeedWeek

      if(accsList){

            if(accsList.length > 0){
              let bulletList = [];
              let content = [];

              for (let i = 1; i <= accsList.length; i += 2) {

                if(accsList[i]){
                  bulletList.push([
      
                              {
                                  text: '• '+accsList[i-1], 
                                  style: 'fieldData',
                              },
                              {
                                  text: '• '+accsList[i],
                                  style: 'fieldData',  
                              }
                          
                          
                  ])
                }else{
                  bulletList.push([
                          
                              {
                                  text: '• '+accsList[i-1], 
                                  style: 'fieldData',
                              },
                              {
                                text: '', 
                                style: 'fieldData',
                              }
                         
    
                  ])
                }
              }

              content.push(
                {
                  stack: [
                      {
                        stack: [
                          {
                          text: 'Consultants Needed This Week:',
                          style: 'fieldHeader',
                          margin: [ 5, 10, 0, 0 ],
                          },
                          {canvas: [{ type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 0.1,lineColor: '#A9A9A9' }],margin: [ 0, 2, 0, 2 ],},
                          {
                            table: {
                              widths: [ '50%','50%'],
                              body: bulletList 
                            },
                            layout: {
                              defaultBorder:false,
                              fillColor: function (i, node) {
                                return (i % 2 === 0) ?  null : '#F1F1F1';
                              },
                              paddingTop: function(i, node) { return 0; }, 
                              paddingBottom: function(i, node) { return 0;},
                            }
                          },
                        ],
                        unbreakable: true,
                      },
                  ],
                },
                
              )

              return content;

            }else{
              return;
            }

        }else{
          return;
        }

    }

    getRequestedChangesList() {
      let accsList = this.editForm.value.requestedChanges

      if(accsList){
          return {
              ul: [
                    ...accsList.map(info => {
                      console.log(info);
                      return [ 
                        {
                          text: info,
                          style: 'test',
                        }
                      ]
                    })
              ],
              margin: [ 0, 10, 0, 0 ],
            };
      }else{
        return;
      }

    }   

    getRequestedChangesList2() {
      let accsList = this.editForm.value.requestedChanges

      if(accsList){

            if(accsList.length > 0){
              let bulletList = [];
              let content = [];

              for (let i = 1; i <= accsList.length; i += 2) {

                if(accsList[i]){
                  bulletList.push([
      
                              {
                                  text: '• '+accsList[i-1], 
                                  style: 'fieldData',
                              },
                              {
                                  text: '• '+accsList[i],
                                  style: 'fieldData',  
                              }
                          
                          
                  ])
                }else{
                  bulletList.push([
                          
                              {
                                  text: '• '+accsList[i-1], 
                                  style: 'fieldData',
                              },
                              {
                                text: '', 
                                style: 'fieldData',
                              }
                         
    
                  ])
                }
              }

              content.push(
                {
                  stack: [
                      {
                        stack: [
                          {
                          text: 'Requested Changes to the Project?',
                          style: 'fieldHeader',
                          margin: [ 5, 10, 0, 0 ],
                          },
                          {canvas: [{ type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 0.1,lineColor: '#A9A9A9' }],margin: [ 0, 2, 0, 2 ],},
                          {
                            table: {
                              widths: [ '50%','50%'],
                              body: bulletList 
                            },
                            layout: {
                              defaultBorder:false,
                              fillColor: function (i, node) {
                                return (i % 2 === 0) ?  null : '#F1F1F1';
                              },
                              paddingTop: function(i, node) { return 0; }, 
                              paddingBottom: function(i, node) { return 0;},
                            }
                          },
                        ],
                        unbreakable: true,
                      },
                  ],
                },
                
              )

              return content;

            }else{
              return;
            }

        }else{
          return;
        }

    }
    
    getClarificationArchEngList() {
      let accsList = this.editForm.value.clarificationArchEng

      if(accsList){
          return {
              ul: [
                    ...accsList.map(info => {
                      console.log(info);
                      return [ 
                        {
                          text: info,
                          style: 'test',
                        }
                      ]
                    })
              ],
              margin: [ 0, 10, 0, 0 ],
            };
      }else{
        return;
      }

    }
    
    getClarificationArchEngList2() {
      let accsList = this.editForm.value.clarificationArchEng

      if(accsList){

            if(accsList.length > 0){
              let bulletList = [];
              let content = [];

              for (let i = 1; i <= accsList.length; i += 2) {

                if(accsList[i]){
                  bulletList.push([
      
                              {
                                  text: '• '+accsList[i-1], 
                                  style: 'fieldData',
                              },
                              {
                                  text: '• '+accsList[i],
                                  style: 'fieldData',  
                              }
                          
                          
                  ])
                }else{
                  bulletList.push([
                          
                              {
                                  text: '• '+accsList[i-1], 
                                  style: 'fieldData',
                              },
                              {
                                text: '', 
                                style: 'fieldData',
                              }
                         
    
                  ])
                }
              }

              content.push(
                {
                  stack: [
                      {
                        stack: [
                          {
                          text: 'Clarification from Architect/Engineer/Interior Design:',
                          style: 'fieldHeader',
                          margin: [ 5, 10, 0, 0 ],
                          },
                          {canvas: [{ type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 0.1,lineColor: '#A9A9A9' }],margin: [ 0, 2, 0, 2 ],},
                          {
                            table: {
                              widths: [ '50%','50%'],
                              body: bulletList 
                            },
                            layout: {
                              defaultBorder:false,
                              fillColor: function (i, node) {
                                return (i % 2 === 0) ?  null : '#F1F1F1';
                              },
                              paddingTop: function(i, node) { return 0; }, 
                              paddingBottom: function(i, node) { return 0;},
                            }
                          },
                        ],
                        unbreakable: true,
                      },
                  ],
                },
                
              )

              return content;

            }else{
              return;
            }

        }else{
          return;
        }

    }

    getInformationNeededList() {
      let accsList = this.editForm.value.informationNeeded

      if(accsList){
          return {
              ul: [
                    ...accsList.map(info => {
                      console.log(info);
                      return [ 
                        {
                          text: info,
                          style: 'test',
                        }
                      ]
                    })
              ],
              margin: [ 0, 10, 0, 0 ],
            };
      }else{
        return;
      }
      
    } 

    getInformationNeededList2() {
      let accsList = this.editForm.value.informationNeeded

      if(accsList){

            if(accsList.length > 0){
              let bulletList = [];
              let content = [];

              for (let i = 1; i <= accsList.length; i += 2) {

                if(accsList[i]){
                  bulletList.push([
      
                              {
                                  text: '• '+accsList[i-1], 
                                  style: 'fieldData',
                              },
                              {
                                  text: '• '+accsList[i],
                                  style: 'fieldData',  
                              }
                          
                          
                  ])
                }else{
                  bulletList.push([
                          
                              {
                                  text: '• '+accsList[i-1], 
                                  style: 'fieldData',
                              },
                              {
                                text: '', 
                                style: 'fieldData',
                              }
                         
    
                  ])
                }
              }

              content.push(
                {
                  stack: [
                      {
                        stack: [
                          {
                          text: 'Information Needed to Keep Things Moving Along:',
                          style: 'fieldHeader',
                          margin: [ 5, 10, 0, 0 ],
                          },
                          {canvas: [{ type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 0.1,lineColor: '#A9A9A9' }],margin: [ 0, 2, 0, 2 ],},
                          {
                            table: {
                              widths: [ '50%','50%'],
                              body: bulletList 
                            },
                            layout: {
                              defaultBorder:false,
                              fillColor: function (i, node) {
                                return (i % 2 === 0) ?  null : '#F1F1F1';
                              },
                              paddingTop: function(i, node) { return 0; }, 
                              paddingBottom: function(i, node) { return 0;},
                            },
                            unbreakable: true,
                          },
                        ],
                        unbreakable: true,
                      },
                  ],
                },
                
              )

              return content;

            }else{
              return;
            }

        }else{
          return;
        }

    }

    getUpcomingMeetings() {
      let accsList = this.editForm.value.upcomingMeetings

      if(accsList){
          return {
              ul: [
                    ...accsList.map(info => {
                      console.log(info);
                      return [ 
                        {
                          text: info,
                          style: 'test',
                        }
                      ]
                    })
              ],
              margin: [ 0, 10, 0, 0 ],
            };
      }else{
        return;
      }
      
    } 

    getUpcomingMeetings2() {
      let accsList = this.editForm.value.upcomingMeetings

      if(accsList){

            if(accsList.length > 0){
              let bulletList = [];
              let content = [];

              for (let i = 1; i <= accsList.length; i += 2) {

                if(accsList[i]){
                  bulletList.push([
      
                              {
                                  text: '• '+accsList[i-1], 
                                  style: 'fieldData',
                              },
                              {
                                  text: '• '+accsList[i],
                                  style: 'fieldData',  
                              }
                          
                          
                  ])
                }else{
                  bulletList.push([
                          
                              {
                                  text: '• '+accsList[i-1], 
                                  style: 'fieldData',
                              },
                              {
                                text: '', 
                                style: 'fieldData',
                              }
                         
    
                  ])
                }
              }

              content.push(
                {
                  stack: [
                      {
                        stack: [
                          {
                          text: 'Upcoming Meetings:',
                          style: 'fieldHeader',
                          margin: [ 5, 10, 0, 0 ],
                          },
                          {canvas: [{ type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 0.1,lineColor: '#A9A9A9' }],margin: [ 0, 2, 0, 2 ],},
                          {
                            table: {
                              widths: [ '50%','50%'],
                              body: bulletList 
                            },
                            layout: {
                              defaultBorder:false,
                              fillColor: function (i, node) {
                                return (i % 2 === 0) ?  null : '#F1F1F1';
                              },
                              paddingTop: function(i, node) { return 0; }, 
                              paddingBottom: function(i, node) { return 0;},
                            }
                          },
                        ],
                        unbreakable: true,
                      },
                  ],
                },
                
              )

              return content;

            }else{
              return;
            }

        }else{
          return;
        }

    }

    getCustomQA() {
      let accsList = this.editForm.value.customQuestion
      return [
  
                ...accsList.map(info => {
                  return [ 
                        {
                          stack: [
                              {
                                image: this.pdfImage.bgInformation,
                                width: '535',
                                // margin: [ 0, 20, 0, 0 ]
                              },
                              {
                                text: info.custQuestion,
                                style: 'testHeader',
                                margin: [ 5, -15, 0, 0 ]
                              },
                              {
                                text: info.custAnswer,
                                style: 'test',
                                margin: [ 0, 10, 0, 0 ],
                              }
                          ],
                          unbreakable: true,
                          margin: [ 0, 20, 0, 0 ],
                        },
                        
                  ]
                })
  
        ]
    }

    getCustomQA2() {
      let accsList = this.editForm.value.customQuestion
      return [
  
                ...accsList.map(info => {
                  return [ 
                        {
                          stack: [
                              {
                                text: info.custQuestion,
                                style: 'fieldHeader',
                                margin: [ 5, 10, 0, 0 ],
                              },
                              {canvas: [{ type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 0.1,lineColor: '#A9A9A9' }],margin: [ 0, 2, 0, 2 ],},
                              {
                                text: info.custAnswer,
                                style: 'fieldData',
                                margin: [ 5, 0, 0, 0 ],
                              }
                          ],
                          unbreakable: true,
                        },
                        
                  ]
                })
  
        ]
    }

    getFridayWeather(){
      let content = [];
      console.log(this.fridayData);

      if(this.editForm.value.weatherFriday){
          content.push({text: 'FRIDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });

          if(this.editForm.value.weatherFriday =='weatherOthers'){
            content.push({text: 'All Day - '+this.getWeatherName(this.editForm.value.weatherOthersFriday), style: 'test3', margin: [ 0, 2, 0, 0 ] });
          }else{
            content.push({text: 'All Day - '+this.getWeatherName(this.editForm.value.weatherFriday), style: 'test3', margin: [ 0, 2, 0, 0 ] });
          }  

          if(this.fridayData){
            if(this.fridayData['weatherMaxTemp']){
                  content.push({text: 'Max Temp : '+this.fridayData['weatherMaxTemp'], style: 'test3', margin: [ 0, 2, 0, 0 ] }); 
            }
            if(this.fridayData['weatherMinTemp']){
                  content.push({text: 'Min Temp : '+this.fridayData['weatherMinTemp'], style: 'test3', margin: [ 0, 2, 0, 0 ] }); 
            }
          }

          return content
      }

      if(this.fridayData){

            content.push({text: 'FRIDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });

            if(this.fridayData['weatherPerfect']){
                  content.push({text: 'Perfect Weather', style: 'test3', margin: [ 0, 2, 0, 0 ] }); 
            }
            if(this.fridayData['weatherAllDay']){
                if(this.fridayData['weatherAllDay'] =='weatherOthers'){
                  content.push({text: 'All Day - '+this.getWeatherName(this.fridayData['weatherOthersAllDay']), style: 'test3', margin: [ 0, 2, 0, 0 ] });
                }else{
                  content.push({text: 'All Day - '+this.getWeatherName(this.fridayData['weatherAllDay']), style: 'test3', margin: [ 0, 2, 0, 0 ] });
                }   
            }
            if(this.fridayData['weatherMorning']){
                if(this.fridayData['weatherMorning'] =='weatherOthers'){
                    content.push({text: 'Morning - '+this.getWeatherName(this.fridayData['weatherOthersMorning']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }else{
                    content.push({text: 'Morning - '+this.getWeatherName(this.fridayData['weatherMorning']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }     
            }
            if(this.fridayData['weatherMidDay']){
                if(this.fridayData['weatherMidDay'] =='weatherOthers'){
                    content.push({text: 'Midday - '+this.getWeatherName(this.fridayData['weatherOthersMidDay']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }else{
                    content.push({text: 'Midday - '+this.getWeatherName(this.fridayData['weatherMidDay']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }
            }
            if(this.fridayData['weatherAfternoon']){
                if(this.fridayData['weatherAfternoon'] =='weatherOthers'){
                    content.push({text: 'Afternoon - '+this.getWeatherName(this.fridayData['weatherOthersAfternoon']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }else{
                    content.push({text: 'Afternoon - '+this.getWeatherName(this.fridayData['weatherAfternoon']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }
            }
            if(this.fridayData['weatherEvening']){
                if(this.fridayData['weatherEvening'] =='weatherOthers'){
                    content.push({text: 'Evening - '+this.getWeatherName(this.fridayData['weatherOthersEvening']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }else{
                  content.push({text: 'Evening - '+this.getWeatherName(this.fridayData['weatherEvening']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                } 
            }
            if(this.fridayData['weatherOnOff']){
                if(this.fridayData['weatherOnOff'] =='weatherOthers'){
                    content.push({text: 'On Off - '+this.getWeatherName(this.fridayData['weatherOthersOnOff']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }else{
                    content.push({text: 'On Off - '+this.getWeatherName(this.fridayData['weatherOnOff']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }  
            }
            if(this.fridayData['weatherRestOfDay']){
                if(this.fridayData['weatherRestOfDay'] =='weatherOthers'){
                    content.push({text: 'Rest of Day - '+this.getWeatherName(this.fridayData['weatherOthersRestOfDay']), style: 'test3', margin: [ 0, 2, 0, 0 ] });
                }else{
                  content.push({text: 'Rest of Day - '+this.getWeatherName(this.fridayData['weatherRestOfDay']), style: 'test3', margin: [ 0, 2, 0, 0 ] });
                }   
            }
            if(this.fridayData['weatherMaxTemp']){
                  content.push({text: 'Max Temp : '+this.fridayData['weatherMaxTemp'], style: 'test3', margin: [ 0, 2, 0, 0 ] }); 
            }
            if(this.fridayData['weatherMinTemp']){
                  content.push({text: 'Min Temp : '+this.fridayData['weatherMinTemp'], style: 'test3', margin: [ 0, 2, 0, 0 ] }); 
            }

      }else{
            content.push({text: 'FRIDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });
      }

      return content
    }

    getFridayWeather2(){
      let content = [];
      console.log(this.fridayData);

      if(this.editForm.value.weatherFriday){
          // content.push({text: 'FRIDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });

          if(this.editForm.value.weatherFriday =='weatherOthers'){
            content.push({text: 'All Day - '+this.getWeatherName(this.editForm.value.weatherOthersFriday), style: 'test3', margin: [ 5, 2, 0, 0 ] });
          }else{
            content.push({text: 'All Day - '+this.getWeatherName(this.editForm.value.weatherFriday), style: 'test3', margin: [ 5, 2, 0, 0 ] });
          }  

          if(this.fridayData){
            if(this.fridayData['weatherMaxTemp']){
                  content.push({text: 'Max Temp : '+this.fridayData['weatherMaxTemp'], style: 'test3', margin: [ 5, 2, 0, 0 ] }); 
            }
            if(this.fridayData['weatherMinTemp']){
                  content.push({text: 'Min Temp : '+this.fridayData['weatherMinTemp'], style: 'test3', margin: [ 5, 2, 0, 0 ] }); 
            }
          }

          return content
      }

      if(this.fridayData){

            // content.push({text: 'FRIDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });

            if(this.fridayData['weatherPerfect']){
                  content.push({text: 'Perfect Weather', style: 'test3', margin: [ 5, 2, 0, 0 ] }); 
            }
            if(this.fridayData['weatherAllDay']){
                if(this.fridayData['weatherAllDay'] =='weatherOthers'){
                  content.push({text: 'All Day - '+this.getWeatherName(this.fridayData['weatherOthersAllDay']), style: 'test3', margin: [ 5, 2, 0, 0 ] });
                }else{
                  content.push({text: 'All Day - '+this.getWeatherName(this.fridayData['weatherAllDay']), style: 'test3', margin: [ 5, 2, 0, 0 ] });
                }   
            }
            if(this.fridayData['weatherMorning']){
                if(this.fridayData['weatherMorning'] =='weatherOthers'){
                    content.push({text: 'Morning - '+this.getWeatherName(this.fridayData['weatherOthersMorning']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }else{
                    content.push({text: 'Morning - '+this.getWeatherName(this.fridayData['weatherMorning']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }     
            }
            if(this.fridayData['weatherMidDay']){
                if(this.fridayData['weatherMidDay'] =='weatherOthers'){
                    content.push({text: 'Midday - '+this.getWeatherName(this.fridayData['weatherOthersMidDay']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }else{
                    content.push({text: 'Midday - '+this.getWeatherName(this.fridayData['weatherMidDay']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }
            }
            if(this.fridayData['weatherAfternoon']){
                if(this.fridayData['weatherAfternoon'] =='weatherOthers'){
                    content.push({text: 'Afternoon - '+this.getWeatherName(this.fridayData['weatherOthersAfternoon']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }else{
                    content.push({text: 'Afternoon - '+this.getWeatherName(this.fridayData['weatherAfternoon']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }
            }
            if(this.fridayData['weatherEvening']){
                if(this.fridayData['weatherEvening'] =='weatherOthers'){
                    content.push({text: 'Evening - '+this.getWeatherName(this.fridayData['weatherOthersEvening']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }else{
                  content.push({text: 'Evening - '+this.getWeatherName(this.fridayData['weatherEvening']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                } 
            }
            if(this.fridayData['weatherOnOff']){
                if(this.fridayData['weatherOnOff'] =='weatherOthers'){
                    content.push({text: 'On Off - '+this.getWeatherName(this.fridayData['weatherOthersOnOff']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }else{
                    content.push({text: 'On Off - '+this.getWeatherName(this.fridayData['weatherOnOff']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }  
            }
            if(this.fridayData['weatherRestOfDay']){
                if(this.fridayData['weatherRestOfDay'] =='weatherOthers'){
                    content.push({text: 'Rest of Day - '+this.getWeatherName(this.fridayData['weatherOthersRestOfDay']), style: 'test3', margin: [ 5, 2, 0, 0 ] });
                }else{
                  content.push({text: 'Rest of Day - '+this.getWeatherName(this.fridayData['weatherRestOfDay']), style: 'test3', margin: [ 5, 2, 0, 0 ] });
                }   
            }
            if(this.fridayData['weatherMaxTemp']){
                  content.push({text: 'Max Temp : '+this.fridayData['weatherMaxTemp'], style: 'test3', margin: [ 5, 2, 0, 0 ] }); 
            }
            if(this.fridayData['weatherMinTemp']){
                  content.push({text: 'Min Temp : '+this.fridayData['weatherMinTemp'], style: 'test3', margin: [ 5, 2, 0, 0 ] }); 
            }

      }else{
            // content.push({text: 'FRIDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });
      }

      return content
    }

    getSaturdayWeather(){
      let content = [];
      console.log(this.saturdayData);

      if(this.editForm.value.weatherSaturday){
          content.push({text: 'SATURDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });

          if(this.editForm.value.weatherSaturday =='weatherOthers'){
            content.push({text: 'All Day - '+this.getWeatherName(this.editForm.value.weatherOthersSaturday), style: 'test3', margin: [ 0, 2, 0, 0 ] });
          }else{
            content.push({text: 'All Day - '+this.getWeatherName(this.editForm.value.weatherSaturday), style: 'test3', margin: [ 0, 2, 0, 0 ] });
          }  

          if(this.saturdayData){
            if(this.saturdayData['weatherMaxTemp']){
                  content.push({text: 'Max Temp : '+this.saturdayData['weatherMaxTemp'], style: 'test3', margin: [ 0, 2, 0, 0 ] }); 
            }
            if(this.saturdayData['weatherMinTemp']){
                  content.push({text: 'Min Temp : '+this.saturdayData['weatherMinTemp'], style: 'test3', margin: [ 0, 2, 0, 0 ] }); 
            }
          }

          return content
      }

      if(this.saturdayData){

            content.push({text: 'SATURDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });

            if(this.saturdayData['weatherPerfect']){
                  content.push({text: 'Perfect Weather', style: 'test3', margin: [ 0, 2, 0, 0 ] }); 
            }
            if(this.saturdayData['weatherAllDay']){
                if(this.saturdayData['weatherAllDay'] =='weatherOthers'){
                  content.push({text: 'All Day - '+this.getWeatherName(this.saturdayData['weatherOthersAllDay']), style: 'test3', margin: [ 0, 2, 0, 0 ] });
                }else{
                  content.push({text: 'All Day - '+this.getWeatherName(this.saturdayData['weatherAllDay']), style: 'test3', margin: [ 0, 2, 0, 0 ] });
                }   
            }
            if(this.saturdayData['weatherMorning']){
                if(this.saturdayData['weatherMorning'] =='weatherOthers'){
                    content.push({text: 'Morning - '+this.getWeatherName(this.saturdayData['weatherOthersMorning']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }else{
                    content.push({text: 'Morning - '+this.getWeatherName(this.saturdayData['weatherMorning']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }     
            }
            if(this.saturdayData['weatherMidDay']){
                if(this.saturdayData['weatherMidDay'] =='weatherOthers'){
                    content.push({text: 'Midday - '+this.getWeatherName(this.saturdayData['weatherOthersMidDay']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }else{
                    content.push({text: 'Midday - '+this.getWeatherName(this.saturdayData['weatherMidDay']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }
            }
            if(this.saturdayData['weatherAfternoon']){
                if(this.saturdayData['weatherAfternoon'] =='weatherOthers'){
                    content.push({text: 'Afternoon - '+this.getWeatherName(this.saturdayData['weatherOthersAfternoon']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }else{
                    content.push({text: 'Afternoon - '+this.getWeatherName(this.saturdayData['weatherAfternoon']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }
            }
            if(this.saturdayData['weatherEvening']){
                if(this.saturdayData['weatherEvening'] =='weatherOthers'){
                    content.push({text: 'Evening - '+this.getWeatherName(this.saturdayData['weatherOthersEvening']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }else{
                  content.push({text: 'Evening - '+this.getWeatherName(this.saturdayData['weatherEvening']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                } 
            }
            if(this.saturdayData['weatherOnOff']){
                if(this.saturdayData['weatherOnOff'] =='weatherOthers'){
                    content.push({text: 'On Off - '+this.getWeatherName(this.saturdayData['weatherOthersOnOff']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }else{
                    content.push({text: 'On Off - '+this.getWeatherName(this.saturdayData['weatherOnOff']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }  
            }
            if(this.saturdayData['weatherRestOfDay']){
                if(this.saturdayData['weatherRestOfDay'] =='weatherOthers'){
                    content.push({text: 'Rest of Day - '+this.getWeatherName(this.saturdayData['weatherOthersRestOfDay']), style: 'test3', margin: [ 0, 2, 0, 0 ] });
                }else{
                  content.push({text: 'Rest of Day - '+this.getWeatherName(this.saturdayData['weatherRestOfDay']), style: 'test3', margin: [ 0, 2, 0, 0 ] });
                }   
            }
            if(this.saturdayData['weatherMaxTemp']){
                  content.push({text: 'Max Temp : '+this.saturdayData['weatherMaxTemp'], style: 'test3', margin: [ 0, 2, 0, 0 ] }); 
            }
            if(this.saturdayData['weatherMinTemp']){
                  content.push({text: 'Min Temp : '+this.saturdayData['weatherMinTemp'], style: 'test3', margin: [ 0, 2, 0, 0 ] }); 
            }

      }else{
            content.push({text: 'SATURDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });
      }

      return content
    }

    getSaturdayWeather2(){
      let content = [];
      console.log(this.saturdayData);

      if(this.editForm.value.weatherSaturday){
          // content.push({text: 'SATURDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });

          if(this.editForm.value.weatherSaturday =='weatherOthers'){
            content.push({text: 'All Day - '+this.getWeatherName(this.editForm.value.weatherOthersSaturday), style: 'test3', margin: [ 5, 2, 0, 0 ] });
          }else{
            content.push({text: 'All Day - '+this.getWeatherName(this.editForm.value.weatherSaturday), style: 'test3', margin: [ 5, 2, 0, 0 ] });
          }  

          if(this.saturdayData){
            if(this.saturdayData['weatherMaxTemp']){
                  content.push({text: 'Max Temp : '+this.saturdayData['weatherMaxTemp'], style: 'test3', margin: [ 5, 2, 0, 0 ] }); 
            }
            if(this.saturdayData['weatherMinTemp']){
                  content.push({text: 'Min Temp : '+this.saturdayData['weatherMinTemp'], style: 'test3', margin: [ 5, 2, 0, 0 ] }); 
            }
          }

          return content
      }

      if(this.saturdayData){

            // content.push({text: 'SATURDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });

            if(this.saturdayData['weatherPerfect']){
                  // content.push({text: 'Perfect Weather', style: 'test3', margin: [ 0, 2, 0, 0 ] }); 
            }
            if(this.saturdayData['weatherAllDay']){
                if(this.saturdayData['weatherAllDay'] =='weatherOthers'){
                  content.push({text: 'All Day - '+this.getWeatherName(this.saturdayData['weatherOthersAllDay']), style: 'test3', margin: [ 5, 2, 0, 0 ] });
                }else{
                  content.push({text: 'All Day - '+this.getWeatherName(this.saturdayData['weatherAllDay']), style: 'test3', margin: [ 5, 2, 0, 0 ] });
                }   
            }
            if(this.saturdayData['weatherMorning']){
                if(this.saturdayData['weatherMorning'] =='weatherOthers'){
                    content.push({text: 'Morning - '+this.getWeatherName(this.saturdayData['weatherOthersMorning']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }else{
                    content.push({text: 'Morning - '+this.getWeatherName(this.saturdayData['weatherMorning']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }     
            }
            if(this.saturdayData['weatherMidDay']){
                if(this.saturdayData['weatherMidDay'] =='weatherOthers'){
                    content.push({text: 'Midday - '+this.getWeatherName(this.saturdayData['weatherOthersMidDay']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }else{
                    content.push({text: 'Midday - '+this.getWeatherName(this.saturdayData['weatherMidDay']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }
            }
            if(this.saturdayData['weatherAfternoon']){
                if(this.saturdayData['weatherAfternoon'] =='weatherOthers'){
                    content.push({text: 'Afternoon - '+this.getWeatherName(this.saturdayData['weatherOthersAfternoon']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }else{
                    content.push({text: 'Afternoon - '+this.getWeatherName(this.saturdayData['weatherAfternoon']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }
            }
            if(this.saturdayData['weatherEvening']){
                if(this.saturdayData['weatherEvening'] =='weatherOthers'){
                    content.push({text: 'Evening - '+this.getWeatherName(this.saturdayData['weatherOthersEvening']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }else{
                  content.push({text: 'Evening - '+this.getWeatherName(this.saturdayData['weatherEvening']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                } 
            }
            if(this.saturdayData['weatherOnOff']){
                if(this.saturdayData['weatherOnOff'] =='weatherOthers'){
                    content.push({text: 'On Off - '+this.getWeatherName(this.saturdayData['weatherOthersOnOff']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }else{
                    content.push({text: 'On Off - '+this.getWeatherName(this.saturdayData['weatherOnOff']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }  
            }
            if(this.saturdayData['weatherRestOfDay']){
                if(this.saturdayData['weatherRestOfDay'] =='weatherOthers'){
                    content.push({text: 'Rest of Day - '+this.getWeatherName(this.saturdayData['weatherOthersRestOfDay']), style: 'test3', margin: [ 5, 2, 0, 0 ] });
                }else{
                  content.push({text: 'Rest of Day - '+this.getWeatherName(this.saturdayData['weatherRestOfDay']), style: 'test3', margin: [ 5, 2, 0, 0 ] });
                }   
            }
            if(this.saturdayData['weatherMaxTemp']){
                  content.push({text: 'Max Temp : '+this.saturdayData['weatherMaxTemp'], style: 'test3', margin: [ 5, 2, 0, 0 ] }); 
            }
            if(this.saturdayData['weatherMinTemp']){
                  content.push({text: 'Min Temp : '+this.saturdayData['weatherMinTemp'], style: 'test3', margin: [ 5, 2, 0, 0 ] }); 
            }

      }else{
            // content.push({text: 'SATURDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });
      }

      return content
    }

    getSundayWeather(){
      let content = [];
      console.log(this.sundayData);

      if(this.editForm.value.weatherSunday){
          content.push({text: 'SUNDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });

          if(this.editForm.value.weatherSunday =='weatherOthers'){
            content.push({text: 'All Day - '+this.getWeatherName(this.editForm.value.weatherOthersSunday), style: 'test3', margin: [ 0, 2, 0, 0 ] });
          }else{
            content.push({text: 'All Day - '+this.getWeatherName(this.editForm.value.weatherSunday), style: 'test3', margin: [ 0, 2, 0, 0 ] });
          }  

          if(this.sundayData){
            if(this.sundayData['weatherMaxTemp']){
                  content.push({text: 'Max Temp : '+this.sundayData['weatherMaxTemp'], style: 'test3', margin: [ 0, 2, 0, 0 ] }); 
            }
            if(this.sundayData['weatherMinTemp']){
                  content.push({text: 'Min Temp : '+this.sundayData['weatherMinTemp'], style: 'test3', margin: [ 0, 2, 0, 0 ] }); 
            }
          }

          return content
      }

      if(this.sundayData){

            content.push({text: 'SUNDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });

            if(this.sundayData['weatherPerfect']){
                  content.push({text: 'Perfect Weather', style: 'test3', margin: [ 0, 2, 0, 0 ] }); 
            }
            if(this.sundayData['weatherAllDay']){
                if(this.sundayData['weatherAllDay'] =='weatherOthers'){
                  content.push({text: 'All Day - '+this.getWeatherName(this.sundayData['weatherOthersAllDay']), style: 'test3', margin: [ 0, 2, 0, 0 ] });
                }else{
                  content.push({text: 'All Day - '+this.getWeatherName(this.sundayData['weatherAllDay']), style: 'test3', margin: [ 0, 2, 0, 0 ] });
                }   
            }
            if(this.sundayData['weatherMorning']){
                if(this.sundayData['weatherMorning'] =='weatherOthers'){
                    content.push({text: 'Morning - '+this.getWeatherName(this.sundayData['weatherOthersMorning']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }else{
                    content.push({text: 'Morning - '+this.getWeatherName(this.sundayData['weatherMorning']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }     
            }
            if(this.sundayData['weatherMidDay']){
                if(this.sundayData['weatherMidDay'] =='weatherOthers'){
                    content.push({text: 'Midday - '+this.getWeatherName(this.sundayData['weatherOthersMidDay']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }else{
                    content.push({text: 'Midday - '+this.getWeatherName(this.sundayData['weatherMidDay']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }
            }
            if(this.sundayData['weatherAfternoon']){
                if(this.sundayData['weatherAfternoon'] =='weatherOthers'){
                    content.push({text: 'Afternoon - '+this.getWeatherName(this.sundayData['weatherOthersAfternoon']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }else{
                    content.push({text: 'Afternoon - '+this.getWeatherName(this.sundayData['weatherAfternoon']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }
            }
            if(this.sundayData['weatherEvening']){
                if(this.sundayData['weatherEvening'] =='weatherOthers'){
                    content.push({text: 'Evening - '+this.getWeatherName(this.sundayData['weatherOthersEvening']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }else{
                  content.push({text: 'Evening - '+this.getWeatherName(this.sundayData['weatherEvening']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                } 
            }
            if(this.sundayData['weatherOnOff']){
                if(this.sundayData['weatherOnOff'] =='weatherOthers'){
                    content.push({text: 'On Off - '+this.getWeatherName(this.sundayData['weatherOthersOnOff']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }else{
                    content.push({text: 'On Off - '+this.getWeatherName(this.sundayData['weatherOnOff']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }  
            }
            if(this.sundayData['weatherRestOfDay']){
                if(this.sundayData['weatherRestOfDay'] =='weatherOthers'){
                    content.push({text: 'Rest of Day - '+this.getWeatherName(this.sundayData['weatherOthersRestOfDay']), style: 'test3', margin: [ 0, 2, 0, 0 ] });
                }else{
                  content.push({text: 'Rest of Day - '+this.getWeatherName(this.sundayData['weatherRestOfDay']), style: 'test3', margin: [ 0, 2, 0, 0 ] });
                }   
            }
            if(this.sundayData['weatherMaxTemp']){
                  content.push({text: 'Max Temp : '+this.sundayData['weatherMaxTemp'], style: 'test3', margin: [ 0, 2, 0, 0 ] }); 
            }
            if(this.sundayData['weatherMinTemp']){
                  content.push({text: 'Min Temp : '+this.sundayData['weatherMinTemp'], style: 'test3', margin: [ 0, 2, 0, 0 ] }); 
            }

      }else{
            content.push({text: 'SUNDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });
      }

      return content
    }

    getSundayWeather2(){
      let content = [];
      console.log(this.sundayData);

      if(this.editForm.value.weatherSunday){
          // content.push({text: 'SUNDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });

          if(this.editForm.value.weatherSunday =='weatherOthers'){
            content.push({text: 'All Day - '+this.getWeatherName(this.editForm.value.weatherOthersSunday), style: 'test3', margin: [ 5, 2, 0, 0 ] });
          }else{
            content.push({text: 'All Day - '+this.getWeatherName(this.editForm.value.weatherSunday), style: 'test3', margin: [ 5, 2, 0, 0 ] });
          }  

          if(this.sundayData){
            if(this.sundayData['weatherMaxTemp']){
                  content.push({text: 'Max Temp : '+this.sundayData['weatherMaxTemp'], style: 'test3', margin: [ 5, 2, 0, 0 ] }); 
            }
            if(this.sundayData['weatherMinTemp']){
                  content.push({text: 'Min Temp : '+this.sundayData['weatherMinTemp'], style: 'test3', margin: [ 5, 2, 0, 0 ] }); 
            }
          }

          return content
      }

      if(this.sundayData){

            // content.push({text: 'SUNDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });

            if(this.sundayData['weatherPerfect']){
                  content.push({text: 'Perfect Weather', style: 'test3', margin: [ 5, 2, 0, 0 ] }); 
            }
            if(this.sundayData['weatherAllDay']){
                if(this.sundayData['weatherAllDay'] =='weatherOthers'){
                  content.push({text: 'All Day - '+this.getWeatherName(this.sundayData['weatherOthersAllDay']), style: 'test3', margin: [ 5, 2, 0, 0 ] });
                }else{
                  content.push({text: 'All Day - '+this.getWeatherName(this.sundayData['weatherAllDay']), style: 'test3', margin: [ 5, 2, 0, 0 ] });
                }   
            }
            if(this.sundayData['weatherMorning']){
                if(this.sundayData['weatherMorning'] =='weatherOthers'){
                    content.push({text: 'Morning - '+this.getWeatherName(this.sundayData['weatherOthersMorning']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }else{
                    content.push({text: 'Morning - '+this.getWeatherName(this.sundayData['weatherMorning']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }     
            }
            if(this.sundayData['weatherMidDay']){
                if(this.sundayData['weatherMidDay'] =='weatherOthers'){
                    content.push({text: 'Midday - '+this.getWeatherName(this.sundayData['weatherOthersMidDay']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }else{
                    content.push({text: 'Midday - '+this.getWeatherName(this.sundayData['weatherMidDay']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }
            }
            if(this.sundayData['weatherAfternoon']){
                if(this.sundayData['weatherAfternoon'] =='weatherOthers'){
                    content.push({text: 'Afternoon - '+this.getWeatherName(this.sundayData['weatherOthersAfternoon']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }else{
                    content.push({text: 'Afternoon - '+this.getWeatherName(this.sundayData['weatherAfternoon']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }
            }
            if(this.sundayData['weatherEvening']){
                if(this.sundayData['weatherEvening'] =='weatherOthers'){
                    content.push({text: 'Evening - '+this.getWeatherName(this.sundayData['weatherOthersEvening']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }else{
                  content.push({text: 'Evening - '+this.getWeatherName(this.sundayData['weatherEvening']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                } 
            }
            if(this.sundayData['weatherOnOff']){
                if(this.sundayData['weatherOnOff'] =='weatherOthers'){
                    content.push({text: 'On Off - '+this.getWeatherName(this.sundayData['weatherOthersOnOff']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }else{
                    content.push({text: 'On Off - '+this.getWeatherName(this.sundayData['weatherOnOff']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }  
            }
            if(this.sundayData['weatherRestOfDay']){
                if(this.sundayData['weatherRestOfDay'] =='weatherOthers'){
                    content.push({text: 'Rest of Day - '+this.getWeatherName(this.sundayData['weatherOthersRestOfDay']), style: 'test3', margin: [ 5, 2, 0, 0 ] });
                }else{
                  content.push({text: 'Rest of Day - '+this.getWeatherName(this.sundayData['weatherRestOfDay']), style: 'test3', margin: [ 5, 2, 0, 0 ] });
                }   
            }
            if(this.sundayData['weatherMaxTemp']){
                  content.push({text: 'Max Temp : '+this.sundayData['weatherMaxTemp'], style: 'test3', margin: [ 5, 2, 0, 0 ] }); 
            }
            if(this.sundayData['weatherMinTemp']){
                  content.push({text: 'Min Temp : '+this.sundayData['weatherMinTemp'], style: 'test3', margin: [ 5, 2, 0, 0 ] }); 
            }

      }else{
            // content.push({text: 'SUNDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });
      }

      return content
    }

    getMondayWeather(){
      let content = [];
      console.log(this.mondayData);

      if(this.editForm.value.weatherMonday){
          content.push({text: 'MONDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });

          if(this.editForm.value.weatherMonday =='weatherOthers'){
            content.push({text: 'All Day - '+this.getWeatherName(this.editForm.value.weatherOthersMonday), style: 'test3', margin: [ 0, 2, 0, 0 ] });
          }else{
            content.push({text: 'All Day - '+this.getWeatherName(this.editForm.value.weatherMonday), style: 'test3', margin: [ 0, 2, 0, 0 ] });
          }  
          if(this.mondayData){
            if(this.mondayData['weatherMaxTemp']){
                  content.push({text: 'Max Temp : '+this.mondayData['weatherMaxTemp'], style: 'test3', margin: [ 0, 2, 0, 0 ] }); 
            }
            if(this.mondayData['weatherMinTemp']){
                  content.push({text: 'Min Temp : '+this.mondayData['weatherMinTemp'], style: 'test3', margin: [ 0, 2, 0, 0 ] }); 
            }
          }

          return content
      }

      if(this.mondayData){

            content.push({text: 'MONDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });

            if(this.mondayData['weatherPerfect']){
                  content.push({text: 'Perfect Weather', style: 'test3', margin: [ 0, 2, 0, 0 ] }); 
            }
            if(this.mondayData['weatherAllDay']){
                if(this.mondayData['weatherAllDay'] =='weatherOthers'){
                  content.push({text: 'All Day - '+this.getWeatherName(this.mondayData['weatherOthersAllDay']), style: 'test3', margin: [ 0, 2, 0, 0 ] });
                }else{
                  content.push({text: 'All Day - '+this.getWeatherName(this.mondayData['weatherAllDay']), style: 'test3', margin: [ 0, 2, 0, 0 ] });
                }   
            }
            if(this.mondayData['weatherMorning']){
                if(this.mondayData['weatherMorning'] =='weatherOthers'){
                    content.push({text: 'Morning - '+this.getWeatherName(this.mondayData['weatherOthersMorning']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }else{
                    content.push({text: 'Morning - '+this.getWeatherName(this.mondayData['weatherMorning']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }     
            }
            if(this.mondayData['weatherMidDay']){
                if(this.mondayData['weatherMidDay'] =='weatherOthers'){
                    content.push({text: 'Midday - '+this.getWeatherName(this.mondayData['weatherOthersMidDay']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }else{
                    content.push({text: 'Midday - '+this.getWeatherName(this.mondayData['weatherMidDay']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }
            }
            if(this.mondayData['weatherAfternoon']){
                if(this.mondayData['weatherAfternoon'] =='weatherOthers'){
                    content.push({text: 'Afternoon - '+this.getWeatherName(this.mondayData['weatherOthersAfternoon']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }else{
                    content.push({text: 'Afternoon - '+this.getWeatherName(this.mondayData['weatherAfternoon']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }
            }
            if(this.mondayData['weatherEvening']){
                if(this.mondayData['weatherEvening'] =='weatherOthers'){
                    content.push({text: 'Evening - '+this.getWeatherName(this.mondayData['weatherOthersEvening']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }else{
                  content.push({text: 'Evening - '+this.getWeatherName(this.mondayData['weatherEvening']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                } 
            }
            if(this.mondayData['weatherOnOff']){
                if(this.mondayData['weatherOnOff'] =='weatherOthers'){
                    content.push({text: 'On Off - '+this.getWeatherName(this.mondayData['weatherOthersOnOff']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }else{
                    content.push({text: 'On Off - '+this.getWeatherName(this.mondayData['weatherOnOff']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }  
            }
            if(this.mondayData['weatherRestOfDay']){
                if(this.mondayData['weatherRestOfDay'] =='weatherOthers'){
                    content.push({text: 'Rest of Day - '+this.getWeatherName(this.mondayData['weatherOthersRestOfDay']), style: 'test3', margin: [ 0, 2, 0, 0 ] });
                }else{
                  content.push({text: 'Rest of Day - '+this.getWeatherName(this.mondayData['weatherRestOfDay']), style: 'test3', margin: [ 0, 2, 0, 0 ] });
                }   
            }
            if(this.mondayData['weatherMaxTemp']){
                  content.push({text: 'Max Temp : '+this.mondayData['weatherMaxTemp'], style: 'test3', margin: [ 0, 2, 0, 0 ] }); 
            }
            if(this.mondayData['weatherMinTemp']){
                  content.push({text: 'Min Temp : '+this.mondayData['weatherMinTemp'], style: 'test3', margin: [ 0, 2, 0, 0 ] }); 
            }

      }else{
            content.push({text: 'MONDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });
      }

      return content
    }

    getMondayWeather2(){
      let content = [];
      console.log(this.mondayData);

      if(this.editForm.value.weatherMonday){
          // content.push({text: 'MONDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });

          if(this.editForm.value.weatherMonday =='weatherOthers'){
            content.push({text: 'All Day - '+this.getWeatherName(this.editForm.value.weatherOthersMonday), style: 'test3', margin: [ 5, 2, 0, 0 ] });
          }else{
            content.push({text: 'All Day - '+this.getWeatherName(this.editForm.value.weatherMonday), style: 'test3', margin: [ 5, 2, 0, 0 ] });
          }  
          if(this.mondayData){
            if(this.mondayData['weatherMaxTemp']){
                  content.push({text: 'Max Temp : '+this.mondayData['weatherMaxTemp'], style: 'test3', margin: [ 5, 2, 0, 0 ] }); 
            }
            if(this.mondayData['weatherMinTemp']){
                  content.push({text: 'Min Temp : '+this.mondayData['weatherMinTemp'], style: 'test3', margin: [ 5, 2, 0, 0 ] }); 
            }
          }

          return content
      }

      if(this.mondayData){

            // content.push({text: 'MONDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });

            if(this.mondayData['weatherPerfect']){
                  content.push({text: 'Perfect Weather', style: 'test3', margin: [ 5, 2, 0, 0 ] }); 
            }
            if(this.mondayData['weatherAllDay']){
                if(this.mondayData['weatherAllDay'] =='weatherOthers'){
                  content.push({text: 'All Day - '+this.getWeatherName(this.mondayData['weatherOthersAllDay']), style: 'test3', margin: [ 5, 2, 0, 0 ] });
                }else{
                  content.push({text: 'All Day - '+this.getWeatherName(this.mondayData['weatherAllDay']), style: 'test3', margin: [ 5, 2, 0, 0 ] });
                }   
            }
            if(this.mondayData['weatherMorning']){
                if(this.mondayData['weatherMorning'] =='weatherOthers'){
                    content.push({text: 'Morning - '+this.getWeatherName(this.mondayData['weatherOthersMorning']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }else{
                    content.push({text: 'Morning - '+this.getWeatherName(this.mondayData['weatherMorning']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }     
            }
            if(this.mondayData['weatherMidDay']){
                if(this.mondayData['weatherMidDay'] =='weatherOthers'){
                    content.push({text: 'Midday - '+this.getWeatherName(this.mondayData['weatherOthersMidDay']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }else{
                    content.push({text: 'Midday - '+this.getWeatherName(this.mondayData['weatherMidDay']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }
            }
            if(this.mondayData['weatherAfternoon']){
                if(this.mondayData['weatherAfternoon'] =='weatherOthers'){
                    content.push({text: 'Afternoon - '+this.getWeatherName(this.mondayData['weatherOthersAfternoon']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }else{
                    content.push({text: 'Afternoon - '+this.getWeatherName(this.mondayData['weatherAfternoon']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }
            }
            if(this.mondayData['weatherEvening']){
                if(this.mondayData['weatherEvening'] =='weatherOthers'){
                    content.push({text: 'Evening - '+this.getWeatherName(this.mondayData['weatherOthersEvening']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }else{
                  content.push({text: 'Evening - '+this.getWeatherName(this.mondayData['weatherEvening']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                } 
            }
            if(this.mondayData['weatherOnOff']){
                if(this.mondayData['weatherOnOff'] =='weatherOthers'){
                    content.push({text: 'On Off - '+this.getWeatherName(this.mondayData['weatherOthersOnOff']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }else{
                    content.push({text: 'On Off - '+this.getWeatherName(this.mondayData['weatherOnOff']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }  
            }
            if(this.mondayData['weatherRestOfDay']){
                if(this.mondayData['weatherRestOfDay'] =='weatherOthers'){
                    content.push({text: 'Rest of Day - '+this.getWeatherName(this.mondayData['weatherOthersRestOfDay']), style: 'test3', margin: [ 5, 2, 0, 0 ] });
                }else{
                  content.push({text: 'Rest of Day - '+this.getWeatherName(this.mondayData['weatherRestOfDay']), style: 'test3', margin: [ 5, 2, 0, 0 ] });
                }   
            }
            if(this.mondayData['weatherMaxTemp']){
                  content.push({text: 'Max Temp : '+this.mondayData['weatherMaxTemp'], style: 'test3', margin: [ 5, 2, 0, 0 ] }); 
            }
            if(this.mondayData['weatherMinTemp']){
                  content.push({text: 'Min Temp : '+this.mondayData['weatherMinTemp'], style: 'test3', margin: [ 5, 2, 0, 0 ] }); 
            }

      }else{
            // content.push({text: 'MONDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });
      }

      return content
    }

    getTuesdayWeather(){
      let content = [];
      console.log(this.tuesdayData);

      if(this.editForm.value.weatherTuesday){
          content.push({text: 'TUESDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });

          if(this.editForm.value.weatherTuesday =='weatherOthers'){
            content.push({text: 'All Day - '+this.getWeatherName(this.editForm.value.weatherOthersTuesday), style: 'test3', margin: [ 0, 2, 0, 0 ] });
          }else{
            content.push({text: 'All Day - '+this.getWeatherName(this.editForm.value.weatherTuesday), style: 'test3', margin: [ 0, 2, 0, 0 ] });
          }  

          if(this.tuesdayData){
            if(this.tuesdayData['weatherMaxTemp']){
                  content.push({text: 'Max Temp : '+this.tuesdayData['weatherMaxTemp'], style: 'test3', margin: [ 0, 2, 0, 0 ] }); 
            }
            if(this.tuesdayData['weatherMinTemp']){
                  content.push({text: 'Min Temp : '+this.tuesdayData['weatherMinTemp'], style: 'test3', margin: [ 0, 2, 0, 0 ] }); 
            }
          }

          return content
      }

      if(this.tuesdayData){

            content.push({text: 'TUESDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });

            if(this.tuesdayData['weatherPerfect']){
                  content.push({text: 'Perfect Weather', style: 'test3', margin: [ 0, 2, 0, 0 ] }); 
            }
            if(this.tuesdayData['weatherAllDay']){
                if(this.tuesdayData['weatherAllDay'] =='weatherOthers'){
                  content.push({text: 'All Day - '+this.getWeatherName(this.tuesdayData['weatherOthersAllDay']), style: 'test3', margin: [ 0, 2, 0, 0 ] });
                }else{
                  content.push({text: 'All Day - '+this.getWeatherName(this.tuesdayData['weatherAllDay']), style: 'test3', margin: [ 0, 2, 0, 0 ] });
                }   
            }
            if(this.tuesdayData['weatherMorning']){
                if(this.tuesdayData['weatherMorning'] =='weatherOthers'){
                    content.push({text: 'Morning - '+this.getWeatherName(this.tuesdayData['weatherOthersMorning']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }else{
                    content.push({text: 'Morning - '+this.getWeatherName(this.tuesdayData['weatherMorning']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }     
            }
            if(this.tuesdayData['weatherMidDay']){
                if(this.tuesdayData['weatherMidDay'] =='weatherOthers'){
                    content.push({text: 'Midday - '+this.getWeatherName(this.tuesdayData['weatherOthersMidDay']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }else{
                    content.push({text: 'Midday - '+this.getWeatherName(this.tuesdayData['weatherMidDay']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }
            }
            if(this.tuesdayData['weatherAfternoon']){
                if(this.tuesdayData['weatherAfternoon'] =='weatherOthers'){
                    content.push({text: 'Afternoon - '+this.getWeatherName(this.tuesdayData['weatherOthersAfternoon']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }else{
                    content.push({text: 'Afternoon - '+this.getWeatherName(this.tuesdayData['weatherAfternoon']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }
            }
            if(this.tuesdayData['weatherEvening']){
                if(this.tuesdayData['weatherEvening'] =='weatherOthers'){
                    content.push({text: 'Evening - '+this.getWeatherName(this.tuesdayData['weatherOthersEvening']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }else{
                  content.push({text: 'Evening - '+this.getWeatherName(this.tuesdayData['weatherEvening']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                } 
            }
            if(this.tuesdayData['weatherOnOff']){
                if(this.tuesdayData['weatherOnOff'] =='weatherOthers'){
                    content.push({text: 'On Off - '+this.getWeatherName(this.tuesdayData['weatherOthersOnOff']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }else{
                    content.push({text: 'On Off - '+this.getWeatherName(this.tuesdayData['weatherOnOff']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }  
            }
            if(this.tuesdayData['weatherRestOfDay']){
                if(this.tuesdayData['weatherRestOfDay'] =='weatherOthers'){
                    content.push({text: 'Rest of Day - '+this.getWeatherName(this.tuesdayData['weatherOthersRestOfDay']), style: 'test3', margin: [ 0, 2, 0, 0 ] });
                }else{
                  content.push({text: 'Rest of Day - '+this.getWeatherName(this.tuesdayData['weatherRestOfDay']), style: 'test3', margin: [ 0, 2, 0, 0 ] });
                }   
            }
            if(this.tuesdayData['weatherMaxTemp']){
                  content.push({text: 'Max Temp : '+this.tuesdayData['weatherMaxTemp'], style: 'test3', margin: [ 0, 2, 0, 0 ] }); 
            }
            if(this.tuesdayData['weatherMinTemp']){
                  content.push({text: 'Min Temp : '+this.tuesdayData['weatherMinTemp'], style: 'test3', margin: [ 0, 2, 0, 0 ] }); 
            }

      }else{
            content.push({text: 'TUESDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });
      }

      return content
    }

    getTuesdayWeather2(){
      let content = [];
      console.log(this.tuesdayData);

      if(this.editForm.value.weatherTuesday){
          // content.push({text: 'TUESDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });

          if(this.editForm.value.weatherTuesday =='weatherOthers'){
            content.push({text: 'All Day - '+this.getWeatherName(this.editForm.value.weatherOthersTuesday), style: 'test3', margin: [ 5, 2, 0, 0 ] });
          }else{
            content.push({text: 'All Day - '+this.getWeatherName(this.editForm.value.weatherTuesday), style: 'test3', margin: [ 5, 2, 0, 0 ] });
          }  

          if(this.tuesdayData){
            if(this.tuesdayData['weatherMaxTemp']){
                  content.push({text: 'Max Temp : '+this.tuesdayData['weatherMaxTemp'], style: 'test3', margin: [ 5, 2, 0, 0 ] }); 
            }
            if(this.tuesdayData['weatherMinTemp']){
                  content.push({text: 'Min Temp : '+this.tuesdayData['weatherMinTemp'], style: 'test3', margin: [ 5, 2, 0, 0 ] }); 
            }
          }

          return content
      }

      if(this.tuesdayData){

            // content.push({text: 'TUESDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });

            if(this.tuesdayData['weatherPerfect']){
                  content.push({text: 'Perfect Weather', style: 'test3', margin: [ 5, 2, 0, 0 ] }); 
            }
            if(this.tuesdayData['weatherAllDay']){
                if(this.tuesdayData['weatherAllDay'] =='weatherOthers'){
                  content.push({text: 'All Day - '+this.getWeatherName(this.tuesdayData['weatherOthersAllDay']), style: 'test3', margin: [ 5, 2, 0, 0 ] });
                }else{
                  content.push({text: 'All Day - '+this.getWeatherName(this.tuesdayData['weatherAllDay']), style: 'test3', margin: [ 5, 2, 0, 0 ] });
                }   
            }
            if(this.tuesdayData['weatherMorning']){
                if(this.tuesdayData['weatherMorning'] =='weatherOthers'){
                    content.push({text: 'Morning - '+this.getWeatherName(this.tuesdayData['weatherOthersMorning']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }else{
                    content.push({text: 'Morning - '+this.getWeatherName(this.tuesdayData['weatherMorning']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }     
            }
            if(this.tuesdayData['weatherMidDay']){
                if(this.tuesdayData['weatherMidDay'] =='weatherOthers'){
                    content.push({text: 'Midday - '+this.getWeatherName(this.tuesdayData['weatherOthersMidDay']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }else{
                    content.push({text: 'Midday - '+this.getWeatherName(this.tuesdayData['weatherMidDay']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }
            }
            if(this.tuesdayData['weatherAfternoon']){
                if(this.tuesdayData['weatherAfternoon'] =='weatherOthers'){
                    content.push({text: 'Afternoon - '+this.getWeatherName(this.tuesdayData['weatherOthersAfternoon']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }else{
                    content.push({text: 'Afternoon - '+this.getWeatherName(this.tuesdayData['weatherAfternoon']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }
            }
            if(this.tuesdayData['weatherEvening']){
                if(this.tuesdayData['weatherEvening'] =='weatherOthers'){
                    content.push({text: 'Evening - '+this.getWeatherName(this.tuesdayData['weatherOthersEvening']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }else{
                  content.push({text: 'Evening - '+this.getWeatherName(this.tuesdayData['weatherEvening']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                } 
            }
            if(this.tuesdayData['weatherOnOff']){
                if(this.tuesdayData['weatherOnOff'] =='weatherOthers'){
                    content.push({text: 'On Off - '+this.getWeatherName(this.tuesdayData['weatherOthersOnOff']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }else{
                    content.push({text: 'On Off - '+this.getWeatherName(this.tuesdayData['weatherOnOff']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }  
            }
            if(this.tuesdayData['weatherRestOfDay']){
                if(this.tuesdayData['weatherRestOfDay'] =='weatherOthers'){
                    content.push({text: 'Rest of Day - '+this.getWeatherName(this.tuesdayData['weatherOthersRestOfDay']), style: 'test3', margin: [ 5, 2, 0, 0 ] });
                }else{
                  content.push({text: 'Rest of Day - '+this.getWeatherName(this.tuesdayData['weatherRestOfDay']), style: 'test3', margin: [ 5, 2, 0, 0 ] });
                }   
            }
            if(this.tuesdayData['weatherMaxTemp']){
                  content.push({text: 'Max Temp : '+this.tuesdayData['weatherMaxTemp'], style: 'test3', margin: [ 5, 2, 0, 0 ] }); 
            }
            if(this.tuesdayData['weatherMinTemp']){
                  content.push({text: 'Min Temp : '+this.tuesdayData['weatherMinTemp'], style: 'test3', margin: [ 5, 2, 0, 0 ] }); 
            }

      }else{
            // content.push({text: 'TUESDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });
      }

      return content
    }

    getWednesdayWeather(){
      let content = [];
      console.log(this.wednesdayData);

      if(this.editForm.value.weatherWednesday){
          content.push({text: 'WEDNESDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });

          if(this.editForm.value.weatherWednesday =='weatherOthers'){
            content.push({text: 'All Day - '+this.getWeatherName(this.editForm.value.weatherOthersWednesday), style: 'test3', margin: [ 0, 2, 0, 0 ] });
          }else{
            content.push({text: 'All Day - '+this.getWeatherName(this.editForm.value.weatherWednesday), style: 'test3', margin: [ 0, 2, 0, 0 ] });
          }  

          if(this.wednesdayData){
            if(this.wednesdayData['weatherMaxTemp']){
                  content.push({text: 'Max Temp : '+this.wednesdayData['weatherMaxTemp'], style: 'test3', margin: [ 0, 2, 0, 0 ] }); 
            }
            if(this.wednesdayData['weatherMinTemp']){
                  content.push({text: 'Min Temp : '+this.wednesdayData['weatherMinTemp'], style: 'test3', margin: [ 0, 2, 0, 0 ] }); 
            }
          }

          return content
      }

      if(this.wednesdayData){

            content.push({text: 'WEDNESDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });

            if(this.wednesdayData['weatherPerfect']){
                  content.push({text: 'Perfect Weather', style: 'test3', margin: [ 0, 2, 0, 0 ] }); 
            }
            if(this.wednesdayData['weatherAllDay']){
                if(this.wednesdayData['weatherAllDay'] =='weatherOthers'){
                  content.push({text: 'All Day - '+this.getWeatherName(this.wednesdayData['weatherOthersAllDay']), style: 'test3', margin: [ 0, 2, 0, 0 ] });
                }else{
                  content.push({text: 'All Day - '+this.getWeatherName(this.wednesdayData['weatherAllDay']), style: 'test3', margin: [ 0, 2, 0, 0 ] });
                }   
            }
            if(this.wednesdayData['weatherMorning']){
                if(this.wednesdayData['weatherMorning'] =='weatherOthers'){
                    content.push({text: 'Morning - '+this.getWeatherName(this.wednesdayData['weatherOthersMorning']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }else{
                    content.push({text: 'Morning - '+this.getWeatherName(this.wednesdayData['weatherMorning']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }     
            }
            if(this.wednesdayData['weatherMidDay']){
                if(this.wednesdayData['weatherMidDay'] =='weatherOthers'){
                    content.push({text: 'Midday - '+this.getWeatherName(this.wednesdayData['weatherOthersMidDay']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }else{
                    content.push({text: 'Midday - '+this.getWeatherName(this.wednesdayData['weatherMidDay']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }
            }
            if(this.wednesdayData['weatherAfternoon']){
                if(this.wednesdayData['weatherAfternoon'] =='weatherOthers'){
                    content.push({text: 'Afternoon - '+this.getWeatherName(this.wednesdayData['weatherOthersAfternoon']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }else{
                    content.push({text: 'Afternoon - '+this.getWeatherName(this.wednesdayData['weatherAfternoon']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }
            }
            if(this.wednesdayData['weatherEvening']){
                if(this.wednesdayData['weatherEvening'] =='weatherOthers'){
                    content.push({text: 'Evening - '+this.getWeatherName(this.wednesdayData['weatherOthersEvening']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }else{
                  content.push({text: 'Evening - '+this.getWeatherName(this.wednesdayData['weatherEvening']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                } 
            }
            if(this.wednesdayData['weatherOnOff']){
                if(this.wednesdayData['weatherOnOff'] =='weatherOthers'){
                    content.push({text: 'On Off - '+this.getWeatherName(this.wednesdayData['weatherOthersOnOff']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }else{
                    content.push({text: 'On Off - '+this.getWeatherName(this.wednesdayData['weatherOnOff']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }  
            }
            if(this.wednesdayData['weatherRestOfDay']){
                if(this.wednesdayData['weatherRestOfDay'] =='weatherOthers'){
                    content.push({text: 'Rest of Day - '+this.getWeatherName(this.wednesdayData['weatherOthersRestOfDay']), style: 'test3', margin: [ 0, 2, 0, 0 ] });
                }else{
                  content.push({text: 'Rest of Day - '+this.getWeatherName(this.wednesdayData['weatherRestOfDay']), style: 'test3', margin: [ 0, 2, 0, 0 ] });
                }   
            }
            if(this.wednesdayData['weatherMaxTemp']){
                  content.push({text: 'Max Temp : '+this.wednesdayData['weatherMaxTemp'], style: 'test3', margin: [ 0, 2, 0, 0 ] }); 
            }
            if(this.wednesdayData['weatherMinTemp']){
                  content.push({text: 'Min Temp : '+this.wednesdayData['weatherMinTemp'], style: 'test3', margin: [ 0, 2, 0, 0 ] }); 
            }

      }else{
            content.push({text: 'WEDNESDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });
      }

      return content
    }

    getWednesdayWeather2(){
      let content = [];
      console.log(this.wednesdayData);

      if(this.editForm.value.weatherWednesday){
          // content.push({text: 'WEDNESDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });

          if(this.editForm.value.weatherWednesday =='weatherOthers'){
            content.push({text: 'All Day - '+this.getWeatherName(this.editForm.value.weatherOthersWednesday), style: 'test3', margin: [ 5, 2, 0, 0 ] });
          }else{
            content.push({text: 'All Day - '+this.getWeatherName(this.editForm.value.weatherWednesday), style: 'test3', margin: [ 5, 2, 0, 0 ] });
          }  

          if(this.wednesdayData){
            if(this.wednesdayData['weatherMaxTemp']){
                  content.push({text: 'Max Temp : '+this.wednesdayData['weatherMaxTemp'], style: 'test3', margin: [ 5, 2, 0, 0 ] }); 
            }
            if(this.wednesdayData['weatherMinTemp']){
                  content.push({text: 'Min Temp : '+this.wednesdayData['weatherMinTemp'], style: 'test3', margin: [ 5, 2, 0, 0 ] }); 
            }
          }

          return content
      }

      if(this.wednesdayData){

            // content.push({text: 'WEDNESDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });

            if(this.wednesdayData['weatherPerfect']){
                  content.push({text: 'Perfect Weather', style: 'test3', margin: [ 5, 2, 0, 0 ] }); 
            }
            if(this.wednesdayData['weatherAllDay']){
                if(this.wednesdayData['weatherAllDay'] =='weatherOthers'){
                  content.push({text: 'All Day - '+this.getWeatherName(this.wednesdayData['weatherOthersAllDay']), style: 'test3', margin: [ 5, 2, 0, 0 ] });
                }else{
                  content.push({text: 'All Day - '+this.getWeatherName(this.wednesdayData['weatherAllDay']), style: 'test3', margin: [ 5, 2, 0, 0 ] });
                }   
            }
            if(this.wednesdayData['weatherMorning']){
                if(this.wednesdayData['weatherMorning'] =='weatherOthers'){
                    content.push({text: 'Morning - '+this.getWeatherName(this.wednesdayData['weatherOthersMorning']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }else{
                    content.push({text: 'Morning - '+this.getWeatherName(this.wednesdayData['weatherMorning']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }     
            }
            if(this.wednesdayData['weatherMidDay']){
                if(this.wednesdayData['weatherMidDay'] =='weatherOthers'){
                    content.push({text: 'Midday - '+this.getWeatherName(this.wednesdayData['weatherOthersMidDay']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }else{
                    content.push({text: 'Midday - '+this.getWeatherName(this.wednesdayData['weatherMidDay']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }
            }
            if(this.wednesdayData['weatherAfternoon']){
                if(this.wednesdayData['weatherAfternoon'] =='weatherOthers'){
                    content.push({text: 'Afternoon - '+this.getWeatherName(this.wednesdayData['weatherOthersAfternoon']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }else{
                    content.push({text: 'Afternoon - '+this.getWeatherName(this.wednesdayData['weatherAfternoon']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }
            }
            if(this.wednesdayData['weatherEvening']){
                if(this.wednesdayData['weatherEvening'] =='weatherOthers'){
                    content.push({text: 'Evening - '+this.getWeatherName(this.wednesdayData['weatherOthersEvening']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }else{
                  content.push({text: 'Evening - '+this.getWeatherName(this.wednesdayData['weatherEvening']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                } 
            }
            if(this.wednesdayData['weatherOnOff']){
                if(this.wednesdayData['weatherOnOff'] =='weatherOthers'){
                    content.push({text: 'On Off - '+this.getWeatherName(this.wednesdayData['weatherOthersOnOff']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }else{
                    content.push({text: 'On Off - '+this.getWeatherName(this.wednesdayData['weatherOnOff']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }  
            }
            if(this.wednesdayData['weatherRestOfDay']){
                if(this.wednesdayData['weatherRestOfDay'] =='weatherOthers'){
                    content.push({text: 'Rest of Day - '+this.getWeatherName(this.wednesdayData['weatherOthersRestOfDay']), style: 'test3', margin: [ 5, 2, 0, 0 ] });
                }else{
                  content.push({text: 'Rest of Day - '+this.getWeatherName(this.wednesdayData['weatherRestOfDay']), style: 'test3', margin: [ 5, 2, 0, 0 ] });
                }   
            }
            if(this.wednesdayData['weatherMaxTemp']){
                  content.push({text: 'Max Temp : '+this.wednesdayData['weatherMaxTemp'], style: 'test3', margin: [ 5, 2, 0, 0 ] }); 
            }
            if(this.wednesdayData['weatherMinTemp']){
                  content.push({text: 'Min Temp : '+this.wednesdayData['weatherMinTemp'], style: 'test3', margin: [ 5, 2, 0, 0 ] }); 
            }

      }else{
            // content.push({text: 'WEDNESDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });
      }

      return content
    }

    getThursdayWeather(){
      let content = [];
      console.log(this.thursdayData);

      if(this.editForm.value.weatherThursday){
          content.push({text: 'THURSDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });

          if(this.editForm.value.weatherThursday =='weatherOthers'){
            content.push({text: 'All Day - '+this.getWeatherName(this.editForm.value.weatherOthersThursday), style: 'test3', margin: [ 0, 2, 0, 0 ] });
          }else{
            content.push({text: 'All Day - '+this.getWeatherName(this.editForm.value.weatherThursday), style: 'test3', margin: [ 0, 2, 0, 0 ] });
          }  

          if(this.thursdayData){
            if(this.thursdayData['weatherMaxTemp']){
                  content.push({text: 'Max Temp : '+this.thursdayData['weatherMaxTemp'], style: 'test3', margin: [ 0, 2, 0, 0 ] }); 
            }
            if(this.thursdayData['weatherMinTemp']){
                  content.push({text: 'Min Temp : '+this.thursdayData['weatherMinTemp'], style: 'test3', margin: [ 0, 2, 0, 0 ] }); 
            }
          }

          return content
      }

      if(this.thursdayData){

            content.push({text: 'THURSDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });

            if(this.thursdayData['weatherPerfect']){
                  content.push({text: 'Perfect Weather', style: 'test3', margin: [ 0, 2, 0, 0 ] }); 
            }
            if(this.thursdayData['weatherAllDay']){
                if(this.thursdayData['weatherAllDay'] =='weatherOthers'){
                  content.push({text: 'All Day - '+this.getWeatherName(this.thursdayData['weatherOthersAllDay']), style: 'test3', margin: [ 0, 2, 0, 0 ] });
                }else{
                  content.push({text: 'All Day - '+this.getWeatherName(this.thursdayData['weatherAllDay']), style: 'test3', margin: [ 0, 2, 0, 0 ] });
                }   
            }
            if(this.thursdayData['weatherMorning']){
                if(this.thursdayData['weatherMorning'] =='weatherOthers'){
                    content.push({text: 'Morning - '+this.getWeatherName(this.thursdayData['weatherOthersMorning']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }else{
                    content.push({text: 'Morning - '+this.getWeatherName(this.thursdayData['weatherMorning']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }     
            }
            if(this.thursdayData['weatherMidDay']){
                if(this.thursdayData['weatherMidDay'] =='weatherOthers'){
                    content.push({text: 'Midday - '+this.getWeatherName(this.thursdayData['weatherOthersMidDay']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }else{
                    content.push({text: 'Midday - '+this.getWeatherName(this.thursdayData['weatherMidDay']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }
            }
            if(this.thursdayData['weatherAfternoon']){
                if(this.thursdayData['weatherAfternoon'] =='weatherOthers'){
                    content.push({text: 'Afternoon - '+this.getWeatherName(this.thursdayData['weatherOthersAfternoon']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }else{
                    content.push({text: 'Afternoon - '+this.getWeatherName(this.thursdayData['weatherAfternoon']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }
            }
            if(this.thursdayData['weatherEvening']){
                if(this.thursdayData['weatherEvening'] =='weatherOthers'){
                    content.push({text: 'Evening - '+this.getWeatherName(this.thursdayData['weatherOthersEvening']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }else{
                  content.push({text: 'Evening - '+this.getWeatherName(this.thursdayData['weatherEvening']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                } 
            }
            if(this.thursdayData['weatherOnOff']){
                if(this.thursdayData['weatherOnOff'] =='weatherOthers'){
                    content.push({text: 'On Off - '+this.getWeatherName(this.thursdayData['weatherOthersOnOff']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }else{
                    content.push({text: 'On Off - '+this.getWeatherName(this.thursdayData['weatherOnOff']), style: 'test3', margin: [ 0,2, 0, 0 ] });
                }  
            }
            if(this.thursdayData['weatherRestOfDay']){
                if(this.thursdayData['weatherRestOfDay'] =='weatherOthers'){
                    content.push({text: 'Rest of Day - '+this.getWeatherName(this.thursdayData['weatherOthersRestOfDay']), style: 'test3', margin: [ 0, 2, 0, 0 ] });
                }else{
                  content.push({text: 'Rest of Day - '+this.getWeatherName(this.thursdayData['weatherRestOfDay']), style: 'test3', margin: [ 0, 2, 0, 0 ] });
                }   
            }
            if(this.thursdayData['weatherMaxTemp']){
                  content.push({text: 'Max Temp : '+this.thursdayData['weatherMaxTemp'], style: 'test3', margin: [ 0, 2, 0, 0 ] }); 
            }
            if(this.thursdayData['weatherMinTemp']){
                  content.push({text: 'Min Temp : '+this.thursdayData['weatherMinTemp'], style: 'test3', margin: [ 0, 2, 0, 0 ] }); 
            }

      }else{
            content.push({text: 'THURSDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });
      }

      return content
    }

    getThursdayWeather2(){
      let content = [];
      console.log(this.thursdayData);

      if(this.editForm.value.weatherThursday){
          // content.push({text: 'THURSDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });

          if(this.editForm.value.weatherThursday =='weatherOthers'){
            content.push({text: 'All Day - '+this.getWeatherName(this.editForm.value.weatherOthersThursday), style: 'test3', margin: [ 5, 2, 0, 0 ] });
          }else{
            content.push({text: 'All Day - '+this.getWeatherName(this.editForm.value.weatherThursday), style: 'test3', margin: [ 5, 2, 0, 0 ] });
          }  

          if(this.thursdayData){
            if(this.thursdayData['weatherMaxTemp']){
                  content.push({text: 'Max Temp : '+this.thursdayData['weatherMaxTemp'], style: 'test3', margin: [ 5, 2, 0, 0 ] }); 
            }
            if(this.thursdayData['weatherMinTemp']){
                  content.push({text: 'Min Temp : '+this.thursdayData['weatherMinTemp'], style: 'test3', margin: [ 5, 2, 0, 0 ] }); 
            }
          }

          return content
      }

      if(this.thursdayData){

            // content.push({text: 'THURSDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });

            if(this.thursdayData['weatherPerfect']){
                  content.push({text: 'Perfect Weather', style: 'test3', margin: [ 5, 2, 0, 0 ] }); 
            }
            if(this.thursdayData['weatherAllDay']){
                if(this.thursdayData['weatherAllDay'] =='weatherOthers'){
                  content.push({text: 'All Day - '+this.getWeatherName(this.thursdayData['weatherOthersAllDay']), style: 'test3', margin: [ 5, 2, 0, 0 ] });
                }else{
                  content.push({text: 'All Day - '+this.getWeatherName(this.thursdayData['weatherAllDay']), style: 'test3', margin: [ 5, 2, 0, 0 ] });
                }   
            }
            if(this.thursdayData['weatherMorning']){
                if(this.thursdayData['weatherMorning'] =='weatherOthers'){
                    content.push({text: 'Morning - '+this.getWeatherName(this.thursdayData['weatherOthersMorning']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }else{
                    content.push({text: 'Morning - '+this.getWeatherName(this.thursdayData['weatherMorning']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }     
            }
            if(this.thursdayData['weatherMidDay']){
                if(this.thursdayData['weatherMidDay'] =='weatherOthers'){
                    content.push({text: 'Midday - '+this.getWeatherName(this.thursdayData['weatherOthersMidDay']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }else{
                    content.push({text: 'Midday - '+this.getWeatherName(this.thursdayData['weatherMidDay']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }
            }
            if(this.thursdayData['weatherAfternoon']){
                if(this.thursdayData['weatherAfternoon'] =='weatherOthers'){
                    content.push({text: 'Afternoon - '+this.getWeatherName(this.thursdayData['weatherOthersAfternoon']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }else{
                    content.push({text: 'Afternoon - '+this.getWeatherName(this.thursdayData['weatherAfternoon']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }
            }
            if(this.thursdayData['weatherEvening']){
                if(this.thursdayData['weatherEvening'] =='weatherOthers'){
                    content.push({text: 'Evening - '+this.getWeatherName(this.thursdayData['weatherOthersEvening']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }else{
                  content.push({text: 'Evening - '+this.getWeatherName(this.thursdayData['weatherEvening']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                } 
            }
            if(this.thursdayData['weatherOnOff']){
                if(this.thursdayData['weatherOnOff'] =='weatherOthers'){
                    content.push({text: 'On Off - '+this.getWeatherName(this.thursdayData['weatherOthersOnOff']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }else{
                    content.push({text: 'On Off - '+this.getWeatherName(this.thursdayData['weatherOnOff']), style: 'test3', margin: [ 5,2, 0, 0 ] });
                }  
            }
            if(this.thursdayData['weatherRestOfDay']){
                if(this.thursdayData['weatherRestOfDay'] =='weatherOthers'){
                    content.push({text: 'Rest of Day - '+this.getWeatherName(this.thursdayData['weatherOthersRestOfDay']), style: 'test3', margin: [ 5, 2, 0, 0 ] });
                }else{
                  content.push({text: 'Rest of Day - '+this.getWeatherName(this.thursdayData['weatherRestOfDay']), style: 'test3', margin: [ 5, 2, 0, 0 ] });
                }   
            }
            if(this.thursdayData['weatherMaxTemp']){
                  content.push({text: 'Max Temp : '+this.thursdayData['weatherMaxTemp'], style: 'test3', margin: [ 5, 2, 0, 0 ] }); 
            }
            if(this.thursdayData['weatherMinTemp']){
                  content.push({text: 'Min Temp : '+this.thursdayData['weatherMinTemp'], style: 'test3', margin: [ 5, 2, 0, 0 ] }); 
            }

      }else{
            // content.push({text: 'THURSDAY',style: 'test', margin: [ 0, 10, 0, 5 ] });
      }

      return content
    }

    getProjectBackground() {

        if(this.projImageBackground){
          return this.pdfImage[this.projImageBackground];
        }else{
          return this.pdfImage.bgpdf;
        }
        
    }

    getFooter (currentPage, pageCount) {
        return [{
            // margin: [31, 0, 31],
            // layout: {
            //     hLineColor: (i) => (i === 0) ? 'lightgray' : '',
            //     vLineWidth: (i) => 0,
            //     hLineWidth: (i) => (i === 0) ? 1 : 0
            // },
            stack: [
                      
                      {
                          image: this.pdfFooterImage,
                          width: '535',
                          margin:[30,0]
                      },
                      {
                          text: currentPage.toString() + ' of ' + pageCount,
                          style: 'test4',
                          margin: [ 30, -35, 30, 0 ]
                      }
              ]
            }
        ];
    };
    
    getPDFIcons(iconType){
      if( (iconType=='telephone') && this.adminData.pdfPhone){
          return {
            image: this.pdfIcons.telephone, 
            width: 10, 
            height: 10
          }
      }else if( (iconType=='mobile') && this.adminData.pdfMobile){
          return {
            image: this.pdfIcons.mobile, 
            width: 10, 
            height: 10
          }
      }else if( (iconType=='email') && this.adminData.pdfEmail){
          return {
            image: this.pdfIcons.email, 
            width: 10, 
            height: 10
          }
      }else if( (iconType=='pin') && this.adminData.pdfAddress){
          return {
            image: this.pdfIcons.pin, 
            width: 10, 
            height: 10
          }
      }else{
         return {
          width: 0, 
          text: ''
         }
      }
      
  }

  getPDFIconsSpace(iconType){
      if( (iconType=='telephone') && this.adminData.pdfPhone){
          return { width: 5, text: '' } 
      }else if( (iconType=='mobile') && this.adminData.pdfMobile){
        return { width: 5, text: '' } 
      }else if( (iconType=='email') && this.adminData.pdfEmail){
        return { width: 5, text: '' } 
      }else if( (iconType=='pin') && this.adminData.pdfAddress){
        return { width: 5, text: '' } 
      }else{
        return {
          width: 0, 
          text: ''
        }
      }
  }

  getPDFIconsSpace2(iconType){
    if( (iconType=='telephone') && this.adminData.pdfPhone){
        return { width: 10, text: '' } 
    }else if( (iconType=='mobile') && this.adminData.pdfMobile){
      return { width: 10, text: '' } 
    }else if( (iconType=='email') && this.adminData.pdfEmail){
      return { width: 10, text: '' } 
    }else if( (iconType=='pin') && this.adminData.pdfAddress){
      return { width: 10, text: '' } 
    }else{
      return {
        width: 0, 
        text: ''
      }
    }
}


  getFooter2(currentPage, pageCount) {
    return [{
        stack: [
                  {
                      text: currentPage.toString() + ' of ' + pageCount,
                      style: 'test4',
                      margin: [ 30, 0, 30, 0 ]
                  },
                  {canvas: [{ type: 'line', x1: 30, y1: 0, x2: 565, y2: 0, lineWidth: 0.1,lineColor: '#A9A9A9' }],margin: [ 0, 0, 0, 0 ],},             
                  {
                    columns: [
                      { width: '*', text: '' },
                      this.getPDFIcons('telephone'),
                      this.getPDFIconsSpace('telephone'),
                      {
                        width: 'auto',
                        text: this.adminData.pdfPhone ? this.adminData.pdfPhone : '',
                        style: 'footerText',
                      },
                      this.getPDFIconsSpace2('telephone'),
                      this.getPDFIcons('mobile'),
                      this.getPDFIconsSpace('mobile'),
                      {
                        width: 'auto',
                        text: this.adminData.pdfMobile,
                        style: 'footerText',
                      },
                      this.getPDFIconsSpace2('mobile'),
                      this.getPDFIcons('email'),
                      this.getPDFIconsSpace('email'),
                      {
                        width: 'auto',
                        text: this.adminData.pdfEmail,
                        style: 'footerText',
                      },
                      this.getPDFIconsSpace2('email'),
                      this.getPDFIcons('pin'),
                      this.getPDFIconsSpace('pin'),
                      {
                        width: 'auto',
                        text: this.adminData.pdfAddress,
                        style: 'footerText',
                      },
                      { width: '*', text: '' },
                    ],
                    margin: [ 0, 4, 0, 0 ]
                  }
    
          ]
        }
    ];
};
  
    public getDocumentDefinition2() {

        // HEADER SETTNGS
        // let headerObj1 = {
        //     image: this.pdfHeaderImage1,
        //     width: 265,
        //     margin:[30,30]
        // }
        let headerObj1 = {
          columns: [
            {
              stack: [
                {
                  image: this.pdfLogo,
                  width: '210',
                  // margin: [ 0, 20, 0, 0 ]
                }
              ],
              margin:[30,20],
              width: '40%',
            },
            {
              stack: [
                {
                  text: '',
                  style: 'test',
                }
              ],
              margin: [ 0, 20, 0, 0 ],
              width: '20%',
            },
          ],
          columnGap: 10
        }
        let headerObj2 = {
            image: this.pdfLogo,
            width: 210,
            margin:[30,20],
        }

      return {
        pageOrientation: 'portrait',
        pageMargins: [ 30, 110, 30, 30 ],
        // header: {
        //     image: this.pdfImage.headerPage1,
        //     width: 515,
        //     margin:[40,40]
        // },

        // HEADER SETTNGS
        header:function(page) { 
            if (page != 1){
                  return headerObj2;
            }else{
                  return headerObj1;
            }
        },

        // FOOTER SETTNGS
        footer: (currentPage, pageCount) => {
            return this.getFooter2(currentPage, pageCount)
        },

        pageSize: 'A4',
        // background: [
        //   {
        //       image: this.getProjectBackground(),
        //       width: 595
        //   }
        // ],
        info: {
            title: this.pdfCompanyName + ' Weekly Report',
        },
        content: [
          // { text: 'WEEK ENDING: 14-06-2020', style: 'test', margin: [ 270,115, 0, 0 ] },
          // { text: 'REPORT #: 000', style: 'test', margin: [ 290,115, 0, 0 ] },
          {
            columns: [
              {
                text: 'Weekly Progress Report',
                style: 'Header',
                width: '40%',
              },
              {
                text: '',
                width: '14%',
              },
              {
                text: 'Report No: ',
                style: 'fieldHeader',
                width: '14%',
              },
              {
                text:  (this.editForm.value.reportNumber ? this.editForm.value.reportNumber : ''),
                style: 'fieldHeader',
                width: '32%',
              }
            ],
            margin: [ 0, 0, 0, 20 ],
          }, 
          {
            columns: [
              {
                stack: [
                  {
                    text: 'Job Number: ',
                    style: 'tableHeader',
                  },
                  {
                    text: 'Project:',
                    style: 'tableHeader',
                  },
                  {
                    text: 'Week Ending:',
                    style: 'tableHeader',
                  },
                  {
                    text: 'Aimed Completion Date: ',
                    style: 'tableHeader',
                  }, 
                ],
                margin: [ 0, 0, 0, 20 ],
                width: '20%',
              },
              {
                stack: [
                  {
                    text: this.projJobNumber ? this.projJobNumber : ' ',
                    style: 'fieldData',
                  },
                  {
                    text: this.pdfProjectName ? this.pdfProjectName : ' ',
                    style: 'fieldData',
                  },
                  {
                    text: this.friDate ? this.friDate : ' ',
                    style: 'fieldData',
                  },
                  {
                    text: this.aimDate ? this.aimDate : ' ',
                    style: 'fieldData',
                  },                 
                ],
                margin: [ 0, 0, 0, 20 ],
                width: '20%',
              },
              {
                stack: [
                  {
                    text: '',
                    style: 'tableHeader',
                  },
                ],
                margin: [ 0, 0, 0, 20 ],
                width: '14%',
              },
              {
                stack: [
                  {
                    text: 'Site Supervisor: ',
                    style: 'tableHeader',
                  },
                  {
                    text: 'Supervisor Email: ',
                    style: 'tableHeader',
                  },
                  {
                    text: 'Supervisor Mobile: ',
                    style: 'tableHeader',
                  },
                  {
                    text: 'Project Address: ',
                    style: 'tableHeader',
                  }
                ],
                margin: [ 0, 0, 0, 20 ],
                width: '16%',
              },
              {
                stack: [
                  {
                    text: this.pdfSupervisorName ? this.pdfSupervisorName : ' ',
                    style: 'fieldData',
                  },
                  {
                    text: this.pdfSupervisorEmail ? this.pdfSupervisorEmail : ' ',
                    style: 'fieldData',
                  },
                  {
                    text: this.pdfSupervisorMobile ? this.pdfSupervisorMobile : ' ',
                    style: 'fieldData',
                  },
                  {
                    text: this.projaddress ? this.projaddress : ' ',
                    style: 'fieldData',
                  }
                ],
                margin: [ 0, 0, 0, 20 ],
                width: '30%',
              },
            ],
          },
          {    
            stack: [
              {
                text: 'Weather',
                style: 'fieldHeader',
              },
            ],
            margin: [ 5, 5, 0, 5 ],
          },
          {
            columns: [
              {
                text: 'Monday',
                style: 'fieldHeader',
                margin: [ 5, 0, 0, 0 ],
              },
              {
                text: 'Tuesday',
                style: 'fieldHeader',
                margin: [ 5, 0, 0, 0 ],
              },
              {
                text: 'Wednesday',
                style: 'fieldHeader',
                margin: [ 5, 0, 0, 0 ],
              },
              {
                text: 'Thursday',
                style: 'fieldHeader',
                margin: [ 5, 0, 0, 0 ],
              },
              {
                text: 'Friday',
                style: 'fieldHeader',
                margin: [ 5, 0, 0, 0 ],
              },
              {
                text: 'Saturday',
                style: 'fieldHeader',
                margin: [ 5, 0, 0, 0 ],
              },
              {
                text: 'Sunday',
                style: 'fieldHeader',
                margin: [ 5, 0, 0, 0 ],
              },
            ],
          },
          {canvas: [{ type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 0.1,lineColor: '#A9A9A9' }],margin: [ 0, 2, 0, 1 ],},
          {
            columns: [
                this.getMondayWeather2(),
                this.getTuesdayWeather2(),
                this.getWednesdayWeather2(),
                this.getThursdayWeather2(),
                this.getFridayWeather2(),
                this.getSaturdayWeather2(),
                this.getSundayWeather2(),
            ]
          },
          {
            stack: [
              {
                columns: [
                  {
                    stack: [
                      {
                        text: 'Days Lost This Week:',
                        style: 'fieldHeader',
                        margin: [ 5, 10, 0, 0 ],
                      },
                      {canvas: [{ type: 'line', x1: 0, y1: 0, x2: 258, y2: 0, lineWidth: 0.1,lineColor: '#A9A9A9' }],margin: [ 0, 2, 0, 2 ],},
                      {
                        text: (this.editForm.value.lostWeekDays ? this.editForm.value.lostWeekDays : '0') + ' Days '+ (this.editForm.value.lostWeekHours ? this.editForm.value.lostWeekHours : '0') +' Hours',
                        style: 'fieldData',
                        margin: [ 5, 0, 0, 0 ],
                      }
                    ],
                    width: '50%',
                    unbreakable: true,
                  },
                  {
                    stack: [
                      {
                        text: 'Total Days Lost to Date:',
                        style: 'fieldHeader',
                        margin: [ 5, 10, 0, 0 ],
                        // margin: [ 3, -17, 0, 3 ]
                      },
                      {canvas: [{ type: 'line', x1: 0, y1: 0, x2: 258, y2: 0, lineWidth: 0.1,lineColor: '#A9A9A9' }],margin: [ 0, 2, 0, 2 ],},
                      {
                        text: (this.editForm.getRawValue().lostTotalDays ? this.editForm.getRawValue().lostTotalDays : '0') + ' Days '+ (this.editForm.getRawValue().lostTotalHours ? this.editForm.getRawValue().lostTotalHours : '0') +' Hours',
                        style: 'fieldData',
                        margin: [ 5, 0, 0, 0 ],
                      }
                    ],
                    width: '50%',
                    unbreakable: true,
                  },
                ],
                columnGap: 20,
              }
            ],
            unbreakable: true
          },
          this.getAccThisWeekList2(),
          this.getAccNextWeekList2(),
          this.getSubThisWeekList2(),
          this.getSubNextWeekList2(),
          this.getConSiteThisWeekList2(),
          this.getConSiteNeedWeekList2(),
          this.getRequestedChangesList2(),
          this.getClarificationArchEngList2(),
          this.getInformationNeededList2(),
          this.getUpcomingMeetings2(),
          this.getCustomQA2(),
          this.previewImage.getUploadedImages(this.editForm.value.imageUpload),
        ], 
        styles: {
          // name: {
          //   fontSize: 16,
          //   bold: true
          // }
          defaultStyle: {
            fontSize: 8,
            font: 'Helvetica'
          },
          testcaption: {
            color: '#050708',
            fontSize: 8,
          },
          test: {
              color: '#050708',
              fontSize: 9,
          },
          test2: {
            color: '#050708',
            fontSize: 9,
            alignment: 'center'
          },
          test3: {
            color: '#050708',
            fontSize: 9,
          },
          test4: {
              color: '#050708',
              fontSize: 9,
              alignment: 'right'
          },
          Header: {
            color: '#050708',
            fontSize: 15,
            bold: true,
          },
          fieldHeader: {
            color: '#050708',
            fontSize: 10,
            bold: true,
          },
          fieldData: {
            color: '#050708',
            fontSize: 9,
          },
          footerText: {
            color: '#050708',
            fontSize: 8,
            bold: true,
          },
          testHeader2: {
            color: '#ffffff',
            fontSize: 16,
          },
          tableHeader: {
              fontSize: 9,
              bold: true,
              fillColor: '#F0F1F0',
          },
          tableTotal: {
            fontSize: 8,
            bold: true,
            fillColor: '#F0F1F0',
          },
          tableFooter: {
              fontSize: 8,
              bold: true,
              // fillColor: '#F0F1F0',
          }
      }
    }
  }

    public getDocumentDefinition() {

              // HEADER SETTNGS
              let headerObj1 = {
                  image: this.pdfHeaderImage1,
                  width: 535,
                  margin:[30,30]
              }
              let headerObj2 = {
                  image: this.pdfHeaderImage2,
                  width: 535,
                  margin:[30,30]
              }

            return {
              pageOrientation: 'portrait',
              pageMargins: [ 30, 130, 30, 30 ],
              // header: {
              //     image: this.pdfImage.headerPage1,
              //     width: 515,
              //     margin:[40,40]
              // },

              // HEADER SETTNGS
              header:function(page) { 
                  if (page != 1){
                        return headerObj2;
                  }else{
                        return headerObj1;
                  }
              },

              // FOOTER SETTNGS
              footer: (currentPage, pageCount) => {
                  return this.getFooter(currentPage, pageCount)
              },

              pageSize: 'A4',
              // background: [
              //   {
              //       image: this.getProjectBackground(),
              //       width: 595
              //   }
              // ],
              info: {
                  title: this.pdfCompanyName + ' Weekly Report',
              },
              content: [
                // { text: 'WEEK ENDING: 14-06-2020', style: 'test', margin: [ 270,115, 0, 0 ] },
                // { text: 'REPORT #: 000', style: 'test', margin: [ 290,115, 0, 0 ] },
                { text: '', style: 'test', margin: [ 0,25, 0, 0 ] },
                { 
                  image: this.pdfImage.bgWeekly,
                  width: '535',
                  // margin: [ 0,-40, 0, 0 ] 
                },
                {
                  columns: [
                    {
                      text: 'WEEKLY PROGRESS REPORT',
                      style: 'testHeader2',
                      width: '51%',
                      margin: [ 14,8, 0, 0 ] 
                    },
                    {
                      text: 'WEEK ENDING: '+this.friDate,
                      style: 'test',
                      width: '30%',
                      // margin: [ 270,115, 0, 0 ]
                    },
                    {
                      text: 'REPORT #: '+ (this.editForm.value.reportNumber ? this.editForm.value.reportNumber : ''),
                      style: 'test'
                    },
                  ],
                  margin: [ 0,-33, 0, 0 ] 
                },
                {
                  columns: [
                    {
                      text: '',
                      width: '51%',
                    },
                    {
                      text: 'PROJECT: '+ this.pdfProjectName,
                      style: 'test',
                      margin: [ 0,-7, 0, 0 ],
                    },
                  ]
                },
                {
                  columns: [
                    {
                      stack: [
                        {
                          image: this.pdfImage.bgSubAccThisWeek,
                          width: '265',
                          // margin: [ 0, 20, 0, 0 ]
                        },
                        {
                          text: 'SITE SUPERVISOR: '+ this.pdfSupervisorName,
                          style: 'testHeader',
                          margin: [ 5, -15, 0, 0 ]
                        },
                      ],
                      margin: [ 0, 20, 0, 0 ],
                      width: '50%',
                    },
                    {
                      stack: [
                        {
                          image: this.pdfImage.bgSubAccThisWeek,
                          width: '265',
                          // margin: [ 0, 20, 0, 0 ]
                        },
                        {
                          text: 'AIMED COMPLETION DATE: '+this.aimDate,
                          style: 'testHeader',
                          margin: [ 5, -15, 0, 0 ]
                        },
                      ],
                      margin: [ 0, 20, 0, 0 ],
                      width: '50%',
                    },
                  ],
                  columnGap: 10
                },
                // {
                //   columns: [
                //     {
                //       text: this.pdfSupervisorName,
                //       style: 'testHeader',
                //       margin: [ 83, -11, 0, 0 ],
                //     },
                //     {
                //       text: this.aimDate,
                //       style: 'testHeader',
                //       margin: [ 120, -11, 0, 0 ],
                //     },
                //   ]
                // },
                {
                  columns: [
                    {
                      stack: [
                        {
                          image: this.pdfImage.bgSubAccThisWeek,
                          width: '265',
                          // margin: [ 0, 20, 0, 0 ]
                        },
                        {
                          text: 'JOB NUMBER: '+ this.projJobNumber,
                          style: 'testHeader',
                          margin: [ 5, -15, 0, 0 ]
                        },
                      ],
                      margin: [ 0, 20, 0, 0 ],
                      width: '50%',
                    },
                    {
                      stack: [
                        {
                          image: this.pdfImage.bgSubAccThisWeek,
                          width: '265',
                          // margin: [ 0, 20, 0, 0 ]
                        },
                        {
                          text: 'ADDRESS: '+this.projaddress,
                          style: 'testHeader',
                          margin: [ 5, -15, 0, 0 ]
                        },
                      ],
                      margin: [ 0, 20, 0, 0 ],
                      width: '50%',
                    },
                  ],
                  columnGap: 10
                },
                // {
                //   columns: [
                //     {
                //       text: this.projJobNumber,
                //       style: 'testHeader',
                //       margin: [ 65, -11, 0, 0 ],
                //     },
                //     {
                //       text: this.projaddress,
                //       style: 'testHeader',
                //       margin: [ 90, -11, 0, 0 ],
                //     },
                //   ]
                // },
                {    
                  stack: [
                    {
                      image: this.pdfImage.bgWeather,
                      width: '500',
                      // margin: [ 0, 20, 0, 0 ]
                    },
                    {
                      text: 'WEATHER',
                      style: 'testHeader',
                      margin: [ 5, -15, 0, 0 ]
                    },
                  ],
                  margin: [ 0, 20, 0, 0 ],
                },
                {
                  columns: [
                      this.getMondayWeather(),
                      this.getTuesdayWeather(),
                      this.getWednesdayWeather(),
                      this.getThursdayWeather(),
                      this.getFridayWeather(),
                      this.getSaturdayWeather(),
                      this.getSundayWeather(),
                  ]
                },
                {
                  columns: [
                    {
                      stack: [
                        {
                          image: this.pdfImage.bgSubAccThisWeek,
                          width: '265',
                          // margin: [ 0, 20, 0, 0 ]
                        },
                        {
                          text: 'DAYS LOST THIS WEEK: '+ (this.editForm.value.lostWeekDays ? this.editForm.value.lostWeekDays : '0') + ' Days '+ (this.editForm.value.lostWeekHours ? this.editForm.value.lostWeekHours : '0') +' Hours',
                          style: 'testHeader',
                          margin: [ 5, -15, 0, 0 ]
                        },
                      ],
                      margin: [ 0, 20, 0, 0 ],
                    },
                    {
                      stack: [
                        {
                          image: this.pdfImage.bgSubAccThisWeek,
                          width: '265',
                          // margin: [ 0, 20, 0, 0 ]
                        },
                        {
                          text: 'TOTAL DAYS LOST TO DATE: '+ (this.editForm.getRawValue().lostTotalDays ? this.editForm.getRawValue().lostTotalDays : '0') + ' Days '+ (this.editForm.getRawValue().lostTotalHours ? this.editForm.getRawValue().lostTotalHours : '0') +' Hours',
                          style: 'testHeader',
                          margin: [ 5, -15, 0, 0 ]
                        },
                      ],
                      margin: [ 0, 20, 0, 0 ],
                    },
                  ],
                  columnGap: 10
                },
                // {
                //   columns: [
                //     {
                //       text: this.editForm.value.lostWeekDays + ' Days '+ this.editForm.value.lostWeekHours +' Hours',
                //       style: 'testHeader',
                //       margin: [ 103, -11, 0, 0 ],
                //     },
                //     {
                //       text: this.editForm.value.lostTotalDays + ' Days '+ this.editForm.value.lostTotalHours +' Hours',
                //       style: 'testHeader',
                //       margin: [ 202, -11, 0, 0 ],
                //     },
                //   ]
                // },
                {
                  stack: [
                    {
                      columns: [
                        {
                          stack: [
                            {
                              image: this.pdfImage.bgSubAccThisWeek,
                              width: '265',
                              // margin: [ 0, 20, 0, 0 ]
                            },
                            {
                              text: 'TASK THIS WEEK:',
                              style: 'testHeader',
                              margin: [ 5, -15, 0, 0 ]
                            },
                            this.getAccThisWeekList(),
                          ],
                          unbreakable: true,
                          margin: [ 0, 20, 0, 0 ],
                        },
                        {
                          stack: [
                            {
                              image: this.pdfImage.bgSubAccThisWeek,
                              width: '265',
                              // margin: [ 0, 20, 0, 0 ]
                            },
                            {
                              text: 'TASK NEXT WEEK:',
                              style: 'testHeader',
                              margin: [ 5, -15, 0, 0 ]
                            },
                            this.getAccNextWeekList(),
                          ],
                          unbreakable: true,
                          margin: [ 0, 20, 0, 0 ],
                        },
                      ],
                      columnGap: 10
                    }
                  ],
                  unbreakable: true
                },
                {
                  stack: [
                    {
                        columns: [
                          {
                            stack: [
                              {
                                image: this.pdfImage.bgSubAccThisWeek,
                                width: '265',
                                // margin: [ 0, 20, 0, 0 ]
                              },
                              {
                                text: 'TRADES TASKS THIS WEEK:',
                                style: 'testHeader',
                                margin: [ 5, -15, 0, 0 ]
                              },
                              this.getSubThisWeekList(),
                            ],
                            margin: [ 0, 20, 0, 0 ],
                            unbreakable: true
                          },
                          {
                            stack: [
                              {
                                image: this.pdfImage.bgSubAccThisWeek,
                                width: '265',
                                // margin: [ 0, 20, 0, 0 ]
                              },
                              {
                                text: 'TRADES TASKS NEXT WEEK:',
                                style: 'testHeader',
                                margin: [ 5, -15, 0, 0 ]
                              },
                              this.getSubNextWeekList(),
                            ],
                            margin: [ 0, 20, 0, 0 ],
                            unbreakable: true
                          },
                        ],
                        columnGap: 10
                      }
                    ],
                    unbreakable: true
                },
                {
                  stack: [
                    {
                      image: this.pdfImage.bgConSiteThisWeek,
                      width: '535',
                      // margin: [ 0, 20, 0, 0 ]
                    },
                    {
                      text: 'CONSULTANTS ON SITE THIS WEEK:',
                      style: 'testHeader',
                      margin: [ 5, -15, 0, 0 ]
                    },
                    this.getConSiteThisWeekList(),
                  ],
                  unbreakable: true,
                  margin: [ 0, 20, 0, 0 ],
                },
                // {
                //   //  text: this.editForm.value.conSiteThisWeek ? this.editForm.value.conSiteThisWeek: 'N/A', style: 'test', margin: [ 0, 10, 0, 0 ] 
                //   stack:[ this.getConSiteThisWeekList() ]
                // },
                {
                  stack: [
                    {
                      image: this.pdfImage.bgConNeedThisWeek,
                      width: '535',
                      // margin: [ 0, 20, 0, 0 ]
                    },
                    {
                      text: 'CONSULTANTS NEEDED THIS WEEK:',
                      style: 'testHeader',
                      margin: [ 5, -15, 0, 0 ]
                    },
                    this.getConSiteNeedWeekList(),
                  ],
                  unbreakable: true,
                  margin: [ 0, 20, 0, 0 ],
                },

                {
                  stack: [
                    {
                      image: this.pdfImage.bgReqProj,
                      width: '535',
                      // margin: [ 0, 20, 0, 0 ]
                    },
                    {
                      text: 'REQUESTED CHANGES TO THE PROJECT?',
                      style: 'testHeader',
                      margin: [ 5, -15, 0, 0 ]
                    },
                    this.getRequestedChangesList(),
                  ],
                  unbreakable: true,
                  margin: [ 0, 20, 0, 0 ],
                },
                // { 
                //   //text: this.editForm.value.requestedChanges ? this.editForm.value.requestedChanges: 'N/A', style: 'test', margin: [ 0, 10, 0, 0 ]
                //   stack:[ this.getRequestedChangesList() ]
                // },
                {
                  stack: [
                    {
                      image: this.pdfImage.bgClarification,
                      width: '535',
                      // margin: [ 0, 20, 0, 0 ]
                    },
                    {
                      text: 'CLARIFICATION FROM ARCHITECT/ENGINEER/INTERIOR DESIGN:',
                      style: 'testHeader',
                      margin: [ 5, -15, 0, 0 ]
                    },
                    this.getClarificationArchEngList()
                  ],
                  unbreakable: true,
                  margin: [ 0, 20, 0, 0 ],
                },
                // { 
                //   //text: this.editForm.value.clarificationArchEng ? this.editForm.value.clarificationArchEng: 'N/A', style: 'test', margin: [ 0, 10, 0, 0 ]
                //   stack:[ this.getClarificationArchEngList() ]
                // },
                {
                  stack: [
                    {
                      image: this.pdfImage.bgInformation,
                      width: '535',
                      // margin: [ 0, 20, 0, 0 ]
                    },
                    {
                      text: 'INFORMATION NEEDED TO KEEP THINGS MOVING ALONG:',
                      style: 'testHeader',
                      margin: [ 5, -15, 0, 0 ]
                    },
                    this.getInformationNeededList(),
                  ],
                  unbreakable: true,
                  margin: [ 0, 20, 0, 0 ],
                },
                {
                  stack: [
                    {
                      image: this.pdfImage.bgInformation,
                      width: '535',
                      // margin: [ 0, 20, 0, 0 ]
                    },
                    {
                      text: 'UPCOMING MEETINGS:',
                      style: 'testHeader',
                      margin: [ 5, -15, 0, 0 ]
                    },
                    this.getUpcomingMeetings(),
                  ],
                  unbreakable: true,
                  margin: [ 0, 20, 0, 0 ],
                },
                // { 
                //   //text: this.editForm.value.informationNeeded ? this.editForm.value.informationNeeded: 'N/A', style: 'test', margin: [ 0, 10, 0, 0 ]
                //   stack:[ this.getInformationNeededList() ]
                // },
                
                this.getCustomQA(),
                this.previewImage.getUploadedImages(this.editForm.value.imageUpload),
              ], 
              styles: {
                // name: {
                //   fontSize: 16,
                //   bold: true
                // }
                defaultStyle: {
                  fontSize: 8,
                  font: 'Helvetica'
                },
                testcaption: {
                  color: '#050708',
                  fontSize: 8,
                },
                test: {
                    color: '#050708',
                    fontSize: 9,
                },
                test2: {
                  color: '#050708',
                  fontSize: 9,
                  alignment: 'center'
                },
                test3: {
                  color: '#050708',
                  fontSize: 9,
                },
                test4: {
                    color: '#050708',
                    fontSize: 9,
                    alignment: 'right'
                },
                testHeader: {
                  color: '#050708',
                  fontSize: 9,
                },
                testHeader2: {
                  color: '#ffffff',
                  fontSize: 16,
                },
                tableHeader: {
                    fontSize: 8,
                    bold: true,
                    fillColor: '#F0F1F0',
                },
                tableTotal: {
                  fontSize: 8,
                  bold: true,
                  fillColor: '#F0F1F0',
                },
                tableFooter: {
                    fontSize: 8,
                    bold: true,
                    // fillColor: '#F0F1F0',
                }
            }
          }
    }
    
    // addItem(): void {
    //   this.imageUpload.push(
    //       new FormGroup({
    //         'passFirstName': new FormControl(''),
    //         'imageFile': new FormControl(''),
    //       })
    //   );
    // }

    openTaskListDialog(): void {
      console.log(this.taskList);
      const dialogRef = this.dialog.open(WeeklyReportEditListTaskDialog, {
          width: '600px',
          data: this.taskList
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log(result);
        if(result){
          let toMerge = this.editForm.value.dcbAccThisWeek;

          if(toMerge){
            this.editForm.patchValue({
              dcbAccThisWeek:  [...toMerge, ...result]
            });
          }else{
            this.editForm.patchValue({
              dcbAccThisWeek:  result
            });
          }
        }
          

      });
  }

  openTradeTaskListDialog(): void {

    const dialogRef = this.dialog.open(WeeklyReportEditListTradeTaskDialog, {
        width: '600px',
        data: this.tradesTaskList
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
      if(result){
        let toMerge = this.editForm.value.subAccThisWeek;

        if(toMerge){
            this.editForm.patchValue({
              subAccThisWeek:  [...toMerge, ...result]
            });
        }else{
            this.editForm.patchValue({
              subAccThisWeek: result
            });
        }
      }
        
    });
}

  openVisitorListDialog(): void {

      if(this.visitorData){ 
                  
          this.visitorList = []
          console.log(this.visitorData);
          console.log(this.listVisitors);
          this.visitorData.forEach(data =>{ 
              // test.push(...data2)  
                
                // JSON.parse(data).forEach(data3 =>{
                //     console.log(data3);
                //     if( (data3.visitorsOnSite) && (data3.visitorsOnSite != '')  ){

                //       let selectedVisitor = this.listVisitors.find(o => o.id === data3.visitorsOnSite);
                  //    console.log(selectedVisitor);
                      console.log(data);
               //       if(selectedVisitor){
                        this.visitorList.push(data);
                 //     }
                      
                //      console.log(this.visitorList);
                //    }
                // });

              // if(this.visitorList.length > 1){

              //   this.visitorList = Object.values(this.visitorList.reduce((acc,cur)=>Object.assign(acc,{[cur.id]:cur}),{}))

              // }

            
         });
          
          

          console.log(this.visitorList);

      }

      const dialogRef = this.dialog.open(WeeklyReportEditListVisitorDialog, {
          width: '400px',
          data: this.visitorList
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log(result);
        if(result){
          let toMerge = this.editForm.value.conSiteThisWeek;

          if(toMerge){
              this.editForm.patchValue({
                conSiteThisWeek:  [...toMerge, ...result]
              });
          }else{
              this.editForm.patchValue({
                conSiteThisWeek:  result
              });
          }
        }
      });
  }

  openEmailClientDialog(): void {
    let formattedDate = this.formatDate3(this.editForm.value.weekendDate);
    const dialogRef = this.dialog.open(WeeklyReportEditEmailClientDialog, {
        width: '600px',
        data: { projectData:this.projectData, adminData:this.adminData , pdfLink:this.pdfLink, formattedDate}
    });

  }

  openEmailAdminDialog(): void {
    let formattedDate = this.formatDate3(this.editForm.value.weekendDate);
    const dialogRef = this.dialog.open(WeeklyReportEditEmailAdminDialog, {
        width: '600px',
        data: { projectData:this.projectData, adminData:this.adminData , pdfLink:this.pdfLink, formattedDate}
    });

  }

  openSetWeatherDialog(day): void {

      const dialogRef = this.dialog.open(WeeklyReportEditSetWeatherDialog, {
          width: '500px',
          data: this.adminData
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log(result);
        if(result){

              if(day=='saturday'){
                  if(result == 'clear'){
                      this.editForm.patchValue({
                          weatherSaturday: result.weather,
                          weatherOthersSaturday: result.others,
                      });
                  }else{
                      this.editForm.patchValue({
                          weatherSaturday: result.weather,
                          weatherOthersSaturday: result.others,
                      });
                  }

              }else if(day=='sunday'){
                  this.editForm.patchValue({
                      weatherSunday: result.weather,
                      weatherOthersSunday: result.others,
                  });
              }else if(day=='monday'){
                  this.editForm.patchValue({
                      weatherMonday: result.weather,
                      weatherOthersMonday: result.others,
                  });
              }else if(day=='tuesday'){
                  this.editForm.patchValue({
                      weatherTuesday: result.weather,
                      weatherOthersTuesday: result.others,
                  });
              }else if(day=='wednesday'){
                  this.editForm.patchValue({
                      weatherWednesday: result.weather,
                      weatherOthersWednesday: result.others,
                  });
              }else if(day=='thursday'){
                  this.editForm.patchValue({
                      weatherThursday: result.weather,
                      weatherOthersThursday: result.others,
                  });
              }else if(day=='friday'){
                  this.editForm.patchValue({
                      weatherFriday: result.weather,
                      weatherOthersFriday: result.others,
                  });
              }

        }

      });
  }


  // public getTask(){

  //     let end_date= this.editForm.value.fridayDate;
  //     let start_date = new Date(end_date);
  //     start_date.setDate( start_date.getDate() - 6 );

  //     let passData = {
  //         startDate:  start_date,
  //         endDate: end_date,
  //     }

  //     console.log(passData);

  //     this.data_api.getTask(this.projectID, passData).subscribe((data) => {
  //         if(data){  
  //               console.log(data);
  //               this.taskList = data;
  //               this.showAddTaskButton = true;
  //         }
  //     })
  // }
  public getFBWeeklyWorkerLogs(){
      let end_date= this.editForm.value.weekendDate;
      let start_date = new Date(end_date);
      start_date.setDate( start_date.getDate() - 6 );

      this.data_api.getWeeklyTimesheetSpec(this.projectID,start_date, end_date).subscribe(data => {
          console.log(data);
          // this.sundayData = data[0];
          // if(this.sundayData){
          //   if(this.sundayData['imageUpload'].length != 0){this.showAddImageDailyButton= true;}
          // }
          if(data){  

              data.forEach(data =>{ 
                      
                  //this.weeklyImagesWorker.push(data);

                  this.weeklyImagesWorker = this.weeklyImagesWorker.concat(data['imageUpload']);

                  data.accomplishments.forEach(data2 =>{ 
                    console.log(data2);
                    this.taskList.push(data2);
                  })

              })

              if(this.taskList){
                this.showAddTaskWorkerButton = true;
              }

              if(this.weeklyImagesWorker){
                this.showAddImageWorkerButton = true;
              }

          }
      });

  }  

  public getWeeklyWorkerLogs(){
      let end_date= this.editForm.value.fridayDate;
      let start_date = new Date(end_date);
      start_date.setDate( start_date.getDate() - 6 );

      let passData = {
          startDate:  start_date,
          endDate: end_date,
          uploadSource: this.projUploadSource
      }

      console.log(passData);
      console.log(this.taskList);
      this.data_api.getWeeklyWorkerlogs(this.projectID, passData).subscribe((data) => {
          if(data){  
                this.weeklyWorkerLogs = data;
                console.log(data);

                data.forEach(data =>{ 
                    
                    this.weeklyImagesWorker.push(data);

                    JSON.parse(data.notes).forEach(data2 =>{ 
                      console.log(data2);
                      this.taskList.push(data2);
                    })

                })

                if(this.taskList){
                  this.showAddTaskWorkerButton = true;
                }

                if(this.weeklyImagesWorker){
                  this.showAddImageWorkerButton = true;
                }
          }
      })
      console.log(this.taskList);
  }

  public getWeeklyImagesDiary(){

      let end_date= this.editForm.value.fridayDate;
      let start_date = new Date(end_date);
      start_date.setDate( start_date.getDate() - 6 );

      let passData = {
          startDate:  start_date,
          endDate: end_date,
          uploadSource: this.projUploadSource
      }

      console.log(passData);

      this.data_api.getWeeklyImagesDiary(this.projectID, passData).subscribe((data) => {
          if(data){  
                console.log(data);
                this.weeklyImagesDiary = data;

                if(Object.keys(data).length){
                  this.showAddImageDailyButton = true;
                }
          }
      })
  }

  // public getWeeklyImagesWorker(){

  //     let end_date= this.editForm.value.fridayDate;
  //     let start_date = new Date(end_date);
  //     start_date.setDate( start_date.getDate() - 6 );

  //     let passData = {
  //         startDate:  start_date,
  //         endDate: end_date,
  //     }

  //     console.log(passData);

  //     this.data_api.getWeeklyImagesWorker(this.projectID, passData).subscribe((data) => {
  //         if(data){  
  //               console.log(data);
  //               this.weeklyImagesWorker = data;
  //         }
  //     })
  // }

  addImageDiary(): void {

      const dialogRef = this.dialog.open(WeeklyReportEditImageDialog, {
          width: '1000px',
          data: this.weeklyImagesDiary
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log(result);
        
        let imagesLength = this.editForm.value.imageUpload.length;
    
          if(result){
            
            result.forEach(imageFile => {

                    this.addImageUpload();
        
                    this.imageSize.push(imageFile.imageSize);
        
                    let reader = new FileReader(); 
                    const myForm =  (<FormArray>this.editForm.get("imageUpload")).at(imagesLength);
        
                    myForm.patchValue({
                      imageCaption: imageFile.imageCaption,
                      imageSize: imageFile.imageSize,
                      imageFile: imageFile.imageFile,
                      imageStamp: imageFile.imageStamp
                    });

                    this.imageURL.push(imageFile.imageFile);

                    imagesLength++  
                    this.editForm.controls.imageUpload.markAsDirty(); 
            });
            
          }

      });
  }

  addImageWorker(): void {

        const dialogRef = this.dialog.open(WeeklyReportEditImageWorkerDialog, {
            width: '1000px',
            data: this.weeklyImagesWorker
        });

        dialogRef.afterClosed().subscribe(result => {
          console.log(result);

          let imagesLength = this.editForm.value.imageUpload.length;

            if(result){

                  result.forEach(imageFile => {  

                        this.addImageUpload();
            
                        this.imageSize.push(imageFile.imageSize);
            
                        let reader = new FileReader(); 
                        const myForm =  (<FormArray>this.editForm.get("imageUpload")).at(imagesLength);
            
                        myForm.patchValue({
                          imageCaption: imageFile.imageCaption,
                          imageSize: imageFile.imageSize,
                          imageFile: imageFile.imageFile,
                          imageStamp: imageFile.imageStamp
                        });

                        this.imageURL.push(imageFile.imageFile);

                        imagesLength++   
                        this.editForm.controls.imageUpload.markAsDirty();
                  });
                  

            }

        });
    }

    enlargeImage(event,timestamp){
  
      const imgElem = event.target;
      console.log(imgElem);
      
      var target = event.target || event.srcElement || event.currentTarget;
      var srcAttr = target.attributes.src;
      this.imgSrc = srcAttr.nodeValue;
      this.imgStampString = timestamp.toDate();
    }

}


@Component({
  selector: 'weeklyreportedit-list-task-dialog',
  templateUrl: 'weeklyreportedit-list-task-dialog.html',
})

export class WeeklyReportEditListTaskDialog implements OnInit {

  addFestForm: FormGroup;
  test: any = []; 
  
  selectedOptions=[];
  selectedOption;
  emptyMessage = false;

  adminData;

  colorBtnDefault;

 // https://stackblitz.com/edit/angular-hdmfwi?file=app%2Flist-selection-example.ts
  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<WeeklyReportEditListTaskDialog>,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.addFestForm.controls;
  }
  
  ngOnInit() {

    this.getAdminSettings();
    // this.addFestForm = this.formBuilder.group({
    //   stageName: ['', Validators.required],
    // }, {
    // });
    console.log(this.data);

    if(this.data.length > 0){

        this.data.forEach((task) => {
            console.log(task);
            this.test.push(task);
        });

      }else{
          this.emptyMessage = true;
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
  }

  onButtonOut(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
  }

  selectAll(checkAll, select: NgModel, values) {
    //this.toCheck = !this.toCheck;
    console.log(values);
    if(checkAll){
      select.update.emit(values); 
    }
    else{
      select.update.emit([]);
    }
  }

}


@Component({
  selector: 'weeklyreportedit-list-tradetask-dialog',
  templateUrl: 'weeklyreportedit-list-tradetask-dialog.html',
})

export class WeeklyReportEditListTradeTaskDialog implements OnInit {

  addFestForm: FormGroup;
  test: any = []; 
  selectedOptions=[];
  selectedOption;
  emptyMessage = false;

  adminData;

  colorBtnDefault;

 // https://stackblitz.com/edit/angular-hdmfwi?file=app%2Flist-selection-example.ts
  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<WeeklyReportEditListTradeTaskDialog>,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.addFestForm.controls;
  }
  
  ngOnInit() {
    this.getAdminSettings();
    if(this.data.length > 0){

        if(this.data){

            this.data.forEach((task) => {
                console.log(task);
                this.test.push(task);
            });
    
        }

    }else{
        this.emptyMessage = true;
    }

    console.log(this.test);

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

  selectAll(checkAll, select: NgModel, values) {
    //this.toCheck = !this.toCheck;
    console.log(values);
    if(checkAll){
      select.update.emit(values); 
    }
    else{
      select.update.emit([]);
    }
  }
}

@Component({
  selector: 'weeklyreportedit-list-visitors-dialog',
  templateUrl: 'weeklyreportedit-list-visitors-dialog.html',
})

export class WeeklyReportEditListVisitorDialog implements OnInit {

  addFestForm: FormGroup;
  visitorListModal: any = []; 
  //typesOfShoes: string[] = ['Boots', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers'];
  selectedOptions=[];
  selectedOption;
  emptyMessage = false;
  
  adminData;

  colorBtnDefault;

 // https://stackblitz.com/edit/angular-hdmfwi?file=app%2Flist-selection-example.ts
  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<WeeklyReportEditListVisitorDialog>,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.addFestForm.controls;
  }
  
  ngOnInit() {
    // this.addFestForm = this.formBuilder.group({
    //   stageName: ['', Validators.required],
    // }, {
    // });
    this.getAdminSettings();
    if(this.data.length > 0){
      console.log(this.data);
        this.data.forEach((array) => {

            if(array){
                        this.visitorListModal.push(array);

            }

        });

    }else{
        this.emptyMessage = true;
    }

    console.log(this.visitorListModal);

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
@Component({
  selector: 'weeklyreportedit-email-admin-dialog',
  templateUrl: 'weeklyreportedit-email-admin-dialog.html',
})

export class WeeklyReportEditEmailAdminDialog implements OnInit {

  editorConfig: AngularEditorConfig = {
      editable: true,
        spellcheck: true,
        height: 'auto',
        minHeight: '100',
        maxHeight: 'auto',
        width: 'auto',
        minWidth: '0',
        translate: 'yes',
        enableToolbar: true,
        showToolbar: true,
        placeholder: 'Enter text here...',
        defaultParagraphSeparator: '',
        defaultFontName: '',
        defaultFontSize: '',
        fonts: [
          {class: 'arial', name: 'Arial'},
          {class: 'times-new-roman', name: 'Times New Roman'},
          {class: 'calibri', name: 'Calibri'},
          {class: 'comic-sans-ms', name: 'Comic Sans MS'}
        ],
      //   customClasses: [
      //   {
      //     name: 'quote',
      //     class: 'quote',
      //   },
      //   {
      //     name: 'redText',
      //     class: 'redText'
      //   },
      //   {
      //     name: 'titleText',
      //     class: 'titleText',
      //     tag: 'h1',
      //   },
      // ],
      sanitize: true,
      toolbarPosition: 'top',
      toolbarHiddenButtons: [
        ['bold','italic','justifyLeft','justifyCenter','justifyRight','justifyFull'],
        ['toggleEditorMode','customClasses','insertImage','insertVideo']
      ]
  };

  addFestForm: FormGroup;
  visitorListModal: any = []; 
  //typesOfShoes: string[] = ['Boots', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers'];
  selectedOptions=[];
  selectedOption;
  emptyMessage = false;
  
 // https://stackblitz.com/edit/angular-hdmfwi?file=app%2Flist-selection-example.ts
  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<WeeklyReportEditListVisitorDialog>,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    private functions: AngularFireFunctions,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.addFestForm.controls;
  }
  
  ngOnInit() {
    this.addFestForm = this.formBuilder.group({
        adminEmail: [''],
        emailHeader: [''],
        pdfLink: [''],
        cc: [''],
        bcc: [''],
        body: [''],
    });

    console.log(this.data);
    this.addFestForm.patchValue({
      adminEmail: this.data.adminData.adminEmail,
      emailHeader: this.data.adminData.emailHeaderNewUser2,
      pdfLink: this.data.pdfLink,
      // cc : this.data.projectData.clientEmailCC ? this.data.projectData.clientEmailCC : '',
      // bcc : this.data.projectData.clientEmailBCC ? this.data.projectData.clientEmailBCC : '',
    });
  }

  delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
  }

  async sendAdminEmail(){
    
      await this.delay(250);

      if (this.addFestForm.invalid) {
          swal.fire({
              title: "Please fill required fields!",
              buttonsStyling: false,
              customClass: {
                confirmButton: 'btn btn-success',
              },
              icon: "error"
          })
          return;
      }
	
      if( (this.validateEmailList(this.addFestForm.value.cc) == false) || (this.validateEmailList(this.addFestForm.value.bcc) == false)){
        
          let htmlVal = '';

          if(this.validateEmailList(this.addFestForm.value.cc) == false){
            htmlVal += 'Client Email Addresses(CC) <br>'
          }

          if(this.validateEmailList(this.addFestForm.value.bcc) == false){
            htmlVal += 'Client Email Addresses(BCC) <br>'
          }

          swal.fire({
              title: "Please add valid email address to these fields:",
              html: htmlVal,
              buttonsStyling: false,
              customClass: {
                confirmButton: 'btn btn-success',
              },
              icon: "error"
          })

          return;
          
      }
      
      console.log(this.addFestForm.value);
    
      // this.dialogRef.close();
      // return;
      const cc = [];
      const bcc = [];

      let emailsCC = this.addFestForm.value.cc;
      if(emailsCC){
        emailsCC.forEach(email => {
            cc.push({
              Email: email
            });
        });
      }

      let emailsBcc = this.addFestForm.value.bcc;
      if(emailsBcc){
        emailsBcc.forEach(email => {
            bcc.push({
              Email: email
            });
        });
      }
      
      let tempdata = {
        adminEmail: this.data.adminData.adminEmail,
        emailHeader: this.data.adminData.logo, //emailHeaderNewUser2,
        pdfLink: this.data.pdfLink,
        body: this.addFestForm.value.body,
        cc : cc,
        bcc : bcc,
        projectName: this.data.projectData.projectName,
        formattedDate: this.data.formattedDate,
        textSignature:  this.data.adminData.textSignature,
        emailSignature:  this.data.adminData.emailSignature,
      }
      console.log(tempdata);


      this.spinnerService.show();
      const callableTest = this.functions.httpsCallable('sendFBAdminWeeklyReport');
      callableTest(tempdata).subscribe(result => {
        console.log(result)
        this.spinnerService.hide();
        this.dialogRef.close();
        $.notify({
          icon: 'notifications',
          message: 'Email Sent!'
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

  }

  validateEmailList(raw){
      var emails = raw; //raw.split(',')

      var valid = true;
      var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

      for (var i = 0; i < emails.length; i++) {
          if( emails[i] === "" || !regex.test(emails[i].replace(/\s/g, ""))){
              valid = false;
          }
      }
      return valid;
  }

}

@Component({
  selector: 'weeklyreportedit-email-client-dialog',
  templateUrl: 'weeklyreportedit-email-client-dialog.html',
})

export class WeeklyReportEditEmailClientDialog implements OnInit {

  editorConfig: AngularEditorConfig = {
      editable: true,
        spellcheck: true,
        height: 'auto',
        minHeight: '100',
        maxHeight: 'auto',
        width: 'auto',
        minWidth: '0',
        translate: 'yes',
        enableToolbar: true,
        showToolbar: true,
        placeholder: 'Enter text here...',
        defaultParagraphSeparator: '',
        defaultFontName: '',
        defaultFontSize: '',
        fonts: [
          {class: 'arial', name: 'Arial'},
          {class: 'times-new-roman', name: 'Times New Roman'},
          {class: 'calibri', name: 'Calibri'},
          {class: 'comic-sans-ms', name: 'Comic Sans MS'}
        ],
      //   customClasses: [
      //   {
      //     name: 'quote',
      //     class: 'quote',
      //   },
      //   {
      //     name: 'redText',
      //     class: 'redText'
      //   },
      //   {
      //     name: 'titleText',
      //     class: 'titleText',
      //     tag: 'h1',
      //   },
      // ],
      sanitize: true,
      toolbarPosition: 'top',
      toolbarHiddenButtons: [
        ['bold','italic','justifyLeft','justifyCenter','justifyRight','justifyFull'],
        ['toggleEditorMode','customClasses','insertImage','insertVideo']
      ]
  };

  addFestForm: FormGroup;
  visitorListModal: any = []; 
  //typesOfShoes: string[] = ['Boots', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers'];
  selectedOptions=[];
  selectedOption;
  emptyMessage = false;
  
 // https://stackblitz.com/edit/angular-hdmfwi?file=app%2Flist-selection-example.ts
  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<WeeklyReportEditListVisitorDialog>,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    private functions: AngularFireFunctions,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.addFestForm.controls;
  }
  
  ngOnInit() {
    this.addFestForm = this.formBuilder.group({
        adminEmail: [''],
        emailHeader: [''],
        pdfLink: [''],
        to: ['', Validators.required],
        cc: [''],
        bcc: [''],
        body: [''],
    });

    console.log(this.data);
    this.addFestForm.patchValue({
      adminEmail: this.data.adminData.adminEmail,
      emailHeader: this.data.adminData.emailHeaderNewUser2,
      pdfLink: this.data.pdfLink,
      to: this.data.projectData.clientEmail,
      cc : this.data.projectData.clientEmailCC ? this.data.projectData.clientEmailCC : '',
      bcc : this.data.projectData.clientEmailBCC ? this.data.projectData.clientEmailBCC : '',
    });
  }
  
  delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
  }

  async sendClientEmail(){

    await this.delay(250);
    
    console.log(this.addFestForm.value);

    if (this.addFestForm.invalid) {
        swal.fire({
            title: "Please fill required fields!",
            buttonsStyling: false,
            customClass: {
              confirmButton: 'btn btn-success',
            },
            icon: "error"
        })
        return;
    }

    if( (this.validateEmailList(this.addFestForm.value.to) == false) || (this.validateEmailList(this.addFestForm.value.cc) == false) || (this.validateEmailList(this.addFestForm.value.bcc) == false)){
      
      let htmlVal = '';

      if(this.validateEmailList(this.addFestForm.value.to) == false){
        htmlVal += 'Client Email Addresses <br>'
      }

      if(this.validateEmailList(this.addFestForm.value.cc) == false){
        htmlVal += 'Client Email Addresses(CC) <br>'
      }

      if(this.validateEmailList(this.addFestForm.value.bcc) == false){
        htmlVal += 'Client Email Addresses(BCC) <br>'
      }

      swal.fire({
          title: "Please add valid email address to these fields:",
          html: htmlVal,
          buttonsStyling: false,
          customClass: {
            confirmButton: 'btn btn-success',
          },
          icon: "error"
      })

      return;
    }

      // this.dialogRef.close();
      // return;
      const to = [];
      const cc = [];
      const bcc = [];

      let emails = this.addFestForm.value.to;
      if(emails){
        emails.forEach(email => {
            to.push({
                Email: email
            });
        });
      }

      let emailsCC = this.addFestForm.value.cc;
      if(emailsCC){
        emailsCC.forEach(email => {
            cc.push({
              Email: email
            });
        });
      }

      let emailsBcc = this.addFestForm.value.bcc;
      if(emailsBcc){
        emailsBcc.forEach(email => {
            bcc.push({
              Email: email
            });
        });
      }
      
      let tempdata = {
        adminEmail: this.data.adminData.adminEmail,
        emailHeader: this.data.adminData.logo, //emailHeaderNewUser2,
        pdfLink: this.data.pdfLink,
        body: this.addFestForm.value.body,
        to: to,
        cc : cc,
        bcc : bcc,
        projectName: this.data.projectData.projectName,
        formattedDate: this.data.formattedDate,
        textSignature:  this.data.adminData.textSignature,
        emailSignature:  this.data.adminData.emailSignature,
      }

      console.log(tempdata);

      this.spinnerService.show();
      const callableTest = this.functions.httpsCallable('sendFBClientWeeklyReport');
      callableTest(tempdata).subscribe(result => {
        console.log(result)
        this.spinnerService.hide();
        this.dialogRef.close();
        $.notify({
          icon: 'notifications',
          message: 'Email Sent!'
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
  }
  
  validateEmailList(raw){
      var emails = raw; //raw.split(',')

      var valid = true;
      var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

      for (var i = 0; i < emails.length; i++) {
          if( emails[i] === "" || !regex.test(emails[i].replace(/\s/g, ""))){
              valid = false;
          }
      }
      return valid;
  }

}



@Component({
  selector: 'weeklyreportedit-image-dialog',
  templateUrl: 'weeklyreportedit-image-dialog.html',
})

export class WeeklyReportEditImageDialog implements OnInit {

  imageForm: FormGroup;
  imageUpload: FormArray;
  selectedImages=[];
  selectedOption;
  public imageURLRaw = [];
  public imageURL = [];
  public imageSize = [];
  public totalImageSize = 0;

  adminData;

  colorBtnDefault;
  
 // https://stackblitz.com/edit/angular-hdmfwi?file=app%2Flist-selection-example.ts
  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<WeeklyReportEditImageDialog>,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.imageForm.controls;
  }
  
  ngOnInit() {

    this.getAdminSettings();

    this.imageForm = this.formBuilder.group({
      imageUpload: this.formBuilder.array([]),
    }, {
    });
    console.log(this.data);
    if(this.data){

        this.data.forEach((imageArray) => {

            let reader = new FileReader();

            this.imageUpload = this.imageForm.get('imageUpload') as FormArray;
    
            if(imageArray){
                  // for (let test of JSON.parse(imageArray.image_upload)) {                
                            
                            // reader.readAsDataURL(test.image_file);
                    
                            // reader.onload = () => {
                            this.getBase64ImageFromURL(imageArray.imageFile).subscribe((base64Data: string) => {   
          
                                  this.imageURL.push(base64Data);
                                  this.imageURLRaw.push(base64Data);
                                  
                                  this.imageUpload.push(
                                    new FormGroup({
                                      'imageCaption': new FormControl(imageArray.imageCaption),
                                      'imageFile': new FormControl(base64Data),
                                      'imageSize': new FormControl(imageArray.imageSize),
                                      'imageStamp': new FormControl(imageArray.imageStamp)
                                    })
                                  );
                            });
          
                            this.imageSize.push(imageArray.imageSize);
                  // }
            }

        });

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

  getBase64ImageFromURL(url: string): Observable<string> {
    return Observable.create((observer: Observer<string>) => {
      // create an image object
      let img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = url;
      if (!img.complete) {
        // This will call another method that will create image from url
        img.onload = () => {
          observer.next(this.getBase64Image(img));
          observer.complete();
        };
        img.onerror = err => {
          observer.error(err);
        };
      } else {
        observer.next(this.getBase64Image(img));
        observer.complete();
      }
    });
  }

  getBase64Image(img: HTMLImageElement): string {
    // We create a HTML canvas object that will create a 2d image
    var canvas: HTMLCanvasElement = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    let ctx: CanvasRenderingContext2D = canvas.getContext("2d");
    // This will draw image
    ctx.drawImage(img, 0, 0);
    // Convert the drawn image to Data URL
    let dataURL: string = canvas.toDataURL("image/png");
    return dataURL;
    // this.base64DefaultURL = dataURL;
    // return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
  }
  public formatBytes(bytes, decimals = 2) {
      if (bytes === 0) return '0 Bytes';

      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  selectThisImage(index, event){

    console.log(event.target.checked);

    var arrayControl = this.imageForm.get('imageUpload') as FormArray;
    console.log(arrayControl.at(index).value)

    if(event.target.checked === true){

      
      this.selectedImages.push(arrayControl.at(index).value);
      

    }else{

      this.selectedImages = this.selectedImages.filter(obj => obj !== arrayControl.at(index).value);
      
    }

    console.log(this.selectedImages);

  }

  selectImage(index){
    var arrayControl = this.imageForm.get('imageUpload') as FormArray;
    // this.imageURL.splice(index,1);
    // this.imageSize.splice(index,1);
    // this.imageUpload.removeAt(index);
    // const control = <FormArray>this.editForm.controls['imageUpload'];
    // console.log(control);
    // control.removeAt(index)
    // console.log(control);
    // (<FormArray>this.editForm.controls['imageUpload']).removeAt(index);
    // (<FormArray>this.editForm.get('imageUpload')).removeAt(index);
    console.log(arrayControl.at(index).value)

    this.dialogRef.close(arrayControl.at(index).value);

  }

  selectImages(){
    this.dialogRef.close(this.selectedImages);
  }

}


@Component({
  selector: 'weeklyreportedit-image-worker-dialog',
  templateUrl: 'weeklyreportedit-image-worker-dialog.html',
})

export class WeeklyReportEditImageWorkerDialog implements OnInit {

  imageForm: FormGroup;
  imageUpload: FormArray;
  selectedImages=[];
  selectedOption;
  public imageURLRaw = [];
  public imageURL = [];
  public imageSize = [];
  public totalImageSize = 0;

  adminData;

  colorBtnDefault;

 // https://stackblitz.com/edit/angular-hdmfwi?file=app%2Flist-selection-example.ts
  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<WeeklyReportEditImageWorkerDialog>,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.imageForm.controls;
  }
  
  ngOnInit() {
    this.getAdminSettings();
    this.imageForm = this.formBuilder.group({
      imageUpload: this.formBuilder.array([]),
    }, {
    });
    console.log(this.data);
    if(this.data){

        this.data.forEach((imageArray) => {

            let reader = new FileReader();

            this.imageUpload = this.imageForm.get('imageUpload') as FormArray;
    
            if(imageArray){
                        
                            // reader.readAsDataURL(test.image_file);
                    
                            // reader.onload = () => {
                            this.getBase64ImageFromURL(imageArray.imageFile).subscribe((base64Data: string) => {   
          
                                  this.imageURL.push(base64Data);
                                  this.imageURLRaw.push(base64Data);
                                  
                                  this.imageUpload.push(
                                    new FormGroup({
                                      'imageCaption': new FormControl(imageArray.imageCaption),
                                      'imageFile': new FormControl(base64Data),
                                      'imageSize': new FormControl(imageArray.imageSize),
                                      'imageStamp': new FormControl(imageArray.imageStamp),
                                    })
                                  );
                            });
          
                            this.imageSize.push(imageArray.imageSize);
      
            }

        });

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

  getBase64ImageFromURL(url: string): Observable<string> {
    return Observable.create((observer: Observer<string>) => {
      // create an image object
      let img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = url;
      if (!img.complete) {
        // This will call another method that will create image from url
        img.onload = () => {
          observer.next(this.getBase64Image(img));
          observer.complete();
        };
        img.onerror = err => {
          observer.error(err);
        };
      } else {
        observer.next(this.getBase64Image(img));
        observer.complete();
      }
    });
  }

  getBase64Image(img: HTMLImageElement): string {
    // We create a HTML canvas object that will create a 2d image
    var canvas: HTMLCanvasElement = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    let ctx: CanvasRenderingContext2D = canvas.getContext("2d");
    // This will draw image
    ctx.drawImage(img, 0, 0);
    // Convert the drawn image to Data URL
    let dataURL: string = canvas.toDataURL("image/png");
    return dataURL;
    // this.base64DefaultURL = dataURL;
    // return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
  }
  public formatBytes(bytes, decimals = 2) {
      if (bytes === 0) return '0 Bytes';

      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  selectThisImage(index, event){

    console.log(event.target.checked);

    var arrayControl = this.imageForm.get('imageUpload') as FormArray;
    console.log(arrayControl.at(index).value)

    if(event.target.checked === true){

      
      this.selectedImages.push(arrayControl.at(index).value);
      

    }else{

      this.selectedImages = this.selectedImages.filter(obj => obj !== arrayControl.at(index).value);
      
    }

    console.log(this.selectedImages);

  }

  selectImage(index){
    var arrayControl = this.imageForm.get('imageUpload') as FormArray;
    // this.imageURL.splice(index,1);
    // this.imageSize.splice(index,1);
    // this.imageUpload.removeAt(index);
    // const control = <FormArray>this.editForm.controls['imageUpload'];
    // console.log(control);
    // control.removeAt(index)
    // console.log(control);
    // (<FormArray>this.editForm.controls['imageUpload']).removeAt(index);
    // (<FormArray>this.editForm.get('imageUpload')).removeAt(index);
    console.log(arrayControl.at(index).value)

    this.dialogRef.close(arrayControl.at(index).value);

  }

  selectImages(){

    this.dialogRef.close(this.selectedImages);

  }

}


@Component({
  selector: 'weeklyreportedit-set-weather-dialog',
  templateUrl: 'weeklyreportedit-set-weather-dialog.html',
})

export class WeeklyReportEditSetWeatherDialog implements OnInit {

  addFestForm: FormGroup;
  visitorListModal: any = []; 
  //typesOfShoes: string[] = ['Boots', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers'];
  selectedWeather;
  selectedOthers = '';
  isOthersAllDay;
  weatherOptions = [
    {value: 'weatherSunny', viewValue: 'Sunny'},
    {value: 'weatherRainy', viewValue: 'Rainy'},
    {value: 'weatherCloudy', viewValue: 'Cloudy'},
    {value: 'weatherStormy', viewValue: 'Stormy'},
    {value: 'weatherSnowy', viewValue: 'Snowy'},
    {value: 'weatherPartial', viewValue: 'Full and Partial'},
    {value: 'weatherOthers', viewValue: 'Other'},
  ]

  adminData;

  colorBtnDefault;

 // https://stackblitz.com/edit/angular-hdmfwi?file=app%2Flist-selection-example.ts
  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<WeeklyReportEditSetWeatherDialog>,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.addFestForm.controls;
  }
  
  ngOnInit() {
    // this.addFestForm = this.formBuilder.group({
    //   stageName: ['', Validators.required],
    // }, {
    // });
    // if(this.data){
    //   console.log(this.data);
    //     this.data.forEach((array) => {

    //         if(array){
    //                     this.visitorListModal.push(array);

    //         }

    //     });

    // }

    console.log(this.visitorListModal);
    this.adminData = this.data;
    this.colorBtnDefault = this.data.colourEnabledButton ? this.data.colourEnabledButton : '';
  }

  onButtonEnter(hoverName: HTMLElement) {
    hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
    console.log(hoverName);
  }

  onButtonOut(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
  }
  
  public changeAllDayWeather(){

        if(this.selectedWeather == 'weatherOthers'){
            this.isOthersAllDay = 'show';
        }else{
            this.isOthersAllDay = 'hide';
        }
        
    }

    public updateWeather(){
      let result = {
        weather: this.selectedWeather,
        others: this.selectedOthers
      }
        this.dialogRef.close(result);
    }

    public clear(){
      let result = 'clear';
      this.dialogRef.close(result);
    }

}