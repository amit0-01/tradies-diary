import { Component, OnInit, AfterViewInit, Renderer2, ViewChild, ElementRef, Input, Inject} from '@angular/core';
import { DatasourceService} from '../services/datasource.service';
import { LocalDataSource } from 'ng2-smart-table';
import {FormBuilder, FormGroup, Validators, FormArray, FormControl} from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import * as ExcelJS from "exceljs/dist/exceljs.min.js"
import * as fs from 'file-saver'
// import {LegacyPageEvent as PageEvent} from '@angular/material/legacy-paginator';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../services/format-datepicker';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import swal from 'sweetalert2';
import * as moment from 'moment';
import imageCompression from 'browser-image-compression'
import { Observable, Observer } from "rxjs";
import { RoleChecker } from '../services/role-checker.service';
import {ActivatedRoute, Params, Router} from '@angular/router';
import { AuthenticationService } from '../shared/authentication.service';
import {MyService} from '../services/image-upload-service'; 
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from '@angular/fire/compat/storage';
import {  first, reduce, map, finalize  } from 'rxjs/operators';
import { NgxProgressOverlayService } from 'ngx-progress-overlay';
import Tutorial from 'src/app/models/tutorial.model';
import Timesheet from 'src/app/models/timesheet.model';
import { Timestamp } from '@firebase/firestore';

declare const $: any;

@Component({
  selector: 'app-dashboardworker',
  templateUrl: './dashboardworker.component.html',
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS},
  ]
})
export class DashboardWorkerComponent {

  tutorial: Tutorial = new Tutorial();
  timesheet: Timesheet = new Timesheet();
  submitted2 = false;

  tutorials?: Tutorial[];
  currentTutorial?: Tutorial;
  currentIndex = -1;
  title = '';

  selectedProject: any = "";

    timeForm: FormGroup;
    items: Array<any>;
    dayName;
    dateName;
    todayDate;
    totalTime;
    todays_date;
    log_message;
    log_mode;
    currentLog;

    fireItems: Observable<any[]>;

    public projectNames = [];
    public userDetails;
    imageUpload: FormArray;
    public showUpdateUploadButton = false;

    currentWebWorker: true
    maxSizeMB: number = 1
    maxWidthOrHeight: number = 1024

    public prevdata;

    public imageURLRaw = [];
    public imageURL = [];
    public imageURLTBD = [];

    public imageSize = [];
    public totalImageSize = 0;
    
    public projUploadFolder;

    isHovering: boolean;

    files: File[] = [];
    public reportPreviewMode = false;

    breaktimes=[
        {value: '00:00', viewValue: 'No Breaks'},
        {value: '00:15', viewValue: '15 minutes'},
        {value: '00:30', viewValue: '30 minutes'},
        {value: '00:45', viewValue: '45 minute'},
        {value: '01:00', viewValue: '1 hour'},
      ]

    ref: AngularFireStorageReference;
    task: AngularFireUploadTask;
    uploadProgress: Observable<number>;
    allUploadProgress: number[]= [];
    totalPercentage: number;
    uploadState: Observable<string>;
    downloadURL: Observable<string>;
    image: string = null;
    downloadArray= [] ;
    downloadURLs= [] ;
    allPercentage: Observable<number>[] = [];
    submitted = false;
    accountFirebase;
    recentImages;
    recentEntryWorker = [];
    currentTimesheet;
    public passID: any;

    adminData;

    colorBtnDefault;

    constructor(
        private data_api: DatasourceService,
        private formBuilder: FormBuilder,
        private spinnerService: NgxSpinnerService,
        public dialog: MatDialog,
        private renderer2: Renderer2,
        private e: ElementRef,
        private rolechecker: RoleChecker,
        private router: Router,
        public authService: AuthenticationService,
        private myService: MyService,
        private afStorage: AngularFireStorage,
        private progressOverlay: NgxProgressOverlayService,
        private route: ActivatedRoute
        ) { }

        public ngOnInit() {
          this.getAdminSettings();
            // console.log(this.passID);
          //this.getTimesheet();
          //this.getTimesheetSpec();
          
           // this.validateToken();
           // this.rolechecker.check(1)
            if (localStorage.getItem('currentUser')) {
                this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
            }

            this.getFBProjectsWorker();

            this.timeForm = this.formBuilder.group({
                workerID: [''],
                selectedDate: ['', Validators.required],
                // projectName: ['', Validators.required],
                start: ['', Validators.required],
                break: ['', Validators.required],
                finish: ['', Validators.required],
                accomplishments: [this.items, [Validators.required]],
                imageUpload: this.formBuilder.array([]),
                // folderName: [''],
                entryStatus: [''],
                modifiedDate: [''],
                projectId: [''],
                createdAt: [''],
                modifiedAt: [''],
                // uploadFolder: [''],
            });

            this.accountFirebase = this.data_api.getCurrentProject();

            this.getRecentImagesWorker();
            
            //this.getDay();
            //this.getProjects();
      
            //this.todays_date = new Date();
            // let friday;
            // friday = 5 - curr.getDay();
            // fridayDateWeek.setDate(fridayDateWeek.getDate()+friday);
  
            this.timeForm.patchValue({
              workerID:this.userDetails.user_id
            });
    
        }

        getAdminSettings(){
            this.data_api.getFBAdminSettings().subscribe((data) => {
                console.log(data);
                this.adminData = data;
                this.colorBtnDefault = data.colourEnabledButton ? data.colourEnabledButton : '';
                // this.colorHlightDefault = data.colourHighlight ? data.colourHighlight : '';
            }); 
        }
    
