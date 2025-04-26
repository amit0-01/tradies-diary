import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Inject, HostListener} from '@angular/core';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../services/format-datepicker';
import { DatasourceService } from '../services/datasource.service';
import { PdfImage } from '../services/pdf-image';
import { PreviewImage } from '../services/preview-image';
import { PDFIcons } from '../services/pdf-icons';
import { Observable, Observer } from 'rxjs';
import swal from 'sweetalert2';
// import * as Chartist from 'chartist';
import { Input } from '@angular/core';
//import * as $$ from 'jQuery';
import { NgxSpinnerService } from "ngx-spinner";
import { AuthenticationService } from '../shared/authentication.service';
import {FormBuilder, FormGroup, Validators, FormArray, FormControl, NgModel} from "@angular/forms";
import { DatePipe } from '@angular/common';
// 16 import {MatLegacyChipInputEvent as MatChipInputEvent} from '@angular/material/legacy-chips';
import {ActivatedRoute, Params, Router} from '@angular/router';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import {ENTER, COMMA} from '@angular/cdk/keycodes';
// import { ImageCompressorService, CompressorConfig } from 'ngx-image-compressor';
import imageCompression from 'browser-image-compression'
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import * as moment from 'moment';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil, startWith } from 'rxjs/operators';
import { MatSelect } from '@angular/material/select';
import {MyService} from '../services/image-upload-service'; 
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDragEnter } from "@angular/cdk/drag-drop";
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from '@angular/fire/compat/storage';
import {  first, reduce, map, finalize  } from 'rxjs/operators';
import { NgxProgressOverlayService } from 'ngx-progress-overlay';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { DeviceDetectorService } from 'ngx-device-detector';
// import { Timestamp } from '@firebase/firestore';
import { MatChipInputEvent } from '@angular/material/chips';

declare const $: any;

@Component({
  selector: 'app-weeklyreport',
  templateUrl: './weeklyreport.component.html',
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS},
    DatePipe
  ]
})
export class WeeklyReportComponent implements OnInit {
  
  // @HostListener("window:beforeunload")  
  // SamplecanDeactivate(): Observable<boolean> | boolean {  
  //     return (  
  //         !this.editForm.dirty  
  //     );  
  // }  

  public userNotes;
  editForm: FormGroup;
  imageUpload: FormArray;
  customQuestion: FormArray;
  public friDate;
  public friDateRaw;
  public aimDateRaw;
  public aimDate;
  public pdfProjectName;
  public projectID;
  public pdfSupervisorName = '';
  public pdfSupervisorEmail = '';
  public pdfSupervisorMobile = '';

  public projectNames:any = [];
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
  public imageURL = [];
  public imageSize = [];
  public totalImageSize = 0;

  public totalHours;
  public rawTotalHrs;
  public rawAimedDate;
  public projectData;
  public adminData;
  public colorBtnDefault;
  
  public rawLostTotalDays = 0;
  public rawLostTotalHours = 0;

  public projJobNumber;
  public projaddress;
  public projUploadSource;
  public projUploadFolder;

  public projImageBackground;
  breakpoint: number;

  public max_date;
  public prevWeekDate;


  public taskList = [];
  public tradesTaskList = [];
  public visitorList = [];
  public visitorData = [];
  
  public listVisitors = []; //store all the names of visitors and owners

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

  //chips
  visible: boolean = true;
  selectable: boolean = true;
  removable: boolean = true;
  addOnBlur: boolean = true;
  // Enter, comma
  separatorKeysCodes = [ENTER, COMMA];

  // public imageUpload = new FormArray([]);
  public filter_list_projects: ReplaySubject<[]> = new ReplaySubject<[]>(1);

  public search_control_project: FormControl = new FormControl();

  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;

  protected _onDestroy = new Subject<void>();

  uploadProgress: Observable<number>;
  allUploadProgress: number[]= [];
  totalPercentage: number;
  allPercentage: Observable<number>[] = [];
  downloadArray= [] ;
  downloadURLs= [] ;
  accountFirebase;
  recentImages;
  recentEntryWeekly = [];
  weekyReportId;

  pdfHeaderImage1;
  pdfHeaderImage2;
  pdfFooterImage;
  deviceInfo;
  pdfLogo;
  pdfCompanyName;

  imgSrc:string;
  imgStampString:string;

  constructor(
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    public authService: AuthenticationService,
    private formBuilder: FormBuilder,
    public pdfImage: PdfImage,
    public pdfIcons:PDFIcons,
    private previewImage: PreviewImage,
    public datepipe: DatePipe,
    private router: Router,
    // private imageCompressor: ImageCompressorService,
    public dialog: MatDialog,
    private myService: MyService,
    private route: ActivatedRoute,
    private afStorage: AngularFireStorage,
    private progressOverlay: NgxProgressOverlayService,
    private afs: AngularFirestore,
    private deviceService: DeviceDetectorService
    ) { }