        onButtonEnter(hoverName: HTMLElement) {
          hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
          console.log(hoverName);
        }
    
        onButtonOut(hoverName: HTMLElement) {
            hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
        }
        
        getFBProjectsWorker(): void {
          this.data_api.getFBProjectsWorker(this.userDetails.user_id).subscribe(data => {
            console.log(data);

              if(data){
                this.projectNames = data;
              }
              
              this.route.queryParams
              // .filter(params => params.name)
              .subscribe(params => {
                    console.log(params);
    
                    // this.passID = {
                    //   project_id: params['project_id'],
                    //   sel_date: params['sel_date'],
                    // };
    
                    this.timeForm.patchValue({
                      projectId: params.project_id,
                        selectedDate: new Date(params.sel_date+'T00:00'),
                    });
        
                });
    
                if(this.timeForm.value.projectId && this.timeForm.value.selectedDate){
                    this.getTime2();
                }
    
                console.log(this.timeForm.value.projectId);
                console.log(this.timeForm.value.selectedDate);           

            });
        
        }

        // getTimesheet(): void {
        //   this.data_api.getTimesheet().subscribe(data => {
        //     console.log(data);
            
        //     if(data){
       
        //       this.timeForm.patchValue({
        //           finish: data.finish,
        //           start: data.start,
        //           break: data.break,
        //           projectId: data.projectId,
        //           accomplishments: data.accomplishments,
        //       });

        //       this.computeTime();

        //       this.imageUpload = this.timeForm.get('imageUpload') as FormArray;
        //       this.imageUpload.clear();
              
        //       for (let test of data.imageUpload) {                
                                    
        //            this.getBase64ImageFromURL(test.imageFile).subscribe((base64Data: string) => {   
 
        //                  this.imageURL.push(base64Data);
        //                  this.imageURLRaw.push(base64Data);
                         
        //                  this.imageUpload.push(
        //                    new FormGroup({
        //                      'imageCaption': new FormControl(test.imageCaption),
        //                      'imageFile': new FormControl(base64Data),
        //                      'imageSize': new FormControl(test.imageSize),
        //                    })
        //                  );
        //            });

        //          //}
                       

        //         this.imageSize.push(test.imageSize);
        //      }


        //     }
            

        //   });
        // }
        
        toggleHover(event: boolean) {
          this.isHovering = event;
        }

        onDrop(files: FileList) {
          for (let i = 0; i < files.length; i++) {
            this.files.push(files.item(i));
          }
        }

        async upload(event) {
          const id = Math.random().toString(36).substring(2);
          this.ref = this.afStorage.ref(id);
          this.task = this.ref.put(event.target.files[0]);

          // await this.task;
          // console.log('Image uploaded!');
          // this.downloadURL = await this.ref.getDownloadURL().toPromise();

          this.uploadState = this.task.snapshotChanges().pipe(map(s => s.state));
          this.uploadProgress = this.task.percentageChanges();
          //this.downloadURL = this.task.downloadURL();
          this.task.snapshotChanges().pipe(
            finalize(() => {
              this.downloadURL = this.ref.getDownloadURL();
              //this.downloadURL.subscribe(url => (this.image = url));
          })).subscribe();
        }

        // public validateToken(){
        //   this.spinnerService.show();
        //     this.data_api.checkToken().subscribe((data) => {
        //         console.log(data);
        //         if(data.code =='jwt_auth_valid_token'){
        //           this.spinnerService.hide();
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
        //             this.authService.logout();
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
        //           this.authService.logout();
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
        
        public getDay(){
            this.todayDate = new Date();
            //this.dayName = this.todayDate.toLocaleString("en-US", { "weekday": "long" });
            this.dateName = this.todayDate.toDateString();
        }
        public generateTime(){
            this.spinnerService.show();
            this.data_api.getUser(this.userDetails.user_id).subscribe((data) => {
                if( (data[1].start) &&  (data[1].break) && (data[1].finish) ){
                    
                    this.timeForm.patchValue({
                        start: this.cleanTime(data[1].start),
                        break: this.cleanBreak(data[1].break),
                        finish: this.cleanTime(data[1].finish),
                    });
                    this.computeTime();

                }else{

                    swal.fire({
                        title: "The Default time is not properly set",
                        // text: "You clicked the button!",
                        buttonsStyling: false,
                        customClass: {
                          confirmButton: 'btn btn-success',
                        },
                        icon: "error"
                    })

                }
                
                this.spinnerService.hide();

            });

        }

        public cleanTime(data){
          if (data){
            return data[0] + " " + data[1];
          }else{
            return ''
          }
            
        }
    
        public cleanBreak(data){
          if (data){
            return data[0];
          }else{
            return ''
          }
        }

        public computeTime(){

            if( (this.timeForm.value.finish != '') && (this.timeForm.value.start != '') && (this.timeForm.value.break != '') ){
                let timeFinish = moment(this.timeForm.value.finish, 'hh:mm A').format('HH mm');
                let timeStart = moment(this.timeForm.value.start, 'hh:mm A').format('HH mm');
                let timeBreak = moment.duration(this.timeForm.value.break);
                
                let diff = (moment(timeFinish, 'HH:mm').subtract(timeBreak)).diff(moment(timeStart, 'HH:mm'))
                let diffDuration = moment.duration(diff);
                let hours =  Math.floor(diffDuration.asHours());
                let minutes = moment.utc(diff).format("mm");
                this.totalTime = hours +" hours " + minutes + " minutes";
            }

        }