  public ngOnInit() {

    this.deviceInfo = this.deviceService.getDeviceInfo();

          // this.getUserNotes();
          this.editForm = this.formBuilder.group({
              // imageUploadList: this.imageUpload,
              weekendDate: ['', Validators.required],
              projectId: ['', Validators.required],
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
              folderName: [''],
              projWeeklyFolderId: [''],
              pdfLink: [''],
              reportNumber: [''],
              //dcbAccThisWeek: this.formBuilder.array([]),
              // dcbAccNextWeek: this.formBuilder.array([]),
              // subAccThisWeek: this.formBuilder.array([]),
              // subAccNextWeek: this.formBuilder.array([]),
              // conSiteThisWeek: this.formBuilder.array([]),
              // conSiteNeedWeek: this.formBuilder.array([]),
              // requestedChanges: this.formBuilder.array([]),
              // clarificationArchEng: this.formBuilder.array([]),
              // informationNeeded: this.formBuilder.array([]),
              imageUpload: this.formBuilder.array([]),
              customQuestion: this.formBuilder.array([]),
              createdAt: [''],
              createdBy: ['']
          });

          let curr;
          curr = new Date();
          let fridayDateWeek;
          let fridayDatelastWeek;
          fridayDateWeek = new Date();
          fridayDatelastWeek = new Date();
          let friday;
          friday = 5 - curr.getDay();

          console.log( (fridayDateWeek.getDate()+friday) - 7);

          fridayDatelastWeek.setDate((fridayDateWeek.getDate()+friday) - 7);
          fridayDatelastWeek.setHours(0,0,0,0);

          fridayDateWeek.setDate(fridayDateWeek.getDate()+friday);
          fridayDateWeek.setHours(0,0,0,0);
          // this.editForm.patchValue({
          //   fridayDate: fridayDateWeek
          // });
          
          console.log(fridayDatelastWeek);

          this.max_date = fridayDateWeek;
          this.prevWeekDate = fridayDatelastWeek;

          // let currentUser = JSON.parse((localStorage.getItem('currentUser')));
          // console.log(currentUser);
      
          // if(currentUser.user_role=='project_supervisor'){
          //     this.getSupervisorProjects(currentUser.user_id);
          // }else{
          //   this.getProjects();
          // }

          let currentUser = JSON.parse((localStorage.getItem('currentUser')));

          if(currentUser.userRole=='app_admin'){
              this.getFBProjects();
          }else if(currentUser.userRole=='project_supervisor'){
              this.getSupervisorProjects(currentUser.user_id);
          }

          this.getAdminSettings();

          this.route.queryParams
            .filter(params => params.date)
            .subscribe(params => {
              console.log(params.project); // { order: "popular" }
              console.log(params.date);

              if(params.project && params.date){

                      let fridayDateWeek = new Date();
                      let fridayDatelastWeek = new Date();
               
                      fridayDateWeek = new Date(params.date+'T00:00');
              
                      fridayDatelastWeek.setDate((fridayDateWeek).getDate() - 7);
                      fridayDatelastWeek.setHours(0,0,0,0);

                      console.log(fridayDatelastWeek);
                      this.prevWeekDate = fridayDatelastWeek;
              
                      this.editForm.reset();
              
                      this.editForm.patchValue({
                        weekendDate: fridayDateWeek,
                        projectId: params.project
                      });
              
              
                     // this.projectSelect(params.project);this.editForm.value.projectId
              }
              
            }
          );


          // this.getSupervisors();
          //this.getQuestions();

          // this.breakpoint = window.innerWidth <= 1024 ? 4 : 8;
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

          this.weekyReportId =  this.afs.createId();
       
          if (localStorage.getItem('currentUser')) {
            this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
          }
         // this.getVisitors();
          // this.getProjectOwners();
    }


    getFBProjects() {
     
      this.data_api.getFBProjectsSelection().subscribe(response => {
        console.log(response);
        let data = [];
        for (let item of response.docs) {
            const itemData = item.data();
            itemData.id = item.id;
            data.push(itemData);
        }
        this.projectNames = [];
          if(data){
            data.forEach(data2 =>{ 
              this.projectNames.push(data2)
            })
            console.log(this.projectNames);
          }
          this.initializeFilterProjects();
          this.projectSelect(this.editForm.value.projectId);
      });

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


    ngOnDestroy() {
      this._onDestroy.next();
      this._onDestroy.complete();
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
  
    initializeFilterProjects() {
  
      this.filter_list_projects.next(this.projectNames.slice());
  
        this.search_control_project.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterListProjects();
        });
  
    }