        public addLog(mode,log){

              // let newDetails;
              // newDetails += 'Company:';
              let passData;

              const tempVal = JSON.parse(JSON.stringify(this.timeForm.value));

              let imgCount = this.timeForm.value.imageUpload.length;
              
              tempVal.imageUpload = imgCount;

              let today = new Date();
              if(mode=='create'){
                passData = {
                    todaysDate: today,
                    log: log,
                    method: mode,
                    subject: 'daily-work',
                    subjectID: this.timeForm.value.projectId,
                    subjectDate: this.timeForm.value.selectedDate,
                    data: tempVal,
                    url: window.location.href,
                    userID: this.userDetails.user_id,
                    userName: this.userDetails.name
                }
              }

              if(mode=='update'){
                  passData = {
                      todaysDate: today,
                      log: log,
                      method: mode,
                      subject: 'daily-work',
                      subjectID: this.timeForm.value.projectId,
                      subjectDate: this.timeForm.value.selectedDate,
                      prevdata: this.prevdata,
                      data: tempVal,
                      url: window.location.href,
                      userID: this.userDetails.user_id,
                      userName: this.userDetails.name
                  }
              }
              
              this.data_api.addFBActivityLog(passData).then(() => {
                this.spinnerService.hide();
                 window.location.reload()
              });

              // console.log(passData);
              // this.data_api.addActivityLog(this.userDetails.user_id,passData)
              //   .subscribe(
              //     (result) => {
              //       console.log(result);
              //       // this.dialogRef.close('success');

              //       setTimeout(function(){
              //         window.location.reload();
              //       }, 1000);  

              //     }
              // ); 
        }

        get accomplishments() { return this.timeForm.get('accomplishments'); }

        public async saveStep1(){
                
                console.log(this.timeForm.value);
         
                // if ( this.timeForm.controls.imageUpload.dirty == true) {
                //   this.timeForm.patchValue({
                //     imageDirty: true
                //   });
                // }else{
                //   this.timeForm.patchValue({
                //     imageDirty: false
                //   });
                // }
                
                // this.timeForm.markAllAsTouched();

                if (this.timeForm.invalid) {

                  this.spinnerService.hide();

                        swal.fire({
                            title: "Please fill required fields!",
                            // text: "You clicked the button!",
                            buttonsStyling: false,
                            customClass: {
                                confirmButton: 'btn dcb-btn btn-primary',
                              },
                            icon: "error"
                        })
                        return;
                }

                if(this.timeForm.controls.imageUpload.dirty == true){

                      
                      this.progressOverlay.show('Uploading Images','#0771DE','white','lightslategray',1); 

                      console.log(this.timeForm.value);

                      this.allPercentage = [];
                      let imageLen = this.timeForm.value.imageUpload.length;
                      let imageDone = 0;
                      let i = 0;
                      let rootFolder;

                      let selectedDate = this.timeForm.value.selectedDate
                      let folderName =  moment(selectedDate).format('YYYY-MM-DD');

                      // this.timeForm.patchValue({
                      //   folderName: folderName
                      // });

                     // console.log(this.timeForm.value.folderName);

                      // if(this.log_mode == 'update'){

                      //   for (let imageTBD of this.imageURLTBD) { 
                      //     this.afStorage.storage.refFromURL(imageTBD).delete()
                      //   }
                        
                      // }


                      this.projUploadFolder = this.projectNames.find(o => o.id === this.timeForm.value.projectId)?.uploadFolder;

                      //Delete Current Images
                      // if(this.imageURLTBD.length > 0){
                      //   for (let imageTBD of this.imageURLTBD) { 
                      //     try {
                      //       const response = await this.afStorage.storage.refFromURL(imageTBD).delete();
                      //     } catch (error) {
                      //       console.error('Error:', error);
                      //     }
                        
                      //   }
                      // }
                      
                      for (let image of this.timeForm.value.imageUpload) { 

                          let base64image = image.imageFile;
                          //let id = Math.random().toString(36).substring(2);
                          //let ref = this.afStorage.ref(rootFolder+'/'+this.timeForm.value.uploadFolder+'/Timesheet/'+folderName+'/'+id);
                          let ref = this.afStorage.ref(this.accountFirebase+'/'+this.projUploadFolder+'/Timesheet/'+folderName+'/'+this.userDetails.user_id+'/'+i);
                          //let base64String = base64image.split(',').pop();
                          let task = ref.putString(base64image, 'data_url');
                          let _percentage$ = task.percentageChanges();
                          this.allPercentage.push(_percentage$);
                          
                          task.snapshotChanges().pipe(
                            finalize(() => {
                              ref.getDownloadURL().subscribe((url) => { 

                                console.log(url);
                                let splitName = url.split(/%2..*%2F(.*?)\?alt/);
                                console.log(splitName[1]);
    
                                this.downloadArray.push({
                                    url: url,
                                    nameIndex: splitName[1]
                                });
                                
                                imageDone = imageDone + 1;
                                if(imageDone == imageLen){
                                  this.progressOverlay.hide();
                                  this.saveStep2();
                                } 

                                // this.downloadURLs = this.downloadURLs.concat([url]);
                                // imageDone = imageDone + 1;
                                // if(imageDone == imageLen){
                                //   this.progressOverlay.hide();
                                //   this.saveStep2();
                                // } 
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
                  this.spinnerService.show();
                  this.saveTimesheet();

                }
        }
        saveStep2(){
          this.spinnerService.show();
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
          
          if(this.timeForm.controls.imageUpload.dirty == true){

                let i = 0;
                this.downloadURLs.forEach(imageUrl => {
                  const myForm =  (<FormArray>this.timeForm.get("imageUpload")).at(i);
                  myForm.patchValue({
                    imageFile: imageUrl
                  });
                  i++;
                });

                console.log(this.downloadURLs);
                //console.log(this.downloadURLs.length);
                console.log(this.recentImages);
                //console.log(this.recentImages.length);
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

                this.data_api.setRecentImagesWorker(tempImages).then(() => {
                    this.saveTimesheet();
                })
                .catch(err => {
                  console.log(err);
                });  



          }else{
            this.saveTimesheet();
          }
          
        }

        getRecentImagesWorker(){

          this.data_api.getFBRecent().pipe(first()).subscribe(data => {
            console.log(data);
              if(data.recentImagesWorker){
                  this.recentImages = data.recentImagesWorker;
                  //this.recentImages = data.recentImagesDailyReport.sort((a, b) => (a.order > b.order) ? -1 : 1);
                  console.log(this.recentImages);
              }
              if(data.recentEntryWorker){
                  this.recentEntryWorker = data.recentEntryWorker;
                  //this.recentImages = data.recentImagesDailyReport.sort((a, b) => (a.order > b.order) ? -1 : 1);
                  console.log(this.recentEntryWorker);
              }
              
          });
    
        }

        saveTimesheet(): void {

          if( (this.currentTimesheet) || (this.currentTimesheet != '') ){
              this.updateTimesheet();
          }else{

              
              let today = new Date();
              let dateToday = moment(today).format('DD-MM-YYYY');
        
              let selectedDate = this.timeForm.value.selectedDate
              let selecteddateToday =  moment(selectedDate).format('DD-MM-YYYY');
        
              if( selecteddateToday === dateToday){

                    this.timeForm.patchValue({
                      entryStatus: "on-time"
                    });

              }else{

                if( (selecteddateToday < dateToday)){

                    this.timeForm.patchValue({
                      entryStatus: "late"
                    });
                }
              }

              this.timeForm.patchValue({
                createdAt: new Date(),
              });

              console.log(this.timeForm.value);
              this.data_api.createTimesheet(this.timeForm.value).then(() => {
                console.log('Created new item successfully!');
                this.submitted2 = true;

                $.notify({
                  icon: 'notifications',
                  message: 'Timesheet Submitted.'
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
                let tempEntries = [];  
                tempEntries.push(
                  {
                    workerName: this.userDetails.name,
                    projectName: this.projectNames.find(o => o.id === this.timeForm.value.projectId).projectName,
                    accomplishments: this.timeForm.value.accomplishments,
                    start: this.timeForm.value.start,
                    break: this.timeForm.value.break,
                    finish: this.timeForm.value.finish,
                    selectedDate: this.timeForm.value.selectedDate,
                    order: 1,
                  }); 
                  if(this.recentEntryWorker){
                    if(this.recentEntryWorker.length > 0){
                        for (let i = 1; i <= (5 - 1); i++) {

                          if ( i > this.recentEntryWorker.length) {
                            break;
                          }

                          tempEntries.push(
                            {
                              workerName: this.recentEntryWorker[i - 1].workerName,
                              projectName: this.recentEntryWorker[i - 1].projectName,
                              accomplishments: this.recentEntryWorker[i - 1].accomplishments,
                              start: this.recentEntryWorker[i - 1].start,
                              break: this.recentEntryWorker[i - 1].break,
                              finish: this.recentEntryWorker[i - 1].finish,
                              selectedDate: this.recentEntryWorker[i - 1].selectedDate,
                              order: i + 1,
                            }); 
                        }
                    }
                  }
                this.data_api.setRecentEntryWorker(tempEntries).then(() => {
                  // this.spinnerService.hide();
                  // setTimeout(function(){
                  //   window.location.reload();
                  // }, 2000);  
                  this.addLog('create','Submitted a Daily Work Log');
                })
                
              });

          }
        }

        updateTimesheet(): void {

          let today = new Date();

          this.timeForm.patchValue({
            modifiedDate: today
          });

          this.timeForm.patchValue({
            modifiedAt: new Date(),
          });

          if(this.timeForm.controls.imageUpload.dirty == true){

              // this.spinnerService.show();

              console.log(this.timeForm.value);
              this.data_api.updateFBTimesheet(this.currentTimesheet.id, this.timeForm.value).then(() => {
                console.log('Updated an item successfully!');
                this.submitted2 = true;

                $.notify({
                  icon: 'notifications',
                  message: 'Timesheet Updated.'
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
                let tempEntries = [];  
                tempEntries.push(
                  {
                    workerName: this.userDetails.name,
                    projectName: this.projectNames.find(o => o.id === this.timeForm.value.projectId).projectName,
                    accomplishments: this.timeForm.value.accomplishments,
                    start: this.timeForm.value.start,
                    break: this.timeForm.value.break,
                    finish: this.timeForm.value.finish,
                    selectedDate: this.timeForm.value.selectedDate,
                    order: 1,
                  }); 
                  if(this.recentEntryWorker){
                    if(this.recentEntryWorker.length > 0){
                        for (let i = 1; i <= (5 - 1); i++) {

                          if ( i > this.recentEntryWorker.length) {
                            break;
                          }

                          tempEntries.push(
                            {
                              workerName: this.recentEntryWorker[i - 1].workerName,
                              projectName: this.recentEntryWorker[i - 1].projectName,
                              accomplishments: this.recentEntryWorker[i - 1].accomplishments,
                              start: this.recentEntryWorker[i - 1].start,
                              break: this.recentEntryWorker[i - 1].break,
                              finish: this.recentEntryWorker[i - 1].finish,
                              selectedDate: this.recentEntryWorker[i - 1].selectedDate,
                              order: i + 1,
                            }); 
                        }
                    }
                  }
                this.data_api.setRecentEntryWorker(tempEntries).then(() => {
                  // this.spinnerService.hide();
                  // setTimeout(function(){
                  //   window.location.reload();
                  // }, 2000);  
                  this.addLog('update','Updated a Daily Work Log');
                })
                
              });
          }else{
              // this.spinnerService.show();

              console.log(this.timeForm.value);
              this.data_api.updateFBTimesheetWithoutImage(this.currentTimesheet.id, this.timeForm.value).then(() => {
                console.log('Updated an item successfully!');
                this.submitted2 = true;

                $.notify({
                  icon: 'notifications',
                  message: 'Timesheet Updated.'
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
                let tempEntries = [];  
                tempEntries.push(
                  {
                    workerName: this.userDetails.name,
                    projectName: this.projectNames.find(o => o.id === this.timeForm.value.projectId).projectName,
                    accomplishments: this.timeForm.value.accomplishments,
                    start: this.timeForm.value.start,
                    break: this.timeForm.value.break,
                    finish: this.timeForm.value.finish,
                    selectedDate: this.timeForm.value.selectedDate,
                    order: 1,
                  }); 
                  if(this.recentEntryWorker){
                    if(this.recentEntryWorker.length > 0){
                        for (let i = 1; i <= (5 - 1); i++) {

                          if ( i > this.recentEntryWorker.length) {
                            break;
                          }

                          tempEntries.push(
                            {
                              workerName: this.recentEntryWorker[i - 1].workerName,
                              projectName: this.recentEntryWorker[i - 1].projectName,
                              accomplishments: this.recentEntryWorker[i - 1].accomplishments,
                              start: this.recentEntryWorker[i - 1].start,
                              break: this.recentEntryWorker[i - 1].break,
                              finish: this.recentEntryWorker[i - 1].finish,
                              selectedDate: this.recentEntryWorker[i - 1].selectedDate,
                              order: i + 1,
                            }); 
                        }
                    }
                  }
                this.data_api.setRecentEntryWorker(tempEntries).then(() => {
                  // this.spinnerService.hide();
                  // setTimeout(function(){
                  //   window.location.reload();
                  // }, 2000);  
                  this.addLog('update','Updated a Daily Work Log');
                })
                
              });
          }

        }


        public submitTime(){
          
          // if(this.submitted == true){
          //   return;
          // }else{
          //   this.submitted = true;
          // }

          if(this.timeForm.value.uploadSource == 'google'){
            let i = 0;
            this.downloadURLs.forEach(imageUrl => {
              const myForm =  (<FormArray>this.timeForm.get("imageUpload")).at(i);
              myForm.patchValue({
                imageFile: imageUrl
              });
              i++;
            });
      
          }

          console.log(this.timeForm.value);
  
          this.myService.nextMessage("saveslow");
          this.spinnerService.show();

            let today = new Date();
            let dateToday = moment(today).format('DD-MM-YYYY');
      
            let selectedDate = this.timeForm.value.selectedDate
            let selecteddateToday =  moment(selectedDate).format('DD-MM-YYYY');
      
            if( selecteddateToday === dateToday){

                  this.timeForm.patchValue({
                    entryStatus: "on-time"
                  });

            }else{

              if( (selecteddateToday < dateToday) &&  this.timeForm.value.entryStatus == ''){

                  this.timeForm.patchValue({
                    entryStatus: "late"
                  });

              }else if( (selecteddateToday < dateToday) && (this.timeForm.value.entryStatus == 'on-time') ){

                  this.timeForm.patchValue({
                    modifiedDate: today
                  });

                }else if( (selecteddateToday < dateToday) && (this.timeForm.value.entryStatus == 'late') ){

                  this.timeForm.patchValue({
                    modifiedDate: today
                  });

              }

            }
            
            console.log(this.timeForm.value);

            this.data_api.submitTime(this.timeForm.value).subscribe((data) => {
                console.log(data);
    
                if(data){
                    this.spinnerService.hide();
                    this.myService.nextMessage("false");
                    //this.data_api.updateProjectWeeklyReport(this.timeForm.value).subscribe((data2) => {
    
                      console.log(data);
        

                      swal.fire({
                          title: "Successfully Submitted Time Log",
                          // text: "You clicked the button!",
                          buttonsStyling: false,
                          customClass: {
                            confirmButton: 'btn  dcb-btn btn-success',
                          },
                          icon: "success"
                      })
                      this.addLog(this.log_message,this.log_mode);
                    

                }else{

                      swal.fire({
                          title: "An error occured while saving",
                          // text: "You clicked the button!",
                          buttonsStyling: false,
                          customClass: {
                            confirmButton: 'btn btn-success',
                          },
                          icon: "error"
                      })
                      this.spinnerService.hide();
                      this.myService.nextMessage("false");
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
                this.myService.nextMessage("false");
              })
        }

        public getTime2(){

            if(this.timeForm.value.projectId && this.timeForm.value.selectedDate && this.timeForm.value.selectedDate != 'Invalid Date'){
              this.spinnerService.show();
              console.log(this.timeForm.value.projectId);
              console.log(this.timeForm.value.selectedDate);
              
              this.data_api.getTimesheetSpec(this.timeForm.value.projectId,this.timeForm.value.selectedDate,this.timeForm.value.workerID).subscribe(async data => {
                console.log(data);
                this.currentTimesheet = '';
                  if(data[0]){
                    this.currentTimesheet = data[0];
                        this.timeForm.patchValue({
                            finish: data[0].finish,
                            start: data[0].start,
                            break: data[0].break,
                            accomplishments: data[0].accomplishments,
                            entryStatus: data[0].entryStatus,
                            createdAt:  data[0].createdAt,
                            modifiedAt:  data[0].modifiedAt
                        });
          
                        this.computeTime();
          
                        this.imageUpload = this.timeForm.get('imageUpload') as FormArray;
                        this.imageUpload.clear();
                        this.imageSize = [];
                        this.imageURL= [];
                        this.imageURLTBD = [];
                        
                        const tempVal = JSON.parse(JSON.stringify(this.timeForm.value));
                        this.prevdata = tempVal;

                        if (data[0].imageUpload){

                            let newImageUploadArray = [];

                            for (let img of data[0].imageUpload) {  

                                let splitName = img.imageFile.split(/%2..*%2F(.*?)\?alt/);

                                console.log(splitName[1]);

                                newImageUploadArray.push({
                                    imageCaption: img.imageCaption,
                                    imageFile: img.imageFile,
                                    nameIndex: splitName[1],
                                    imageSize: img.imageSize,
                                    imageStamp: img.imageStamp
                                });      

                            }

                            newImageUploadArray.sort((a, b) => {
                              return a.nameIndex - b.nameIndex;
                            });

                            console.log(newImageUploadArray);


                            for (let img of newImageUploadArray) {   

                                this.imageURLTBD.push(img.imageFile); 

                                // this.getBase64ImageFromURL(img.imageFile).subscribe((base64Data: string) => {   
              
                                //       this.imageURL.push(base64Data);
                                //       this.imageURLRaw.push(base64Data);
                                      
                                //       this.imageUpload.push(
                                //         new FormGroup({
                                //           'imageCaption': new FormControl(img.imageCaption),
                                //           'imageFile': new FormControl(base64Data),
                                //           'imageSize': new FormControl(img.imageSize),
                                //         })
                                //       );
                                // });

                                 const awaitData = await this.getBase64ImageFromURL(img.imageFile).toPromise(); 
                                  console.log(awaitData);
                                    this.imageURL.push(awaitData);
                                    this.imageURLRaw.push(awaitData);
                                    // console.log(awaitData);
                                    this.imageUpload.push(
                                      new FormGroup({
                                        'imageCaption': new FormControl(img.imageCaption),
                                        'imageFile': new FormControl(awaitData),
                                        'imageSize': new FormControl(img.imageSize),
                                        'imageStamp': new FormControl(img.imageStamp)
                                      })
                                    );
                              //}
                                    
              
                              this.imageSize.push(img.imageSize);
                            }

                            let imgCount = data[0].imageUpload.length;
                            tempVal.imageUpload = imgCount;
                            this.prevdata = tempVal;
                            console.log(this.prevdata);
                       }
          
                      this.spinnerService.hide();
                }else{
                   let tempId,tempDate;
                  if(this.timeForm.value.projectId){
                    tempId = this.timeForm.value.projectId
                  }
                  if(this.timeForm.value.selectedDate){
                    tempDate = this.timeForm.value.selectedDate
                  }

                  this.timeForm.reset();

                  if(tempId){
                    this.timeForm.patchValue({
                      projectId: tempId
                    });
                  }
                  if(tempDate){
                    this.timeForm.patchValue({
                      selectedDate: tempDate
                    });
                  }

                  this.timeForm.patchValue({
                    workerID:this.userDetails.user_id
                  });

                  this.imageUpload = this.timeForm.get('imageUpload') as FormArray;
                  this.imageUpload.clear();
                  this.imageSize = [];
                  this.imageURL= [];
                  this.imageURLTBD = [];
                  
                  this.spinnerService.hide();
                }

              });

            }
            
            

        }

        public getTime(){
          
            this.myService.nextMessage("loadslow");
            this.spinnerService.show();

            if(this.timeForm.value.projectName){
                if(this.timeForm.value.projectName.id){
                  this.timeForm.patchValue({
                      projectId: this.timeForm.value.projectName.id,
                  });
                  //console.log(this.timeForm.value.projectName.upload_source);
                }
                if(this.timeForm.value.projectName.upload_source){
                  this.timeForm.patchValue({
                      uploadSource: this.timeForm.value.projectName.upload_source,
                  });
                  //console.log(this.timeForm.value.projectName.upload_source);
                }
                if(this.timeForm.value.projectName.upload_folder){
                  this.timeForm.patchValue({
                      uploadFolder: this.timeForm.value.projectName?.upload_folder,
                  });
                  //console.log(this.timeForm.value.projectName.folder_timesheet_id);
                }
            }

            let passData = {
                selectedDate: this.timeForm.value.selectedDate,
                projectName: this.timeForm.value.projectId,
                userEmail: this.userDetails.user_email,
                uploadSource: this.timeForm.value.uploadSource
            }
            console.log(passData);
            this.data_api.getTime(passData).subscribe((data) => {
                console.log(data);
                this.spinnerService.hide();
                this.myService.nextMessage("false");

                if(data[0]){  
                      console.log(data);
                      this.log_message = 'Updated a Daily Work Log';
                      this.log_mode = 'update';
                      this.currentLog = data[0];

                      this.timeForm.patchValue({
                            start: data[0].start,
                            break: data[0].break,
                            finish: data[0].finish,
                            accomplishments: JSON.parse(data[0].notes),
                            folderName: data[0].folder_name,
                            folderId: data[0].folder_id,
                            entryStatus: data[0].entry_status,
                        });


                        this.computeTime();

                        const tempVal = JSON.parse(JSON.stringify(this.timeForm.value));
                        this.prevdata = tempVal;

                        if (data[0].image_upload){

                          let reader = new FileReader();
          
                          this.imageUpload = this.timeForm.get('imageUpload') as FormArray;
                          this.imageUpload.clear();
                          this.imageURL = [];
                          this.imageURLTBD = [];
                          this.imageSize = [];
                          console.log(data[0].image_upload);
                 
                          for (let test of JSON.parse(data[0].image_upload)) {                
                                    
                                   if(this.timeForm.value.projectName.upload_source  == 'google'){
                                      this.imageURLTBD.push(test.image_file);
                                   }
                                  //     this.imageURL.push(test.image_file);
                                  //     this.imageURLRaw.push(test.image_file);

                                  //       this.imageUpload.push(
                                  //         new FormGroup({
                                  //           'imageCaption': new FormControl(test.image_caption),
                                  //           'imageFile': new FormControl(test.image_file),
                                  //           'imageSize': new FormControl(test.image_size),
                                  //         })
                                  //       );

                                  //   }else{ 

                                      this.getBase64ImageFromURL(test.image_file).subscribe((base64Data: string) => {   
                    
                                            this.imageURL.push(base64Data);
                                            this.imageURLRaw.push(base64Data);
                                            
                                            this.imageUpload.push(
                                              new FormGroup({
                                                'imageCaption': new FormControl(test.image_caption),
                                                'imageFile': new FormControl(base64Data),
                                                'imageSize': new FormControl(test.image_size),
                                                'imageStamp': new FormControl(test.image_size),
                                                
                                              })
                                            );
                                      });

                                    //}
                                          
                
                                          this.imageSize.push(test.image_size);
                                }
                                let imgCount = JSON.parse(data[0].image_upload).length;
                                tempVal.imageUpload = imgCount;
                                this.prevdata = tempVal;
                        }else{
                          
                          this.imageUpload = this.timeForm.get('imageUpload') as FormArray;
                          this.imageUpload.clear();
                          this.imageURL = [];
                          this.imageSize = [];
                        }

                        console.log(this.prevdata);

                        

                }else{

                  swal.fire({
                      title: "You have NO ENTRIES for this date",
                      // text: "You clicked the button!",
                      buttonsStyling: false,
                      customClass: {
                        confirmButton: 'btn btn-success',
                      },
                      icon: "error"
                  })

                  this.spinnerService.hide();
                  this.myService.nextMessage("false");

                  this.currentLog = '';
                  this.log_message = 'Submitted a Daily Work Log';
                  this.log_mode = 'create';
                  this.timeForm.patchValue({
                      start: '',
                      break: '',
                      finish: '',
                      accomplishments: '',
                      folderName: '',
                      folderId: '',
                      totalFileSize: '',
                      entryStatus:  '',
                      modifiedDate:  '',
                      // projectId:  '',
                      // projTimesheetFolderId:  '',
                      // uploadSource:  '',
                      imageDirty:  ''
                  });

                  this.imageUpload = this.timeForm.get('imageUpload') as FormArray;
                  this.imageUpload.clear();
                  this.imageURL = [];
                  this.imageSize = [];
                  this.totalTime = '';
                }
            })
            
        }

        openDeleteDialog(): void {

          const dialogRef = this.dialog.open(TimeDeleteDialog, {
              width: '400px',
              data: this.currentLog
          });
      
          dialogRef.afterClosed().subscribe(result => {
            console.log(result);
            
              if(result){
    
                    if(result.fest_confirm=='DELETE'){ 
    
                        console.log(result);
                        this.spinnerService.show();   
                            console.log(result);
                            this.data_api.deleteTime(result)
                            .subscribe((data3) => {
                                      // alert(data2);   
                                      // if(data2){
                                      //     alert("Updated Successfully");
                                      // }
                                      // alert("Updated Successfully");
                                    swal.fire({
                                        title: "Time Log Deleted!",
                                        // text: "You clicked the button!",
                                        buttonsStyling: false,
                                        customClass: {
                                          confirmButton: 'btn btn-success',
                                        },
                                        icon: "success"
                                    })
                                    this.log_message = 'DELETED a Daily Work Log';
                                    this.addLog(this.log_message,this.log_mode);

                                      this.spinnerService.hide();
                                      // window.location.reload();
                            }); 
            
                    }else{
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

        public getProjects(){
            // this.spinnerService.show();
            let currentUser = JSON.parse((localStorage.getItem('currentUser')));

            this.data_api.getProjectsWorker(currentUser.user_id).subscribe(
              
              (data) => {
                console.log(data)
                    data.forEach(data =>{ 
                        this.projectNames.push(data) 
                    })
              });
        }

        async onFileChange(event, index) {

        this.myService.nextMessage("true");
        this.spinnerService.show();
            if(event.target.files && event.target.files.length) {
      
                  const imageFile = event.target.files[0];
                  
                  const myForm =  (<FormArray>this.timeForm.get("imageUpload")).at(index);
      
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
      
                  console.log(imageFile);
      
                  // Crop Lnadscape images and convert to base64
                  //const imageCropped = await this.fileListToBase64(event.target.files);
      
                  // Convert Base64 to File
                 
                  //console.log(imageCropped);
      
                  // Convert Base64 to File
                  //const compressedFiles = await  Promise.all(
                    //imageCropped.map(async (dataUrl: string) => await imageCompression.getFilefromDataUrl(dataUrl, 'test'))
                  //)
      
      
                  // Compress File
                  //const compressedFiles2 = await  Promise.all(
                    //await compressedFiles.map(async (imageFile: File) => await imageCompression(imageFile, options))
                  //)
                  
                  //console.log(compressedFiles2);
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
      
                  this.timeForm.controls.imageUpload.markAsDirty();
      
            }
          }
      
          async onSelectFile(event) {
              if(event.target.files){
                  this.progressOverlay.show('Compressing Images','#0771DE','white','lightslategray',1);
                  console.log(event);
                  // var options = {
                  //   maxSizeMB: this.maxSizeMB,
                  //   maxWidthOrHeight: 500,
                  //   useWebWorker: this.currentWebWorker,
                  //   maxIteration: 50,
                  //   // onProgress: (p) => {
                  //   //   console.log(p);
                  //   //   this.progressOverlay.setProgress(p);
                  //   //   if(p == 100){
                  //   //     this.progressOverlay.hide();
                  //   //   }
                  //   // }
                  // }
          
                  const imageFiles = Array.from(event.target.files);
                  // try {
                  //   const compressedFiles = await Promise.all(
                  //       await imageFiles.map(async (imageFile: File) => await imageCompression(imageFile, options))
                  //   )

                  // await this.processImages(compressedFiles);

                  // this.progressOverlay.hide();

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
                  this.timeForm.controls.imageUpload.markAsDirty();
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
      
                                crop(event.target.result, 5/6 ).then(canvas => {
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
      
              let imagesLength = this.timeForm.value.imageUpload.length;
              let imageStamp = new Date();

              imageFiles.forEach(imageFile => {
              
                  this.addImageUpload();
      
                  this.imageSize.push(imageFile.size);
      
                  let reader = new FileReader(); 
                  const myForm =  (<FormArray>this.timeForm.get("imageUpload")).at(imagesLength);

                  myForm.patchValue({
                    imageSize: imageFile.size,
                    imageStamp: imageStamp
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
              
              this.timeForm.patchValue({
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

          createImageUpload(): FormGroup {
            return this.formBuilder.group({
              imageCaption: '',
              imageFile: '',
              imageSize: '',
              imageStamp: '',
            });
          }
      
          addImageUpload(): void {
            this.imageUpload = this.timeForm.get('imageUpload') as FormArray;
            this.imageUpload.push(this.createImageUpload());
          }
      
          removeImageUpload(index){
            this.imageUpload = this.timeForm.get('imageUpload') as FormArray;
            this.imageURL.splice(index,1);
            this.imageSize.splice(index,1);
            this.imageUpload.removeAt(index);
            // const control = <FormArray>this.editForm.controls['imageUpload'];
            // console.log(control);
            // control.removeAt(index)
            // console.log(control);
            // (<FormArray>this.editForm.controls['imageUpload']).removeAt(index);
            // (<FormArray>this.editForm.get('imageUpload')).removeAt(index);
            this.timeForm.controls.imageUpload.markAsDirty();
          }
      
          removeLastImageUpload(): void {
            this.imageUpload = this.timeForm.get('imageUpload') as FormArray;
            this.imageUpload.removeAt(this.imageUpload.length - 1)
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


          public changeTimeDialog(control, data): void {
            const dialogRef = this.dialog.open(ChangeTimeDialog, {
                width: '320px',
                data: data
            });
        
            dialogRef.afterClosed().subscribe(result => {
        
                console.log(result);
        
                if(result){  
                    if(control == 'start'){

                      this.timeForm.patchValue({
                        start: result,
                      });
                      this.computeTime();

                    }else if(control == 'finish'){

                      this.timeForm.patchValue({
                        finish: result,
                      });
                      this.computeTime();

                    }
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

    adminData;

    colorBtnDefault;

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
      this.getAdminSettings();
      console.log(this.data)
      let t = this.data; 
      let cdt = moment(t, 'hh:mm A');
      console.log(cdt.format('YYYY-MM-DD HH:mm'));
      this.mytime = cdt.format('YYYY-MM-DD HH:mm');
    }
    
    getAdminSettings(){
        this.data_api.getFBAdminSettings().subscribe((data) => {
            console.log(data);
            this.adminData = data;
            this.colorBtnDefault = data.colourEnabledButton ? data.colourEnabledButton : '';
            // this.colorHlightDefault = data.colourHighlight ? data.colourHighlight : '';
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
  selector: 'time-deletedialog',
  templateUrl: 'time-deletedialog.html',
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
  ]
})

export class TimeDeleteDialog implements OnInit {

  deleteFestForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<TimeDeleteDialog>,
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