    protected filterListProjects() {
        if (!this.projectNames) {
          return;
        }
        // get the search keyword
        let search = this.search_control_project.value;
        if (!search) {
          this.filter_list_projects.next(this.projectNames.slice());
          return;
        } else {
          search = search.toLowerCase();
        }
        // filter the banks
        this.filter_list_projects.next(
          this.projectNames.filter(projectName => projectName.projectName.toLowerCase().indexOf(search) > -1)
        );
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

    public getVisitors(){
        this.data_api.getVisitors().subscribe((data) => {
          console.log(data);
        if(data){
          data.forEach(data2 =>{      
            this.listVisitors.push({id: data2.id,visitor_name: data2.visitor_name})  
          });
        } 
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
        });
      console.log(this.listVisitors);
    }
  
    changeDate(){
        if(this.editForm.value.weekendDate){
            let fridayDateWeek = new Date();
            let fridayDatelastWeek = new Date();
            let _projectId = this.editForm.value.projectId;

            fridayDateWeek = this.editForm.value.weekendDate;

            fridayDatelastWeek.setDate((fridayDateWeek).getDate() - 7);
            fridayDatelastWeek.setHours(0,0,0,0);
            
            console.log(fridayDatelastWeek);
            this.prevWeekDate = fridayDatelastWeek;

            this.editForm.reset();

            this.editForm.patchValue({
              weekendDate: fridayDateWeek,
              projectId: _projectId
            });


            this.projectSelect(_projectId);
       }
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
      console.log(this.taskList);
      console.log(this.tradesTaskList);
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
            if(this.saturdayData['tradeFormArray'].length > 0){
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

    // Get Data from Diary (excluded images)
  //   getDiaryData(){

  //     this.spinnerService.show();
  //     let end_date= this.editForm.value.weekendDate;
  //     let dateSaturday = new Date(end_date);
  //     let dateSunday = new Date(end_date);
  //     let dateMonday = new Date(end_date);
  //     let dateTuesday= new Date(end_date);
  //     let dateWednesday = new Date(end_date);
  //     let dateThursday= new Date(end_date);
  //     let dateFriday = new Date(end_date);
  
  //     dateSaturday.setDate( dateSaturday.getDate() - 6 );
  //     dateSunday.setDate( dateSunday.getDate() - 5 );
  //     dateMonday.setDate( dateMonday.getDate() - 4 );
  //     dateTuesday.setDate( dateTuesday.getDate() - 3  );
  //     dateWednesday.setDate( dateWednesday.getDate() - 2 );
  //     dateThursday.setDate( dateThursday.getDate() - 1 );
  //     dateFriday.setDate( dateFriday.getDate());
  
  //     let passData = {
  //       dateSaturday:  dateSaturday,
  //       dateSunday:  dateSunday,
  //       dateMonday:  dateMonday,
  //       dateTuesday:  dateTuesday,
  //       dateWednesday:  dateWednesday,
  //       dateThursday:  dateThursday,
  //       dateFriday:  dateFriday,
  //     }
  
  //     this.data_api.getDiaryData(this.projectID, passData).subscribe((data) => {
  //       if(data){ 
  //         console.log(data);
  //               this.saturdayWeath = data[0];
  //               this.sundayWeath = data[1];
  //               this.mondayWeath = data[2];
  //               this.tuesdayWeath = data[3];
  //               this.wednesdayWeath = data[4];
  //               this.thursdayWeath = data[5];
  //               this.fridayWeath = data[6];
  //               this.visitorData =  data[7];
  //               let staffData =  data[8];
  //               let tradeData =  data[9];

  //               if(this.saturdayWeath.length != 0){this.showWeatherSaturdayButton= true;}
  //               if(this.sundayWeath.length != 0){this.showWeatherSundayButton= true;}
  //               if(this.mondayWeath.length != 0){this.showWeatherMondayButton= true;}
  //               if(this.tuesdayWeath.length != 0){this.showWeatherTuesdayButton= true;}
  //               if(this.wednesdayWeath.length != 0){this.showWeatherWednesdayButton= true;}
  //               if(this.thursdayWeath.length != 0){this.showWeatherThursdayButton= true;}
  //               if(this.fridayWeath.length != 0){this.showWeatherFridayButton= true;}

  //               // if(visitorData){ 
                
  //               //       this.visitorList = []
  //               //       console.log(visitorData);
  //               //       visitorData.forEach(data =>{ 
  //               //           // test.push(...data2)  
  //               //           if(JSON.parse(data.visitors_site).length > 0){
      
  //               //             console.log(JSON.parse(data.visitors_site).length);

  //               //                 JSON.parse(data.visitors_site).forEach(data3 =>{
  //               //                   if(data3.visitorsOnSite){
  //               //                       let selectedVisitor = this.listVisitors.find(o => o.id === data3.visitorsOnSite);
  //               //                       if(selectedVisitor){
  //               //                         this.visitorList.push(selectedVisitor);
  //               //                       }

  //               //                   }
  //               //                 });
      
  //               //           }
                        
  //               //       });
                      
  //               //       console.log(this.visitorList);
      
  //               //       if(this.visitorList.length > 1){
  //               //         this.visitorList = Object.values(this.visitorList.reduce((acc,cur)=>Object.assign(acc,{[cur.id]:cur}),{}))
  //               //       }
      
  //               //       console.log(this.visitorList);
      
  //               // }

  //               if(staffData){ 
  //                 console.log(this.taskList);
  //                     staffData.forEach(data =>{ 
   
  //                         if(data.staff_site){

  //                               console.log(this.taskList);

  //                               let staffData_ = JSON.parse(data.staff_site);

  //                               staffData_.forEach(data2 =>{ 
  //                                 // staffTask.push(data2.taskDescription);
  //                                 console.log(data2);

  //                                 data2.taskStaffFormArray.forEach(data3 =>{ 
  //                                     console.log(data3.taskDescription);
  //                                     if (!this.taskList.find(o => o === data3.taskDescription)){
  //                                       this.taskList.push(data3.taskDescription);
  //                                     }
                                      
  //                                 });

  //                               });

  //                         }
                        
  //                     });
                      
  //                     console.log(this.taskList);
        
  //               }

  //               if(tradeData){ 
  //                 console.log(this.tradesTaskList);
  //                     tradeData.forEach(data =>{ 
                        
  //                         if(data.trades_site){


  //                               let tradeData_ = JSON.parse(data.trades_site);

  //                               tradeData_.forEach(data2 =>{ 
  //                                 // staffTask.push(data2.taskDescription);
  //                                 console.log(data2); 

  //                                 data2.tradeStaffFormArray.forEach(data3 =>{ 

  //                                     data3.taskTradeFormArray.forEach(data4 =>{ 
  //                                         console.log(data4.taskDescription);

  //                                         if (!this.tradesTaskList.find(o => o === data4.taskDescription))
  //                                         {
  //                                             this.tradesTaskList.push(data4.taskDescription);
  //                                         }

  //                                     });


  //                                 });

  //                               });

  //                         }
                        
  //                     });
                      
  //                     console.log(this.tradesTaskList);
        
  //               }
  //         }
          
  //         console.log(this.saturdayWeath);
  //         console.log(this.sundayWeath);
  //         console.log(this.mondayWeath);
  //         console.log(this.tuesdayWeath);
  //         console.log(this.wednesdayWeath);
  //         console.log(this.thursdayWeath);
  //         console.log(this.fridayWeath);
  
  //         this.spinnerService.hide();
  //     });
  
  // }

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

                this.spinnerService.hide();

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

    async getFBCounterWeeklyReport(){
      const data =  await this.data_api.getFBCounterWeeklyReport().pipe(take(1)).toPromise();
      console.log(data);
      if(data){
        if(data.reportNumber){
          return data.reportNumber + 1;  
        }else{
          return 1
        }
      }else{
        return 1
      }
    }
    
    public addLog(){
        // let newDetails;
        // newDetails += 'Company:';

        const tempVal = JSON.parse(JSON.stringify(this.editForm.value));

        let imgCount = this.editForm.value.imageUpload.length;
        
        tempVal.imageUpload = imgCount;

        let today = new Date();
        // let passData = {
        //     todaysDate: today,
        //     log: 'Created New Weekly Report',
        //     method: 'create',
        //     subject: 'weekly-report',
        //     subjectID: this.projectID,
        //     subjectDate: this.editForm.value.weekendDate,
        //     data: tempVal,
        //     url: window.location.href
        // }

        let passData = {
            todaysDate: today,
            log: 'Created New Weekly Report',
            method: 'create',
            subject: 'weekly-report',
            subjectID: this.projectID,
            subjectDate: this.editForm.value.weekendDate,
            data: tempVal,
            url: window.location.href,
            userID: this.userDetails.user_id,
            userName: this.userDetails.name
        }

        this.data_api.addFBActivityLog(passData).then(() => {
          this.spinnerService.hide();
          this.router.navigate(['/weekly-report/edit/'+this.weekyReportId]);
        });

        // this.data_api.addFBActivityLog(this.userDetails.user_id,passData)
        //   .subscribe(
        //     (result) => {
        //       console.log(result);

        //       this.router.navigate(['/weekly-report/edit/'+this.weekyReportId]);

        //     }
        // ); 
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public async saveStep1(message){   // Generate and Upload PDF to Firebase

        // Initiate PDF Generation
        this.progressOverlay.show('Uploading Report PDF','#0771DE','white','lightslategray',1); 

        await this.delay(250);

        const report_num = await this.getFBCounterWeeklyReport();
        console.log(report_num);
        this.editForm.patchValue({
          reportNumber: report_num
        });

        this.data_api.updateFBCounterWeeklyReport(report_num).then(() => {
          console.log('Weekly Report Counter incremented!');
        });

        this.friDateRaw = this.editForm.value.weekendDate;
        this.friDate = ('0' + (this.friDateRaw.getDate())).slice(-2) + '-' + ('0' + (this.friDateRaw.getMonth() + 1) ).slice( -2 ) + '-' + this.friDateRaw.getFullYear() ;

        //transform Aimed Completion Date 
        let convertedDateFormat = (this.editForm.getRawValue().aimedComDate).split("/").reverse().join("-");
        
        this.aimDateRaw = new Date(convertedDateFormat);
        this.aimDate = ('0' + (this.aimDateRaw.getDate())).slice(-2) + '-' + ('0' + (this.aimDateRaw.getMonth() + 1) ).slice( -2 ) + '-' + this.aimDateRaw.getFullYear() ;

        const documentDefinition = this.getDocumentDefinition2();

        const pdfDocGenerator = pdfMake.createPdf(documentDefinition);

        //let selectedDate = this.editForm.value.todaysDate
        let folderName =  moment(this.friDateRaw).format('YYYY-MM-DD');
        //let formattedDate = ('0' + (this.todaysDateRaw.getDate())).slice(-2) + '-' + ('0' + (this.todaysDateRaw.getMonth() + 1) ).slice( -2 ) + '-' + this.todaysDateRaw.getFullYear();

        let id = this.friDate +'-'+this.projJobNumber+'.pdf'

        this.accountFirebase = this.data_api.getCurrentProject();
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
                }else if(message=="preview"){
                  window.open(url, "_blank");
                }

                this.saveStep2();
              });
          })).subscribe();

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

    public saveStep2(){  // Upload Files to Firebase

          console.log(this.editForm.value);
        
          // this.editForm.markAllAsTouched();

          // console.log(this.editForm.errors)
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

        if(this.editForm.controls.imageUpload.dirty == true){

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

              this.accountFirebase = this.data_api.getCurrentProject();
              
              for (let image of this.editForm.value.imageUpload) { 

                  let base64image = image.imageFile;
                  let id = Math.random().toString(36).substring(2);
                  let ref = this.afStorage.ref(this.accountFirebase+'/'+this.projUploadFolder+'/Weekly Report/'+folderName+'/'+i);
                  //let base64String = base64image.split(',').pop();
                  let task = ref.putString(base64image, 'data_url');
                  let _percentage$ = task.percentageChanges();
                  this.allPercentage.push(_percentage$);
                  
                  task.snapshotChanges().pipe(
                    finalize(() => {
                      ref.getDownloadURL().subscribe((url) => { 
                      // this.downloadURLs = this.downloadURLs.concat([url]);
                        //console.log(url);
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
          
      }else{
        this.saveReport();
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

    if(this.editForm.controls.imageUpload.dirty == true){

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
                  this.saveReport();
            })
            .catch(err => {
                console.log(err);
            });  



    }else{
      this.saveReport();
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

  saveReport(): void {

      this.spinnerService.show();

      // if(this.editForm.controls.imageUpload.dirty == true){

      //     let i = 0;
      //     this.downloadURLs.forEach(imageUrl => {
      //       console.log(imageUrl);
      //       const myForm =  (<FormArray>this.editForm.get("imageUpload")).at(i);
      //       myForm.patchValue({
      //         imageFile: imageUrl
      //       });
      //       i++;
      //     });
      // } 

      if(this.editForm.controls.imageUpload.dirty != true){
        this.editForm.controls.imageUpload.disable();
      }

      this.editForm.patchValue({
        createdAt: new Date(),
        createdBy: this.userDetails.user_id
      });

      this.data_api.createFBWeeklyReport(this.weekyReportId, this.editForm.value).then(data => {
            console.log(data);
            //this.spinnerService.hide();
            let weekyReportId = data;

            $.notify({
              icon: 'notifications',
              message: 'Weekly Report Saved.'
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

                // CONVERT BACK  IMAGEUPLOAD IMAGES FROM FIREBASE DOWNLOAD URLS TO ORIGINAL BASE64 AFTER SAVING TO FIREBASE
                let i = 0;
                this.imageURL.forEach(imageUrl => {
                const myForm =  (<FormArray>this.editForm.get("imageUpload")).at(i);
                myForm.patchValue({
                  imageFile: imageUrl
                });
                i++;
                });

                this.downloadURLs = [];

            } 

            let tempEntries = [];  

            tempEntries.push(
              {
                projectName: this.pdfProjectName,
                weeklyReportId: this.weekyReportId,
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
              //this.saveStep1();
              //this.router.navigate(['/weekly-report/edit/'+this.weekyReportId]);
              this.data_api.updateFBProjectLostDaysHours( this.projectID, this.editForm.getRawValue().lostTotalDays, this.editForm.getRawValue().lostTotalHours).then(() => {
                this.addLog();
              })

            })
            
      });
    
  }

    // public addReport(){
      

    //   // if( ( !(this.saturdayWeath.length != 0) ||
    //   //  !(this.sundayWeath.length != 0) || !(this.mondayWeath.length != 0) ||
    //   //  !(this.tuesdayWeath.length != 0) || !(this.wednesdayWeath.length != 0) ||
    //   //  !(this.thursdayWeath.length != 0) || !(this.fridayWeath.length != 0)) ){

    //   //   swal.fire({
    //   //           title: "Weekly Weather is Incomplete",
    //   //           // text: "You clicked the button!",
    //   //           buttonsStyling: false,
    //   //           customClass: {
    //   //             confirmButton: 'btn dcb-btn',
    //   //           },
    //   //           icon: "error"
    //   //       })
    //   //       return;
    //   // }  

    //   this.spinnerService.show();
        
        
    //     this.calculateTotalSize();
    //     console.log(this.editForm.value);

    //     if(this.projUploadSource == 'google'){
    //       let i = 0;
    //       this.downloadURLs.forEach(imageUrl => {
    //         const myForm =  (<FormArray>this.editForm.get("imageUpload")).at(i);
    //         myForm.patchValue({
    //           imageFile: imageUrl
    //         });
    //         i++;
    //       });
    
    //     }
        
    //     this.data_api.addWeeklyReport(this.editForm.value).subscribe((data1) => {
    //         console.log(data1);

    //         if(data1){

    //             this.data_api.updateProjectWeeklyReport(this.editForm.value).subscribe((data2) => {

    //               console.log(data2);
    //               this.spinnerService.hide();
    //               swal.fire({
    //                   title: "Successfully Created A Report",
    //                   // text: "You clicked the button!",
    //                   buttonsStyling: false,
    //                   customClass: {
    //                     confirmButton: 'btn dcb-btn',
    //                   },
    //                   icon: "success"
    //               })
    //               this.editForm.markAsPristine();
                  
    //               this.addLog(data1);
    //               //this.router.navigate(['/weekly-report/edit/'+data1]);
    //             })

    //         }
    //     })
    // }

    public getProjects(){
          // this.spinnerService.show();

          this.data_api.getActiveProjects().subscribe((data) => {
              data.forEach(data =>{ 
                  this.projectNames.push(data)
                  
              })

              this.initializeFilterProjects();
          });
    }

    // public getSupervisorProjects(curUserID){
    //     this.spinnerService.show();
    
    //     this.data_api.getProjectsSupervisor(curUserID).subscribe((data) => {
    //           console.log(data);
    //           data.forEach(data =>{ 
    //             this.projectNames.push(data)
    //           }) 

    //           this.getAltSupervisorProjects(curUserID);
    //     })
    // }

    // public getAltSupervisorProjects(curUserID){
    //     this.spinnerService.show();
    
    //     this.data_api.getFBProjectsAltSupervisor(curUserID).subscribe((data) => {
    //           console.log(data);
    //           data.forEach(data =>{ 
    //             this.projectNames.push(data)
    //           }) 

    //           this.initializeFilterProjects();
    //     })
    // }

    public getSupervisorProjects(curUserID){
  
      this.data_api.getFBProjectsSupervisor(curUserID).subscribe((data) => {
  
          data.forEach(data =>{ 
            if (!this.projectNames.find(item => item.id === data.id)) {
              this.projectNames.push(data)
            }
          })
  
          this.getAltSupervisorProjects(curUserID);
      }
        )
    }
  
    public getAltSupervisorProjects(curUserID){
  
      this.data_api.getFBProjectsAltSupervisor(curUserID).subscribe((data) => {
  
          data.forEach(data =>{ 
            if (!this.projectNames.find(item => item.id === data.id)) {
              this.projectNames.push(data)
            }
          })
  
          this.initializeFilterProjects();
      }
        )
    }

    // public getSupervisors(){
    //       // this.spinnerService.show();

    //       this.data_api.getProjectSupervisors().subscribe((data) => {
    //         console.log(data);
    //           data.forEach(data =>{ 
    //               this.siteSupervisors.push({id:JSON.stringify(data.id),name: data.name})
    //           })
    //       });
    // }

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

    public getQuestions(){
        // this.spinnerService.show();

        this.data_api.getQuestions().subscribe((data) => {
            data.forEach(data =>{ 
                this.customQuestions.push(data)
            })
        });
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
      let totalLostProjectHours = totalLostWeekHours + ((+this.rawLostTotalDays * 8) + +this.rawLostTotalHours);

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

    public projectSelect(val){
      console.log(val);
      console.log(this.projectNames);
      let selectedProject = this.projectNames.find(o => o.id == val);

      console.log(selectedProject);
     // this.spinnerService.show();
        //this.data_api.getProject(val).subscribe((data) => {
          //  data.forEach(data =>{ 


            //    let passData = {
            //       endDate: this.editForm.value.fridayDate,
            //        projectName: data.id,
            //   }

                this.data_api.getFBWeeklyReport(val, this.editForm.value.weekendDate).subscribe((data2) => {

                    if(data2.length > 0){

                      console.log(data2);
                      this.editForm.markAsPristine()
                      this.router.navigate(['/weekly-report/edit/'+data2[0].id]);

                    }else{
          
                          //this.rawTotalHrs = selectedProject.totalHours;
                          this.rawAimedDate = selectedProject.aimedComDate.toDate();
                          this.projJobNumber = selectedProject.jobNumber;
                          this.projaddress = selectedProject.projectAddress;
                          //this.projUploadSource = selectedProject.upload_source;
                          this.projUploadFolder = selectedProject.uploadFolder;

                          if(selectedProject.lostTotalDays){
                              if(selectedProject.lostTotalDays > 0){
                                this.rawLostTotalDays = selectedProject.lostTotalDays;
                              }else{
                                this.rawLostTotalDays = 0;
                              }
                          }
                          if(selectedProject.lostTotalHours){
                            if(selectedProject.lostTotalDays > 0){
                              this.rawLostTotalHours = selectedProject.lostTotalHours;
                            }else{
                              this.rawLostTotalHours = 0;
                            }   
                          }

                          this.editForm.patchValue({
                            lostTotalDays: selectedProject.lostTotalDays,
                            lostTotalHours: selectedProject.lostTotalHours,
                            aimedComDate: this.getFinalAimedDate(this.rawAimedDate,this.rawLostTotalDays),
                            siteSupervisor: selectedProject.siteSupervisor,
                          });
                          
                          // if((selectedProject.folder_weekly_id) && (selectedProject.folder_weekly_id != 'null') ){
                          //     this.editForm.patchValue({
                          //       projWeeklyFolderId: selectedProject.folder_weekly_id
                          //     });
                          // }

                          if((selectedProject.uploadFolder) && (selectedProject.uploadFolder != 'null') ){
                              this.editForm.patchValue({
                                uploadFolder: selectedProject.uploadFolder
                              });
                          }

                          // if((data.upload_source) && (data.upload_source != 'null') ){
                          //   this.editForm.patchValue({
                          //     uploadSource: data.upload_source
                          //   });
                          // }

                          this.pdfProjectName = selectedProject.projectName;
                          this.projectID = selectedProject.id;
                          // this.getTask();
                          //this.getWeeklyImagesDiary();
                          // this.getWeeklyImagesWorker();
                          //this.getWeeklyWorkerLogs();
                          //this.getDiaryData();
                          this.spinnerService.hide();
                          this.getSupervisor(selectedProject.siteSupervisor);
                          this.getFBPreviousWeeklyReportData();
                          this.getFBWeeklyWorkerLogs();
                          this.getFBDiaryData();

                    }

                });

          //  })
       // });
        
    }

    public getFBPreviousWeeklyReportData(){

          // let passData = {
          //   prevWeekDate: this.prevWeekDate,
          // }

          console.log(this.projectID);
          console.log(this.prevWeekDate);
          console.log(this.editForm.value.weekendDate);
          this.data_api.getFBWeeklyReport(this.projectID, this.prevWeekDate).subscribe((data) => {
              // if(data.length > 0){  
                
                    console.log(data);
           
                    this.editForm.patchValue({
                        dcbAccThisWeek: data[0].dcbAccNextWeek,
                        subAccThisWeek: data[0].subAccNextWeek,
                    });
                
              // }
          })

    }

    disableWeekend(d: Date) {
      //if(d.getDay() != 0 && d.getDay() != 6) {
      if(d.getDay() == 5) {
        return d;
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

    //     let plusHours = totalHours;
    //     let plusDay = Math.ceil(totalDays + plusHours);
        
    //     let rawAimedDate2 = new Date(aimedDate);

    //     console.log(plusDay);
    //     if(plusDay > 1){
    //       console.log();
    //       return this.formatDate(rawAimedDate2.setDate(rawAimedDate2.getDate() + plusDay));
    //     }else{
    //       return this.formatDate(aimedDate);
    //     }
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

    // onFileChange(event, index) {

    //   if(event.target.files && event.target.files.length) {
    //     const [file] = event.target.files;
    //     const myForm =  (<FormArray>this.editForm.get("imageUpload")).at(index);


    //     const rawFiles: File[] = [].slice.call(event.target.files);
    //     rawFiles.forEach(async (file: File) => {

    //       const config: CompressorConfig = { orientation: 1, ratio: 50, quality: 50, enableLogs: true };
    //       const compressedFile: File = await this.imageCompressor.compressFile(file, config);
    //       console.log(compressedFile);

    //       this.imageSize[index] = compressedFile.size;

    //       let reader = new FileReader();

    //       reader.readAsDataURL(compressedFile);

    //       reader.onload = () => {

    //           myForm.patchValue({
    //             imageFile: reader.result
    //           });
              
    //           this.imageURL[index] = reader.result;

    //       } 

    //     });

    //   }
    // }

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

      //   var options = {
      //     maxSizeMB: this.maxSizeMB,
      //     maxWidthOrHeight: 500,
      //     useWebWorker: this.currentWebWorker,
      //     maxIteration: 50,
      //     onProgress: (p) => {
      //       this.spinnerService.show();
      //       if(p == 100){

      //         setTimeout(() => {
      //           this.spinnerService.hide();
      //           this.myService.nextMessage("false");
      //         }, 3000); 

      //       }
      //     }
      //   }

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


    public reduceRatio(numerator, denominator) {
        var gcd, temp, divisor;
                // from: http://pages.pacificcoast.net/~cazelais/euclid.html
        gcd = function (a, b) { 
            if (b === 0) return a;
            return gcd(b, a % b);
        }
                // take care of some simple cases
        if (!this.isInteger(numerator) || !this.isInteger(denominator)) return '? : ?';
        if (numerator === denominator) return '1 : 1';
                // make sure numerator is always the larger number
        if (+numerator < +denominator) {
            temp        = numerator;
            numerator   = denominator;
            denominator = temp;
        }
                divisor = gcd(+numerator, +denominator);
                return 'undefined' === typeof temp ? (numerator / divisor) + ' : ' + (denominator / divisor) : (denominator / divisor) + ' : ' + (numerator / divisor);
    };

    public isInteger(value) {
        return /^[0-9]+$/.test(value);
    };

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

    // }

    // public calculateTotalSize(){
    //     this.totalImageSize = 0;
    //     let imagesLength = this.editForm.value.imageUpload.length;
        
    //     for (let i = 0; i < imagesLength; i++) {
    //       this.totalImageSize = this.totalImageSize + this.imageSize[i];
    //     }

    //     console.log( this.formatBytes(this.totalImageSize) );
    //     this.editForm.patchValue({
    //       totalFileSize: this.totalImageSize
    //     });
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
    
    public test(){
      console.log(this.editForm.value.imageUpload);
    }
    
    trackByFn(index: number, item: any) {
      console.log(index);
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
        imageFile: '',
        imageSize: '',
        imageStamp: ''
      });
    }

    addImageUpload(): void {
      this.imageUpload = this.editForm.get('imageUpload') as FormArray;
      this.imageUpload.push(this.createImageUpload());
    }

    removeImageUpload(index){
      this.imageUpload = this.editForm.get('imageUpload') as FormArray;
      this.imageURL.splice(index,1);
      this.imageSize.splice(index,1);
      this.imageUpload.removeAt(index);

      this.editForm.controls.imageUpload.markAsDirty();
      // const control = <FormArray>this.editForm.controls['imageUpload'];
      // console.log(control);
      // control.removeAt(index)
      // console.log(control);
      // (<FormArray>this.editForm.controls['imageUpload']).removeAt(index);
      // (<FormArray>this.editForm.get('imageUpload')).removeAt(index);
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

    public submitForApproval(){

      return;

      this.spinnerService.show();

        //transform Friday Date
        this.friDateRaw = this.editForm.value.fridayDate;
        this.friDate = ('0' + (this.friDateRaw.getDate())).slice(-2) + '-' + ('0' + (this.friDateRaw.getMonth() + 1) ).slice( -2 ) + '-' + this.friDateRaw.getFullYear() ;

        //transform Aimed Completion Date 
        this.aimDateRaw = this.editForm.value.aimedComDate;
        this.aimDate = ('0' + (this.aimDateRaw.getDate())).slice(-2) + '-' + ('0' + (this.aimDateRaw.getMonth() + 1) ).slice( -2 ) + '-' + this.aimDateRaw.getFullYear() ;

        // const documentDefinition = { content: 'This is an sample PDF printed with pdfMake' };
        const documentDefinition = this.getDocumentDefinition();

        const pdfDocGenerator = pdfMake.createPdf(documentDefinition);

        pdfDocGenerator.getBase64((data) => {
              console.log(data);
              // this.data_api.submitForApproval(data).subscribe((result) => {
                
              //   console.log(result);

              //   if(result){
      
              //       swal({
              //           title: "Form Submitted for Approval",
              //           // text: "You clicked the button!",
              //           buttonsStyling: false,
              //           confirmButtonClass: "btn btn-success",
              //           type: "success"
              //       }).catch(swal.noop)
      
              //     this.spinnerService.hide();
      
              //   }else{
      
              //     swal({
              //         title: "Error in Submitting the Form",
              //         // text: "You clicked the button!",
              //         buttonsStyling: false,
              //         confirmButtonClass: "btn btn-success",
              //         type: "error"
              //     }).catch(swal.noop)
      
              //     this.spinnerService.hide();
      
              //   }
      
              // });

        });

    }

    // public generatePdf(){

    //     //transform Friday Date
    //     this.friDateRaw = this.editForm.value.weekendDate;
    //     this.friDate = ('0' + (this.friDateRaw.getDate())).slice(-2) + '-' + ('0' + (this.friDateRaw.getMonth() + 1) ).slice( -2 ) + '-' + this.friDateRaw.getFullYear() ;

    //     //transform Aimed Completion Date 
    //     this.aimDateRaw = this.editForm.value.aimedComDate;
    //     this.aimDate = ('0' + (this.aimDateRaw.getDate())).slice(-2) + '-' + ('0' + (this.aimDateRaw.getMonth() + 1) ).slice( -2 ) + '-' + this.aimDateRaw.getFullYear() ;

    //     // const documentDefinition = { content: 'This is an sample PDF printed with pdfMake' };
    //     const documentDefinition = this.getDocumentDefinition();
    //     //pdfMake.createPdf(documentDefinition).download('test.pdf');
    //     pdfMake.createPdf(documentDefinition).open();

    //  }

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
                                width: '510',
                                // margin: [ 0, 20, 0, 0 ]
                              },
                              {
                                text: info.custQuestion,
                                style: 'testHeader',
                                margin: [ 5, -15, 0, 0 ]
                              },
                          ],
                          margin: [ 0, 20, 0, 0 ],
                        },
                        {
                          text: info.custAnswer,
                          style: 'test',
                          margin: [ 0, 10, 0, 0 ],
                        }
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
      
    // return [ 
    //       {
    //         stack: [
    //             // {
    //             //   image: info.imageFile,
    //             //   width: 250,

    //             // },
    //             {
    //               text: info.imageCaption+'-'+index,
    //               style: 'testHeader',

    //             },
    //         ],
    //         margin: [ 0, 20, 0, 0 ],
    //         width: '50%',
    //       },
    // ]

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


    getUploadedImages() {
      let accsList = this.editForm.value.imageUpload;
      let imageMasonry = [];
      //accsList[1].imageCaption;
      if(accsList.length == 1){
        imageMasonry.push([
          {
              columns: [ 
                  { 
                        image: accsList[0].imageFile,
                        width: 250,
                  },   
              ],
              columnGap: 20,
              margin: [ 0, 20, 0, 0 ],
          },
          {
              columns: [ 
                  { 
                        text: accsList[0].imageCaption, 
                        style: 'test',
                  },
              ],
              columnGap: 20,
              margin: [ 0, 10, 0, 0 ],
          },
        ])
      }
      else if(accsList.length == 2){
        imageMasonry.push([
          {
              columns: [ 
                  { 
                        image: accsList[0].imageFile,
                        width: 250,
                  },
                  { 
                        image: accsList[1].imageFile,
                        width: 250,
                  },    
              ],
              columnGap: 20,
              margin: [ 0, 20, 0, 0 ],
          },
          {
              columns: [ 
                  { 
                        text: accsList[0].imageCaption, 
                        style: 'test',
                  },
                  { 
                        text: accsList[1].imageCaption, 
                        style: 'test',
                  },
              ],
              columnGap: 20,
              margin: [ 0, 10, 0, 0 ],
          },
        ])
      }
      return imageMasonry;
    }

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
          title: 'DCB Weekly Report',
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
                  text: 'DAYS LOST THIS WEEK: '+(this.editForm.value.lostWeekDays ? this.editForm.value.lostWeekDays : '0') + ' Days '+ (this.editForm.value.lostWeekHours ? this.editForm.value.lostWeekHours : '0') +' Hours',
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
                  text: 'TOTAL DAYS LOST TO DATE: '+(this.editForm.getRawValue().lostTotalDays ? this.editForm.getRawValue().lostTotalDays : '0') + ' Days '+ (this.editForm.getRawValue().lostTotalHours ? this.editForm.getRawValue().lostTotalHours : '0') +' Hours',
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

        const dialogRef = this.dialog.open(WeeklyReportListTaskDialog, {
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

        const dialogRef = this.dialog.open(WeeklyReportListTradeTaskDialog, {
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
                  subAccThisWeek:  result
                });
            }
          }
          
        });
    }

    openVisitorListDialog(): void {

      
      if(this.visitorData){ 
                
          this.visitorList = []
          console.log(this.visitorData);
          this.visitorData.forEach(data =>{ 
              // test.push(...data2)  
              // if(JSON.parse(data.visitors_site).length > 0){

              //   console.log(JSON.parse(data.visitors_site).length);

              //       JSON.parse(data.visitors_site).forEach(data3 =>{
              //         if(data3.visitorsOnSite){
              //             let selectedVisitor = this.listVisitors.find(o => o.id === data3.visitorsOnSite);
              //             if(selectedVisitor){
                            this.visitorList.push(data);
              //             }

              //         }
              //       });

              // }
            
          });
          
          // console.log(this.visitorList);

          // if(this.visitorList.length > 1){
          //   this.visitorList = Object.values(this.visitorList.reduce((acc,cur)=>Object.assign(acc,{[cur.id]:cur}),{}))
          // }

          console.log(this.visitorList);

    }


      const dialogRef = this.dialog.open(WeeklyReportListVisitorDialog, {
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

  openSetWeatherDialog(day): void {

      const dialogRef = this.dialog.open(WeeklyReportSetWeatherDialog, {
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
    //Get Worker Logs Images
    public getWeeklyWorkerLogs(){
          let end_date= this.editForm.value.weekendDate;
          let start_date = new Date(end_date);
          start_date.setDate( start_date.getDate() - 6 );

          let passData = {
              startDate:  start_date,
              endDate: end_date,
              uploadSource: this.projUploadSource
          }

          console.log(passData);

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
    }

    // Get images from Daily Reports
    public getWeeklyImagesDiary(){

        let end_date= this.editForm.value.weekendDate;
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

        const dialogRef = this.dialog.open(WeeklyReportImageDialog, {
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

        const dialogRef = this.dialog.open(WeeklyReportImageWorkerDialog, {
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
  selector: 'weeklyreport-list-task-dialog',
  templateUrl: 'weeklyreport-list-task-dialog.html',
})

export class WeeklyReportListTaskDialog implements OnInit {

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
    public dialogRef: MatDialogRef<WeeklyReportListTaskDialog>,
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
  selector: 'weeklyreport-list-tradetask-dialog',
  templateUrl: 'weeklyreport-list-tradetask-dialog.html',
})

export class WeeklyReportListTradeTaskDialog implements OnInit {

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
    public dialogRef: MatDialogRef<WeeklyReportListTradeTaskDialog>,
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
  selector: 'weeklyreport-list-visitors-dialog',
  templateUrl: 'weeklyreport-list-visitors-dialog.html',
})

export class WeeklyReportListVisitorDialog implements OnInit {

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
    public dialogRef: MatDialogRef<WeeklyReportListVisitorDialog>,
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
    if(this.data.length > 0){
      this.emptyMessage = false;
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
  selector: 'weeklyreport-image-dialog',
  templateUrl: 'weeklyreport-image-dialog.html',
})

export class WeeklyReportImageDialog implements OnInit {

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
        public dialogRef: MatDialogRef<WeeklyReportImageDialog>,
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
                    //for (let test of JSON.parse(imageArray.image_upload)) {                
                              
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
                    //}
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
        // var arrayControl = this.imageForm.get('imageUpload') as FormArray;
        // // this.imageURL.splice(index,1);
        // // this.imageSize.splice(index,1);
        // // this.imageUpload.removeAt(index);
        // // const control = <FormArray>this.editForm.controls['imageUpload'];
        // // console.log(control);
        // // control.removeAt(index)
        // // console.log(control);
        // // (<FormArray>this.editForm.controls['imageUpload']).removeAt(index);
        // // (<FormArray>this.editForm.get('imageUpload')).removeAt(index);
        // console.log(arrayControl.at(index).value)

        this.dialogRef.close(this.selectedImages);

      }

}

@Component({
  selector: 'weeklyreport-image-worker-dialog',
  templateUrl: 'weeklyreport-image-worker-dialog.html',
})

export class WeeklyReportImageWorkerDialog implements OnInit {

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
        public dialogRef: MatDialogRef<WeeklyReportImageWorkerDialog>,
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
                    //  for (let test of JSON.parse(imageArray.image_upload)) {                
                                
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
        // var arrayControl = this.imageForm.get('imageUpload') as FormArray;
        // // this.imageURL.splice(index,1);
        // // this.imageSize.splice(index,1);
        // // this.imageUpload.removeAt(index);
        // // const control = <FormArray>this.editForm.controls['imageUpload'];
        // // console.log(control);
        // // control.removeAt(index)
        // // console.log(control);
        // // (<FormArray>this.editForm.controls['imageUpload']).removeAt(index);
        // // (<FormArray>this.editForm.get('imageUpload')).removeAt(index);
        // console.log(arrayControl.at(index).value)

        this.dialogRef.close(this.selectedImages);

      }

}


@Component({
  selector: 'weeklyreport-set-weather-dialog',
  templateUrl: 'weeklyreport-set-weather-dialog.html',
})

export class WeeklyReportSetWeatherDialog implements OnInit {

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
    public dialogRef: MatDialogRef<WeeklyReportSetWeatherDialog>,
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