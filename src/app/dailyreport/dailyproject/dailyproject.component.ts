import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Inject, HostListener, NgZone} from '@angular/core';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../services/format-datepicker';
import { DatasourceService } from '../../services/datasource.service';
import { PdfImage } from '../../services/pdf-image';
import { PDFIcons } from '../../services/pdf-icons';
import { PreviewImage } from '../../services/preview-image';
import { BehaviorSubject, Observable, Observer } from 'rxjs';
import swal from 'sweetalert2';
// import * as Chartist from 'chartist';
import { Input } from '@angular/core';
//import * as $$ from 'jQuery';
import { NgxSpinnerService } from "ngx-spinner";
import { AuthenticationService } from '../../shared/authentication.service';
import {FormBuilder, FormGroup, Validators, FormArray, FormControl} from "@angular/forms";
import { DatePipe } from '@angular/common';
// 16 import {MatLegacyChipInputEvent as MatChipInputEvent} from '@angular/material/legacy-chips';
import {ActivatedRoute, Params, Router, ParamMap} from '@angular/router';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import {ENTER, COMMA} from '@angular/cdk/keycodes';
// import { ImageCompressorService, CompressorConfig } from 'ngx-image-compressor';
import imageCompression from 'browser-image-compression';
import {DailyProjectViewWorkerImageDialog, DailyProjectWorkerImageRenderComponent} from './dailyprojectworkerimagebutton-render.component';
import {DailyProjectWorkerAcceptRenderComponent} from './dailyprojectworkeracceptbutton-render.component';
// import {DailyProjectMaterialsRenderComponent} from './dailyprojectmaterialsbutton-render.component';
// import {DailyProjectStagesRenderComponent} from './dailyprojectstagesbutton-render.component';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { LocalDataSource } from 'ng2-smart-table';
import {v4 as uuidv4} from 'uuid';
import { RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { ProductsAddDialog } from 'src/app/products/products.component';
import * as moment from 'moment';
// import { SampleChangesGuard } from '../../shared/unsaved-changes-guard';
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDragEnter } from "@angular/cdk/drag-drop";
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil, startWith } from 'rxjs/operators';
import { MatSelect } from '@angular/material/select';
import {MyService} from '../../services/image-upload-service'; 
import {WorkerLogsDeleteDialog, WorkerLogsRenderComponent, WorkersLogDialog} from './workerlogs-render.component';
import {Location} from '@angular/common'; 
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from '@angular/fire/compat/storage';
import {  first, reduce, map, finalize  } from 'rxjs/operators';
import { NgxProgressOverlayService } from 'ngx-progress-overlay';
import { AngularFirestore, AngularFirestoreCollection  } from '@angular/fire/compat/firestore';
import { Timestamp } from '@firebase/firestore';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatChipInputEvent } from '@angular/material/chips';

export interface DragDropListItem {
  id: string;
  title: string;
  description: string;
}

export interface DragDropListImage {
  imageCaption: string;
  imageFile: string;
  imageSize: string;
  imageStamp: string
}

declare const $: any;

@Component({
  selector: 'app-dailyproject',
  templateUrl: './dailyproject.component.html',
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS},
    DatePipe
  ],
  styles : [`
  :host ::ng-deep .material-icons {
    font-size: 13px;
    color: black;
  }
    `]
})
export class DailyProjectComponent implements OnInit  {
  @ViewChild('stickyMenu') menuElement: ElementRef;
  modifiedById: any;
  previouslyUpdatedBy:any
  Interval:any
  dtOptions = {
    paging: false,
    searching: false,
    data: [], 
    columns: [],
    destroy : true,
      select: {
    style: 'multi',
    selector: 'td:first-child'
  }
  }
  workerOptions = structuredClone( this.dtOptions); 
  workerOptionsArchive = structuredClone( this.dtOptions); 
  workerDtTrigger: Subject<any> = new Subject<any>();
  workerDtTriggerArchieve : Subject<any> = new Subject<any>();

  // @HostListener("window:beforeunload")  
  // SamplecanDeactivate(): Observable<boolean> | boolean {  
  //     return (  
  //         // !this.editForm.dirty  
  //         !this.editForm.controls.weatherResidual.dirty &&
  //         !this.editForm.controls.weatherPerfect.dirty &&
  //         !this.editForm.controls.weatherMaxTemp.dirty &&
  //         !this.editForm.controls.weatherMinTemp.dirty &&
  //         !this.editForm.controls.weatherMorning.dirty &&
  //         !this.editForm.controls.weatherMidDay.dirty &&
  //         !this.editForm.controls.weatherAfternoon.dirty &&
  //         !this.editForm.controls.weatherEvening.dirty &&
  //         !this.editForm.controls.weatherOnOff.dirty &&
  //         !this.editForm.controls.weatherAllDay.dirty &&
  //         !this.editForm.controls.weatherRestOfDay.dirty &&
  //         !this.editForm.controls.weatherOthersMorning.dirty &&
  //         !this.editForm.controls.weatherOthersMidDay.dirty &&
  //         !this.editForm.controls.weatherOthersAfternoon.dirty &&
  //         !this.editForm.controls.weatherOthersEvening.dirty &&
  //         !this.editForm.controls.weatherOthersOnOff.dirty &&
  //         !this.editForm.controls.weatherOthersAllDay.dirty &&
  //         !this.editForm.controls.weatherOthersRestOfDay.dirty &&
  //         !this.editForm.controls.toolboxTalk.dirty &&
  //         !this.editForm.controls.toolboxForm.dirty &&
  //         !this.editForm.controls.toolboxRequired.dirty &&
  //         !this.editForm.controls.toolboxNotes.dirty &&
  //         !this.editForm.controls.toolboxInput.dirty &&
  //         !this.editForm.controls.safetyWalk.dirty &&
  //         !this.editForm.controls.safetyForm.dirty &&
  //         !this.editForm.controls.safetyRequired.dirty &&
  //         !this.editForm.controls.safetyNotes.dirty &&
  //         !this.editForm.controls.safetyInput.dirty &&
  //         !this.editForm.controls.accidentReport.dirty &&
  //         !this.editForm.controls.accidentForm.dirty &&
  //         !this.editForm.controls.accidentRequired.dirty &&
  //         !this.editForm.controls.accidentNotes.dirty &&
  //         !this.editForm.controls.accidentInput.dirty &&
  //         !this.editForm.controls.ppeReport.dirty &&
  //         !this.editForm.controls.ppeForm.dirty &&
  //         !this.editForm.controls.ppeRequired.dirty &&
  //         !this.editForm.controls.ppeNotes.dirty &&
  //         !this.editForm.controls.ppeInput.dirty &&
  //         !this.editForm.controls.instructionsReceived.dirty &&
  //         !this.editForm.controls.delays.dirty &&
  //         !this.editForm.controls.toolsUsed.dirty &&
  //         !this.editForm.controls.damageReport.dirty &&
  //         !this.editForm.controls.summary.dirty &&
  //         !this.editForm.controls.materialsRequested.dirty &&
  //         !this.editForm.controls.offHirePlant.dirty &&
  //         !this.editForm.controls.variations.dirty &&
  //         !this.editForm.controls.deliveries.dirty &&
  //         // !this.editForm.controls.productsOnSite.dirty &&
  //         !this.editForm.controls.eot.dirty &&
  //         !this.editForm.controls.tradesContact.dirty &&
  //         !this.editForm.controls.tradesSched.dirty &&
  //         !this.editForm.controls.imageUpload.dirty &&
  //         !this.editForm.controls.staffFormArray.dirty &&
  //         !this.editForm.controls.tradeFormArray.dirty &&
  //         !this.editForm.controls.visitorFormArray.dirty &&
  //         !this.editForm.controls.productFormArray.dirty
  //     );  
  // }  

  @HostListener('window:scroll', ['$event'])
    handleScroll(){
      const windowScroll = window.pageYOffset;
      if(windowScroll >= this.elementPosition - 200){
        this.sticky = true;
      } else {
        this.sticky = false;
      }
    }

  sticky: boolean = false;
  elementPosition: any;

  detailAccordion = [
    {
      elementID: 'summary',
      title: 'Summary',

    },
    {
      elementID: 'instructionsReceived',
      title: 'Instructions Received',
    },
    {
      elementID: 'whs',
      title: 'WHS',
    },
    {
      elementID: 'delays',
      title: 'Delays',
    },
    {
      elementID: 'eot',
      title: 'EOT',
    },
    {
      elementID: 'toolsUsed',
      title: 'Tools Used',
    },
    {
      elementID: 'damageReport',
      title: 'Damage Report',
    },
    {
      elementID: 'materialsRequested',
      title: 'Materials Requested',
    },
    {
      elementID: 'tradesContact',
      title: 'Trades to Contact',
    },
    {
      elementID: 'tradesSched',
      title: 'Trades to Schedule',
    },
    {
      elementID: 'offHirePlant',
      title: 'Off Hire Plant',
    },
    {
      elementID: 'variations',
      title:'Variations',
    },
    {
      elementID: 'deliveries',
      title: 'Deliveries',
    }
  ];

  public passID: any;
  public userNotes;
  editForm: FormGroup;
  imageUpload: FormArray;
  // staffFormArray: FormArray;
  //tradeFormArray: FormArray;
  //taskTradeFormArray: FormArray;
  // visitorFormArray: FormArray;
  // productFormArray: FormArray;
  public dailyReportId;
  public projectName;
  public jobNumber;
  public projectAddress;
  public aimedDate;
  public projImageBackground;
  public projUploadFolder;
  public todaysDate;
  public todaysDateRaw;
  public aimDateRaw;
  public aimDate;
  public pdfProjectName;
  public pdfSupervisorName;
  public pdfSupervisorEmail;
  public pdfSupervisorMobile;

  public projectNames = [];
  todays_date;


  public customQuestions = [];

  public listTrades = [];
  public listStaffs = [];
  public listTradeStaffs = [];
  public listVisitors = [];
  public listReasons = [];  
  public listProducts = [];
  public listWorkers = [];

  // public weeklyImagesWorker = [];
  public dailyWorkerLogs = [];
  public dailyWorkerImages = [];
  public dailyWorkerLogsArchive = [];
  public dailyWorkerLogsAccepted = [];

  public hideArchive = true;

  pdfHeaderImage1;
  pdfHeaderImage2;
  pdfFooterImage;
  pdfLogo;
  pdfstaffTotalHours = 0;

  public method = 'create';
  public message = 'Created a Daily Report'

  public isOthersAllDay = 'hide';
  public isOthersMorning = 'hide';
  public isOthersMidDay = 'hide';
  public isOthersAfternoon = 'hide';
  public isOthersEvening = 'hide';
  public isOthersOnOff = 'hide';
  public isOthersRestOfDay = 'hide';

  public imageURLRaw = [];
  public imageURL = [];
  public imageURLTBD = [];
  public imageSize = [];
  public totalImageSize = 0;
  public prevdata = [];

  public totalHours;
  public rawTotalHrs;
  // public rawAimedDate;
  // public projJobNumber;
  // public projaddress;
  // public projImageBackground;
  public projOwners;
  public projWorkers;
  public projSupervisor;
  public latitude;
  public longitude;
  public settingsData;
  public uploadSource;
  public projUploadSource;
  public pdfLink;
  public adminData;
  public colorBtnDefault;
  public colorHlightDefault;

  public download_mode = false;

  selectedRows = [];
  // public autoSavemode = false;

  breakpoint: number;

  currentWebWorker: true
  maxSizeMB: number = 1
  maxWidthOrHeight: number = 1024

  sizeTypeChoices= [
    {value: 'fixed', viewValue: 'Fixed'},
    {value: 'length', viewValue: 'Length'},
    {value: 'squared', viewValue: 'Squared'},
    {value: 'cubed', viewValue: 'Cubed'},
  ]

  breaktimes=[
    {value: '00:00', viewValue: 'No Breaks'},
    {value: '00:15', viewValue: '15 minutes'},
    {value: '00:30', viewValue: '30 minutes'},
    {value: '00:45', viewValue: '45 minutes'},
    {value: '01:00', viewValue: '1 hour'},
  ]

  staffcounts=[
    {value: 1, viewValue: '1'},
    {value: 2, viewValue: '2'},
    {value: 3, viewValue: '3'},
    {value: 4, viewValue: '4'},
    {value: 5, viewValue: '5'},
    {value: 6, viewValue: '6'},
    {value: 7, viewValue: '7'},
    {value: 8, viewValue: '8'},
    {value: 9, viewValue: '9'},
    {value: 10, viewValue: '10'},
    {value: 11, viewValue: '11'},
    {value: 12, viewValue: '12'},
    {value: 13, viewValue: '13'},
    {value: 14, viewValue: '14'},
    {value: 15, viewValue: '15'},
    {value: 16, viewValue: '16'},
    {value: 17, viewValue: '17'},
    {value: 18, viewValue: '18'},
    {value: 19, viewValue: '19'},
    {value: 20, viewValue: '20'},
  ]

  weatherOptions = [
    {value: 'weatherSunny', viewValue: 'Sunny'},
    {value: 'weatherRainy', viewValue: 'Rainy'},
    {value: 'weatherCloudy', viewValue: 'Cloudy'},
    {value: 'weatherStormy', viewValue: 'Stormy'},
    {value: 'weatherSnowy', viewValue: 'Snowy'},
    {value: 'weatherPartial', viewValue: 'Full and Partial'},
    {value: 'weatherOthers', viewValue: 'Other'},
  ]
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

  items: Array<any>;
  newArray: any;
  public userDetails;
  public showUpdateUploadButton = false;
  checked = false;
  lockSwitchBool : boolean = true;
  lockSwitchImageBool : boolean = true;
  // public reportPreviewMode = false;
  public finishLoading = true;
  public imagefinishLoading = true;
  public timesheetImagefinishLoading = true;

  whsData = [
    {
      toolbox_talk: '',
      toolbox_form: '',
      toolbox_required: '',
      toolbox_notes: '',
      toolbox_input: '',
      safety_walk: '',
      safety_form: '',
      safety_required: '',
      safety_notes: '',
      safety_input: '',
      accident_report: '',
      accident_form: '',
      accident_required: '',
      accident_notes: '',
      accident_input: '',
      ppe_report: '',
      ppe_form: '',
      ppe_required: '',
      ppe_notes: '',
      ppe_input: '',
    }
  ]

  materialsData = [];
  stagesData = []; 
  //   {
  //     id: 1,
  //     productName: 'Cement',
  //     unit: 'kilo',
  //     cost: '100',
  //     sizeType: 'fixed',
  //     brand: 'brandx',
  //     sku: '123',
  //     supplier: 'Cemex',
  //     category: '',
  //     costCentre: '',
  //     stage: '',
  //   },
  //   {
  //     id: 2,
  //     productName: 'Door',
  //     unit: 'item',
  //     cost: '1000',
  //     sizeType: 'fixed',
  //     brand: '',
  //     sku: '',
  //     supplier: '',
  //     category: '',
  //     costCentre: '',
  //     stage: '',
  //   },
  // ]

  materialSource: LocalDataSource;
  stageSource: LocalDataSource;
  workerLogSource: LocalDataSource = new LocalDataSource;

  imgSrc;
  imgStampString:string;

  // public materialSettings = {
  //   actions: { 
  //     delete: false,
  //     add: false,
  //     edit: false,
  //     //custom: [{ name: 'ourCustomAction', title: '<i [routerLink]="["/edit", card.id]" class="material-icons">edit</i>' }],
  //   },
  //   pager: {
  //     display: false,
  //   },
  //   attr: {
  //     class: 'table table-bordered'
  //   },
  //   hideSubHeader: true,
  //   mode: 'external',
  //   columns: {
  //     customactions: {
  //       title: 'Action',
  //       type : 'custom',
  //       width: '100px',
  //       filter: false,
  //       valuePrepareFunction: (cell, row) => row,
  //       // renderComponent: DailyProjectMaterialsRenderComponent,
  //       onComponentInitFunction :(instance) => {
  //         instance.update.subscribe(row => {
  //             // let objIndex = this.materialsData.findIndex((obj => obj.id == row.id));

  //             // this.materialsData[objIndex].productName = row.productName;
  //             // this.materialsData[objIndex].unit = row.unit;
  //             // this.materialsData[objIndex].cost = row.cost;
  //             // this.materialsData[objIndex].sizeType = row.sizeType;
  //             // this.materialsData[objIndex].brand = row.brand;
  //             // this.materialsData[objIndex].sku = row.sku;
  //             // this.materialsData[objIndex].supplier = row.supplier;
  //             // this.materialsData[objIndex].category = row.category;
  //             // this.materialsData[objIndex].costCentre = row.costCentre;
  //             // this.materialsData[objIndex].stage = row.stage;
              
  //             // this.materialSource = new LocalDataSource(this.materialsData);

  //             this.data_api.updateProjectMaterialId(this.passID.id,row)
  //             .subscribe(
  //               (result) => {
  //                 if(result){

  //                     swal.fire({
  //                         title: "Successfully Updated A Product/Material",
  //                         // text: "You clicked the button!",
  //                         buttonsStyling: false,
  //                         customClass: {
  //                           confirmButton: 'btn btn-success',
  //                         },
  //                         icon: "success"
  //                     })

  //                     this.getProject();
                      
  //                 }else{

  //                   swal.fire({
  //                       title: "Error in Updating Product/Material",
  //                       // text: "You clicked the button!",
  //                       buttonsStyling: false,
  //                       customClass: {
  //                         confirmButton: 'btn btn-success',
  //                       },
  //                       icon: "error"
  //                   })
        
  //                 }
  //             },
  //             (error) => {
  //                 swal.fire({
  //                     title: error.error.message,
  //                     // text: "You clicked the button!",
  //                     buttonsStyling: false,
  //                     customClass: {
  //                       confirmButton: 'btn btn-success',
  //                     },
  //                     icon: "error"
  //                 })
                  
  //             }
              
  //           );


  //         });
  //         instance.delete.subscribe(row => {
  //             // let objIndex = this.materialsData.findIndex((obj => obj.id == row.id));
  //             // this.materialsData.splice(objIndex, 1);
  //             // this.materialSource = new LocalDataSource(this.materialsData);

  //             this.data_api.deleteProjectMaterialId(this.passID.id,row)
  //             .subscribe(
  //               (result) => {
  //                 if(result){
  //                     this.getProject();
  //                     // swal({
  //                     //     title: "New Project Created!",
  //                     //     // text: "You clicked the button!",
  //                     //     buttonsStyling: false,
  //                     //     confirmButtonClass: "btn btn-success",
  //                     //     type: "success"
  //                     // }).catch(swal.noop)

  //                     // this.dialogRef.close('success');
        
  //                 }else{
  //                   // swal({
  //                   //     title: "Error in Creating New Project",
  //                   //     // text: "You clicked the button!",
  //                   //     buttonsStyling: false,
  //                   //     confirmButtonClass: "btn btn-success",
  //                   //     type: "error"
  //                   // }).catch(swal.noop)
        
  //                 }
  //             },
  //             (error) => {
  //                 // swal({
  //                 //     title: error.error.message,
  //                 //     // text: "You clicked the button!",
  //                 //     buttonsStyling: false,
  //                 //     confirmButtonClass: "btn btn-success",
  //                 //     type: "error"
  //                 // }).catch(swal.noop)
                  
  //             }
              
  //           );
            
  //         });
  //       }

  //     //   return `<a href="#/search/edit/${row.id}"><i class="material-icons">edit</i></a>`;
  //       // }
  //     },
  //     // id: {
  //     //   title: 'ID',
  //     //   valuePrepareFunction: (cell,row) => {
  //     //     return row.id;
  //     //   }
  //     // },
  //     product: {
  //       title: 'Product',
  //       valuePrepareFunction: (cell,row) => {
  //           return row.productName;
  //       }
  //     },
  //     quantity: {
  //       title: 'Quantity',
  //       valuePrepareFunction: (cell,row) => {
  //           return row.quantity;
  //       }
  //     },
  //     unit: {
  //       title: 'Unit',
  //       valuePrepareFunction: (cell,row) => {
  //           return row.unit;
  //       }
  //     },
  //     cost: {
  //       title: 'Unit Cost',
  //       valuePrepareFunction: (cell,row) => {
  //           return row.cost;
  //       }
  //     },
  //     total: {
  //       title: 'Total',
  //       valuePrepareFunction: (cell,row) => {
  //           return row.total;
  //       }
  //     },
  //     // brand: {
  //     //   title: 'Brand',
  //     //   valuePrepareFunction: (cell,row) => {
  //     //       return row.brand;
  //     //   }
  //     // },
  //     // sku: {
  //     //   title: 'SKU',
  //     //   valuePrepareFunction: (cell,row) => {
  //     //       return row.sku;
  //     //   }
  //     // },
  //     // supplier: {
  //     //   title: 'Supplier',
  //     //   valuePrepareFunction: (cell,row) => {
  //     //       return row.supplier;
  //     //   }
  //     // },
  //     // category: {
  //     //   title: 'Category',
  //     //   valuePrepareFunction: (cell,row) => {
  //     //       return row.category;
  //     //   }
  //     // },
  //     // costCentre: {
  //     //   title: 'Cost Centre',
  //     //   valuePrepareFunction: (cell,row) => {
  //     //       return row.costCentre;
  //     //   }
  //     // },
  //     // stage: {
  //     //   title: 'Stage',
  //     //   valuePrepareFunction: (cell,row) => {
  //     //       return row.stage;
  //     //   }
  //     // },
  //   }
  // };

  // public stagesSettings = {
  //   actions: { 
  //     delete: false,
  //     add: false,
  //     edit: false,
  //     //custom: [{ name: 'ourCustomAction', title: '<i [routerLink]="["/edit", card.id]" class="material-icons">edit</i>' }],
  //   },
  //   pager: {
  //     display: false,
  //   },
  //   attr: {
  //     class: 'table table-bordered'
  //   },
  //   hideSubHeader: true,
  //   mode: 'external',
  //   columns: {
  //     customactions: {
  //       title: 'Action',
  //       type : 'custom',
  //       width: '100px',
  //       filter: false,
  //       valuePrepareFunction: (cell, row) => row,
  //       // renderComponent: DailyProjectStagesRenderComponent,
  //       onComponentInitFunction :(instance) => {
  //         instance.update.subscribe(row => {
  //              this.data_api.updateProjectStageId(this.passID.id,row)
  //             .subscribe(
  //               (result) => {
  //                 if(result){
  //                     this.getProject();
  //                     // swal({
  //                     //     title: "New Project Created!",
  //                     //     // text: "You clicked the button!",
  //                     //     buttonsStyling: false,
  //                     //     confirmButtonClass: "btn btn-success",
  //                     //     type: "success"
  //                     // }).catch(swal.noop)

  //                     // this.dialogRef.close('success');
        
  //                 }else{
  //                   // swal({
  //                   //     title: "Error in Creating New Project",
  //                   //     // text: "You clicked the button!",
  //                   //     buttonsStyling: false,
  //                   //     confirmButtonClass: "btn btn-success",
  //                   //     type: "error"
  //                   // }).catch(swal.noop)
        
  //                 }
  //             },
  //             (error) => {
  //                 // swal({
  //                 //     title: error.error.message,
  //                 //     // text: "You clicked the button!",
  //                 //     buttonsStyling: false,
  //                 //     confirmButtonClass: "btn btn-success",
  //                 //     type: "error"
  //                 // }).catch(swal.noop)
                  
  //             }
              
  //           );


  //         });
  //         instance.delete.subscribe(row => {

  //             this.data_api.deleteProjectStageId(this.passID.id,row)
  //             .subscribe(
  //               (result) => {
  //                 if(result){
  //                     this.getProject();
  //                     // swal({
  //                     //     title: "New Project Created!",
  //                     //     // text: "You clicked the button!",
  //                     //     buttonsStyling: false,
  //                     //     confirmButtonClass: "btn btn-success",
  //                     //     type: "success"
  //                     // }).catch(swal.noop)

  //                     // this.dialogRef.close('success');
        
  //                 }else{
  //                   // swal({
  //                   //     title: "Error in Creating New Project",
  //                   //     // text: "You clicked the button!",
  //                   //     buttonsStyling: false,
  //                   //     confirmButtonClass: "btn btn-success",
  //                   //     type: "error"
  //                   // }).catch(swal.noop)
        
  //                 }
  //             },
  //             (error) => {
  //                 // swal({
  //                 //     title: error.error.message,
  //                 //     // text: "You clicked the button!",
  //                 //     buttonsStyling: false,
  //                 //     confirmButtonClass: "btn btn-success",
  //                 //     type: "error"
  //                 // }).catch(swal.noop)
                  
  //             }
              
  //           );
            
  //         });
  //       }
  //     },
  //     stageName: {
  //       title: 'Stage Name',
  //       valuePrepareFunction: (cell,row) => {
  //           return row.stageName;
  //       }
  //     }
  //   }
  // };
  
  // public settings3 = {
  //   actions: { 
  //     delete: false,
  //     add: false,
  //     edit: false,
  //     //custom: [{ name: 'ourCustomAction', title: '<i [routerLink]="["/edit", card.id]" class="material-icons">edit</i>' }],
  //   },
  //   pager: {
  //     display: false,
  //   },
  //   attr: {
  //     class: 'table table-bordered'
  //   },
  //   hideSubHeader: true,
  //   mode: 'external',
  //   columns: {
  //     customactions: {
  //       title: 'Action',
  //       type : 'custom',
  //       filter: false,
  //       valuePrepareFunction: (cell, row) => row,
  //       //renderComponent: DailyProjectRenderComponent
  //     //   return `<a href="#/search/edit/${row.id}"><i class="material-icons">edit</i></a>`;
  //       // }
  //     },
  //     id: {
  //       title: 'ID',
  //       valuePrepareFunction: (cell,row) => {
  //         return row.id;
  //       }
  //     },
  //     product: {
  //       title: 'Product',
  //       valuePrepareFunction: (cell,row) => {
  //           return row.supervisor_name;
  //       }
  //     },
  //     cost: {
  //       title: 'Cost',
  //       valuePrepareFunction: (cell,row) => {
  //           return row.supervisor_name;
  //       }
  //     },
  //     unit: {
  //       title: 'Unit',
  //       valuePrepareFunction: (cell,row) => {
  //           return row.supervisor_name;
  //       }
  //     },
  //   }
  // };
  
  // public workerSettings = {
  //   selectMode: 'multi',
  //   actions: { 
  //     delete: false,
  //     add: false,
  //     edit: false,
  //     //custom: [{ name: 'ourCustomAction', title: '<i [routerLink]="["/edit", card.id]" class="material-icons">edit</i>' }],
  //   },
  //   pager: {
  //     display: false,
  //   },
  //   attr: {
  //     class: 'table table-bordered'
  //   },
  //   hideSubHeader: true,
  //   mode: 'external',
  //   columns: {
  //     // customactions: {
  //     //   title: 'Action',
  //     //   width: '100px',
  //     //   type : 'custom',
  //     //   filter: false,
  //     //   valuePrepareFunction: (cell, row) => row,
  //     //   // renderComponent: StaffsRenderComponent
  //     // //   return `<a href="#/search/edit/${row.id}"><i class="material-icons">edit</i></a>`;
  //     //   // }
  //     // },
  //     customactions: {
  //       title: 'Action',
  //       width: '100px',
  //       type : 'custom',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell, row) => row,
  //       renderComponent: WorkerLogsRenderComponent,
  //     //   return `<a href="#/search/edit/${row.id}"><i class="material-icons">edit</i></a>`;
  //       // }
  //     },
  //     accepted_status: {
  //       title: 'Accepted',
  //       width: '8%',
  //       type : 'html',
  //       filter: false,
  //       sort: false,
  //       // valuePrepareFunction: (cell,row)  => row,
  //       //     renderComponent: DailyProjectWorkerAcceptRenderComponent,
  //       //     onComponentInitFunction :(instance) => {
  //       //         instance.save.subscribe(row => {
  //       //         });
  //       //     }
  //       valuePrepareFunction: (cell,row) => {
  //           return row.acceptedStatus == true ? '<span class="color-positive">Yes</span>' : '<span class="color-negative">No</span>';
  //       }
  //     },
  //     worker_name: {
  //       title: 'Name',
  //       width: '15%',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //           return row.workerName;
  //       }
  //     },
  //     notes: {
  //       title: 'Notes',
  //       width: '25%',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //           return row.accomplishments;
  //       }
  //     },
  //     start: {
  //       title: 'Start',
  //       width: '8%',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //           return row.start;
  //       }
  //     },
  //     break: {
  //       title: 'Break',
  //       width: '8%',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //           return row.break;
  //       }
  //     },
  //     finish: {
  //       title: 'Finish',
  //       width: '8%',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //           return row.finish;
  //       }
  //     },
  //     entry_status: {
  //       title: 'Status',
  //       width: '10%',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //           return row.entryStatus + ' ' + (row.modifiedBy ? "(modified by "+row.modifiedBy+")" : "") + ' ' + (row.modifiedDate ? "(updated last "+row.modifiedDate.toDate().toDateString()+")" : "");
  //       }
  //     },
  //     image: {
  //       title: 'Image',
  //       type : 'custom',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row)  => row,
  //           renderComponent: DailyProjectWorkerImageRenderComponent,
  //           onComponentInitFunction :(instance) => {
  //               instance.onEnlarge.subscribe(row => {
  //                 this.imgSrc = "";
  //                 this.getBase64ImageFromURL(row.image).subscribe((base64Data: string) => {  
  //                   this.imgSrc = base64Data
  //                 })
  //                 if(row.timestamp){
  //                   this.imgStampString = row.timestamp.toDate();
  //                 }
                  

  //               });
  //           }
  //     },
  //     // staff_phone: {
  //     //   title: 'Phone',
  //     //   valuePrepareFunction: (cell,row) => {
  //     //       return row.staff_phone;
  //     //   }
  //     // },
  //     // default_hours: {
  //     //   title: 'Default Hours',
  //     //   valuePrepareFunction: (cell,row) => {
  //     //       return row.default_hours;
  //     //   }
  //     // },

  //   }
  // };


  // public workerSettingsArchive = {
  //   selectMode: 'multi',
  //   actions: { 
  //     delete: false,
  //     add: false,
  //     edit: false,
  //     //custom: [{ name: 'ourCustomAction', title: '<i [routerLink]="["/edit", card.id]" class="material-icons">edit</i>' }],
  //   },
  //   pager: {
  //     display: false,
  //   },
  //   attr: {
  //     class: 'table table-bordered'
  //   },
  //   hideSubHeader: true,
  //   mode: 'external',
  //   columns: {
  //     // customactions: {
  //     //   title: 'Action',
  //     //   width: '100px',
  //     //   type : 'custom',
  //     //   filter: false,
  //     //   valuePrepareFunction: (cell, row) => row,
  //     //   // renderComponent: StaffsRenderComponent
  //     // //   return `<a href="#/search/edit/${row.id}"><i class="material-icons">edit</i></a>`;
  //     //   // }
  //     // },
  //     customactions: {
  //       title: 'Action',
  //       width: '30px',
  //       type : 'custom',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell, row) => row,
  //       renderComponent: WorkerLogsRenderComponent,
  //     //   return `<a href="#/search/edit/${row.id}"><i class="material-icons">edit</i></a>`;
  //       // }
  //     },
  //     archive_status: {
  //       title: 'Archive',
  //       width: '8%',
  //       type : 'html',
  //       filter: false,
  //       sort: false,
  //       // valuePrepareFunction: (cell,row)  => row,
  //       //     renderComponent: DailyProjectWorkerAcceptRenderComponent,
  //       //     onComponentInitFunction :(instance) => {
  //       //         instance.save.subscribe(row => {
  //       //         });
  //       //     }
  //       valuePrepareFunction: (cell,row) => {
  //           return row.archiveStatus == true ? '<span class="color-positive">Yes</span>' : '<span class="color-negative">No</span>';
  //       }
  //     },
  //     worker_name: {
  //       title: 'Name',
  //       width: '15%',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //           return row.workerName;
  //       }
  //     },
  //     notes: {
  //       title: 'Notes',
  //       width: '25%',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //           return row.accomplishments;
  //       }
  //     },
  //     start: {
  //       title: 'Start',
  //       width: '8%',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //           return row.start;
  //       }
  //     },
  //     break: {
  //       title: 'Break',
  //       width: '8%',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //           return row.break;
  //       }
  //     },
  //     finish: {
  //       title: 'Finish',
  //       width: '8%',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //           return row.finish;
  //       }
  //     },
  //     entry_status: {
  //       title: 'Status',
  //       width: '10%',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //           return row.entryStatus + ' ' + (row.modifiedBy ? "(modified by "+row.modifiedBy+")" : "") + ' ' + (row.modifiedDate ? "(updated last "+row.modifiedDate.toDate().toDateString()+")" : "");
  //       }
  //     },
  //     image: {
  //       title: 'Image',
  //       type : 'custom',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row)  => row,
  //           renderComponent: DailyProjectWorkerImageRenderComponent,
  //           onComponentInitFunction :(instance) => {
  //               instance.save.subscribe(row => {
  //               });
  //           }
  //     },
  //     // staff_phone: {
  //     //   title: 'Phone',
  //     //   valuePrepareFunction: (cell,row) => {
  //     //       return row.staff_phone;
  //     //   }
  //     // },
  //     // default_hours: {
  //     //   title: 'Default Hours',
  //     //   valuePrepareFunction: (cell,row) => {
  //     //       return row.default_hours;
  //     //   }
  //     // },

  //   }
  // };

  @Input() itemsCopy = 'val1';

  type: FormGroup;

  public filter_list_visitors: ReplaySubject<any[]>[] = [];
  public filter_list_reasons: ReplaySubject<any[]>[] = [];
  public filter_list_employees: ReplaySubject<any[]>[] = [];
  public filter_list_products: ReplaySubject<any[]>[] = [];
  public filter_list_trades: ReplaySubject<any[]>[] = [];
  public filter_list_tradestaffs: ReplaySubject<any[]>[] = [];

  uploadProgress: Observable<number>;
  allUploadProgress: number[]= [];
  totalPercentage: number;
  allPercentage: Observable<number>[] = [];
  downloadArray= [] ;
  downloadURLs= [] ;
  accountFirebase;
  recentImages;
  recentEntryDaily = [];

  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;
  
  protected _onDestroy = new Subject<void>();

  // public imageUpload = new FormArray([]);
  
  public projectOwnersID:any = [];
  public projectWorkersID:any = [];
  public siteSupervisorsID:any = [];
  public altSupervisorsID:any = [];

  public projectOwners:any = [];
  public projectWorkers:any = [];
  public siteSupervisors = [];
  public altSupervisors:any = [];

  constructor(
    private route: ActivatedRoute,
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
    private location: Location,
    private afStorage: AngularFireStorage,
    private progressOverlay: NgxProgressOverlayService,
    private afs: AngularFirestore,
    private clipboard: Clipboard,
    private ngZone: NgZone
    ) { 

      //this.materialSource = new LocalDataSource(this.materialsData);
    }

  ngAfterViewInit(){
    this.elementPosition = this.menuElement.nativeElement.offsetTop;
  }

  public ngOnInit() {
          this.passID = {
              id: this.route.snapshot.params['id'],
          };
          this.route.params

          .subscribe(
              (params: Params) => {
                  this.passID.id = params['id'];
              }
          );


          if (localStorage.getItem('currentUser')) {
              this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
          }

          // this.getUserNotes();
          this.editForm = this.formBuilder.group({
              // imageUploadList: this.imageUpload,
              todaysDate: ['', Validators.required],
              projectId: ['', Validators.required],
              siteSupervisor: ['', Validators.required],
              reportNumber: [''],
              //aimedComDate: [''],
              weatherResidual: [''],
              weatherPerfect: [''],
              weatherMaxTemp: [''],
              weatherMinTemp: [''],
              weatherMorning: [''],
              weatherMidDay: [''],
              weatherAfternoon: [''],
              weatherEvening: [''],
              weatherOnOff: [''],
              weatherAllDay: [''],
              weatherRestOfDay: [''],
              weatherOthersMorning: [''],
              weatherOthersMidDay: [''],
              weatherOthersAfternoon: [''],
              weatherOthersEvening: [''],
              weatherOthersOnOff: [''],
              weatherOthersAllDay: [''],
              weatherOthersRestOfDay: [''],
              // lostWeekDays: [''],
              // lostWeekHours: [''],
              // lostTotalDays: [''],
              // lostTotalHours: [''],
              totalFileSize: [''],
              folderName: [''],
              imageFolderId: [''],
              toolboxTalk: [''],
              toolboxForm: [''],
              toolboxRequired: [''],
              toolboxNotes: [''],
              toolboxInput: [''],
              safetyWalk: [''],
              safetyForm: [''],
              safetyRequired: [''],
              safetyNotes: [''],
              safetyInput: [''],
              accidentReport: [''],
              accidentForm: [''],
              accidentRequired: [''],
              accidentNotes: [''],
              accidentInput: [''],
              ppeReport: [''],
              ppeForm: [''],
              ppeRequired: [''],
              ppeNotes: [''],
              ppeInput: [''],
              uploadFolder: [''],
              uploadSource: [''],
              pdfLink:[''],
              instructionsReceived: [this.items, []],
              delays: [this.items, []],
              toolsUsed: [this.items, []],
              damageReport: [this.items, []],
              summary: [this.items, []],
              materialsRequested: [this.items, []],
              offHirePlant: [this.items, []],
              variations: [this.items, []],
              deliveries: [this.items, []],
              // productsOnSite: [this.items, []],
              // tradesOnSite
              // staffOnSite: [this.items, []],
              // visitorsOnSite: [this.items, []],
              eot: [''],
              tradesContact: [this.items, []],
              tradesSched: [this.items, []],
              tradesIdArray: [this.items, []],
              staffIdArray: [this.items, []],
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
              //staffFormArray: this.formBuilder.array([ this.createStaffForm() ]),
              staffFormArray: this.formBuilder.array([ ]),
              //tradeFormArray: this.formBuilder.array([ this.createTradeForm() ]),
              tradeFormArray: this.formBuilder.array([ ]),
              visitorFormArray: this.formBuilder.array([ ]),
              //visitorFormArray: this.formBuilder.array([ this.createVisitorForm() ]),
              productFormArray: this.formBuilder.array([ ]),
              //productFormArray: this.formBuilder.array([ this.createProductForm() ])
              createdAt: [''],
              modifiedAt: [''],
              createdBy: [''],
              modifiedBy: [''],
          });

          // let curr;
          // curr = new Date();
          // let todays_date;
          this.todays_date = new Date();
          this.todays_date.setHours(0,0,0,0);
          // let friday;
          // friday = 5 - curr.getDay();
          // fridayDateWeek.setDate(fridayDateWeek.getDate()+friday);

          this.editForm.patchValue({
            todaysDate: this.todays_date,
            projectId:  this.passID.id
          });

          this.route.queryParams
            .filter(params => params.date)
            .subscribe(params => {
        
              if(params.downloadmode == 'true'){
                  this.download_mode = true;
                  window.parent.postMessage({"message":"start"}, '*');
              }

              this.editForm.patchValue({
                todaysDate:  new Date(params.date+'T00:00')
              });

              // this.reportPreviewMode = true;
              // this.order = params.order;

            }
          );

          this.finishLoading = false;
        
          //this.getDailyReportPreload();
          
          // this.getProject(); 
          //this.getTrades();
          //this.getProducts();
          //this.getDailyWorkerLogs();
          // this.getTradeStaffs()
          // this.getVisitors();
          //this.getReasons();
          //this.getProjects();
          // this.getSupervisors();
          //this.getQuestions();
          // this.getDailyReport();
          // this.getImages();
          // this.changeDate();
          this.getAdminSettings();
          this.getFBProject();
          this.getFBAllTrades();
          this.getFBWorkers();
          this.getFBProductsArray();
          this.getFBVisitors();
          this.getFBReasons();
          //this.getFBDailyReport();
          this.getRecentImagesDailyReport();
          this.getFBDailyWorkerLogs();

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
        //   this.editForm.valueChanges
        //   .pipe(
        //     debounceTime(5000),
        //     switchMap((value) => of(value))
        //   )
        //   .subscribe((value) => {
        //     this.autoSaveReport();
        // });

        // this.initializeFilterVisitors(0);
       // this.initializeFilterReasons(0);
       // this.initializeFilterEmployees(0);
        //this.initializeFilterProducts(0);
          this.Interval =  setInterval(()=>{
            this.getPreviousUpdatedByUser();
          },4000) 
    }

// GET PREVIOUSLY UPDATED USER
async getPreviousUpdatedByUser() {

  try {
    const docSnapshot = await this.afs.collection('/accounts')
      .doc(this.accountFirebase)
      .collection('/dailyReport')
      .doc(this.dailyReportId)
      .get()
      .toPromise();

    if (docSnapshot.exists) {
      this.modifiedById = docSnapshot.data().modifiedBy;

      this.findUserById();
    } else {
      console.log('No such document!');
    }
  } catch (error) {
    console.error('Error getting document:', error);
  }
}

// FIND USER BY ID TO DISPLAY ON HTML
findUserById() {
  if (!this.modifiedById) {
    console.log('No modifiedById to search for');
    return;
  }

  this.afs.collection('/users', ref => ref.where('id', '==', this.modifiedById))
    .get()
    .toPromise()
    .then(docSnapshot => {
      if (docSnapshot.empty) {
        console.log('No matching documents.');
      } else {
        docSnapshot.forEach(doc => {
          console.log(doc.id, '=>', doc.data());
          
          const userData :any = doc.data();
          if (userData.userFirstName && userData.userLastName) {
            this.previouslyUpdatedBy = `${userData.userFirstName} ${userData.userLastName}`;
          } else {
            console.log('User first or last name not found');
          }
        });
      }
    })
    .catch(error => {
      console.error('Error getting documents: ', error);
    });
}



     async getFBCounterDailyReport(){
      const data =  await this.data_api.getFBCounterDailyReport().pipe(take(1)).toPromise();
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

    public getFBProjectUsers(){
        this.listStaffs = [];
        this.data_api.getFBUsersOrderedFname().subscribe((data) => {
              this.listStaffs = [];

                if(data){
                    data.forEach(data =>{    
                      if(!data.password){  
                          if(data.userRole == 'project_owner' ){
                            this.projectOwners.push({id:data.id,name: data.userFirstName + ' ' + data.userLastName})
                          }

                          if(data.userRole == 'project_worker' ){
                            this.projectWorkers.push({id:data.id,name: data.userFirstName + ' ' + data.userLastName})
                          }

                          if(data.userRole == 'project_supervisor' ){
                            this.siteSupervisors.push({id:data.id,name: data.userFirstName + ' ' + data.userLastName})
                            this.altSupervisors.push({id:data.id,name: data.userFirstName + ' ' + data.userLastName})
                          }
                      }
                    })
                }
                if(this.siteSupervisors.length > 0){
                    for (let i = 0; i < this.siteSupervisors.length; i++) {
                        if (this.siteSupervisorsID.includes(this.siteSupervisors[i].id)) {
                        
                          this.listStaffs.push({id: this.siteSupervisors[i].id, staff_name: this.siteSupervisors[i].name, type:'user-supervisor'})  
                        }
                    }
                }
                if(this.altSupervisors.length > 0){
                  for (let i = 0; i < this.altSupervisors.length; i++) {
                      if (this.altSupervisorsID.includes(this.altSupervisors[i].id)) {
                  
                        this.listStaffs.push({id: this.altSupervisors[i].id, staff_name: this.altSupervisors[i].name, type:'user-altsupervisor'})  
                      }
                  }
                }
                if(this.projectWorkers.length > 0){
                  for (let i = 0; i < this.projectWorkers.length; i++) {
                      if (this.projectWorkersID.includes(this.projectWorkers[i].id)) {
                   
                        this.listStaffs.push({id: this.projectWorkers[i].id, staff_name: this.projectWorkers[i].name, type:'user-worker'})  
                      }
                  }
                }
                if(this.listStaffs){
                  this.listStaffs.sort(function(a, b) {
                      var textA = a.staff_name.toUpperCase();
                      var textB = b.staff_name.toUpperCase();
                      return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                  });
                }
                if(this.projectOwners.length > 0){
                  for (let i = 0; i < this.projectOwners.length; i++) {
                      if (this.projectOwnersID.includes(this.projectOwners[i].id)) {
                       
                        this.listVisitors.push({id: this.projectOwners[i].id, visitor_name: this.projectOwners[i].name, type:'user'})  
                      }
                  }
                  if(this.listVisitors){
                    this.listVisitors.sort(function(a, b) {
                        var textA = a.visitor_name.toUpperCase();
                        var textB = b.visitor_name.toUpperCase();
                        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                    });
                  }
                }

                // this.initializeFilterOwners();
                // this.initializeFilterWorkers();
                // this.initializeFilterSupervisors();
                // this.initializeFilterAltSupervisors();

                this.getFBDailyReport();

          }
        );
    }

    public getFBDailyReport(){
        if(this.editForm.value.projectId && this.editForm.value.todaysDate){
          
          this.data_api.getFBDailyReport(this.editForm.value.projectId,this.editForm.value.todaysDate).subscribe(async data => {
                  console.log('daily report data',data[0])
                  let dataDailyReport = data[0];
                  if(dataDailyReport){  
                      let whsData;
                      let instructionsReceived;
                      let delays;
                      let toolsUsed;
                      let damageReport;
                      let summary;
                      let materialsRequested;
                      let offHirePlant;
                      let variations;
                      let deliveries;
                      // let tradesOnSite;
                      // let staffOnSite;
                      // let visitorsOnSite;
                      let tradesContact;
                      let tradesSched;
                      let products;

                      // if(dataDailyReport.whs){
                      //   whsData = dataDailyReport.whs;
                      // }
                      this.dailyReportId = dataDailyReport.id;
                      this.editForm.patchValue({
                            weatherResidual: dataDailyReport.weatherResidual,
                            weatherPerfect: dataDailyReport.weatherPerfect,
                            weatherMaxTemp: dataDailyReport.weatherMaxTemp,
                            weatherMinTemp: dataDailyReport.weatherMinTemp,
                            weatherMorning: dataDailyReport.weatherMorning,
                            weatherMidDay: dataDailyReport.weatherMidDay,
                            weatherAfternoon: dataDailyReport.weatherAfternoon,
                            weatherEvening: dataDailyReport.weatherEvening,
                            weatherOnOff: dataDailyReport.weatherOnOff,
                            weatherAllDay: dataDailyReport.weatherAllDay,
                            weatherRestOfDay: dataDailyReport.weatherRestOfDay,
                            weatherOthersMorning: dataDailyReport.weatherOthersMorning,
                            weatherOthersMidDay: dataDailyReport.weatherOthersMidDay,
                            weatherOthersAfternoon: dataDailyReport.weatherOthersAfternoon,
                            weatherOthersEvening: dataDailyReport.weatherOthersEvening,
                            weatherOthersOnOff: dataDailyReport.weatherOthersOnOff,
                            weatherOthersAllDay: dataDailyReport.weatherOthersAllDay,
                            weatherOthersRestOfDay: dataDailyReport.weatherOthersRestOfDay,
                            toolboxTalk: dataDailyReport.toolboxTalk,
                            toolboxForm: dataDailyReport.toolboxForm,
                            toolboxRequired: dataDailyReport.toolboxRequired,
                            toolboxNotes: dataDailyReport.toolboxNotes,
                            toolboxInput: dataDailyReport.toolboxInput,
                            safetyWalk: dataDailyReport.safetyWalk,
                            safetyForm: dataDailyReport.safetyForm,
                            safetyRequired: dataDailyReport.safetyRequired,
                            safetyNotes: dataDailyReport.safetyNotes,
                            safetyInput: dataDailyReport.safetyInput,
                            accidentReport: dataDailyReport.accidentReport,
                            accidentForm: dataDailyReport.accidentForm,
                            accidentRequired: dataDailyReport.accidentRequired,
                            accidentNotes: dataDailyReport.accidentNotes,
                            accidentInput: dataDailyReport.accidentInput,
                            ppeReport: dataDailyReport.ppeReport,
                            ppeForm: dataDailyReport.ppeForm,
                            ppeRequired: dataDailyReport.ppeRequired,
                            ppeNotes: dataDailyReport.ppeNotes,
                            ppeInput: dataDailyReport.ppeInput,
                            instructionsReceived: dataDailyReport.instructionsReceived,
                            delays: dataDailyReport.delays,
                            toolsUsed: dataDailyReport.toolsUsed,
                            damageReport: dataDailyReport.damageReport,
                            summary: dataDailyReport.summary,
                            materialsRequested: dataDailyReport.materialsRequested,
                            offHirePlant: dataDailyReport.offHirePlant,
                            variations: dataDailyReport.variations,
                            deliveries:dataDailyReport.deliveries,
                            tradesContact: dataDailyReport.tradesContact,
                            tradesSched: dataDailyReport.tradesSched,
                            // productsOnSite: products,
                            // tradesOnSite: tradesOnSite,
                            // staffOnSite: staffOnSite,
                            // visitorsOnSite: visitorsOnSite,
                            eot: dataDailyReport.eot,
                            reportNumber: dataDailyReport.reportNumber,
                            createdAt: dataDailyReport.createdAt,
                            createdBy: dataDailyReport.createdBy
                        });

                        this.pdfLink = dataDailyReport.pdfLink;

                        if (dataDailyReport.tradeFormArray){
                          this.tradeFormArray().clear()
                          let i = 0;
                          dataDailyReport.tradeFormArray.forEach(t => {
                            let teacher: FormGroup = this.createTradeForm();
                            this.tradeFormArray().push(teacher);

                            if(t.tradeStaffFormArray){

                                (teacher.get("tradeStaffFormArray") as FormArray).clear()
                                let x = 0;
                                  t.tradeStaffFormArray.forEach(b => {
                                    
                                    let tradeStaff = this.createTradeStaffForm();
                                      (teacher.get("tradeStaffFormArray") as FormArray).push(tradeStaff)

                                      if(b.taskTradeFormArray){

                                      (tradeStaff.get("taskTradeFormArray") as FormArray).clear()
                                          b.taskTradeFormArray.forEach(c => {
                                              let tradeTask = this.createTaskTradeForm();
                                              (tradeStaff.get("taskTradeFormArray") as FormArray).push(tradeTask)

                                          });
                                          
                                      }

                                  });
                                  // this.initializeFilterTradeStaffs(i,x);
                                  x++;
                            }
                            this.initializeFilterTrades(i);
                            this.loadTradeStaffs(i,t.tradesOnSite);
                            i++;
                          });

                          this.tradeFormArray().patchValue(dataDailyReport.tradeFormArray);
                          
                        }

                        if (dataDailyReport.staffFormArray){
                            this.staffFormArray().clear()
                            let i = 0;
                            dataDailyReport.staffFormArray.forEach(t => {
                              let teacher: FormGroup = this.createStaffForm();
                              this.staffFormArray().push(teacher);
                              if(t.taskStaffFormArray){
                                  // (teacher.get("taskStaffFormArray") as FormArray).clear()
                                  t.taskStaffFormArray.forEach(b => {
                                    let batch = this.createTaskStaffForm();
                                      (teacher.get("taskStaffFormArray") as FormArray).push(batch)
                                  });
                              }
                              this.initializeFilterEmployees(i);
                              i++;
                          });
                          this.staffFormArray().patchValue(dataDailyReport.staffFormArray);
                        }

                        if (dataDailyReport.visitorFormArray){
                          this.visitorFormArray().clear()
                          let i = 0;
                         dataDailyReport.visitorFormArray.forEach(t => {
                            var teacher: FormGroup = this.createVisitorForm();
                            this.visitorFormArray().push(teacher);
                            this.initializeFilterVisitors(i);
                            this.initializeFilterReasons(i);
                            i++;
                          });
                          this.visitorFormArray().patchValue(dataDailyReport.visitorFormArray);
                        }

                        if (dataDailyReport.productFormArray){
                          this.productFormArray().clear()
                          let i = 0;
                          dataDailyReport.productFormArray.forEach(t => {

                            var teacher: FormGroup = this.createProductForm();
                            this.productFormArray().push(teacher);
                            this.initializeFilterProducts(i);
                            i++;
                          });
                          this.productFormArray().patchValue(dataDailyReport.productFormArray);

                        }

                        this.imageUpload = this.editForm.get('imageUpload') as FormArray;
                        this.imageUpload.clear();
                        this.imageSize = [];
                        this.imageURL= [];

                        if (dataDailyReport.imageUpload){

                            let newImageUploadArray = [];

                            for (let img of dataDailyReport.imageUpload) {  

                                let splitName = img.imageFile.split(/%2..*%2F(.*?)\?alt/);

                                newImageUploadArray.push({
                                    imageCaption: img.imageCaption,
                                    imageFile: img.imageFile,
                                    nameIndex: splitName[1],
                                    imageSize: img.imageSize,
                                    imageBy: img.imageBy,
                                    imageStamp: img.imageStamp
                                });      

                            }

                            newImageUploadArray.sort((a, b) => {
                              return a.nameIndex - b.nameIndex;
                            });

                            for (let img of newImageUploadArray) {  

                                  this.imageURLTBD.push(img.imageFile);    
                                  this.imageURL.push(img.imageFile);
                                  this.imageURLRaw.push(img.imageFile);

                                    this.imageUpload.push(
                                      new FormGroup({
                                        'imageCaption': new FormControl(img.imageCaption),
                                        'imageFile': new FormControl(img.imageFile),
                                        'imageSize': new FormControl(img.imageSize),
                                        'imageBy': new FormControl(img.imageBy),
                                        'imageStamp': new FormControl(img.imageStamp),
                                      })
                                    );
                                  // this.getBase64ImageFromURL(img.imageFile).subscribe((base64Data: string) => {   
                  
                                  //         this.imageURL.push(base64Data);
                                  //         this.imageURLRaw.push(base64Data);
                                          
                                  //         this.imageUpload.push(
                                  //           new FormGroup({
                                  //             'imageCaption': new FormControl(img.imageCaption),
                                  //             'imageFile': new FormControl(base64Data),
                                  //             'imageSize': new FormControl(img.imageSize),
                                  //           })
                                  //         );
                                  //   });

                                  // const awaitData = await this.getBase64ImageFromURL(img.imageFile).toPromise(); 
                                  //   this.imageURL.push(awaitData);
                                  //   this.imageURLRaw.push(awaitData);
                                  //   this.imageUpload.push(
                                  //     new FormGroup({
                                  //       'imageCaption': new FormControl(img.imageCaption),
                                  //       'imageFile': new FormControl(awaitData),
                                  //       'imageSize': new FormControl(img.imageSize),
                                  //       'imageBy': new FormControl(img.imageBy),
                                  //     })
                                  //   );

                             
                                  //}
                                        
                  
                                  this.imageSize.push(img.imageSize);
                            }
                           this.convertImages();
                        }


                        const tempVal = JSON.parse(JSON.stringify(this.editForm.value));

                        let imgCount = dataDailyReport.imageUpload.length;
                        tempVal.imageUpload = imgCount;

                        this.prevdata = tempVal;
                        // this.method = 'update';
                        // this.message = 'Updated a Daily Report'   

                        this.editForm.markAsPristine();
                }
                
          });
          
        }

    }

    convertImages(){
      if(this.editForm.value.imageUpload.length > 0){
          let i = 0;
          for (let img of this.editForm.value.imageUpload) {
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

    getFBProject(): void {
 
      this.data_api.getFBProject(this.passID.id).pipe(first()).subscribe(data => {

          if(data){

              this.projectName = data.projectName;
              this.jobNumber = data.jobNumber;
              this.projectAddress = data.projectAddress;
              if(data.aimedComDate){
                this.aimedDate = moment(data.aimedComDate.toDate()).format('DD/MM/YYYY');
              }
              this.projWorkers =  data.projectWorker;
              this.projOwners =  data.projectOwner;
              this.projSupervisor = data.siteSupervisor;
              this.latitude = data.latitude;
              this.longitude = data.longitude;
              this.projImageBackground = data.bgName;
              this.projUploadFolder = data.uploadFolder;
              this.projectOwnersID = data.projectOwner;
              this.projectWorkersID = data.projectWorker;
              this.siteSupervisorsID = data.siteSupervisor;
              this.altSupervisorsID = data.altSupervisor;
              this.editForm.patchValue({
                siteSupervisor: data.siteSupervisor
              });
              this.getSupervisor(data.siteSupervisor);
          }

          this.getFBProjectUsers();

      });
    }

    public getSupervisor(id){
      if(id){
          this.data_api.getFBUser(id).subscribe((data) => {
                this.pdfSupervisorName = data.userFirstName + ' ' + data.userLastName;
                this.pdfSupervisorEmail =  data.userEmail;
                this.pdfSupervisorMobile = data.userMobile ? data.userMobile: ' ';
            }
          );
      }
    }

    getFBAllTrades(): void {
      this.data_api.getFBAllTrades().subscribe(data => {
  
          if(data){

            data.sort(function(a, b) {
                var textA = a.tradeCompanyName.toUpperCase();
                var textB = b.tradeCompanyName.toUpperCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });

            this.listTrades = data;
          }
  
      });
    }

    public getFBWorkers(): void {

          this.data_api.getFBWorkers().subscribe(data => {

              if(data){
                data.forEach(data =>{   
                  if(!data.password){
                    this.listWorkers.push(data);
                  }
                })
              }

          });
    }

    public getFBProductsArray(): void {

      this.data_api.getFBProductsArray().subscribe(data => {
          if(data){
            if(data.productArray){

              data.productArray.sort(function(a, b) {
                  var textA = a.productArrayName.toUpperCase();
                  var textB = b.productArrayName.toUpperCase();
                  return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
              });

              this.listProducts = data.productArray;
            }
          }
   
      });
    }

    public getFBVisitors(): void {
      this.data_api.getFBVisitors().subscribe(data => {
          if(data){
            if(data.visitorArray){

              data.visitorArray.sort(function(a, b) {
                  var textA = a.visitorName.toUpperCase();
                  var textB = b.visitorName.toUpperCase();
                  return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
              });


              this.listVisitors = [];
              data.visitorArray.forEach(data2 =>{  
                  if(data2){
                    this.listVisitors.push({id: data2.visitorName, visitor_name: data2.visitorName, type:'global'})   
                  } 
              });

            }
          }
      });
    }

    public getFBReasons(): void {
      this.data_api.getFBReasons().subscribe(data => {
          if(data){
            if(data.reasonArray){

              data.reasonArray.sort(function(a, b) {
                  var textA = a.reason.toUpperCase();
                  var textB = b.reason.toUpperCase();
                  return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
              });

              this.listReasons = data.reasonArray;
            }
          }
      });
    }

    getAdminSettings(){
        this.data_api.getFBAdminSettings().subscribe((data) => {
          this.adminData = data;
          this.colorBtnDefault = data.colourEnabledButton ? data.colourEnabledButton : '';
          this.colorHlightDefault = data.colourHighlight ? data.colourHighlight : '';
          if(data.pdfHeader1){
              this.getBase64ImageFromURL(data.pdfHeader1).subscribe((base64Data: string) => {   
                this.pdfHeaderImage1 = base64Data;
              });
            }
            
            if(data.pdfHeader2){
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

        }); 
    }

    onButtonEnter(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
    }

    onButtonOut(hoverName: HTMLElement) {
        hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
    }

    initializeFilterVisitors(i) {

      this.filter_list_visitors[i] = new ReplaySubject<any[]>(1);

      const adminAdvocacy = <FormArray>this.editForm.controls['visitorFormArray'];
      adminAdvocacy.controls[i].get('search_control_visitor').valueChanges
      .pipe(takeUntil(this._onDestroy),
      startWith(adminAdvocacy.controls[i].get('search_control_visitor').value))
      .subscribe(() => {
        this.filterListVisitors(i);
      });

    }

    initializeFilterReasons(i) {

      this.filter_list_reasons[i] = new ReplaySubject<any[]>(1);

      const adminAdvocacy = <FormArray>this.editForm.controls['visitorFormArray'];
      adminAdvocacy.controls[i].get('search_control_reason').valueChanges
      .pipe(takeUntil(this._onDestroy),
      startWith(adminAdvocacy.controls[i].get('search_control_reason').value))
      .subscribe(() => {
        this.filterListReasons(i);
      });

    }
 
    initializeFilterEmployees(i) {

      this.filter_list_employees[i] = new ReplaySubject<any[]>(1);

      const adminAdvocacy = <FormArray>this.editForm.controls['staffFormArray'];
      adminAdvocacy.controls[i].get('search_control_employee').valueChanges
      .pipe(takeUntil(this._onDestroy),
      startWith(adminAdvocacy.controls[i].get('search_control_employee').value))
      .subscribe(() => {
        this.filterListEmployees(i);
      });

    }

    initializeFilterTrades(i) {

      this.filter_list_trades[i] = new ReplaySubject<any[]>(1);

      const adminAdvocacy = <FormArray>this.editForm.controls['tradeFormArray'];
      adminAdvocacy.controls[i].get('search_control_trade').valueChanges
      .pipe(takeUntil(this._onDestroy),
      startWith(adminAdvocacy.controls[i].get('search_control_trade').value))
      .subscribe(() => {
        this.filterListTrades(i);
      });

    }

    initializeFilterTradeStaffs(empIndex,staffIndex) {

      this.filter_list_tradestaffs[staffIndex] = new ReplaySubject<any[]>(1);
      // const adminAdvocacy = <FormArray>this.editForm.controls['tradeFormArray'].controls('tradeStaffFormArray');
      const adminAdvocacy = this.tradeFormArray().at(empIndex).get("tradeStaffFormArray") as FormArray
      adminAdvocacy.controls[staffIndex].get('search_control_tradestaff').valueChanges
      .pipe(takeUntil(this._onDestroy),
      startWith(adminAdvocacy.controls[staffIndex].get('search_control_tradestaff').value))
      .subscribe(() => {
        this.filterListTradeStaffs(empIndex,staffIndex);
      });

    }

    initializeFilterProducts(i) {

      this.filter_list_products[i] = new ReplaySubject<any[]>(1);

      const adminAdvocacy = <FormArray>this.editForm.controls['productFormArray'];
      adminAdvocacy.controls[i].get('search_control_product').valueChanges
      .pipe(takeUntil(this._onDestroy),
      startWith(adminAdvocacy.controls[i].get('search_control_product').value))
      .subscribe(() => {
        this.filterListProducts(i);
      });

    }

    filterListVisitors(i) {
      if(!this.listVisitors) {
        return;
      }

      const adminAdvocacy = <FormArray>this.editForm.controls['visitorFormArray'];
      
      let search = adminAdvocacy.controls[i].get('search_control_visitor').value;
      
      if(!search) {
        this.filter_list_visitors[i].next(this.listVisitors.slice());
        return;
      } else {
        search = search.toLowerCase();
      }

      this.filter_list_visitors[i].next(
        this.listVisitors.filter(visitors => visitors.visitor_name.toLowerCase().indexOf(search) > -1)
      );
      
    }

    filterListReasons(i) {
      if(!this.listReasons) {
        return;
      }

      const adminAdvocacy = <FormArray>this.editForm.controls['visitorFormArray'];
      
      let search = adminAdvocacy.controls[i].get('search_control_reason').value;
      
      if(!search) {
        this.filter_list_reasons[i].next(this.listReasons.slice());
        return;
      } else {
        search = search.toLowerCase();
      }

      this.filter_list_reasons[i].next(
        this.listReasons.filter(listReason => listReason.reason.toLowerCase().indexOf(search) > -1)
      );
      
    }

    filterListEmployees(i) {
      if(!this.listStaffs) {
        return;
      }

      const adminAdvocacy = <FormArray>this.editForm.controls['staffFormArray'];
      
      let search = adminAdvocacy.controls[i].get('search_control_employee').value;
      
      if(!search) {
        this.filter_list_employees[i].next(this.listStaffs.slice());
        return;
      } else {
        search = search.toLowerCase();
      }

      this.filter_list_employees[i].next(
        this.listStaffs.filter(employees => employees.staff_name.toLowerCase().indexOf(search) > -1)
      );
      
    }

    filterListTrades(i) {
      if(!this.listTrades) {
        return;
      }

      const adminAdvocacy = <FormArray>this.editForm.controls['tradeFormArray'];
      
      let search = adminAdvocacy.controls[i].get('search_control_trade').value;
      
      if(!search) {
        this.filter_list_trades[i].next(this.listTrades.slice());
        return;
      } else {
        search = search.toLowerCase();
      }

      this.filter_list_trades[i].next(
        this.listTrades.filter(trades => trades.tradeCompanyName.toLowerCase().indexOf(search) > -1)
      );
      
    }

    filterListTradeStaffs(empIndex,staffIndex) {
      if(!this.listTradeStaffs) {
        return;
      }

      const adminAdvocacy = this.tradeFormArray().at(empIndex).get("tradeStaffFormArray") as FormArray
      
      let search = adminAdvocacy.controls[staffIndex].get('search_control_tradestaff').value;
      
      if(!search) {
        this.filter_list_trades[staffIndex].next(this.listTradeStaffs.slice());
        return;
      } else {
        search = search.toLowerCase();
      }

      this.filter_list_trades[staffIndex].next(
        this.listTradeStaffs.filter(tradeStaff => tradeStaff.staffName.toLowerCase().indexOf(search) > -1)
      );
      
    }

    filterListProducts(i) {
      if(!this.listProducts) {
        return;
      }

      const adminAdvocacy = <FormArray>this.editForm.controls['productFormArray'];
      
      let search = adminAdvocacy.controls[i].get('search_control_product').value;
      
      if(!search) {
        this.filter_list_products[i].next(this.listProducts.slice());
        return;
      } else {
        search = search.toLowerCase();
      }

      this.filter_list_products[i].next(
        this.listProducts.filter(listProduct => listProduct.productArrayName.toLowerCase().indexOf(search) > -1)
      );
      
    }


    onRowSelect(event) {
      console.log('event', event);
      this.selectedRows = [];
      event.selected.forEach(element => {
         
            this.selectedRows.push(element)
  
      });
    }
    public updateStaffCount(){

      let count = 0;

      this.dailyWorkerLogs.forEach(data =>{
          if(data.acceptedStatus == true){
            count = count + 1;
          }
      });
      
      this.data_api.updateFBDailyReportStaffCount(this.dailyReportId,count).then(() => {

      }); 

    }

    public approveTime(){
      console.log('this is working')
      //this.spinnerService.show();
         console.log('selectedrows', this.selectedRows)
        //this.spinnerService.show();

        this.selectedRows.forEach(data =>{
          console.log('data',data);
            this.data_api.updateFBTimesheetApprove(data.id).then(() => {
              this.selectedRows = [];
                // swal.fire({
                //     title: "Employee Logs Updated",
                //     // text: "You clicked the button!",
                //     buttonsStyling: false,
                //     customClass: {
                //       confirmButton: 'btn btn-success',
                //     },
                //     icon: "success"
                // })

                //this.addLog();
            }); 
        });  
        
      // this.data_api.approveTime(this.selectedRows).subscribe((data) => {

      //     if(data){

      //       swal.fire({
      //           title: "Selected Employee Logs are Approved",
      //           // text: "You clicked the button!",
      //           buttonsStyling: false,
      //           customClass: {
      //             confirmButton: 'btn btn-success',
      //           },
      //           icon: "success"
      //       })

      //       this.spinnerService.hide();
      //       setTimeout(function(){
      //               window.location.reload();
      //             }, 2000);  
      //       }
          

      // });
      
    }

    public rejectTime(){
    
      //this.spinnerService.show();

      this.selectedRows.forEach(data =>{
          this.data_api.updateFBTimesheetReject(data.id).then(() => {
          this.selectedRows = [];
              // swal.fire({
              //     title: "Employee Logs Updated",
              //     // text: "You clicked the button!",
              //     buttonsStyling: false,
              //     customClass: {
              //       confirmButton: 'btn btn-success',
              //     },
              //     icon: "success"
              // })

              //this.addLog();
          }); 
      });  

      // this.spinnerService.show();

      // this.data_api.rejectTime(this.selectedRows).subscribe((data) => {

      //     if(data){

      //       swal.fire({
      //           title: "Selected Employee Logs are Rejected",
      //           // text: "You clicked the button!",
      //           buttonsStyling: false,
      //           customClass: {
      //             confirmButton: 'btn btn-success',
      //           },
      //           icon: "success"
      //       })

      //       this.spinnerService.hide();
      //       setTimeout(function(){
      //               window.location.reload();
      //             }, 2000);  
      //       }
          

      // });
      
    }

    public archiveTime(){
      this.spinnerService.show();
      this.selectedRows.forEach(data =>{
          this.data_api.updateFBTimesheetArchive(data.id).then(() => {
            setTimeout(()=>{
              this.setTableDataWorkerLogs(this.dailyWorkerLogs);
            },1000)
            this.selectedRows = [];
            this.spinnerService.hide();
              // swal.fire({
              //     title: "Employee Logs Updated",
              //     // text: "You clicked the button!",
              //     buttonsStyling: false,
              //     customClass: {
              //       confirmButton: 'btn btn-success',
              //     },
              //     icon: "success"
              // })

              //this.addLog();
          }); 
      });  

      // this.spinnerService.show();

      // this.data_api.archiveTime(this.selectedRows).subscribe((data) => {

      //     if(data){

      //       swal.fire({
      //           title: "Selected Employee Logs are Archived",
      //           // text: "You clicked the button!",
      //           buttonsStyling: false,
      //           customClass: {
      //             confirmButton: 'btn btn-success',
      //           },
      //           icon: "success"
      //       })

      //       this.spinnerService.hide();
      //       setTimeout(function(){
      //               window.location.reload();
      //             }, 2000);  
      //       }
          

      // });
      
    }

    public unarchiveTime(){

      this.spinnerService.show();

      this.selectedRows.forEach(data =>{
          this.data_api.updateFBTimesheetUnArchive(data.id).then(() => {
            setTimeout(()=>{
              this.setTableDataWorkerArchive(this.dailyWorkerLogsArchive)
            },1000)
            this.selectedRows = [];
            this.spinnerService.hide();
              // swal.fire({
              //     title: "Employee Logs Updated",
              //     // text: "You clicked the button!",
              //     buttonsStyling: false,
              //     customClass: {
              //       confirmButton: 'btn btn-success',
              //     },
              //     icon: "success"
              // })

              //this.addLog();
          }); 
      });  
      // this.spinnerService.show();

      // this.data_api.unarchiveTime(this.selectedRows).subscribe((data) => {

      //     if(data){

      //       swal.fire({
      //           title: "Selected Employee Logs are unArchived",
      //           // text: "You clicked the button!",
      //           buttonsStyling: false,
      //           customClass: {
      //             confirmButton: 'btn btn-success',
      //           },
      //           icon: "success"
      //       })

      //       this.spinnerService.hide();
      //       setTimeout(function(){
      //               window.location.reload();
      //             }, 2000);  
      //       }
          

      // });
      
    }

    public showArchives(){
      this.workerDtTriggerArchieve = new Subject<any>();
      this.spinnerService.show();
      this.hideArchive = false;
      this.spinnerService.hide();
      this.setTableDataWorkerArchive(this.dailyWorkerLogsArchive)
      this.selectedRows = [];
    }

    public hideArchives(){
      this.workerDtTrigger = new Subject<any>();
      this.spinnerService.show();
      this.hideArchive = true;
      this.spinnerService.hide();
      this.setTableDataWorkerLogs(this.dailyWorkerLogs);
      this.selectedRows = [];
    }
    
    ngOnDestroy() {
      this._onDestroy.next();
      this._onDestroy.complete();
      clearInterval(this.Interval);
    }

    // dropImage(event: CdkDragDrop<any[]>) {

    //   moveItemInArray(this.editForm.get('imageUpload')['controls'], event.previousIndex, event.currentIndex);
    //   moveItemInArray(this.editForm.get('imageUpload').value, event.previousIndex, event.currentIndex);

    // }

    dragEntered(event: CdkDragEnter<number>) {
        const drag = event.item;
        const dropList = event.container;
        const dragIndex = drag.data;
        const dropIndex = dropList.data;
    
        const phContainer = dropList.element.nativeElement;
        const phElement = phContainer.querySelector('.cdk-drag-placeholder');
        phContainer.removeChild(phElement);
        phContainer.parentElement.insertBefore(phElement, phContainer);
          
        moveItemInArray(this.editForm.get('imageUpload')['controls'], dragIndex, dropIndex);
        moveItemInArray(this.editForm.value.imageUpload, dragIndex, dropIndex);
        moveItemInArray(this.imageURL, dragIndex, dropIndex);
        moveItemInArray(this.imageSize, dragIndex, dropIndex);

    }
    

    drop(event: CdkDragDrop<DragDropListItem[]>) {

      if(this.lockSwitchBool != true){

            if (event.previousContainer === event.container) {
              moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      
              this.data_api.updateProjectDetailsOrder(this.passID.id,this.detailAccordion)
                .subscribe(
                  (result) => {
                    if(result){
                    }
                },          
              );
      
            } else {
              transferArrayItem(event.previousContainer.data,
                                event.container.data,
                                event.previousIndex,
                                event.currentIndex);
                              
            }

      }


    }
    
    public autoFocus(elementID){
       setTimeout(()=> $("#"+elementID+" input").focus(), 500);
       //setTimeout(()=> $("#summary input").focus(), 500);
      // setTimeout(()=> $(this).parents('.card-collapse').find('input').focus(), 500);
    }

    public focusPanelElement(elementID){
      setTimeout(()=> $("#"+elementID+" input").focus(), 500);
    }

    changeDate(){
        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = today.getFullYear();
        let dateToday = mm + dd + yyyy;

        let selectedDate = this.editForm.value.todaysDate
        let projectID = this.editForm.value.projectId

        let selecteddd = String(selectedDate.getDate()).padStart(2, '0');
        let selectedmm = String(selectedDate.getMonth() + 1).padStart(2, '0'); //January is 0!
        let selectedyyyy = selectedDate.getFullYear();
        let selecteddateToday = selectedmm + selecteddd + selectedyyyy;

        // // if( selecteddateToday === dateToday){
        // //   this.reportPreviewMode = false;
        // // }else{
        // //   this.reportPreviewMode = true;
        // // }
        // this.finishLoading = false;

        // this.editForm.reset();
        // this.editForm.markAsPristine();
        // this.showUpdateUploadButton = false;

        // this.tradeFormArray().clear();
        // this.staffFormArray().clear();
        // this.visitorFormArray().clear();
        // this.productFormArray().clear();

        // // this.editForm.patchValue({
        //       todaysDate: selectedDate,
        //       projectId:  projectID
        // });

        //this.getDailyReport();
        // this.getImages();
        //this.getDailyWorkerLogs();

        // let curURL = this.router.url;
        let silentDate = selectedyyyy+"-"+selectedmm+"-"+selecteddd;
        //this.location.replaceState("/daily-report/project/"+projectID+"?date="+silentDate);
        this.router.navigateByUrl('/daily-report/project/'+projectID+'?date='+silentDate).then(() => {
          window.location.reload();
        });
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
            const base64 = this.getBase64Image(img)
            console.log('base64', base64)
            observer.complete();
          };
          img.onerror = err => {
            observer.error(err);
          };
        } else {
          observer.next(this.getBase64Image(img));
          console.log('observer', observer)
          observer.complete();
        }
      });
    }

    getBase64ImageFromURLTwo = async (url: string) => {
     const myHeaders = new Headers();
     const res = await fetch(this.data_api.bridgeURLData() + '/base-data/url', {
       // Adding method type
       method: 'POST',
       // Adding body or contents to send
       body: JSON.stringify({
         url: url,
       }),
       // Adding headers to the request
       headers: {
         'Content-type': 'application/json; charset=UTF-8'
       }
     });
     const result = res.json();
     return result;
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

  public togglePerfect(){
      if(this.editForm.value.weatherPerfect == true){

          this.editForm.patchValue({
              weatherResidual: '',
              weatherAllDay: '',
              weatherOthersAllDay: '',
              weatherMorning: '',
              weatherOthersMorning: '',
              weatherMidDay: '',
              weatherOthersMidDay: '',
              weatherAfternoon: '',
              weatherOthersAfternoon: '',
              weatherEvening: '',
              weatherOthersEvening: '',
              weatherOnOff: '',
              weatherOthersOnOff: '',
              weatherRestOfDay: '',
              weatherOthersRestOfDay: '',
          });

          this.isOthersAllDay = 'hide';	  
          this.isOthersMorning = 'hide';
          this.isOthersMidDay = 'hide';
          this.isOthersAfternoon = 'hide';
          this.isOthersEvening = 'hide';
          this.isOthersOnOff = 'hide';
          this.isOthersRestOfDay = 'hide';

      }
  }

  // public getProject(){
  //     this.spinnerService.show();
  //     this.data_api.getProject(this.passID.id).subscribe(
        
  //       (data) => {
  //         this.projectName = data[0].project_name;
  //         this.jobNumber = data[0].job_number;
  //         this.projectAddress = data[0].project_address;
  //         this.aimedDate = moment(data[0].aimed_date).format('DD/MM/YYYY');
  //         this.projWorkers =  JSON.parse(data[0].project_worker_id);
  //         this.projOwners =  JSON.parse(data[0].project_owner_id);
  //         this.projSupervisor = JSON.parse(data[0].site_supervisor);
  //         this.latitude = data[0].latitude;
  //         this.longitude = data[0].longitude;
  //         this.projImageBackground = data[0].bg_name;
  //         this.editForm.patchValue({
  //           projectId:  data[0].id
  //         });
  //         // if((data[0].materials) && (data[0].materials != 'null') ){
  //         //   this.materialsData = JSON.parse(data[0].materials);
  //         //   this.materialSource = new LocalDataSource(this.materialsData);
  //         // }
  //         if((data[0].stages) && (data[0].stages != 'null') ){
  //           this.stagesData = JSON.parse(data[0].stages);
  //           this.stageSource = new LocalDataSource(this.stagesData);
  //         }

  //         this.getSupervisor(data[0].site_supervisor);
  //         if(data[0].detail_accordion){
  //           this.detailAccordion = JSON.parse(data[0].detail_accordion)
  //         }
  //         this.spinnerService.hide();
          
  //         this.getSupervisors();
  //         // this.getProjectOwners();
          
  //     }
  //     // (error) => {
  //     //     swal.fire({
  //     //         title: error.error.message,
  //     //         // text: "You clicked the button!",
  //     //         buttonsStyling: false,
  //     //         customClass: {
  //     //           confirmButton: 'btn dcb-btn',
  //     //           cancelButton: 'btn dcb-btn',
  //     //         },
  //     //         showCancelButton: true,
  //     //         icon: "error",
  //     //         reverseButtons: true,
  //     //         confirmButtonText: 'Report Error',
  //     //         cancelButtonText: 'Close',
  //     //     }).then((result) => {
  //     //       if (result.isConfirmed) {
  //     //         swal.fire({
  //     //           title: error.error.message,
  //     //         })
  //     //       } 
  //     //       // else if (result.dismiss === swal.DismissReason.cancel) {
  //     //       //   swal.fire(
  //     //       //     'Cancelled',
  //     //       //     'Your imaginary file is safe :)',
  //     //       //     'error'
  //     //       //   )
  //     //       // }
  //     //     })
  //     //     this.spinnerService.hide();
  //     // }

  //     );
  // }

  getEOT2(){
    if(this.editForm.value.eot == true){
          return [
                {
                    stack: [
                      {
                        text: 'EOT: '+(this.editForm.value.eot ? 'Yes' : 'No'),
                        style: 'fieldHeader',
                        margin: [ 5, 10, 0, 0 ],
                        },
                      {canvas: [{ type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 0.1,lineColor: '#A9A9A9' }],margin: [ 0, 2, 0, 2 ],},
                    ],
            }
          
          ]
    }else{
          return;
    }
 }

  getDetails(data,label) {
    let accsList = data

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
                        text: label+':',
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

  public getOptionalColumns(){
      let colLen = [];

      if(this.editForm.value.instructionsReceived){
        if(this.editForm.value.instructionsReceived != ''){
          colLen.push(
            {
              data: this.editForm.value.instructionsReceived,
              title: 'INSTRUCTIONS RECEIVED',
            });
        }
      }
      if(this.editForm.value.delays){
        if(this.editForm.value.delays != ''){
            colLen.push(
              {
                data: this.editForm.value.delays,
                title: 'DELAYS',
              });
        }
      }
      if(this.editForm.value.toolsUsed){
        if(this.editForm.value.toolsUsed != ''){
          colLen.push(
            {
              data: this.editForm.value.toolsUsed,
              title: 'TOOLS USED',
            });
        }  
      }
      if(this.editForm.value.damageReport){
        if(this.editForm.value.damageReport != ''){
          colLen.push(
            {
              data: this.editForm.value.damageReport,
              title: 'DAMAGE REPORT',
            });
        } 
      }
      if(this.editForm.value.summary){
        if(this.editForm.value.summary != ''){
          colLen.push(
            {
              data: this.editForm.value.summary,
              title: 'SUMMARY',
            });
        } 
      }
      if(this.editForm.value.materialsRequested){
        if(this.editForm.value.materialsRequested != ''){
          colLen.push(
            {
              data: this.editForm.value.materialsRequested,
              title: 'MATERIALS REQUESTED',
            });
         }  
      }
      if(this.editForm.value.tradesContact){
        if(this.editForm.value.tradesContact != ''){
          colLen.push(
            {
              data: this.editForm.value.tradesContact,
              title: 'TRADES TO CONTACT',
            });
        } 
      }
      if(this.editForm.value.tradesSched){
        if(this.editForm.value.tradesSched != ''){
          colLen.push(
            {
              data: this.editForm.value.tradesSched,
              title: 'TRADES TO SCHEDULE',
            });
        } 
      }
      if(this.editForm.value.offHirePlant){
        if(this.editForm.value.offHirePlant != ''){
          colLen.push(
            {
              data: this.editForm.value.offHirePlant,
              title: 'OFF HIRE PLANT',
            });
        }  
      }
      if(this.editForm.value.variations){
        if(this.editForm.value.variations != ''){
          colLen.push(
            {
              data: this.editForm.value.variations,
              title: 'VARIATIONS',
            });
        }  
      }
      if(this.editForm.value.deliveries){
        if(this.editForm.value.deliveries != ''){
          colLen.push(
            {
              data: this.editForm.value.deliveries,
              title: 'DELIVERIES',
            });
        }  
      }

      let columnMasonry = [];

      for (let i = 1; i <= colLen.length; i += 2) {

                  if(colLen[i]){

                    columnMasonry.push([
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
                                            text: colLen[i-1].title,
                                            style: 'testHeader',
                                            margin: [ 5, -15, 0, 0 ]
                                        },
                                        this.getOptionalValue(colLen[i-1].data),
                                      ],
                                      unbreakable: true,
                                      margin: [ 0, 10, 0, 0 ],

                                  },
                                  { 

                                      stack: [
                                        {
                                            image: this.pdfImage.bgSubAccThisWeek,
                                            width: '265',
                                            // margin: [ 0, 20, 0, 0 ]
                                        },
                                        {
                                            text: colLen[i].title,
                                            style: 'testHeader',
                                            margin: [ 5, -15, 0, 0 ]
                                        },
                                        this.getOptionalValue(colLen[i].data),
                                      ],
                                      unbreakable: true,
                                      margin: [ 0, 10, 0, 0 ],

                                  },    
                              ],
                              columnGap: 10,
                              margin: [ 0, 10, 0, 0 ],
                          },
  
                      ])

                  }else{

                      columnMasonry.push([
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
                                                text: colLen[i-1].title,
                                                style: 'testHeader',
                                                margin: [ 5, -15, 0, 0 ]
                                            },
                                            this.getOptionalValue(colLen[i-1].data),
                                          ],
                                          unbreakable: true,
                                          margin: [ 0, 10, 0, 0 ],
                                        
                                      }

                                  ],
                                  columnGap: 10,
                                  margin: [ 0, 10, 0, 0 ],
                              },
                          ])
                  }
      }

      return columnMasonry;

  }

  public getOptionalValue(value){
      
        if(value){
          return {
            ul: [
              ...value.map(info => {
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
        }

  }

  //  getFBUser(id){
  //   if(id){
  //         this.data_api.getFBUser(id).subscribe(data => {
  //           return data.userFirstName;
  //         });          
  //       //return userData.userFirstName + ' ' + userData.userLastName;
  //   }
  // }

  getFBDailyWorkerLogs(){
    //       let end_date= this.editForm.value.fridayDate;
    //       let start_date = new Date(end_date);
    //       start_date.setDate( start_date.getDate() - 6 );

    //       let passData = {
    //         todaysDate: this.editForm.value.todaysDate,
    //         uploadSource: this.projUploadSource
    //       }
    
    let fromDate;
    let toDate;

    fromDate = this.editForm.value.todaysDate;
    toDate = this.editForm.value.todaysDate;

    this.data_api.getFBDailyWorkerLogs(this.editForm.value.projectId,fromDate,toDate).subscribe(data => {
              if(data){  
                    this.dailyWorkerLogs = [];
                    this.dailyWorkerImages = [];
                    this.dailyWorkerLogsArchive = [];
                    this.dailyWorkerLogsAccepted = [];

                    data.forEach(workerDataLog =>{ 

                        let workerLog;

                        workerLog = workerDataLog;
                        let selectedWorker = this.listWorkers.find(o => o.id === workerLog.workerID);
                        workerLog['workerName'] = selectedWorker.userFirstName + ' ' + selectedWorker.userLastName;
                        if(workerLog){
                         console.log('workerlogarchive', workerLog.archiveStatus)
                         if(workerLog.archiveStatus == true){
                           this.dailyWorkerLogsArchive.push(workerLog)
                           this.setTableDataWorkerArchive(this.dailyWorkerLogsArchive)
                          }else{
                             this.dailyWorkerLogs.push(workerLog) 
                             this.setTableDataWorkerLogs(this.dailyWorkerLogs);
                          }

                          if( (workerLog.archiveStatus != true) && (workerLog.acceptedStatus == true) ){

                              this.dailyWorkerLogsAccepted.push(workerLog)

                              //let workerLogImage = workerLog.imageUpload;
                              if(workerLog.imageUpload){

                                    workerLog.imageUpload.forEach(async imageUploads =>{ 
                                      await this.getBase64ImageFromURL(imageUploads.imageFile).subscribe((base64Data: string) => {   
                                            
                                            this.dailyWorkerImages.push(
                                            {
                                              'imageCaption': imageUploads.imageCaption,
                                              'imageFile': base64Data,
                                              'imageSize': imageUploads.imageSize,
                                              'imageStamp': imageUploads.imageStamp, 
                                            }
                                            );
                                        });
                                    })
                              }

                          }

                          

                        }
                    })
                    this.timesheetImagefinishLoading = true;

                    this.updateStaffCount();
              }else{
                  this.timesheetImagefinishLoading = true;
                  this.setTableDataWorkerLogs([]);
              }
      });
    
    }

// SET TABLE DATA 26-03-2025
setTableDataWorkerLogs(data: any) {
  if ($.fn.dataTable.isDataTable('#workerTable')) {
    console.log('datatabled destroyed')
    $('#workerTable').DataTable().destroy();
  }       
  console.log('worker data', data)
  // Update workerOptions
  this.workerOptions.data = data;
  this.workerOptions.columns = [
    {
      data: null,
      title: '', 
      orderable: false,
      searchable: false,
      width: '50px',
      createdCell: (cell: any, cellData: any, rowData: any) => {
        cell.innerHTML = `<input type="checkbox" class="row-checkbox" />`;
    
        // Optional: store checkbox status if needed later
        cell.querySelector('.row-checkbox')?.addEventListener('change', (event: any) => {
          if (event.target.checked) {
            this.selectedRows.push(rowData);
          } else {
            this.selectedRows = this.selectedRows.filter(row => row !== rowData);
          }
          console.log('Selected Rows:', this.selectedRows);
        });
      }
    },    
    {
      data: null,
      title: 'Action',
      width: '100px',
      orderable: false,
      searchable: false,
      createdCell: (cell: any, cellData: any, rowData: any) => {
        cell.innerHTML = `
          <a href="javascript:void(0);" class="edit"><i class="material-icons" title="Edit">edit</i></a>
          <a href="javascript:void(0);" class="delete"><i class="material-icons" title="Delete">delete</i></a>
        `;
        cell.querySelector('.edit')?.addEventListener('click', () => {
          this.updateWorkerLog(rowData);
        });
        cell.querySelector('.delete')?.addEventListener('click', () => {
          this.openDeleteDialog(rowData);
        });
      },
    },
     {
      title: 'Accepted',
      render: (data, type,row) => {
          return row.acceptedStatus == true ? '<span class="color-positive">Yes</span>' : '<span class="color-negative">No</span>';
      }
    },
    {
      title: 'Name',
      render: (cell,type,row) => {
          return row.workerName;
      }
    },
    // {
    //   data: 'projectId',
    //   title: 'Project Name',
    //   orderable: false,
    //   render: (data: any, type: any, row: any) => {
    //     console.log('worker log', row)
    //     console.log('this.projectName', this.projectNames)
    //     return this.projectNames.find(o => o.id === row?.projectId)?.projectName 
    //       ?? 'Project is deleted or not found';
    //   },
    // },
    {
      title: 'Date',
      render: (data: any, type: any, row: any) => {
        return row.selectedDate.toDate().toDateString();
      },
    },
    { data: 'accomplishments', title: 'Notes' },
    { data: 'start', title: 'Start' },
    { data: 'break', title: 'Break' },
    { data: 'finish', title: 'Finish' },
    {
      data: 'entryStatus',
      title: 'Status',
      render: (data: any, type: any, row: any) => {
        return row.entryStatus + ' ' + 
               (row.modifiedBy ? "(modified by " + row.modifiedBy + ")" : "") + 
               ' ' + 
               (row.modifiedDate ? "(updated last " + row.modifiedDate.toDate().toDateString() + ")" : "");
      },
    },
    {
      data: null,
      title: 'Image',
      orderable: false,
      searchable: false,
      createdCell: (cell: any, cellData: any, rowData: any) => {
        cell.innerHTML = rowData.imageUpload
          ? `<button style="min-width:100px!important; padding: 5px 10px !important;" mat-button class="btn dcb-btn view-images">View Images</button>`
          : 'No Image';
        cell.querySelector('.view-images')?.addEventListener('click', () => {
          this.openImageDialog(rowData);
        });
      },
    }
  ];

  // **Fix: Destroy and reinitialize DataTable**
  setTimeout(() => {
    this.workerDtTrigger.next();  
    console.log('datatable trigger');
  }, 1000);
}


  updateWorkerLog(rowData: any) {
    const dialogRef = this.dialog.open(WorkersLogDialog, {
        width: '400px',
        data: rowData
    });

    dialogRef.afterClosed().subscribe(result => {
      
      if(result == 'success'){   
          setTimeout(function(){
            window.location.reload();
          }, 1000);  
      }
    });
  }
  
  // DELETE WORKER LOGS
  openDeleteDialog(data: string) {
    const dialogRef = this.dialog.open(WorkerLogsDeleteDialog, {
      width: '400px',
      data: data
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.spinnerService.show();
  
        this.data_api.deleteFBTimesheet(result).then(() => {
          this.spinnerService.hide();
          $.notify({
            icon: 'notifications',
            message: 'Entry Deleted'
          }, {
            type: 'success',
            timer: 1000,
            placement: { from: 'top', align: 'center' },
            template: `
              <div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0} alert-with-icon" role="alert">
                <button mat-button type="button" aria-hidden="true" class="close" data-notify="dismiss">
                  <i class="material-icons">close</i>
                </button>
                <i class="material-icons" data-notify="icon">notifications</i>
                <span data-notify="title">{1}</span>
                <span data-notify="message">{2}</span>
              </div>`
          });
          window.location.reload();
        });
      }
    });
  }



  openImageDialog(rowData: any): void {
    const dialogRef = this.dialog.open(DailyProjectViewWorkerImageDialog, {
      data: rowData.imageUpload  
    });

    dialogRef.componentInstance.onEnlarge.subscribe((enlargedData) => {
      this.imgSrc = '';  
      this.getBase64ImageFromURL(enlargedData.image).subscribe((base64Data: string) => {
        this.imgSrc = base64Data;  
      });
      
      if (enlargedData.timestamp) {
        this.imgStampString = enlargedData.timestamp.toDate();
      }
    });
  }


  setTableDataWorkerArchive(data){
    if ($.fn.dataTable.isDataTable('#workerTableArchieve')) {
      console.log('datatabled destroyed')
      $('#workerTableArchieve').DataTable().destroy();
    }       
    console.log('data',data)
  this.workerOptionsArchive.data = data
  this.workerOptionsArchive.columns = [
    {
      data: null,
      title: '', 
      orderable: false,
      searchable: false,
      width: '50px',
      createdCell: (cell: any, cellData: any, rowData: any) => {
        cell.innerHTML = `<input type="checkbox" class="row-checkbox" />`;
    
        // Optional: store checkbox status if needed later
        cell.querySelector('.row-checkbox')?.addEventListener('change', (event: any) => {
          if (event.target.checked) {
            this.selectedRows.push(rowData);
          } else {
            this.selectedRows = this.selectedRows.filter(row => row !== rowData);
          }
          console.log('Selected Rows:', this.selectedRows);
        });
      }
    },
    {
      title: "Action",
      data: null,
      width: "30px",
      orderable: false,
      createdCell: (cell: any, cellData: any, rowData: any) => {
        cell.innerHTML = `
          <a href="javascript:void(0);" class="edit"><i class="material-icons" title="Edit">edit</i></a>
          <a href="javascript:void(0);" class="delete"><i class="material-icons" title="Delete">delete</i></a>
        `;
        cell.querySelector('.edit')?.addEventListener('click', () => {
          this.updateWorkerLogArchieve(rowData);
        });
        cell.querySelector('.delete')?.addEventListener('click', () => {
          this.openDeleteDialogArchieve(rowData);
        });
      },
    },
    {
      title: "Archive",
      data: "archiveStatus",
      width: "8%",
      orderable: false,
      render: (data, type, row) =>
        row.archiveStatus == true ? '<span class="color-positive">Yes</span>' : '<span class="color-negative">No</span>'
    },
    {
      title: "Name",
      data: "workerName",
      width: "15%",
      orderable: false,
    },
    {
      title: "Notes",
      data: "accomplishments",
      width: "25%",
      orderable: false,
    },
    {
      title: "Start",
      data: "start",
      width: "8%",
      orderable: false,
    },
    {
      title: "Break",
      data: "break",
      width: "8%",
      orderable: false,
    },
    {
      title: "Finish",
      data: "finish",
      width: "8%",
      orderable: false,
    },
    {
      title: "Status",
      data: null,
      width: "10%",
      orderable: false,
      render: (data, type, row) =>
        row.entryStatus + ' ' + (row.modifiedBy ? "(modified by "+row.modifiedBy+")" : "") + ' ' + (row.modifiedDate ? "(updated last "+row.modifiedDate.toDate().toDateString()+")" : "")
    },
    {
      data: null,
      title: 'Image',
      createdCell: (cell: any, cellData: any, rowData: any) => {
        cell.innerHTML = rowData.imageUpload
          ? `<button style="min-width:100px!important; padding: 5px 10px !important;" mat-button class="btn dcb-btn view-images">View Images</button>`
          : 'No Image';
        cell.querySelector('.view-images')?.addEventListener('click', () => {
          this.openImageDialogArchieve(rowData);
        });
      },
    },
  ]
  setTimeout(()=>{
    this.workerDtTriggerArchieve.next()
    console.log('datatable triggered')
  },1000)
  }


  // FOR UPDATING
  updateWorkerLogArchieve(rowData): void {
    const dialogRef = this.dialog.open(WorkersLogDialog, {
        width: '400px',
        data: rowData
    });

    dialogRef.afterClosed().subscribe(result => {
      
      if(result == 'success'){   
          setTimeout(function(){
            window.location.reload();
          }, 1000);  
      }
    });
}

// FOR DELETING
openDeleteDialogArchieve(data): void {

  const dialogRef = this.dialog.open(WorkerLogsDeleteDialog, {
      width: '400px',
      data: data
  });

  dialogRef.afterClosed().subscribe(result => {
      
        if(result){ 

          this.spinnerService.show();   
              this.data_api.deleteFBTimesheet(result).then(() => {
                this.spinnerService.hide();  
                // this.addLog();
                $.notify({
                  icon: 'notifications',
                  message: 'Entry Deleted'
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

                setTimeout(function(){
                  window.location.reload();
                }, 1000);  
                
              });

        }

    });
}

// IMAGE DISPLAY

openImageDialogArchieve(data): void {
  this.imgSrc = "";

  this.getBase64ImageFromURL(data.image).subscribe((base64Data: string) => {  
    this.imgSrc = base64Data;
    
    // If timestamp exists, convert it to date
    if (data.timestamp) {
      this.imgStampString = data.timestamp.toDate();
    }

    // Open Dialog
    const dialogRef = this.dialog.open(DailyProjectViewWorkerImageDialog, {
      width: '100%',
      data: data.imageUpload
    });

    dialogRef.afterClosed().subscribe(result => {
     
    });
  });
}



  // END 26-03-2025

    scroll(el: HTMLElement) {
       
        setTimeout(function(){
          el.scrollIntoView();
        }, 500);  
    }

    // onResize(event) {
    //   // this.breakpoint = event.target.innerWidth <= 1024 ? 4 : 8;
    //   // this.breakpoint = event.target.innerWidth <= 768 ? 1 : 8;
    //   if(event.target.innerWidth <= 430){
    //     this.breakpoint = 1;
    //   }else if(event.target.innerWidth <= 600){
    //     this.breakpoint = 2;
    //   }else if(event.target.innerWidth <= 768){
    //     this.breakpoint = 3;
    //   }else if(event.target.innerWidth <= 1200){
    //     this.breakpoint = 4;
    //   }else if(event.target.innerWidth <= 1700){
    //     this.breakpoint = 5;
    //   }else if(event.target.innerWidth > 1700){
    //     this.breakpoint = 8;
    //   }
    // }

    public tagInputSave(){

      // if(this.finishLoading == false){
      //   return;
      // }

      //     // this.calculateTotalSize();

      //     this.data_api.addDailyReport(this.editForm.getRawValue()).subscribe((data1) => {

      //         this.editForm.markAsPristine();
      //         this.addCLog(this.method, this.message +'(action-triggered)');
      //     })
        
    }

    checkZeroHour(){
        let returnValue;
        const staffControls = this.editForm.controls['staffFormArray']['controls'];
        staffControls.forEach( staffControl => {
          
          const taskControls = staffControl['controls']['taskStaffFormArray']['controls'];

          taskControls.forEach( taskControl => {
   
            if(taskControl['controls']['checkDetailStaff'].value == true){

                const hourValue2 = taskControl['controls']['tempHours'].value;
                if(hourValue2){
    
                  if(hourValue2 == 0 || hourValue2 == ''){
                    returnValue = false;
                    return;
                  }else if(parseFloat(hourValue2) <= 0){
                    returnValue = false;
                    return;
                  }
    
                }else{
                    returnValue = false;
                    return;
                }

            }else{

                const hourValue = taskControl['controls']['hours'].value;
                if(hourValue){
    
                  if(hourValue == 0 || hourValue == ''){
                    returnValue = false;
                    return;
                  }else if(parseFloat(hourValue) <= 0){
                    returnValue = false;
                    return;
                  }
    
                }else{
                    returnValue = false;
                    return;
                }

            }
            

          });

        });
        if(returnValue == false){
          return false;
        }else{
          return true;
        }
        
    }
    // public async saveStep1Test(message){
    //   this.todaysDateRaw = this.editForm.value.todaysDate;
    //   this.todaysDate = ('0' + (this.todaysDateRaw.getDate())).slice(-2) + '-' + ('0' + (this.todaysDateRaw.getMonth() + 1) ).slice( -2 ) + '-' + this.todaysDateRaw.getFullYear();
    //   const documentDefinition = this.getDocumentDefinition2();

    //   const pdfDocGenerator = pdfMake.createPdf(documentDefinition);
      
    //   pdfDocGenerator.open();
    // }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public async saveStep1(message){

          if (this.checkZeroHour() == false){

            let htmlVal = "Employee's hours";

              swal.fire({
                  title: "Please fill required fields!",
                  html: htmlVal,
                  buttonsStyling: false,
                  customClass: {
                    confirmButton: 'btn btn-success',
                  },
                  icon: "error"
              })
              return;
          }

          // Initiate PDF Generation
          this.progressOverlay.show('Generating Report PDF','#0771DE','white','lightslategray',1); 

          await this.delay(3000);

          if(!this.editForm.value.reportNumber){
            this.editForm.patchValue({
              reportNumber: ''
            });
  
          }

          if(!this.dailyReportId){
            const report_num = await this.getFBCounterDailyReport();
            this.editForm.patchValue({
              reportNumber: report_num
            });

            this.data_api.updateFBCounterDailyReport(report_num).then(() => {
            });
          }
   
          this.pdfstaffTotalHours = 0;
          this.todaysDateRaw = this.editForm.value.todaysDate;
          this.todaysDate = ('0' + (this.todaysDateRaw.getDate())).slice(-2) + '-' + ('0' + (this.todaysDateRaw.getMonth() + 1) ).slice( -2 ) + '-' + this.todaysDateRaw.getFullYear();
          const documentDefinition = this.getDocumentDefinition2();

          const pdfDocGenerator = pdfMake.createPdf(documentDefinition);
          this.progressOverlay.hide();

         
          this.progressOverlay.show('Uploading Report PDF','#0771DE','white','lightslategray',1);
          let selectedDate = this.editForm.value.todaysDate
          let folderName =  moment(selectedDate).format('YYYY-MM-DD');
          let formattedDate = ('0' + (this.todaysDateRaw.getDate())).slice(-2) + '-' + ('0' + (this.todaysDateRaw.getMonth() + 1) ).slice( -2 ) + '-' + this.todaysDateRaw.getFullYear();

          let id = formattedDate+'-'+this.jobNumber+'.pdf'

          // if(message=="download"){
          //   pdfDocGenerator.download(id); 
          // }else if(message=="preview"){
          //   pdfDocGenerator.open();
          // }

          pdfDocGenerator.getBase64((data) => {

            let ref = this.afStorage.ref(this.accountFirebase+'/'+this.projUploadFolder+'/Daily Report/'+folderName+'/'+id);
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
                  this.editForm.patchValue({
                    pdfLink: url
                  });
                  
                  if(message=="download"){
                    this.downloadPDF(data,id);
                  }else if(message=="preview"){
                    window.open(url, "_blank");
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

                          // navigator.clipboard.writeText(url);

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

    // public copyPdfLink(){
    //   this.clipboard.copy(this.editForm.value.pdfLink);
    //   $.notify({
    //   icon: 'notifications',
    //   message: 'PDF link copied.'
    //   }, {
    //     type: 'success',
    //     timer: 1000,
    //     placement: {
    //       from: 'top',
    //       align: 'center'
    //     },
    //     template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0} alert-with-icon" role="alert">' +
    //     '<button mat-button type="button" aria-hidden="true" class="close" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
    //     '<i class="material-icons" data-notify="icon">notifications</i> ' +
    //     '<span data-notify="title">{1}</span> ' +
    //     '<span data-notify="message">{2}</span>' +
    //     '<div class="progress" data-notify="progressbar">' +
    //       '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
    //     '</div>' +
    //     '<a href="{3}" target="{4}" data-notify="url"></a>' +
    //     '</div>'
    //   });
    
    // }

    public async saveStep2() {

      if(this.editForm.controls.imageUpload.dirty == true){

                  this.progressOverlay.show('Uploading Images','#0771DE','white','lightslategray',1); 

                  this.allPercentage = [];
                  let imageLen = this.editForm.value.imageUpload.length;
                  let imageDone = 0;
                  let i = 0;

                  let selectedDate = this.editForm.value.todaysDate
                  let folderName =  moment(selectedDate).format('YYYY-MM-DD');

                  this.editForm.patchValue({
                    folderName: folderName
                  });

                  

                    // //Delete Current Images
                    // if(this.imageURLTBD){
                    //   for (let imageTBD of this.imageURLTBD) { 
                    //   await this.afStorage.storage.refFromURL(imageTBD).delete();
                    //   }
                    // }

                    for (let image of this.editForm.value.imageUpload) { 
                    //for (let i = 0; i < this.imageURL.length; i++) {
                      let base64image = image.imageFile;
                      let id = Math.random().toString(36).substring(2);
                      let ref = this.afStorage.ref(this.accountFirebase+'/'+this.projUploadFolder+'/Daily Report/'+folderName+'/'+i);
                      //let base64String = base64image.split(',').pop();
                      let task = ref.putString(base64image, 'data_url');
                      let _percentage$ = task.percentageChanges();
                      this.allPercentage.push(_percentage$);
                      
                      task.snapshotChanges().pipe(
                        finalize(() => {
                          ref.getDownloadURL().subscribe((url) => { 
                            // this.downloadURLs = this.downloadURLs.concat([url]);
                            let splitName = url.split(/%2..*%2F(.*?)\?alt/);

                            this.downloadArray.push({
                                url: url,
                                nameIndex: splitName[1]
                            });
                            
                            imageDone = imageDone + 1;
                            if(imageDone == imageLen){
                              this.progressOverlay.hide();
                              this.saveStep3();
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
                          this.progressOverlay.setProgress(Math.ceil(this.totalPercentage));
                          // if(this.totalPercentage == 100){
                            
                          // }
                        }
                      )
                  );
      }else{
        this.saveStep3();
      }
    }

    saveStep3() {

        if( this.downloadArray){
            //Sort Download URLS by filename
            this.downloadArray.sort((a, b) => {
              return a.nameIndex - b.nameIndex;
            });

            this.downloadArray.forEach((data) => {
              this.downloadURLs.push(data.url);
            });

        }
        
        if(this.editForm.controls.imageUpload.dirty == true){

            let i = 0;
          
        
            this.downloadURLs.forEach(imageUrl => {

              const myForm =  (<FormArray>this.editForm.get("imageUpload")).at(i);
              myForm.patchValue({
                imageFile: imageUrl
              });
              i++;
      
            });

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
              //how to get 1 - number of recent images; 1 -  this.downloadURLs.length
              //9  = (10 - this.downloadURLs.length)
              // this.recentImages[i - 1].imageUrl = this.recentImages[1 to 9] is not available

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

            }

            this.data_api.setRecentImagesDailyReport(tempImages).then(() => {
                 this.saveStep4();
            })
            .catch(err => {

            });  

        }else{
          this.saveStep4();
        }

    }

    getRecentImagesDailyReport(){

      this.data_api.getFBRecent().pipe(first()).subscribe(data => {

          if(data.recentImagesDailyReport){
            this.recentImages = [];
              this.recentImages = data.recentImagesDailyReport;
              //this.recentImages = data.recentImagesDailyReport.sort((a, b) => (a.order > b.order) ? -1 : 1);

          }
          if(data.recentEntryDaily){
            this.recentEntryDaily = [];
            this.recentEntryDaily = data.recentEntryDaily;
            //this.recentImages = data.recentImagesDailyReport.sort((a, b) => (a.order > b.order) ? -1 : 1);

         }
      });

    }

    saveStep4(): void {

          this.spinnerService.show();

          if(this.editForm.value.tradeFormArray.length > 0){
              let arrayTrades = [];
              let data = this.editForm.value.tradeFormArray;
              if(data){
                data.forEach(tradesList=> {
                  arrayTrades.push(tradesList.tradesOnSite);
                });
                this.editForm.patchValue({
                  tradesIdArray: arrayTrades
                });
              }
          }
          if(this.editForm.value.staffFormArray.length > 0){
              let arrayStaff = [];
              let data = this.editForm.value.staffFormArray;
              if(data){
                data.forEach(staffList=> {
                  arrayStaff.push(staffList.staffOnSite);
                });
                this.editForm.patchValue({
                  staffIdArray: arrayStaff
                });
              }
          }
          
          if(this.dailyReportId){
         const parsedUserData = JSON.parse(localStorage.getItem('currentUser'));
         const modifiedUserBy = parsedUserData.user_id
         this.editForm.patchValue({modifiedBy : modifiedUserBy})
              if(this.editForm.controls.imageUpload.dirty != true){
                this.editForm.controls.imageUpload.disable();
              }

              this.data_api.updateFBDailyReport(this.dailyReportId, this.editForm.value).then(() => {
                  this.spinnerService.hide();
                  $.notify({
                    icon: 'notifications',
                    message: 'Daily Report Updated.'
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

                      // for (let imageTBD of this.imageURLTBD) { 
                      //   this.afStorage.storage.refFromURL(imageTBD).delete();
                      // }

                      let i = 0;
                      this.imageURL.forEach(imageUrl => {
                      const myForm =  (<FormArray>this.editForm.get("imageUpload")).at(i);
                      myForm.patchValue({
                        imageFile: imageUrl
                      });
                      i++;
                      });

                      this.imageURLTBD = [];
                      this.imageURLTBD = this.downloadURLs;
                      this.downloadURLs = [];

                  } 

                  let tempEntries = [];  

                  tempEntries.push(
                    {
                      projectName: this.projectName,
                      projectId: this.editForm.value.projectId,
                      todaysDate: this.editForm.value.todaysDate,
                      tradesOnSite: this.countNumber(this.editForm.value.tradeFormArray),
                      staffsOnSite: this.countNumber(this.editForm.value.staffFormArray),
                      visitorOnSite: this.countNumber(this.editForm.value.visitorFormArray),
                      order: 1,
                    }); 
                    if(this.recentEntryDaily){
                      if(this.recentEntryDaily.length > 0){
                          for (let i = 1; i <= (5 - 1); i++) {

                            if ( i > this.recentEntryDaily.length) {
                              break;
                            }

                            tempEntries.push(
                              { 
                                projectName: this.recentEntryDaily[i - 1].projectName,
                                projectId: this.recentEntryDaily[i - 1].projectId,
                                todaysDate: this.recentEntryDaily[i - 1].todaysDate,
                                tradesOnSite: this.recentEntryDaily[i - 1].tradesOnSite,
                                staffsOnSite: this.recentEntryDaily[i - 1].staffsOnSite,
                                visitorOnSite: this.recentEntryDaily[i - 1].visitorOnSite,
                                order: i + 1,
                              }); 
                          }
                      }
                    }
                  this.data_api.setRecentEntryDailyReport(tempEntries).then(() => {
                    this.getRecentImagesDailyReport();
                    this.addLog('update','Updated a Daily Report');
                  })


                });

          }else{

              this.editForm.patchValue({
                createdAt: new Date(),
                createdBy: this.userDetails.user_id
              });

              this.data_api.createFBDailyReport(this.editForm.value).then(data => {
       
                this.dailyReportId = data;

                $.notify({
                  icon: 'notifications',
                  message: 'Daily Report Saved.'
                }, {
                    type: 'success',
                    timer: 1000,
                    placement: {
                        from: 'top',
                        align: 'center'
                    },
                    template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0} alert-with-icon" role="alert">' +
                      '<button  mat-button type="button" aria-hidden="true" class="close" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
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

                    let i = 0;
                    this.imageURL.forEach(imageUrl => {
                      const myForm =  (<FormArray>this.editForm.get("imageUpload")).at(i);
                      myForm.patchValue({
                        imageFile: imageUrl
                      });
                      i++;
                    });

                    this.imageURLTBD = [];
                    this.imageURLTBD = this.downloadURLs;
                    this.downloadURLs = [];
                } 
                
                let tempEntries = [];  

                tempEntries.push(
                  {
                    projectName: this.projectName,
                    projectId: this.editForm.value.projectId,
                    todaysDate: this.editForm.value.todaysDate,
                    tradesOnSite: this.countNumber(this.editForm.value.tradeFormArray),
                    staffsOnSite: this.countNumber(this.editForm.value.staffFormArray),
                    visitorOnSite: this.countNumber(this.editForm.value.visitorFormArray),
                    order: 1,
                  }); 

                  if(this.recentEntryDaily){
                    if(this.recentEntryDaily.length > 0){
                        for (let i = 1; i <= (5 - 1); i++) {

                          if ( i > this.recentEntryDaily.length) {
                            break;
                          }

                          tempEntries.push(
                            { 
                              projectName: this.recentEntryDaily[i - 1].projectName,
                              projectId: this.recentEntryDaily[i - 1].projectId,
                              todaysDate: this.recentEntryDaily[i - 1].todaysDate,
                              tradesOnSite: this.recentEntryDaily[i - 1].tradesOnSite,
                              staffsOnSite: this.recentEntryDaily[i - 1].staffsOnSite,
                              visitorOnSite: this.recentEntryDaily[i - 1].visitorOnSite,
                              order: i + 1,
                            }); 
                        }
                    }
                  }

                  this.data_api.setRecentEntryDailyReport(tempEntries).then(() => {
                    this.getRecentImagesDailyReport();
                    this.addLog('create','Created New Daily Report');
                  })
                  
              });
             
          }

    }

    public countNumber(data) {
      let count = data;
      if (count){
        return count.length;
      }else{
        return 0;
      }
      
  }
 
    public addLog(method,message){

      
        const tempVal = JSON.parse(JSON.stringify(this.editForm.value));

        let imgCount = this.editForm.value.imageUpload.length;
        
        tempVal.imageUpload = imgCount;

        let today = new Date();
        let passData = {
            todaysDate: today,
            log: message,
            method: method,
            subject: 'daily-report',
            subjectID: this.passID.id,
            subjectDate: this.editForm.value.todaysDate,
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
    }

    // public addCLog(method,message){

    //     // let newDetails;
    //     // newDetails += 'Company:';
    //     // todaysDate: this.editForm.value.todaysDate,
    //     // projectName: this.passID.id,

    //     const tempVal = JSON.parse(JSON.stringify(this.editForm.value));

    //     let imgCount = this.editForm.value.imageUpload.length;
        
    //     tempVal.imageUpload = imgCount;


    //     let today = new Date();
    //     let passData = {
    //         todaysDate: today,
    //         log: message,
    //         method: method,
    //         subject: 'daily-report',
    //         subjectID: this.passID.id+moment(this.editForm.value.todaysDate).format('YYYYMMDD'),
    //         prevdata: this.prevdata,
    //         data: tempVal,
    //         url: window.location.href
    //     }
        
    //     this.data_api.addActivityLog(this.userDetails.user_id,passData)
    //       .subscribe(
    //         (result) => {

    //             const tempVal2 = JSON.parse(JSON.stringify(this.editForm.value));

    //             let imgCount2 = this.editForm.value.imageUpload.length;
                
    //             tempVal2.imageUpload = imgCount2;

    //             this.prevdata = tempVal2;
    //             this.editForm.markAsPristine();
    //             this.method = 'update';
    //             this.message = 'Updated a Daily Report'
    //         }
    //   ); 
    // }

    // public addCLogAutoSave(message){
    //     // let newDetails;
    //     // newDetails += 'Company:';

    //     let today = new Date();
    //     let passData = {
    //         todaysDate: today,
    //         log: message,
    //         data: this.editForm.value,
    //         url: window.location.href
    //     }
        
    //     this.data_api.addActivityLog(this.userDetails.user_id,passData)
    //       .subscribe(
    //         (result) => {

    //         }
    //   ); 
    // }

    // public autoSaveReport(){

    //   if(this.finishLoading == false){
    //      return;
    //   }
    //     // this.calculateTotalSize();

    //     this.data_api.addDailyReport(this.editForm.getRawValue()).subscribe((data1) => {
    
    //         if(data1[1] == "created"){

    //               // swal.fire({
    //               //       title: 'Successfully Created A Daily Report',
    //               //       // text: "You clicked the button!",
    //               //       buttonsStyling: false,
    //               //       customClass: {
    //               //         confirmButton: 'btn btn-success',
    //               //       },
    //               //       icon: 'success'
    //               //   })

    //                 $.notify({
    //                   icon: 'notifications',
    //                   message: 'Auto-created A Daily Report'
    //                 }, {
    //                   type: 'success',
    //                   delay: 2000,
    //                   placement: {
    //                       from: 'top',
    //                       align: 'right'
    //                   },
    //                   template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0} alert-with-icon" role="alert">' +
    //                     '<button  mat-button type="button" aria-hidden="true" class="close" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
    //                     '<i class="material-icons" data-notify="icon">notifications</i> ' +
    //                     '<span data-notify="title">{1}</span> ' +
    //                     '<span data-notify="message">{2}</span>' +
    //                     '<div class="progress" data-notify="progressbar">' +
    //                       '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
    //                     '</div>' +
    //                     '<a href="{3}" target="{4}" data-notify="url"></a>' +
    //                   '</div>'
    //                 });

    //                 this.editForm.markAsPristine();

    //                 this.addCLog('create','Created New Daily Report (autosaved)')

    //         }else if(data1[1] == "updated"){

    //               // swal.fire({
    //               //       title: 'Successfully Updated A Daily Report',
    //               //       // text: "You clicked the button!",
    //               //       buttonsStyling: false,
    //               //       customClass: {
    //               //         confirmButton: 'btn btn-success',
    //               //       },
    //               //       icon: 'success'
    //               //   })

    //                 $.notify({
    //                   icon: 'notifications',
    //                   message: 'Auto-updated A Daily Report'
    //                 }, {
    //                   type: 'success',
    //                   delay: 2000,
    //                   placement: {
    //                       from: 'top',
    //                       align: 'right'
    //                   },
    //                   template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0} alert-with-icon" role="alert">' +
    //                     '<button  mat-button type="button" aria-hidden="true" class="close" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
    //                     '<i class="material-icons" data-notify="icon">notifications</i> ' +
    //                     '<span data-notify="title">{1}</span> ' +
    //                     '<span data-notify="message">{2}</span>' +
    //                     '<div class="progress" data-notify="progressbar">' +
    //                       '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
    //                     '</div>' +
    //                     '<a href="{3}" target="{4}" data-notify="url"></a>' +
    //                   '</div>'
    //                 });

    //                 this.editForm.markAsPristine();
    //                 this.addCLog('update','Updated a Daily Report (autosaved)')
    //         }
    //     })
    // }

    // public uploadPhotos(){
      
    //   this.addReport()

    //   this.spinnerService.show();

    //     this.calculateTotalSize();

    //     this.data_api.uploadImages(this.userDetails.user_id,this.editForm.value).subscribe((data1) => {
     
    //         if(data1){

    //             // this.data_api.updateProjectWeeklyReport(this.editForm.value).subscribe((data2) => {

    //               this.spinnerService.hide();

    //               swal.fire({
    //                   title: "Successfully Uploaded Photos",
    //                   // text: "You clicked the button!",
    //                   buttonsStyling: false,
    //                   customClass: {
    //                     confirmButton: 'btn btn-success',
    //                   },
    //                   icon: "success"
    //               })
    //               this.showUpdateUploadButton = true;
    //               this.addCLog('create','Uploaded Images for Daily Report')
    //             // })

    //             this.editForm.markAsPristine();

    //         }
    //     })
    // }

    // public updatePhotos(){
      

    //   this.spinnerService.show();
        
        
    //     this.calculateTotalSize();

    //     this.data_api.updateImages(this.userDetails.user_id,this.editForm.value).subscribe((data1) => {

    //         if(data1){

    //             // this.data_api.updateProjectWeeklyReport(this.editForm.value).subscribe((data2) => {

    //               this.spinnerService.hide();

    //               swal.fire({
    //                   title: "Successfully Uploaded Photos",
    //                   // text: "You clicked the button!",
    //                   buttonsStyling: false,
    //                   customClass: {
    //                     confirmButton: 'btn btn-success',
    //                   },
    //                   icon: "success"
    //               })
  
    //               this.addCLog('update','Updated Images for Daily Report')

    //               this.editForm.markAsPristine();
    //             // })

    //         }
    //     })
    // }

    // public uploaddownloadPdf(){
    //   this.uploadPhotos();
    //   this.downloadPdf();
    // }

    // public uploadpreviewPdf(){
    //   this.uploadPhotos();
    //   this.previewPdf();
    // }

    // public updatedownloadPdf(){
    //   this.updatePhotos();
    //   this.downloadPdf();
    // }

    // public updatepreviewPdf(){
    //   this.updatePhotos();
    //   this.previewPdf();
    // }

  //   public getDailyReport(){
  //     this.spinnerService.show();
  //     // let todays_date;
  //     // todays_date = new Date();
  //     let passData = {
  //         todaysDate: this.editForm.value.todaysDate,
  //         projectName: this.passID.id,
  //     }
  //     this.data_api.getDailyReport(passData).subscribe((data) => {
  //         this.spinnerService.hide();
  //         this.finishLoading = true;
  //         if(data){  
  //               let whsData;
  //               let instructionsReceived;
  //               let delays;
  //               let toolsUsed;
  //               let damageReport;
  //               let summary;
  //               let materialsRequested;
  //               let offHirePlant;
  //               let variations;
  //               let deliveries;
  //               // let tradesOnSite;
  //               // let staffOnSite;
  //               // let visitorsOnSite;
  //               let tradesContact;
  //               let tradesSched;
  //               let products;

  //               this.getImages();
                
  //               if(data[0].whs){
  //                 whsData = JSON.parse(data[0].whs);
  //               }
  //               if(data[0].instr_rec){
  //                 instructionsReceived = JSON.parse(data[0].instr_rec);
  //               }
  //               if(data[0].delays){
  //                 delays = JSON.parse(data[0].delays);
  //               }
  //               if(data[0].tools_used){
  //                 toolsUsed = JSON.parse(data[0].tools_used);
  //               }
  //               if(data[0].damage_report){
  //                 damageReport = JSON.parse(data[0].damage_report);
  //               }
  //               if(data[0].summary){
  //                 summary = JSON.parse(data[0].summary);
  //               }
  //               if(data[0].materials_req){
  //                 materialsRequested = JSON.parse(data[0].materials_req);
  //               }
  //               if(data[0].off_hire){
  //                 offHirePlant = JSON.parse(data[0].off_hire);
  //               }
  //               if(data[0].variations){
  //                 variations = JSON.parse(data[0].variations);
  //               }
  //               if(data[0].deliveries){
  //                 deliveries = JSON.parse(data[0].deliveries);
  //               }
  //               if(data[0].trades_contact){
  //                 tradesContact = JSON.parse(data[0].trades_contact );
  //               }
  //               if(data[0].trades_sched){
  //                 tradesSched = JSON.parse(data[0].trades_sched );
  //               }
  //               if(data[0].products){
  //                 products = JSON.parse(data[0].products );
  //               }
  //               // if(data[0].trades_site){
  //               //   tradesOnSite = JSON.parse(data[0].trades_site);
  //               // }
  //               // if(data[0].staff_site){
  //               //   staffOnSite = JSON.parse(data[0].staff_site);
  //               // }
  //               // if(data[0].visitors_site){
  //               //   visitorsOnSite = JSON.parse(data[0].visitors_site);
  //               // }

  //               this.editForm.patchValue({
  //                     weatherResidual: data[0].weather_residual,
  //                     weatherPerfect: data[0].weather_perfect,
  //                     weatherMaxTemp: data[0].weather_max_temp,
  //                     weatherMinTemp: data[0].weather_min_temp,
  //                     weatherMorning: data[0].weather_morning,
  //                     weatherMidDay: data[0].weather_midday,
  //                     weatherAfternoon: data[0].weather_afternoon,
  //                     weatherEvening: data[0].weather_evening,
  //                     weatherOnOff: data[0].weather_onoff,
  //                     weatherAllDay: data[0].weather_allday,
  //                     weatherRestOfDay: data[0].weather_restofday,
  //                     weatherOthersMorning: data[0].weather_others_morning,
  //                     weatherOthersMidDay: data[0].weather_others_midday,
  //                     weatherOthersAfternoon: data[0].weather_others_afternoon,
  //                     weatherOthersEvening: data[0].weather_others_evening,
  //                     weatherOthersOnOff: data[0].weather_others_onoff,
  //                     weatherOthersAllDay: data[0].weather_others_allday,
  //                     weatherOthersRestOfDay: data[0].weather_others_restofday,
  //                     toolboxTalk: whsData.toolbox_talk,
  //                     toolboxForm: whsData.toolbox_form,
  //                     toolboxRequired:  whsData.toolbox_required,
  //                     toolboxNotes:  whsData.toolbox_notes,
  //                     toolboxInput:  whsData.toolbox_input,
  //                     safetyWalk: whsData.safety_walk,
  //                     safetyForm: whsData.safety_form,
  //                     safetyRequired: whsData.safety_required,
  //                     safetyNotes: whsData.safety_notes,
  //                     safetyInput: whsData.safety_input,
  //                     accidentReport: whsData.accident_report,
  //                     accidentForm: whsData.accident_form,
  //                     accidentRequired: whsData.accident_required,
  //                     accidentNotes: whsData.accident_notes,
  //                     accidentInput: whsData.accident_input,
  //                     ppeReport: whsData.ppe_report,
  //                     ppeForm: whsData.ppe_form,
  //                     ppeRequired: whsData.ppe_required,
  //                     ppeNotes: whsData.ppe_notes,
  //                     ppeInput: whsData.ppe_input,
  //                     instructionsReceived: instructionsReceived,
  //                     delays: delays,
  //                     toolsUsed: toolsUsed,
  //                     damageReport: damageReport,
  //                     summary: summary,
  //                     materialsRequested: materialsRequested,
  //                     offHirePlant: offHirePlant,
  //                     variations: variations,
  //                     deliveries: deliveries,
  //                     tradesContact: tradesContact,
  //                     tradesSched: tradesSched,
  //                     productsOnSite: products,
  //                     // tradesOnSite: tradesOnSite,
  //                     // staffOnSite: staffOnSite,
  //                     // visitorsOnSite: visitorsOnSite,
  //                     eot: data[0].eot,
  //                 });
                            
  //                 if (data[0].trades_site){
  //                   this.tradeFormArray().clear()
  //                   let i = 0;
  //                   JSON.parse(data[0].trades_site).forEach(t => {
  //                     let teacher: FormGroup = this.createTradeForm();
  //                     this.tradeFormArray().push(teacher);

  //                     if(t.tradeStaffFormArray){

  //                          (teacher.get("tradeStaffFormArray") as FormArray).clear()
  //                          let x = 0;
  //                           t.tradeStaffFormArray.forEach(b => {
                              
  //                             let tradeStaff = this.createTradeStaffForm();
  //                               (teacher.get("tradeStaffFormArray") as FormArray).push(tradeStaff)

  //                               if(b.taskTradeFormArray){

  //                               (tradeStaff.get("taskTradeFormArray") as FormArray).clear()
  //                                   b.taskTradeFormArray.forEach(c => {
  //                                       let tradeTask = this.createTaskTradeForm();
  //                                       (tradeStaff.get("taskTradeFormArray") as FormArray).push(tradeTask)

  //                                   });
                                    
  //                               }

  //                           });
  //                           // this.initializeFilterTradeStaffs(i,x);
  //                           x++;
  //                     }
  //                     this.initializeFilterTrades(i);
  //                     this.loadTradeStaffs(i,t.tradesOnSite);
  //                     i++;
  //                   });

  //                   this.tradeFormArray().patchValue(JSON.parse(data[0].trades_site));
                    
  //                 }

  //                 if (data[0].staff_site){
  //                     this.staffFormArray().clear()
  //                     let i = 0;
  //                     JSON.parse(data[0].staff_site).forEach(t => {
  //                       let teacher: FormGroup = this.createStaffForm();
  //                       this.staffFormArray().push(teacher);
  //                       if(t.taskStaffFormArray){
  //                           // (teacher.get("taskStaffFormArray") as FormArray).clear()
  //                           t.taskStaffFormArray.forEach(b => {
  //                             let batch = this.createTaskStaffForm();
  //                               (teacher.get("taskStaffFormArray") as FormArray).push(batch)
  //                           });
  //                       }
  //                       this.initializeFilterEmployees(i);
  //                       i++;
  //                   });
  //                   this.staffFormArray().patchValue(JSON.parse(data[0].staff_site));

  //                 }

  //                 if (data[0].visitors_site){
  //                   this.visitorFormArray().clear()
  //                   let i = 0;
  //                   JSON.parse(data[0].visitors_site).forEach(t => {
  //                     var teacher: FormGroup = this.createVisitorForm();
  //                     this.visitorFormArray().push(teacher);
  //                     this.initializeFilterVisitors(i);
  //                     this.initializeFilterReasons(i);
  //                     i++;
  //                   });
  //                   this.visitorFormArray().patchValue(JSON.parse(data[0].visitors_site));
  //                 }

  //                 if (data[0].products){
  //                   this.productFormArray().clear()
  //                   let i = 0;
  //                   JSON.parse(data[0].products).forEach(t => {

  //                     var teacher: FormGroup = this.createProductForm();
  //                     this.productFormArray().push(teacher);
  //                     this.initializeFilterProducts(i);
  //                     i++;
  //                   });
  //                   this.productFormArray().patchValue(JSON.parse(data[0].products));

  //                 }

  //                 const tempVal = JSON.parse(JSON.stringify(this.editForm.value));

  //                 let imgCount = this.editForm.value.imageUpload.length;
                  
  //                 tempVal.imageUpload = imgCount;

  //                 this.prevdata = tempVal;
  //                 this.method = 'update';
  //                 this.message = 'Updated a Daily Report'   
  //                 // this.editForm.valueChanges
  //                 // .pipe(
  //                 //   debounceTime(60000),
  //                 //   switchMap((value) => of(value))
  //                 // )
  //                 // .subscribe((value) => {
  //                 //   if(this.autoSavemode == true){
  //                 //     this.autoSaveReport();
  //                 //   }else{
  //                 //   }
  //                 // });



  //         }
  //     })
  // }

    // public getTrades(){
    //     this.data_api.getTrades().subscribe((data) => {
    //         this.listTrades = data;
    //     });
    // }

    // public getProducts(){
   
    //   this.data_api.getProducts().subscribe((data) => {
    //       this.listProducts = data;
    //   });

    // }

    // public getEmployees(){
    //     this.data_api.getEmployees().subscribe((data) => {
    //       //  this.listStaffs = data;   
    //       if(data){
            
    //             data.forEach(data2 =>{ 
    //                 if(data2.hide_list != 1){
    //                   this.listStaffs.push({id: data2.id, staff_name: data2.staff_name, type:'global', default_hours: data2.default_hours})  
    //                 }
    //             });
            
    //       }
    //       this.getProjectOwners();
    //     });
    // }

    public loadTradeStaffs(empIndex,tradeID){
        // this.data_api.getTradeStaffs().subscribe((data) => {
        //   this.listTradeStaffs = data;
        // });
        if(tradeID){

            let selectedTrade = this.listTrades.find(o => o.id === tradeID);
            
            if(selectedTrade){
                this.listTradeStaffs[empIndex] = selectedTrade.staffFormArray;

                // this.tradeStaffFormArray(empIndex).at(0).get('staffOnSite').patchValue(this.listTradeStaffs[empIndex][0].staffID);
            }
            
      }
    }
    
    public getStaffName(id){
      if(id){
        let selectedTrade = this.listStaffs.find(o => o.id === id);
        return selectedTrade?.staff_name;
      }else{
        return;
      }
      
    }

    public getTradeStaffName(empIndex,tradeID,id){
      if(tradeID){
            //find search filter
            let selectedTrade = this.listTrades.find(o => o.id === tradeID);
            

            if(selectedTrade){
              let selectedStaff = selectedTrade.staffFormArray.find(o => o.staffID === id);

              if(selectedStaff){
                  return selectedStaff.staffName;
              }else{
                  return;
              }

          }else{
            return;
          }
            
      }   
    }

    // public getTradeStaffs(empIndex,tradeID){
    //     // this.data_api.getTradeStaffs().subscribe((data) => {
    //     //   this.listTradeStaffs = data;
    //     // });
    //     if(tradeID){
    //         //find search filter
    //         let selectedTrade = this.listTrades.find(o => o.id === tradeID);
            

    //         if(selectedTrade){
    //             this.listTradeStaffs[empIndex] = selectedTrade.staffFormArray;

    //             this.tradeStaffFormArray(empIndex).at(0).get('staffOnSite').patchValue(this.listTradeStaffs[empIndex][0].staffID);

    //             this.selectTradeEmployee(empIndex,0)

    //         }
            
    //   }
    // }


    public setNumStaff(empIndex,tradeID,staffNum){

        let selectedTrade = this.listTrades.find(o => o.id === tradeID);

        for (let i = 0; i < staffNum; i++) {
          this.tradeStaffFormArray(empIndex).push(this.createTradeStaffForm());
          this.taskTradeFormArray(empIndex, i).push(this.createTaskTradeForm());
          this.tradeFormArray().at(empIndex).get('staffCount').patchValue(staffNum);

          if(selectedTrade.staffFormArray[i]){
            this.tradeStaffFormArray(empIndex).at(i).get('staffOnSite').patchValue(selectedTrade.staffFormArray[i].staffID);

            if( (selectedTrade.staffFormArray[i].start) && (selectedTrade.staffFormArray[i].start) && (selectedTrade.staffFormArray[i].start) ){
              this.taskTradeFormArray(empIndex, i).at(0).get('checkDetail').patchValue(true);
              this.taskTradeFormArray(empIndex, i).at(0).get('start').patchValue(selectedTrade.staffFormArray[i].start);
              this.taskTradeFormArray(empIndex, i).at(0).get('break').patchValue(selectedTrade.staffFormArray[i].break);
              this.taskTradeFormArray(empIndex, i).at(0).get('finish').patchValue(selectedTrade.staffFormArray[i].finish);
            }
  
            this.computeTime(empIndex, i, 0);
          }
          

        }
        this.initializeFilterTrades(empIndex);
		    this.loadTradeStaffs(empIndex,tradeID);
        this.computeTradeTotalHours(empIndex);
    }

    public applyAllStaff(empIndex){

      let valueToCopytaskDescription = this.taskTradeFormArray(empIndex, 0).at(0).get('taskDescription').value;
      let valueToCopycheckDetail = this.taskTradeFormArray(empIndex, 0).at(0).get('checkDetail').value;
      let valueToCopystart = this.taskTradeFormArray(empIndex, 0).at(0).get('start').value;
      let valueToCopybreak = this.taskTradeFormArray(empIndex, 0).at(0).get('break').value;
      let valueToCopyfinish = this.taskTradeFormArray(empIndex, 0).at(0).get('finish').value;

      let staffNum = this.tradeStaffFormArray(empIndex).length;

      for (let i = 1; i < staffNum; i++) {

          this.taskTradeFormArray(empIndex, i).at(0).get('taskDescription').patchValue(valueToCopytaskDescription);
          this.taskTradeFormArray(empIndex, i).at(0).get('checkDetail').patchValue(valueToCopycheckDetail);
          this.taskTradeFormArray(empIndex, i).at(0).get('start').patchValue(valueToCopystart);
          this.taskTradeFormArray(empIndex, i).at(0).get('break').patchValue(valueToCopybreak);
          this.taskTradeFormArray(empIndex, i).at(0).get('finish').patchValue(valueToCopyfinish);

          this.computeTime(empIndex, i, 0);
      }

      this.computeTradeTotalHours(empIndex);

    }

    // public getVisitors(){
    //       this.data_api.getVisitors().subscribe((data) => {
    //         if(data){
    //             data.forEach(data2 =>{      
    //                 this.listVisitors.push({id: data2.id,visitor_name: data2.visitor_name, type:'global'})  
    //             });
    //             // this.listVisitors = data;
    //             this.changeDate();
    //         } 
    //       });
    // }

    // public getReasons(){
    //       this.data_api.getReasons().subscribe((data) => {
    //         if(data){
    //           this.listReasons = data;
    //         } 
    //       });
    // }

    // public getProjectOwners(){
   
    //   this.data_api.getProjectOwners().subscribe((data) => {

    //     if(this.projOwners){
    //         this.projOwners.forEach(data1 =>{     
    //                 data.forEach(data2 =>{      
    //                     if(data1 == data2.id){
    //                       this.listVisitors.push({id: data2.user_email, visitor_name: data2.name, type:'user'})  
    //                     }
    //                 });
    //         });
    //     }
    //     this.getVisitors();
    //   });
      
    // }

    public cleanTime(data){
      if (data){

          if ( (data[0] == 'AM') || (data[0] == 'PM') ){
              return data[1] + " " + data[0];
          }else if ( (data[1] == 'AM') || (data[1] == 'PM') ){
              return data[0] + " " + data[1];
          }

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

    // public getSupervisors(){
    //       // this.spinnerService.show();

    //       this.data_api.getProjectSupervisors().subscribe((data) => {
    //         if(this.projSupervisor){
  
    //                 data.forEach(data2 =>{ 
    //                       if(this.projSupervisor == data2.id){
    //                         let defhours = '{\"start\":\"'+this.cleanTime(data2.meta.start)+'\",\"break\":\"'+this.cleanBreak(data2.meta.break)+'\",\"finish\":\"'+this.cleanTime(data2.meta.finish)+'\"}';
    //                         this.listStaffs.push({id: data2.user_email, staff_name: data2.name, type:'user-supervisor', default_hours: defhours})  
    //                       }
    //                 });
    //         }      
    //         this.getWorkers();   
    //       });
    // }

  //   public getWorkers(){
  //       this.data_api.getProjectWorkers().subscribe((data) => {

  //         if(this.projWorkers){
  //             this.projWorkers.forEach(data1 =>{     
  //                     data.forEach(data2 =>{      
  //                         if(data1 == data2.id){
  //                           let defhours = '{\"start\":\"'+this.cleanTime(data2.meta.start)+'\",\"break\":\"'+this.cleanBreak(data2.meta.break)+'\",\"finish\":\"'+this.cleanTime(data2.meta.finish)+'\"}';
  //                           this.listStaffs.push({id: data2.user_email, staff_name: data2.name, type:'user-worker', default_hours: defhours, show_time: data2.meta.show_time})  
  //                         }
  //                     });
  //             });
  //         }
  //         this.getEmployees();
  //       });
  // }


    // public getProjects(){
    //       // this.spinnerService.show();

    //       this.data_api.getActiveProjects().subscribe((data) => {
    //           data.forEach(data =>{ 
    //               this.projectNames.push(data)
                  
    //           })
    //       });
    // }

    // public getSupervisor(val){
    //   this.data_api.getWPUser(val).subscribe((data) => {
    //         this.pdfSupervisorName = data;
    //     }
    //   );
    // }

    // public getQuestions(){
    //       // this.spinnerService.show();

    //       this.data_api.getQuestions().subscribe((data) => {
    //           data.forEach(data =>{ 
    //               this.customQuestions.push(data)
    //           })
    //       });
    // }

    public getTemperature(){
    
        // let passData = {
        //   latitude:  this.latitude,
        //   longitude:  this.longitude
        // }
        
        this.spinnerService.show();
        this.data_api.getFBTemperature(this.latitude,this.longitude,moment(this.editForm.value.todaysDate).format('YYYY-MM-DD')).subscribe(
          (data) => {
          //  this.editForm.patchValue({
          //   weatherMinTemp: Math.round(data['main'].temp_min),
          //   weatherMaxTemp: Math.round(data['main'].temp_max),
          //  });
           this.editForm.patchValue({
            weatherMinTemp: Math.round(data['days'][0].tempmin),
            weatherMaxTemp: Math.round(data['days'][0].tempmax),
           });
           this.spinnerService.hide();
        },
        (error) => {
          this.spinnerService.hide();
            swal.fire({
                title: error.error,
                icon: 'error',
                buttonsStyling: false,
                customClass:{
                  confirmButton: "btn btn-success"
                }
            });
        }
        );
  }

    // public addLostDaysHrs(){

    //   this.totalHours = +this.rawTotalHrs + (+this.editForm.value.lostWeekDays * 8) + +this.editForm.value.lostWeekHours;

    //   this.editForm.patchValue({
    //       lostTotalDays: Math.floor( (this.totalHours/8) ),
    //       lostTotalHours: ( (this.totalHours/8) - Math.floor( (this.totalHours/8) ) ) * 8,
    //       aimedComDate: this.getFinalAimedDate(this.rawAimedDate,this.totalHours)
    //   });
    // }

    // public projectSelect(val){
    //   this.spinnerService.show();
    //     this.data_api.getProject(val).subscribe((data) => {
    //         data.forEach(data =>{ 

    //             this.rawTotalHrs = data.total_hours;
    //             this.rawAimedDate = data.aimed_date;
    //             this.projJobNumber = data.job_number;
    //             this.projaddress = data.project_address;
    //             this.projImageBackground = data.bg_name;

    //             this.editForm.patchValue({
    //               lostTotalDays: Math.floor( (this.rawTotalHrs/8) ),
    //               lostTotalHours: ( (this.rawTotalHrs/8) - Math.floor( (this.rawTotalHrs/8) ) ) * 8,
    //               aimedComDate: this.getFinalAimedDate(data.aimed_date,data.total_hours),
    //               siteSupervisor: data.site_supervisor
    //             });

    //             this.pdfProjectName = data.project_name;

    //             this.spinnerService.hide();

    //         })
    //     });
    // }

    // public getFinalAimedDate(aimedDate,totalHours){
    //     let plusDay = totalHours / 8;
    //     let rawAimedDate2 = new Date(aimedDate);
  
    //     if(plusDay > 1){
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

            // // Crop Lnadscape images and convert to base64
            // const imageCropped = await this.fileListToBase64(event.target.files);

            // // Convert Base64 to File
           
            // // Convert Base64 to File
            // const compressedFiles = await  Promise.all(
            //   imageCropped.map(async (dataUrl: string) => await imageCompression.getFilefromDataUrl(dataUrl, 'test'))
            // )


            // // Compress File
            // const compressedFiles2 = await  Promise.all(
            //   await compressedFiles.map(async (imageFile: File) => await imageCompression(imageFile, options))
            // )
            
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

                  }

            this.editForm.controls.imageUpload.markAsDirty();
      }
    }

    async onSelectFile(event) {
      
      if(event.target.files){
        this.progressOverlay.show('Compressing Images','#0771DE','white','lightslategray',1);

        // var options = {
        //   maxSizeMB: this.maxSizeMB,
        //   maxWidthOrHeight: 500,
        //   useWebWorker: this.currentWebWorker,
        //   maxIteration: 50,
        //   onProgress: (p) => {  

        //     if(p == 100){
        //       setTimeout(() => {
        //         this.spinnerService.hide();
        //         this.myService.nextMessage("false");
        //       }, 1000); 
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

        // await this.processImages(compressedFiles2);

        const imageFiles = Array.from(event.target.files);

              // try {
              //   const compressedFiles = await Promise.all(
              //       await imageFiles.map(async (imageFile: File) => await imageCompression(imageFile, options))
              //   )

              //   await this.processImages(compressedFiles);

              // } catch (error) {

          
          const compressedFiles = await this.allProgress(imageFiles,
            (p) => {

                this.progressOverlay.setProgress(Math.ceil(p));
          });
 
          this.processImages(compressedFiles);
          this.progressOverlay.hide();
          this.editForm.controls.imageUpload.markAsDirty();

          swal.fire({
            title: "Please click Save Daily Report button to Save the images",
                // text: htmlVal,
                buttonsStyling: false,
                customClass: {
                  confirmButton: 'btn btn-success',
                },
                icon: "info"
          })

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
      
        let imagesLength = this.editForm.value.imageUpload.length;
        let imageStamp = new Date();
        
        imageFiles.forEach(imageFile => {
        
            this.addImageUpload();

            this.imageSize.push(imageFile.size);

            let reader = new FileReader(); 
            const myForm =  (<FormArray>this.editForm.get("imageUpload")).at(imagesLength);

            myForm.patchValue({
              imageSize: imageFile.size,
              imageBy: this.userDetails.user_id,
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
  
    // public onSelectFile(event) {

    //   this.spinnerService.show();

    //   let imagesLength = this.editForm.value.imageUpload.length;

    //   const rawFiles: File[] = [].slice.call(event.target.files);

    //   rawFiles.forEach(async (file: File) => {

    //     this.addImageUpload();

    //     const config: CompressorConfig = { orientation: 1, ratio: 50, quality: 50, enableLogs: true };
    //     const compressedFile: File = await this.imageCompressor.compressFile(file, config);

    //     this.imageSize.push(compressedFile.size);

    //     let reader = new FileReader(); 

    //     const myForm =  (<FormArray>this.editForm.get("imageUpload")).at(imagesLength);

    //     myForm.patchValue({
    //       imageSize: compressedFile.size
    //     });

    //     reader.readAsDataURL(compressedFile);

    //     reader.onload = (event:any) => {
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

    //     this.editForm.patchValue({
    //       totalFileSize: this.totalImageSize
    //     });
    // }

    // public addActivityLog(activity){
    //   this.spinnerService.show();

    //   let passData = {
    //       dateTime: new Date(),
    //       logs: activity
    //   }

    //   this.data_api.addActivityLog(this.userDetails.user_id,passData).subscribe((data) => {

    //         if(data){
    //             this.spinnerService.hide();
    //             //this.data_api.updateProjectWeeklyReport(this.timeForm.value).subscribe((data2) => {
    //         }
    //     })
    // }

    public calculateTotalSize(){
        this.totalImageSize = 0;
        //let imagesLength = this.imageSize.length;
        // for (let i = 0; i < imagesLength; i++) {
        //   this.totalImageSize = this.totalImageSize + this.imageSize[i];
        // }
        
        this.imageSize.forEach(value => {
          this.totalImageSize = this.totalImageSize + value;
        });
        
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

    }
    
    trackByFn(index: number, item: any) {

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
        imageBy: '',
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
      // control.removeAt(index)
      // (<FormArray>this.editForm.controls['imageUpload']).removeAt(index);
      // (<FormArray>this.editForm.get('imageUpload')).removeAt(index);
    }

    removeLastImageUpload(): void {
      this.imageUpload = this.editForm.get('imageUpload') as FormArray;
      this.imageUpload.removeAt(this.imageUpload.length - 1)
    }

    // createTradeForm(): FormGroup {
    //   return this.formBuilder.group({
    //     tradesOnSite: '',
    //       // taskNumber: [{ value: '', disabled: true }],
    //       taskDescription: '',
    //       hours: '',
    //   });
    // }


    createTaskStaffForm(): FormGroup {
        return this.formBuilder.group({
            taskDescription: '',
            checkDetailStaff: '',
            start: '',
            break: '',
            finish: '',
            hours: '',
            tempHours: ''
        });
    }
    createTradeForm(): FormGroup {
      return this.formBuilder.group({
        tradesOnSite: '',
        staffCount: '',
        search_control_trade: [null],
          // taskNumber: [{ value: '', disabled: true }],
          // taskDescription: '',
        totalHours: '',
        tradeStaffFormArray: this.formBuilder.array([]),
        // tradeStaffFormArray: this.formBuilder.array([ this.createTradeStaffForm() ]),
      });
    }

    createTradeStaffForm(): FormGroup {
      return this.formBuilder.group({
        staffOnSite: '',
        search_control_tradestaff: [null],
        // taskNumber: [{ value: '', disabled: true }],
        totalHours: '',
        taskTradeFormArray: this.formBuilder.array([ ]),
        // taskTradeFormArray: this.formBuilder.array([ this.createTaskTradeForm() ]),
      });
    }

    createTaskTradeForm(): FormGroup {
      return this.formBuilder.group({
          taskDescription: '',
          checkDetail: '',
          start: '',
          break: '',
          finish: '',
          hours: '',
          tempHours: '',
      });
  }

    createStaffForm(): FormGroup {
      return this.formBuilder.group({
          staffOnSite: '',
          // taskNumber: [{ value: '', disabled: true }],
          totalHours: '',
          taskStaffFormArray: this.formBuilder.array([ ]),
          search_control_employee: [null],
      });
    }

    createVisitorForm(): FormGroup {
      return this.formBuilder.group({
          visitorsOnSite: '',
          reasonsOnSite: '',
          duration: '',
          search_control_visitor: [null],
          search_control_reason: [null],
      });
    }

    createProductForm(): FormGroup {
      return this.formBuilder.group({
          productName: '',
          sizeType: '',
          quantity: '',
          length: '',
          width: '',
          height: '',
          hours: '',
          weight: '',
          area: '',
          volume:'',
          cost: '',
          unit: '',
          total: '',
          search_control_product: [null],
      });
    }

    tradeFormArray(): FormArray {
      return this.editForm.get("tradeFormArray") as FormArray
    }

    staffFormArray(): FormArray {
      return this.editForm.get("staffFormArray") as FormArray
    }

    visitorFormArray(): FormArray {
      return this.editForm.get("visitorFormArray") as FormArray
    }

    productFormArray(): FormArray {
      return this.editForm.get("productFormArray") as FormArray
    }

    tradeStaffFormArray(empIndex:number) : FormArray {
      return this.tradeFormArray().at(empIndex).get("tradeStaffFormArray") as FormArray
    }

    taskTradeFormArray(empIndex:number, staffIndex:number) : FormArray {
      // return this.tradeStaffFormArray(staffIndex).at(staffIndex).get("taskTradeFormArray") as FormArray
      return this.tradeStaffFormArray(empIndex).at(staffIndex).get("taskTradeFormArray") as FormArray
    }

    taskStaffFormArray(empIndex:number) : FormArray {
      return this.staffFormArray().at(empIndex).get("taskStaffFormArray") as FormArray
    }

    addStaffForm(): void {
      // this.staffFormArray = this.editForm.get('staffFormArray') as FormArray;
      this.staffFormArray().push(this.createStaffForm());
    }

    removeStaffForm(i): void {
      // this.staffFormArray = this.editForm.get('staffFormArray') as FormArray;
      this.staffFormArray().removeAt(i)
    }

    removeLastStaffForm(): void {
      // this.staffFormArray = this.editForm.get('staffFormArray') as FormArray;
      this.staffFormArray().removeAt(this.staffFormArray.length - 1)
    }

    addTaskTradeForm(empIndex, staffIndex){
      //this.taskTradeFormArray = this.editForm.get('taskTradeFormArray') as FormArray;
      this.taskTradeFormArray(empIndex, staffIndex).push(this.createTaskTradeForm());
    }

    addTradeStaffForm(empIndex){
      //this.taskTradeFormArray = this.editForm.get('taskTradeFormArray') as FormArray;
      this.tradeStaffFormArray(empIndex).push(this.createTradeStaffForm());

      let staffNum = this.tradeStaffFormArray(empIndex).length;

      this.tradeFormArray().at(empIndex).get('staffCount').patchValue(staffNum)

    }

    addTaskStaffForm(empIndex){
      //this.taskTradeFormArray = this.editForm.get('taskTradeFormArray') as FormArray;
      this.taskStaffFormArray(empIndex).push(this.createTaskStaffForm());
    }

    removeTaskTradeForm(empIndex:number,staffIndex:number, skillIndex:number){
      //this.taskTradeFormArray = this.editForm.get('taskTradeFormArray') as FormArray;
      this.taskTradeFormArray(empIndex,staffIndex).removeAt(skillIndex);
      this.computeTradeStaffTotalHours(empIndex, staffIndex);
    }

    removeTradeStaffForm(empIndex:number,staffIndex:number){
      //this.taskTradeFormArray = this.editForm.get('taskTradeFormArray') as FormArray;
      this.tradeStaffFormArray(empIndex).removeAt(staffIndex);
      this.computeTradeTotalHours(empIndex);

      let staffNum = this.tradeStaffFormArray(empIndex).length;

      this.tradeFormArray().at(empIndex).get('staffCount').patchValue(staffNum)

    }

    removeTaskStaffForm(empIndex:number,skillIndex:number){
      //this.taskTradeFormArray = this.editForm.get('taskTradeFormArray') as FormArray;
      this.taskStaffFormArray(empIndex).removeAt(skillIndex);
      this.computeStaffTotalHours(empIndex);
    }

    addTradeForm(): void {
      //this.tradeFormArray = this.editForm.get('tradeFormArray') as FormArray;
      this.tradeFormArray().push(this.createTradeForm());
    }

    removeTradeForm(i): void {
      //this.tradeFormArray = this.editForm.get('tradeFormArray') as FormArray;
      this.tradeFormArray().removeAt(i)
    }

    removeLastTradeForm(): void {
      //this.tradeFormArray = this.editForm.get('tradeFormArray') as FormArray;
      this.tradeFormArray().removeAt(this.tradeFormArray.length - 1)
    }

    addVisitorForm(): void {
      // this.visitorFormArray = this.editForm.get('visitorFormArray') as FormArray;
      this.visitorFormArray().push(this.createVisitorForm());
    }

    removeVisitorForm(i): void {
      // this.visitorFormArray = this.editForm.get('visitorFormArray') as FormArray;
      this.visitorFormArray().removeAt(i)
    }

    removeLastVisitorForm(): void {
      // this.visitorFormArray = this.editForm.get('visitorFormArray') as FormArray;
      this.visitorFormArray().removeAt(this.visitorFormArray.length - 1)
    }

    addProductForm(): void {
     // this.productFormArray = this.editForm.get('productFormArray') as FormArray;
      this.productFormArray().push(this.createProductForm());
    }

    removeProductForm(i): void {
     // this.productFormArray = this.editForm.get('productFormArray') as FormArray;
      this.productFormArray().removeAt(i)
    }

    removeLastProductForm(): void {
     // this.productFormArray = this.editForm.get('productFormArray') as FormArray;
      this.productFormArray().removeAt(this.productFormArray.length - 1)
    }

    public selectEmployee(empIndex){

      let selectedEmp = this.staffFormArray().at(empIndex).get('staffOnSite').value;

      let staffDetails = this.listStaffs.find((obj => obj.id == selectedEmp));
      
      this.taskStaffFormArray(empIndex).clear();
      this.addTaskStaffForm(empIndex);
      
      if(staffDetails.show_time == '1'){ 
          if(staffDetails.default_hours){

            let _defHours = JSON.parse(staffDetails.default_hours);
            
            this.taskStaffFormArray(empIndex).at(0).get('checkDetailStaff').patchValue(true);
            this.taskStaffFormArray(empIndex).at(0).get('start').patchValue(_defHours.start);
            this.taskStaffFormArray(empIndex).at(0).get('break').patchValue(_defHours.break);
            this.taskStaffFormArray(empIndex).at(0).get('finish').patchValue( _defHours.finish);
            this.computeTimeStaff(empIndex,0);
          }else{
            this.taskStaffFormArray(empIndex).at(0).get('checkDetailStaff').patchValue(false);
          }
      }else{
        this.computeTimeStaff(empIndex,0);

        this.taskStaffFormArray(empIndex).at(0).get('tempHours').patchValue( 0 );
        this.taskStaffFormArray(empIndex).at(0).get('hours').patchValue( 0 );
        this.computeStaffTotalHours(empIndex);
      }


    }
    
    public sizeTypeChanged(i){

        let thisFormArray = this.productFormArray().at(i)

        let selectedProduct = this.listProducts.find(o => o.productArrayID === thisFormArray.value.productName);

        thisFormArray.patchValue({
            length: '',
            width: '',
            height: '',
            hours: '',
            weight: '',
            quantity: '',
            cost: selectedProduct.productArrayCost,
            total: '',
            unit: selectedProduct.productArrayUnit,
            sizeType: selectedProduct.productArraySizeType
        });

        if(selectedProduct.size_type=='item'){
          thisFormArray.patchValue({
            total: selectedProduct.productArrayCost,
          });
        }
          

    }
    public onComputeSpace(i){

      let thisFormArray = this.productFormArray().at(i)

      let quantity = thisFormArray.value.quantity;
      let length = thisFormArray.value.length;
      let width = thisFormArray.value.width;
      let height = thisFormArray.value.height;
      let hours = thisFormArray.value.hours;
      let weight = thisFormArray.value.weight;
      let unitCost = thisFormArray.value.cost;
      //let unitCost = this.productFormArray().getRawValue()

      let area; let volume;

      if(thisFormArray.value.sizeType == 'length'){

        thisFormArray.patchValue({
          area: length,
          total: length * unitCost
        });

      }else if(thisFormArray.value.sizeType == 'squared'){

        area =  length * width
        thisFormArray.patchValue({
          area: area,
          total: area * unitCost
        });

      }else if(thisFormArray.value.sizeType == 'cubed'){

        volume = length * width * height,
        thisFormArray.patchValue({
          volume: volume,
          total: volume * unitCost
        });

      }else if(thisFormArray.value.sizeType == 'time'){

        thisFormArray.patchValue({
          total: hours * unitCost
        });

      }else if(thisFormArray.value.sizeType == 'weight'){

        thisFormArray.patchValue({
          total: weight * unitCost
        });

      }else if(thisFormArray.value.sizeType == 'item'){

        thisFormArray.patchValue({
          total: quantity * unitCost
        });

      }
  
    }
    
    public onGetSpecPrint(value){

      let length = value.length;
      let width = value.width;
      let height = value.height;
      let hours = value.hours;
      let weight = value.weight;
      let unitCost = value.cost;
      let quantity = value.quantity;
      //let unitCost = this.productFormArray().getRawValue()

      let area; let volume;

      if(value.sizeType == 'length'){

          return length +  '(L)'

      }else if(value.sizeType == 'squared'){

        area =  length * width
        return length +  '(L)' + ' x ' + width +  '(W)' + ' = '+ area +  '(A)'

      }else if(value.sizeType == 'cubed'){

        volume = length * width * height
        return length +  '(L)' + ' x ' + width +  '(W)' + ' x ' + height +  '(H)' + ' = '+ volume +  '(A)'

      }else if(value.sizeType == 'time'){

        return hours +  '(Hrs)'

      }else if(value.sizeType == 'weight'){

          return weight +  '(Weight)'

      }else if(value.sizeType == 'item'){

          return quantity +  '(Qty)'

      }
      
    }

    public onComputeSpacePrint(value){

      let length = value.length;
      let width = value.width;
      let height = value.height;
      let hours = value.hours;
      let weight = value.weight;
      let unitCost = value.cost;
      let quantity = value.quantity;
      //let unitCost = this.productFormArray().getRawValue()

      let area; let volume;

      if(value.sizeType == 'length'){

          return (length * unitCost).toFixed(2)


      }else if(value.sizeType == 'squared'){

        area =  length * width
        return (area * unitCost).toFixed(2)

      }else if(value.sizeType == 'cubed'){

        volume = length * width * height
        return (volume * unitCost).toFixed(2)

      }else if(value.sizeType == 'time'){

        return (hours * unitCost).toFixed(2)

      }else if(value.sizeType == 'weight'){

          return (weight * unitCost).toFixed(2)

      }else if(value.sizeType == 'item'){

          return (quantity * unitCost).toFixed(2)

      }
      
    }

    public computeTime(empIndex, staffIndex,skillIndex){

      if( (this.taskTradeFormArray(empIndex, staffIndex).value[skillIndex].finish != '') && (this.taskTradeFormArray(empIndex, staffIndex).value[skillIndex].start != '') && (this.taskTradeFormArray(empIndex, staffIndex).value[skillIndex].break != '')  ){
       
          let timeFinish = moment(this.taskTradeFormArray(empIndex, staffIndex).value[skillIndex].finish, 'hh:mm A').format('HH mm');
          let timeStart = moment(this.taskTradeFormArray(empIndex, staffIndex).value[skillIndex].start, 'hh:mm A').format('HH mm');
          let timeBreak = moment.duration(this.taskTradeFormArray(empIndex, staffIndex).value[skillIndex].break);

          let diff = (moment(timeFinish, 'HH:mm').subtract(timeBreak)).diff(moment(timeStart, 'HH:mm'))
          let diffDuration = moment.duration(diff);
          let hours =  Math.floor(diffDuration.asHours());
          let minutes = moment.utc(diff).format("mm");
          
          let convertHours = hours + ":" + minutes;

          this.taskTradeFormArray(empIndex, staffIndex).at(skillIndex).get('tempHours').patchValue( (moment.duration(convertHours).asHours()).toFixed(2) );
          this.taskTradeFormArray(empIndex, staffIndex).at(skillIndex).get('hours').patchValue( (moment.duration(convertHours).asHours()).toFixed(2) );

          this.computeTradeStaffTotalHours(empIndex, staffIndex);
          
      }else if( (this.taskTradeFormArray(empIndex, staffIndex).value[skillIndex].finish != '') && (this.taskTradeFormArray(empIndex, staffIndex).value[skillIndex].start != '') && (this.taskTradeFormArray(empIndex, staffIndex).value[skillIndex].break == '')  ){
       
          let timeFinish = moment(this.taskTradeFormArray(empIndex, staffIndex).value[skillIndex].finish, 'hh:mm A').format('HH mm');
          let timeStart = moment(this.taskTradeFormArray(empIndex, staffIndex).value[skillIndex].start, 'hh:mm A').format('HH mm');
          let timeBreak = 0;

          let diff = (moment(timeFinish, 'HH:mm').subtract(timeBreak)).diff(moment(timeStart, 'HH:mm'))
          let diffDuration = moment.duration(diff);
          let hours =  Math.floor(diffDuration.asHours());
          let minutes = moment.utc(diff).format("mm");
          
          let convertHours = hours + ":" + minutes;

          this.taskTradeFormArray(empIndex, staffIndex).at(skillIndex).get('tempHours').patchValue( (moment.duration(convertHours).asHours()).toFixed(2) );
          this.taskTradeFormArray(empIndex, staffIndex).at(skillIndex).get('hours').patchValue( (moment.duration(convertHours).asHours()).toFixed(2) );

          this.computeTradeStaffTotalHours(empIndex, staffIndex);
          
      }

    }


    public computeTimeStaff(empIndex,skillIndex){

      if( (this.taskStaffFormArray(empIndex).value[skillIndex].finish != '') && (this.taskStaffFormArray(empIndex).value[skillIndex].start != '') && (this.taskStaffFormArray(empIndex).value[skillIndex].break != '')  ){
       
          let timeFinish = moment(this.taskStaffFormArray(empIndex).value[skillIndex].finish, 'hh:mm A').format('HH mm');
          let timeStart = moment(this.taskStaffFormArray(empIndex).value[skillIndex].start, 'hh:mm A').format('HH mm');
          let timeBreak = moment.duration(this.taskStaffFormArray(empIndex).value[skillIndex].break);

          let diff = (moment(timeFinish, 'HH:mm').subtract(timeBreak)).diff(moment(timeStart, 'HH:mm'))
          let diffDuration = moment.duration(diff);
          let hours =  Math.floor(diffDuration.asHours());
          let minutes = moment.utc(diff).format("mm");
          
          let convertHours = hours + ":" + minutes;

          this.taskStaffFormArray(empIndex).at(skillIndex).get('tempHours').patchValue( (moment.duration(convertHours).asHours()).toFixed(2) );
          this.taskStaffFormArray(empIndex).at(skillIndex).get('hours').patchValue( (moment.duration(convertHours).asHours()).toFixed(2) );
        

          this.computeStaffTotalHours(empIndex);
          
      }else if( (this.taskStaffFormArray(empIndex).value[skillIndex].finish != '') && (this.taskStaffFormArray(empIndex).value[skillIndex].start != '') && (this.taskStaffFormArray(empIndex).value[skillIndex].break == '')  ){
       
          let timeFinish = moment(this.taskStaffFormArray(empIndex).value[skillIndex].finish, 'hh:mm A').format('HH mm');
          let timeStart = moment(this.taskStaffFormArray(empIndex).value[skillIndex].start, 'hh:mm A').format('HH mm');
          let timeBreak = 0;

          let diff = (moment(timeFinish, 'HH:mm').subtract(timeBreak)).diff(moment(timeStart, 'HH:mm'))
          let diffDuration = moment.duration(diff);
          let hours =  Math.floor(diffDuration.asHours());
          let minutes = moment.utc(diff).format("mm");
          
          let convertHours = hours + ":" + minutes;

          this.taskStaffFormArray(empIndex).at(skillIndex).get('tempHours').patchValue( (moment.duration(convertHours).asHours()).toFixed(2) );
          this.taskStaffFormArray(empIndex).at(skillIndex).get('hours').patchValue( (moment.duration(convertHours).asHours()).toFixed(2) );

          this.computeStaffTotalHours(empIndex);
          
      }

    }

    public computeTradeStaffTotalHours(empIndex, staffIndex){

      let taskLen = this.taskTradeFormArray(empIndex, staffIndex).length;
      let staffTotal = 0;
 
      if(taskLen > 1){
          for (let i = 0; i < taskLen; i++) {
            let temp = this.taskTradeFormArray(empIndex, staffIndex).value[i].hours ? parseFloat(this.taskTradeFormArray(empIndex, staffIndex).value[i].hours) : 0;
            staffTotal = staffTotal + temp;
          }
      }else if(taskLen == 1 ){
        staffTotal = parseFloat(this.taskTradeFormArray(empIndex, staffIndex).value[0].hours)
      }else{
        staffTotal = 0;
      }

      this.tradeStaffFormArray(empIndex).at(staffIndex).get('totalHours').patchValue( (staffTotal).toFixed(2) );

      this.computeTradeTotalHours(empIndex);
    }

    public computeTradeTotalHours(empIndex){

  
      let staffLen = this.tradeStaffFormArray(empIndex).length;

      let tradeTotal = 0;

      if(staffLen > 1){
          for (let i = 0; i < staffLen; i++) {
              let curTaskLen =  this.taskTradeFormArray(empIndex, i).length;
              for (let j = 0; j < curTaskLen; j++) {
                tradeTotal = tradeTotal + ( this.taskTradeFormArray(empIndex, i).value[j].hours ? parseFloat(this.taskTradeFormArray(empIndex, i).value[j].hours) : 0 )
              }    
          }
      }else if(staffLen == 1 ){
        for (let i = 0; i < staffLen; i++) {
            let curTaskLen =  this.taskTradeFormArray(empIndex, i).length;
            for (let j = 0; j < curTaskLen; j++) {
              tradeTotal = tradeTotal + ( this.taskTradeFormArray(empIndex, i).value[j].hours ? parseFloat(this.taskTradeFormArray(empIndex, i).value[j].hours) : 0 )
            }    
        }
      }else{
        tradeTotal = 0;
      }

      this.tradeFormArray().at(empIndex).get('totalHours').patchValue( (tradeTotal).toFixed(2) );

    }

    public computeStaffTotalHours(empIndex){

      let len = this.taskStaffFormArray(empIndex).length;
      let total = 0;
      if(len > 1){
          for (let i = 0; i < len; i++) {
              total = total + parseFloat(this.taskStaffFormArray(empIndex).value[i].hours)
          }
      }else if(len == 1 ){
        total = parseFloat(this.taskStaffFormArray(empIndex).value[0].hours)
      }else{
        total = 0;
      }

      this.staffFormArray().at(empIndex).get('totalHours').patchValue( (total).toFixed(2) );
    }

    getTotal(empIndex,skillIndex) {
        // const studentGrades = this.taskTradeFormArray(0).value[skillIndex].hours;
        // return studentGrades.reduce((a, b) => Number(a) + Number(b));
 
    } 

    public beautifyNotes(data) {

        if(data){
          return data.join(', ');  
        }else{
          return;
        }
            
    }
    
    public submitForApproval(){

      return;

      this.spinnerService.show();

        //transform Friday Date
        //this.friDateRaw = this.editForm.value.fridayDate;
        //this.friDate = ('0' + (this.friDateRaw.getDate())).slice(-2) + '-' + ('0' + (this.friDateRaw.getMonth() + 1) ).slice( -2 ) + '-' + this.friDateRaw.getFullYear() ;

        //transform Aimed Completion Date 
        this.aimDateRaw = this.editForm.value.aimedComDate;
        this.aimDate = ('0' + (this.aimDateRaw.getDate())).slice(-2) + '-' + ('0' + (this.aimDateRaw.getMonth() + 1) ).slice( -2 ) + '-' + this.aimDateRaw.getFullYear() ;

        // const documentDefinition = { content: 'This is an sample PDF printed with pdfMake' };
        const documentDefinition = this.getDocumentDefinition();

        const pdfDocGenerator = pdfMake.createPdf(documentDefinition);

        pdfDocGenerator.getBase64((data) => {
              // this.data_api.submitForApproval(data).subscribe((result) => {
                
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

    public previewPdf(){

        // this.addReport();
        this.pdfstaffTotalHours = 0;
        this.todaysDateRaw = this.editForm.value.todaysDate;
        this.todaysDate = ('0' + (this.todaysDateRaw.getDate())).slice(-2) + '-' + ('0' + (this.todaysDateRaw.getMonth() + 1) ).slice( -2 ) + '-' + this.todaysDateRaw.getFullYear() ;

        //transform Friday Date
      // this.friDateRaw = this.editForm.value.fridayDate;
        //this.friDate = ('0' + (this.friDateRaw.getDate())).slice(-2) + '-' + ('0' + (this.friDateRaw.getMonth() + 1) ).slice( -2 ) + '-' + this.friDateRaw.getFullYear() ;

        //transform Aimed Completion Date
        //this.aimDateRaw = this.editForm.value.aimedComDate;
        //this.aimDate = ('0' + (this.aimedDate.getDate())).slice(-2) + '-' + ('0' + (this.aimedDate.getMonth() + 1) ).slice( -2 ) + '-' + this.aimedDate.getFullYear() ;

        // const documentDefinition = { content: 'This is an sample PDF printed with pdfMake' };
        const documentDefinition = this.getDocumentDefinition2();
        //pdfMake.createPdf(documentDefinition).download('test.pdf');
        pdfMake.createPdf(documentDefinition).open();

    }

    public downloadPdf(){

              this.pdfstaffTotalHours = 0;
              this.todaysDateRaw = this.editForm.value.todaysDate;
              this.todaysDate = ('0' + (this.todaysDateRaw.getDate())).slice(-2) + '-' + ('0' + (this.todaysDateRaw.getMonth() + 1) ).slice( -2 ) + '-' + this.todaysDateRaw.getFullYear() ;
        
              //transform Friday Date
            // this.friDateRaw = this.editForm.value.fridayDate;
              //this.friDate = ('0' + (this.friDateRaw.getDate())).slice(-2) + '-' + ('0' + (this.friDateRaw.getMonth() + 1) ).slice( -2 ) + '-' + this.friDateRaw.getFullYear() ;

              //transform Aimed Completion Date
              //this.aimDateRaw = this.editForm.value.aimedComDate;
              //this.aimDate = ('0' + (this.aimedDate.getDate())).slice(-2) + '-' + ('0' + (this.aimedDate.getMonth() + 1) ).slice( -2 ) + '-' + this.aimedDate.getFullYear() ;

              // const documentDefinition = { content: 'This is an sample PDF printed with pdfMake' };
              const documentDefinition = this.getDocumentDefinition2();
              //pdfMake.createPdf(documentDefinition).download('test.pdf');
              // pdfMake.createPdf(documentDefinition).download(this.todaysDate+'-'+this.jobNumber+'.pdf');

              if(this.download_mode == true){
              
                pdfMake.createPdf(documentDefinition).download(this.todaysDate+'-'+this.jobNumber+'.pdf',
                function() { 
                  // setTimeout(function(){ window.reload() }, 2000);
                  setTimeout(() => {
                    window.parent.postMessage({"message":"done"}, '*');
                    window.location.href = '';
                  }, 1000);
                }
                );
              }else{
                const pdfDocGenerator = pdfMake.createPdf(documentDefinition);
                pdfDocGenerator.download(this.todaysDate+'-'+this.jobNumber+'.pdf');
                
              }

     

     }

    public changeDayWeather(){
        this.editForm.controls['weatherAllDay'].reset();

        if(this.editForm.value.weatherMorning == 'weatherOthers'){
            this.isOthersMorning = 'show';
        }else{
            this.isOthersMorning = 'hide';
        }

        if(this.editForm.value.weatherMidDay == 'weatherOthers'){
            this.isOthersMidDay = 'show';
        }else{
            this.isOthersMidDay = 'hide';
        }

        if(this.editForm.value.weatherAfternoon == 'weatherOthers'){
            this.isOthersAfternoon = 'show';
        }else{
            this.isOthersAfternoon = 'hide';
        }

        if(this.editForm.value.weatherEvening == 'weatherOthers'){
            this.isOthersEvening = 'show';
        }else{
            this.isOthersEvening = 'hide';
        }

        if(this.editForm.value.weatherOnOff == 'weatherOthers'){
            this.isOthersOnOff = 'show';
        }else{
            this.isOthersOnOff = 'hide';
        }

        if(this.editForm.value.weatherRestOfDay == 'weatherOthers'){
            this.isOthersRestOfDay = 'show';
        }else{
            this.isOthersRestOfDay = 'hide';
        }

        this.isOthersAllDay = 'hide';
    }

    public changeAllDayWeather(){
   
        this.editForm.controls['weatherMorning'].reset();
        this.editForm.controls['weatherMidDay'].reset();
        this.editForm.controls['weatherAfternoon'].reset();
        this.editForm.controls['weatherEvening'].reset();
        this.editForm.controls['weatherOnOff'].reset();
        this.editForm.controls['weatherRestOfDay'].reset();
 
        if(this.editForm.value.weatherAllDay == 'weatherOthers'){
            this.isOthersAllDay = 'show';
        }else{
            this.isOthersAllDay = 'hide';
        }

        this.isOthersMorning = 'hide';
        this.isOthersMidDay = 'hide';
        this.isOthersAfternoon = 'hide';
        this.isOthersEvening = 'hide';
        this.isOthersOnOff = 'hide';
        this.isOthersRestOfDay = 'hide';
        
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

    getInstructionsReceived() {
      let accsList = this.editForm.value.instructionsReceived

      if(accsList){
          return {
              ul: [
                    ...accsList.map(info => {
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
      }

    }

    getDelays() {
      let accsList = this.editForm.value.delays

      if(accsList){

        return {
            ul: [
                  ...accsList.map(info => {
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
      }
    }

    getToolsUsed() {
      let accsList = this.editForm.value.toolsUsed

      if(accsList){

          return {
              ul: [
                    ...accsList.map(info => {
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

      }
    }

    getDamageReport() {
      let accsList = this.editForm.value.damageReport

      if(accsList){

          return {
              ul: [
                    ...accsList.map(info => {
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
            
      }
    }

    getSummary() {
      let accsList = this.editForm.value.summary

      if(accsList){

          return {
              ul: [
                    ...accsList.map(info => {
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

      }
    }

    getMaterialsRequested() {
      let accsList = this.editForm.value.materialsRequested

      if(accsList){

          return {
              ul: [
                    ...accsList.map(info => {
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

      }
    }

    getTradesToContact() {
      let accsList = this.editForm.value.tradesContact

      if(accsList){

          return {
              ul: [
                    ...accsList.map(info => {
                      return [ 
                        {
                          text: info.display,
                          style: 'test',
                        }
                      ]
                    })
              ],
              margin: [ 0, 10, 0, 0 ],
            };

      }
    } 

    getTradesToSchedule() {
      let accsList = this.editForm.value.tradesSched

      if(accsList){

          return {
              ul: [
                    ...accsList.map(info => {
                      return [ 
                        {
                          text: info.display,
                          style: 'test',
                        }
                      ]
                    })
              ],
              margin: [ 0, 10, 0, 0 ],
            };

      }
    } 

    checkgetTradesOnSite(){
        if( this.editForm.value.tradeFormArray.length > 0  && this.tradeFormArray().at(0).get('tradesOnSite').value != '' ){
              return [{
                      stack: [
                        {
                          image: this.pdfImage.bgSubAccThisWeek,
                          width: '265',
                          // margin: [ 0, 20, 0, 0 ]
                        },
                        {
                          text: 'TRADES ON SITE:',
                          style: 'testHeader',
                          margin: [ 5, -15, 0, 0 ]
                        },
                        this.getTradesOnSite(),
                      ],
                      unbreakable: false,
                      margin: [ 0, 10, 0, 0 ],
                  }
                ]
        }else{
            return '';
        }
        
    }

    getTradesOnSite() {
      let data = this.editForm.value.tradeFormArray;
      if(data){


        let _tradesList = [];
        let _tradesList2 = [];

        let i = 0;
        data.forEach(tradesList=> {
          if(tradesList.tradesOnSite){
            let tradeDetails = this.listTrades.find((obj => obj.id == tradesList.tradesOnSite));

              if(tradesList.tradeStaffFormArray){
                let _tradehours = 0;

                    let iter = 0;
                    tradesList.tradeStaffFormArray.forEach(staffList => {
                      
                      if(this.listTradeStaffs[i]){
                        

                                let staffDetails =  this.listTradeStaffs[i].find((obj => obj.staffID == staffList.staffOnSite));
                                let _staffList = [];

                                if(iter==0){

                                  _staffList.push({text:'',style: 'test',margin: [ 0, 10, 0, 0 ]});
                                  _staffList.push({text:'Trade Name: '+tradeDetails?.tradeCompanyName,style: 'test5',margin: [ 0, 10, 0, 0 ]});

                                }

                                _staffList.push({text:'Staff Name: '+staffDetails?.staffName,style: 'test',margin: [ 0, 10, 0, 0 ]});

                                if(staffList.taskTradeFormArray){

                                      
                                      let columns = [];
                                    
                                      columns.push({text:'Description',style: 'test',width: '*',margin: [ 0, 10, 0, 0 ]});
                                      columns.push({text:'Start',style: 'test',width: '10%',margin: [ 0, 10, 0, 0 ]});
                                      columns.push({text:'Break',style: 'test',width: '10%',margin: [ 0, 10, 0, 0 ]});
                                      columns.push({text:'Finish',style: 'test',width: '10%',margin: [ 0, 10, 0, 0 ]});
                                      columns.push({text:'Total Hours',style: 'test',width: '12%',margin: [ 0, 10, 0, 0 ]});
                                      _staffList.push({columns})
                                      _staffList.push({canvas: [{ type: 'line', x1: 0, y1: 5, x2: 520, y2: 5, lineWidth: 0.5, lineColor: '#BDBDBD' }]});
                                            let _staffhours = 0;
                                            staffList.taskTradeFormArray.forEach(taskList => {
                    
                                                  let columns = [];
                                                  
                                                  columns.push({text:taskList.taskDescription,width: '*',style: 'test',margin: [ 0, 5, 0, 0 ]});
                                                  columns.push({text:taskList.start,style: 'test',width: '10%',margin: [ 0, 5, 0, 0 ]});
                                                  columns.push({text:taskList.break,style: 'test',width: '10%',margin: [ 0, 5, 0, 0 ]});
                                                  columns.push({text:taskList.finish,style: 'test',width: '10%',margin: [ 0, 5, 0, 0 ]});
                                                  columns.push({text:taskList.hours,style: 'test',width: '12%',margin: [ 0, 5, 0, 0 ]});
                                                  _staffList.push({columns});
                                                  _staffList.push({canvas: [{ type: 'line', x1: 0, y1: 5, x2: 520, y2: 5, lineWidth: 0.5, lineColor: '#BDBDBD' }]});
                                                  _staffhours = (_staffhours + taskList.hours) * 1;
                                            });
                                            
                                      columns = [];
                    
                                      columns.push({text:'',width: '*',style: 'test',margin: [ 0, 5, 0, 0 ]});
                                      columns.push({text:'',style: 'test',width: '10%',margin: [ 0, 5, 0, 0 ]});
                                      // columns.push({text:'',style: 'test',width: '9%',margin: [ 0, 5, 0, 0 ]});
                                      columns.push({text:'Staff Total Hours:',style: 'test',width: '20%',margin: [ 0, 5, 0, 0 ]});
                                      columns.push({text:_staffhours,style: 'test',width: '12%',margin: [ 0, 5, 0, 0 ]});
                                      _staffList.push({columns});

                                      _tradehours = (_tradehours + _staffhours) * 1;
                                }
                                
                              _tradesList.push(
                                    {
                                      stack: [
                                      ..._staffList,
                                    ],
                                      unbreakable: true
                                    }                   
                              );

                              iter++;
                        }
                    });

                    let columns = [];
                    _tradesList.push({canvas: [{ type: 'line', x1: 0, y1: 5, x2: 520, y2: 5, lineWidth: 1, lineColor: '#BDBDBD' }]});
                    columns.push({text:'',width: '*',style: 'test',margin: [ 0, 5, 0, 0 ]});
                    columns.push({text:'',style: 'test',width: '10%',margin: [ 0, 5, 0, 0 ]});
                    // columns.push({text:'',style: 'test',width: '9%',margin: [ 0, 5, 0, 0 ]});
                    columns.push({text:'Trade Total Hours:',style: 'test',width: '20%',margin: [ 0, 5, 0, 0 ]});
                    columns.push({text:_tradehours,style: 'test',width: '12%',margin: [ 0, 5, 0, 0 ]});
                    _tradesList.push({columns});

              }else{
                _tradesList.push({text:'',style: 'test',margin: [ 0, 10, 0, 0 ]});
                _tradesList.push({text:'Trade Name: '+tradeDetails?.tradeCompanyName,style: 'test5',margin: [ 0, 10, 0, 0 ]});    
              }
       
              _tradesList.push({text:'',style: 'test',margin: [ 0, 15, 0, 0 ]});

              _tradesList2.push(
                      {
                        stack: [
                        ..._tradesList,
                      ],
                        unbreakable: false
                      }                   
                );

                _tradesList = [];
            i++;
          }
        });

        return _tradesList2;

      }
    } 

    checkgetStaffOnSite(){

      if( (this.editForm.value.staffFormArray.length > 0  && this.staffFormArray().at(0).get('staffOnSite').value != '')  || (this.dailyWorkerLogsAccepted) ){
            return [
                {
                  stack: [
                    {
                      image: this.pdfImage.bgSubAccThisWeek,
                      width: '265',
                      // margin: [ 0, 20, 0, 0 ]
                    },
                    {
                      text: 'EMPLOYEES ON SITE:',
                      style: 'testHeader',
                      margin: [ 5, -15, 0, 0 ]
                    },
                    this.getStaffOnSite(),
                    this.getStaffOnSite2(),
                    this.getStaffTotal(),
                  ],
                  unbreakable: false,
                  margin: [ 0, 10, 0, 0 ],
              }
            ]
      }else{
          return '';
      }

    }

    checkgetStaffOnSiteB(){
      // console.log( this.staffFormArray().at(0).get('staffOnSite').value);

      if( (this.editForm.value.staffFormArray.length > 0  && this.staffFormArray().at(0).get('staffOnSite').value != '')  || (this.dailyWorkerLogsAccepted.length > 0) ){
            return [
                {
                  stack: [
                    {
                      text: 'Employees on Site:',
                      style: 'fieldHeader',
                      margin: [ 5, 10, 0, 0 ],
                    },
                    {canvas: [{ type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 0.1,lineColor: '#A9A9A9' }],margin: [ 0, 2, 0, 2 ],},
                    this.getStaffOnSiteSupervisor(),
                    this.getStaffOnSiteWorker(),
                    // this.getStaffTotal(),
                  ],
                  unbreakable: false,
              }
            ]
      }else{
          return '';
      }

    }

    getTableTimesheetHeader(){

      let content = [];

      content.push([
        {
            table: {
              widths: [ '12%','40%','12%','12%','12%','12%'],
              body: [

                [
                  {
                    text: 'Task No', 
                    style: 'tableHeader',
                  },
                  {
                      text:  'Description', 
                      style: 'tableHeader',  
                  },
                  {
                      text:  'Start', 
                      style: 'tableHeader',  
                  },
                  {
                      text:  'Break', 
                      style: 'tableHeader',  
                  },
                  {
                      text:  'Finish', 
                      style: 'tableHeader',  
                  },
                  {
                      text:  'Hours', 
                      style: 'tableHeader',  
                  },
              ]

            ]                     
            },
            layout: {
              defaultBorder:false,
              fillColor: '#F1F1F1',
              paddingTop: function(i, node) { return 2; }, 
              paddingBottom: function(i, node) { return 2;},
            }
          },
        
        ])


      return content;

    }

    getTableStaffTime(data){
      if(data){
        let staffTaskHolder = [];
        
        let TaskNum = 1;
        data.forEach(taskList => {
          staffTaskHolder.push([
            {text: TaskNum, style: 'fieldData'},
            {text: taskList.taskDescription, style: 'fieldData'},
            {text: taskList.start, style: 'fieldData'},
            {text: taskList.break, style: 'fieldData'},
            {text: taskList.finish, style: 'fieldData'},
            {text: (taskList.hours * 1).toFixed(2), style: 'fieldData'},
          ]);
          TaskNum++;
        });
        return staffTaskHolder;
      }
    }

    getStaffOnSiteSupervisor() {
        let data = this.editForm.value.staffFormArray;
        if(data){
            if(data.length > 0){
              
             
              let content = [];

              data.forEach(staffList => {

                  if(staffList.staffOnSite){
                    
                    let staffHolder = [];
                    let staffTaskHolder = [];

                    let staffDetails = this.listStaffs.find((obj => obj.id == staffList.staffOnSite));

                    let _staffhours = 0;
                    staffList.taskStaffFormArray.forEach(taskList => {
                      _staffhours = _staffhours + (taskList.hours) * 1;
                    });
                      staffHolder.push(
                        {
                          stack: [
                              {
                                stack: [
                                  {
                                    columns: [
                                      {
                                        text: 'Staff Name: '+staffDetails?.staff_name,
                                        style: 'tableHeader',
                                        margin: [ 5, 5, 0, 0 ],
                                      },
                                      {
                                        text: 'Total Hours: '+(_staffhours).toFixed(2),
                                        style: 'tableHeader',
                                        margin: [ 5, 5, 0, 0 ],
                                        alignment: 'right'
                                      },
                                    ],
                                  }, 
                                  // {
                                  //   text: 'Staff Name: '+staffDetails?.staff_name,
                                  //   style: 'tableHeader',
                                  //   margin: [ 5, 5, 0, 0 ],
                                  // },
                                  this.getTableTimesheetHeader(),
                                  // {canvas: [{ type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 0.1,lineColor: '#A9A9A9' }],margin: [ 0, 2, 0, 2 ],},
                                  {
                                    table: {
                                      widths: [ '12%','40%','12%','12%','12%','12%'],
                                      body: this.getTableStaffTime(staffList.taskStaffFormArray)                    
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

                      content.push(staffHolder);
                  }

              });

              return content;

            }else{
              return;
            }
        }else{
          return;
        }
    } 

    getStaffOnSiteWorker() {
        let data = this.dailyWorkerLogsAccepted;
        if(data){
            if(data.length > 0){
              
            
              let content = [];

              data.forEach(staffList => {

                    
                    let staffHolder = [];

                    // let staffDetails = this.listStaffs.find((obj => obj.id == staffList.staffOnSite));
                    let timeFinish = moment(staffList.finish, 'hh:mm A').format('HH mm');
                    let timeStart = moment(staffList.start, 'hh:mm A').format('HH mm');
                    let timeBreak = moment.duration(staffList.break);
                    let diff = (moment(timeFinish, 'HH:mm').subtract(timeBreak)).diff(moment(timeStart, 'HH:mm'))
                    let diffDuration = moment.duration(diff);
                    let hours =  Math.floor(diffDuration.asHours());
                    let minutes = moment.utc(diff).format("mm");
                    let totalHours = hours +":" + minutes;

                      staffHolder.push(
                        {
                          stack: [
                              {
                                stack: [
                                  {
                                    columns: [
                                      {
                                        text: 'Staff Name: '+staffList?.workerName,
                                        style: 'tableHeader',
                                        margin: [ 5, 5, 0, 0 ],
                                      },
                                      {
                                        text: 'Total Hours: '+(moment.duration(totalHours).asHours()).toFixed(2),
                                        style: 'tableHeader',
                                        margin: [ 5, 5, 0, 0 ],
                                        alignment: 'right'
                                      },
                                    ],
                                  }, 
                                  // {
                                  //   text: 'Staff Name: '+ staffList?.workerName,
                                  //   style: 'tableHeader',
                                  //   margin: [ 5, 5, 0, 0 ],
                                  // },
                                  this.getTableTimesheetHeader(),
                                  // {canvas: [{ type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 0.1,lineColor: '#A9A9A9' }],margin: [ 0, 2, 0, 2 ],},
                                  {
                                    table: {
                                      widths: [ '12%','40%','12%','12%','12%','12%'],
                                      // body: this.getTableStaffTime(staffList.taskStaffFormArray)  
                                      body:[
                                          [
                                            {text: '1', style: 'fieldData'},
                                            {text:this.beautifyNotes(staffList.accomplishments), style: 'fieldData'},
                                            {text: staffList.start, style: 'fieldData'},
                                            {text: staffList.break, style: 'fieldData'},
                                            {text: staffList.finish, style: 'fieldData'},
                                            {text: (moment.duration(totalHours).asHours()).toFixed(2), style: 'fieldData'},
                                          ] 
                                      ]                  
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

                      content.push(staffHolder);
               

              });

              return content;

            }else{
              return;
            }
        }else{
          return;
        }
    } 

    checkgetTradesOnSiteB(){

      if( this.editForm.value.tradeFormArray.length > 0  && this.tradeFormArray().at(0).get('tradesOnSite').value != '' ){
            return [
                {
                  stack: [
                    {
                      text: 'Trades on Site:',
                      style: 'fieldHeader',
                      margin: [ 5, 10, 0, 0 ],
                    },
                    {canvas: [{ type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 0.1,lineColor: '#A9A9A9' }],margin: [ 0, 2, 0, 2 ],},
                    this.getTradesOnSiteB(),
                  ],
                  unbreakable: false,
              }
            ]
      }else{
          return '';
      }

    }

    getTradesOnSiteB() {
      let data = this.editForm.value.tradeFormArray;
      if(data){
          if(data.length > 0){
              
              let content = [];
              let i = 0

                  data.forEach(tradesList=> {

                    if(tradesList.tradesOnSite){

                        let tradeDetails = this.listTrades.find((obj => obj.id == tradesList.tradesOnSite));

                        if(tradesList.tradeStaffFormArray){

                              tradesList.tradeStaffFormArray.forEach(staffList => {

                                  if(this.listTradeStaffs[i]){
                                        
                                        let staffHolder = [];
                                        let staffTaskHolder = [];

                                        let staffDetails =  this.listTradeStaffs[i].find((obj => obj.staffID == staffList.staffOnSite));
                                        let _staffhours = 0;
                                        staffList.taskTradeFormArray.forEach(taskList => {
                                          _staffhours = _staffhours + (taskList.hours) * 1;
                                        });
                                          staffHolder.push(
                                            {
                                              stack: [
                                                  {
                                                    stack: [
                                                      {
                                                        columns: [
                                                          {
                                                            text: 'Staff Name: '+staffDetails?.staffName,
                                                            style: 'tableHeader',
                                                            margin: [ 5, 5, 0, 0 ],
                                                          },
                                                          {
                                                            text: 'Total Hours: '+(_staffhours).toFixed(2),
                                                            style: 'tableHeader',
                                                            margin: [ 5, 5, 0, 0 ],
                                                            alignment: 'right'
                                                          },
                                                        ],
                                                      }, 
                                                      this.getTableTimesheetHeader(),
                                                      {
                                                        table: {
                                                          widths: [ '12%','40%','12%','12%','12%','12%'],
                                                          body: this.getTableStaffTime(staffList.taskTradeFormArray)                    
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
                                          content.push(
                                            [
                                            {
                                              columns: [
                                                {
                                                  text: 'Trade Name: '+tradeDetails?.tradeCompanyName,
                                                  style: 'tableHeader',
                                                },
                                                // {
                                                //   text: 'Total Hours: '+(_staffhours).toFixed(2),
                                                //   style: 'tableHeader',
                                                //   margin: [ 5, 5, 0, 0 ],
                                                //   alignment: 'right'
                                                // },
                                              ],
                                              margin: [ 5, 5, 0, 0 ],
                                            },
                                            {canvas: [{ type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 0.1,lineColor: '#A9A9A9' }],margin: [ 0, 2, 0, 2 ],},
                                          ])
                                    
                                          content.push(staffHolder);
                                      }

                                  });
                        }
                    }
                    i++;
                  });

              return content;

          }else{
            return;
          }
      }else{
        return;
      }
  } 

    getStaffOnSite() {
        let data = this.editForm.value.staffFormArray;
        if(data){

          let _staffList = [];
          let _staffList2 = [];

                  data.forEach(staffList => {

                    if(staffList.staffOnSite){

                    let staffDetails = this.listStaffs.find((obj => obj.id == staffList.staffOnSite));
                    _staffList.push({text:'',style: 'test',margin: [ 0, 10, 0, 0 ]});
                    _staffList.push({text:'Staff Name: '+staffDetails?.staff_name,style: 'test',margin: [ 0, 10, 0, 0 ]});

                            if(staffList.taskStaffFormArray){
                                  
                                  let columns = [];

                                  columns.push({text:'Description',style: 'test',width: '*',margin: [ 0, 10, 0, 0 ]});
                                  columns.push({text:'Start',style: 'test',width: '10%',margin: [ 0, 10, 0, 0 ]});
                                  columns.push({text:'Break',style: 'test',width: '10%',margin: [ 0, 10, 0, 0 ]});
                                  columns.push({text:'Finish',style: 'test',width: '10%',margin: [ 0, 10, 0, 0 ]});
                                  columns.push({text:'Total Hours',style: 'test',width: '12%',margin: [ 0, 10, 0, 0 ]});
                                  _staffList.push({columns})
                                  _staffList.push({canvas: [{ type: 'line', x1: 0, y1: 5, x2: 520, y2: 5, lineWidth: 0.5, lineColor: '#BDBDBD' }]});
                                        let _staffhours = 0;
                                        staffList.taskStaffFormArray.forEach(taskList => {
                
                                              let columns = [];
                                              
                                              columns.push({text:taskList.taskDescription,width: '*',style: 'test',margin: [ 0, 5, 0, 0 ]});
                                              columns.push({text:taskList.start,style: 'test',width: '10%',margin: [ 0, 5, 0, 0 ]});
                                              columns.push({text:taskList.break,style: 'test',width: '10%',margin: [ 0, 5, 0, 0 ]});
                                              columns.push({text:taskList.finish,style: 'test',width: '10%',margin: [ 0, 5, 0, 0 ]});
                                              columns.push({text:taskList.hours,style: 'test',width: '12%',margin: [ 0, 5, 0, 0 ]});
                                              _staffList.push({columns});
                                              _staffList.push({canvas: [{ type: 'line', x1: 0, y1: 5, x2: 520, y2: 5, lineWidth: 0.5, lineColor: '#BDBDBD' }]});
                                              _staffhours = _staffhours + (taskList.hours) * 1;
                                        });
                                        
                                  columns = [];
                
                                  columns.push({text:'',width: '*',style: 'test',margin: [ 0, 5, 0, 0 ]});
                                  columns.push({text:'',style: 'test',width: '10%',margin: [ 0, 5, 0, 0 ]});
                                  // columns.push({text:'',style: 'test',width: '15%',margin: [ 0, 5, 0, 0 ]});
                                  columns.push({text: staffDetails?.staff_name + ' Total Hours:',style: 'test',width: '20%',margin: [ 0, 5, 0, 0 ]});
                                  columns.push({text:(_staffhours).toFixed(2),style: 'test',width: '12%',margin: [ 0, 5, 0, 0 ]});
                                  _staffList.push({columns});
                                  this.pdfstaffTotalHours = this.pdfstaffTotalHours + _staffhours;
                            }
                          }

                          _staffList2.push(
                                {
                                  stack: [
                                  ..._staffList,
                                ],
                                  unbreakable: true
                                }                   
                          );

                          _staffList = [];

                      });

          return _staffList2;
        }
    } 

    getStaffOnSite2() {
        let data = this.dailyWorkerLogsAccepted;
        if(data){

          let _staffList = [];
          let _staffList2 = [];

                  data.forEach(staffList => {
           
                    let staffDetails = this.listStaffs.find((obj => obj.id == staffList.staffOnSite));

                    _staffList.push({text:'',style: 'test',margin: [ 0, 10, 0, 0 ]});
                    _staffList.push({text:'Staff Name: '+staffList?.workerName,style: 'test',margin: [ 0, 10, 0, 0 ]});

                                                
                                  let columns = [];

                                  columns.push({text:'Description',style: 'test',width: '*',margin: [ 0, 10, 0, 0 ]});
                                  columns.push({text:'Start',style: 'test',width: '10%',margin: [ 0, 10, 0, 0 ]});
                                  columns.push({text:'Break',style: 'test',width: '10%',margin: [ 0, 10, 0, 0 ]});
                                  columns.push({text:'Finish',style: 'test',width: '10%',margin: [ 0, 10, 0, 0 ]});
                                  columns.push({text:'Total Hours',style: 'test',width: '12%',margin: [ 0, 10, 0, 0 ]});
                                  _staffList.push({columns})
                                  _staffList.push({canvas: [{ type: 'line', x1: 0, y1: 5, x2: 520, y2: 5, lineWidth: 0.5, lineColor: '#BDBDBD' }]});

                                  columns = [];
                                  
                                  columns.push({text:this.beautifyNotes(staffList.accomplishments),width: '*',style: 'test',margin: [ 0, 5, 0, 0 ]});
                                  columns.push({text:staffList.start,style: 'test',width: '10%',margin: [ 0, 5, 0, 0 ]});
                                  columns.push({text:staffList.break,style: 'test',width: '10%',margin: [ 0, 5, 0, 0 ]});
                                  columns.push({text:staffList.finish,style: 'test',width: '10%',margin: [ 0, 5, 0, 0 ]});

                                  let timeFinish = moment(staffList.finish, 'hh:mm A').format('HH mm');
                                  let timeStart = moment(staffList.start, 'hh:mm A').format('HH mm');
                                  let timeBreak = moment.duration(staffList.break);
                                  
                                  let diff = (moment(timeFinish, 'HH:mm').subtract(timeBreak)).diff(moment(timeStart, 'HH:mm'))
                                  let diffDuration = moment.duration(diff);
                                  let hours =  Math.floor(diffDuration.asHours());
                                  let minutes = moment.utc(diff).format("mm");
                                  let totalHours = hours +":" + minutes;

                                  columns.push({text:(moment.duration(totalHours).asHours()).toFixed(2),style: 'test',width: '12%',margin: [ 0, 5, 0, 0 ]});
                                  _staffList.push({columns});
                                  _staffList.push({canvas: [{ type: 'line', x1: 0, y1: 5, x2: 520, y2: 5, lineWidth: 0.5, lineColor: '#BDBDBD' }]});
                                  
                                        
                                  columns = [];
                
                                  columns.push({text:'',width: '*',style: 'test',margin: [ 0, 5, 0, 0 ]});
                                  columns.push({text:'',style: 'test',width: '15%',margin: [ 0, 5, 0, 0 ]});
                                  // columns.push({text:'',style: 'test',width: '15%',margin: [ 0, 5, 0, 0 ]});
                                  columns.push({text: staffList?.workerName + ' Total Hours:',style: 'test',width: '20%',margin: [ 0, 5, 0, 0 ]});
                                  columns.push({text:(moment.duration(totalHours).asHours()).toFixed(2),style: 'test',width: '12%',margin: [ 0, 5, 0, 0 ]});
                                  _staffList.push({columns});
                                  this.pdfstaffTotalHours = this.pdfstaffTotalHours + moment.duration(totalHours).asHours();

                                  _staffList2.push(
                                        {
                                          stack: [
                                          ..._staffList,
                                        ],
                                          unbreakable: true
                                        }                   
                                  );
        
                                  _staffList = [];

                      });


          return _staffList2;
        }
    } 

    getStaffTotal(){
            let _allStaffTotal = [];
            let columns = [];
            _allStaffTotal.push({canvas: [{ type: 'line', x1: 0, y1: 5, x2: 520, y2: 5, lineWidth: 1, lineColor: '#BDBDBD' }]});
            columns.push({text:'',width: '*',style: 'test',margin: [ 0, 5, 0, 0 ]});
            columns.push({text:'',style: 'test',width: '10%',margin: [ 0, 5, 0, 0 ]});
            // columns.push({text:'',style: 'test',width: '15%',margin: [ 0, 5, 0, 0 ]});
            columns.push({text:'Employees Total Hours:',style: 'test',width: '20%',margin: [ 0, 5, 0, 0 ]});
            columns.push({text:(this.pdfstaffTotalHours).toFixed(2),style: 'test',width: '12%',margin: [ 0, 5, 0, 0 ]});
            _allStaffTotal.push({columns});

            return _allStaffTotal
    } 

    checkgetVisitorsOnSite(){
        if( this.editForm.value.visitorFormArray.length > 0  && this.visitorFormArray().at(0).get('visitorsOnSite').value != '' ){
            return [
                {
                    stack: [
                      {
                        image: this.pdfImage.bgSubAccThisWeek,
                        width: '265',
                        // margin: [ 0, 20, 0, 0 ]
                      },
                      {
                        text: 'VISITORS ON SITE:',
                        style: 'testHeader',
                        margin: [ 5, -15, 0, 0 ]
                      },
                      this.getVisitorsOnSite(),
                    ],
                    unbreakable: true,
                    margin: [ 0, 20, 0, 0 ],
                }
            ];
        }else{
            return '';
        }
    }

    getVisitorsOnSite() {
      let data = this.editForm.value.visitorFormArray;
      if(data){
          let _visitorList = [];
          let columns = [];
          _visitorList.push({text:'',style: 'test',margin: [ 0, 10, 0, 0 ]});
          columns.push({text:'Visitor Name',width: '25%',style: 'test',margin: [ 0, 5, 0, 0 ]});
          columns.push({text:'Reasons',style: 'test',width: '*',margin: [ 0, 5, 0, 0 ]});
          columns.push({text:'Total Hours',style: 'test',width: '15%',margin: [ 0, 5, 0, 0 ]});
          _visitorList.push({columns})
          _visitorList.push({canvas: [{ type: 'line', x1: 0, y1: 5, x2: 520, y2: 5, lineWidth: 0.5, lineColor: '#BDBDBD' }]});

          data.forEach(visitorList => {
            if(visitorList.visitorsOnSite){
              //let visitorDetails = this.listVisitors.find((obj => obj.id == visitorList.visitorsOnSite));
                let columns = [];

                columns.push({text: visitorList.visitorsOnSite,width: '25%',style: 'test',margin: [ 0, 5, 0, 0 ]});

                //if(visitorList.reasonsOnSite){
                    // let _reasons = [];
                    // visitorList.reasonsOnSite.forEach(reasonList => {
                    //     _reasons.push(reasonList.reason);
                    // });

                    // columns.push({text:_reasons.join(", "),style: 'test',width: '*',margin: [ 0, 5, 0, 0 ]});
                    //let selectedReason = this.listReasons.find(o => o.reasonID == visitorList.reasonsOnSite);
                    //onsole.log(selectedReason);
                    //if(selectedReason){
                      columns.push({text: visitorList.reasonsOnSite,style: 'test',width: '*',margin: [ 0, 5, 0, 0 ]});
                   // }
                    
                    
                //}
                

                columns.push({text:visitorList.duration,style: 'test',width: '15%',margin: [ 0, 5, 0, 0 ]});

                _visitorList.push({columns});
                _visitorList.push({canvas: [{ type: 'line', x1: 0, y1: 5, x2: 520, y2: 5, lineWidth: 0.5, lineColor: '#BDBDBD' }]});

            }
          });

          return _visitorList;
      }
    } 

    checkgetVisitorsOnSiteB(){

      if( this.editForm.value.visitorFormArray.length > 0  && this.visitorFormArray().at(0).get('visitorsOnSite').value != '' ){
            return [
                {
                  stack: [
                    {
                      text: 'Visitors on Site:',
                      style: 'fieldHeader',
                      margin: [ 5, 10, 0, 0 ],
                    },
                    {canvas: [{ type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 0.1,lineColor: '#A9A9A9' }],margin: [ 0, 2, 0, 2 ],},
                    this.getVisitorsOnSiteB(),
                  ],
                  unbreakable: false,
              }
            ]
      }else{
          return '';
      }

  }

  getVisitorsOnSiteB(){

            let data = this.editForm.value.visitorFormArray;
            if(data){
                if(data.length > 0){
                  
                
                  let content = [];

                  content.push(
                    {
                      table: {
                        widths: [ '30%','50%','20%'],
                        body: [
          
                          [
                            {
                              text: 'Visitor Name', 
                              style: 'tableHeader',
                            },
                            {
                                text:  'Reasons', 
                                style: 'tableHeader',  
                            },
                            {
                                text:  'Total Hours', 
                                style: 'tableHeader',  
                            },
                        ]
          
                      ]                     
                      },
                      layout: {
                        defaultBorder:false,
                        fillColor: '#F1F1F1',
                        paddingTop: function(i, node) { return 2; }, 
                        paddingBottom: function(i, node) { return 2;},
                      }
                    },
                  )

                  content.push(

                    {
                      table: {
                        widths: [ '30%','50%','20%'],
                        body: this.getTableVisitorTime(data)                    
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

                  )
                  
                  return content;

                }else{
                  return;
                }
            }else{
              return;
            }

  }

  getTableVisitorTime(data){
      if(data){
      let visitorHolder = [];
      
      data.forEach(visitorList => {
        visitorHolder.push([
        {text: visitorList.visitorsOnSite, style: 'fieldData'},
        {text: visitorList.reasonsOnSite, style: 'fieldData'},
        {text: visitorList.duration, style: 'fieldData'},
        ]);
      });
      return visitorHolder;
      }
  }

  checkgetMaterialsB(){

    if( this.editForm.value.productFormArray.length > 0  && this.productFormArray().at(0).get('productName').value != '' ){
          return [
              {
                stack: [
                  {
                    text: 'Materials/Plant:',
                    style: 'fieldHeader',
                    margin: [ 5, 10, 0, 0 ],
                  },
                  {canvas: [{ type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 0.1,lineColor: '#A9A9A9' }],margin: [ 0, 2, 0, 2 ],},
                  this.getMaterialsB(),
                ],
                unbreakable: false,
            }
          ]
    }else{
        return '';
    }

}

getMaterialsB(){

          let data = this.productFormArray().getRawValue();
          if(data){
              if(data.length > 0){
                
              
                let content = [];

                content.push(
                  {
                    table: {
                      widths: [ '30%','25%','15%','15%','15%'],
                      body: [
        
                        [
                          {
                            text: 'Product Name', 
                            style: 'tableHeader',
                          },
                          {
                              text:  'Specifications', 
                              style: 'tableHeader',  
                          },
                          {
                              text:  'Unit Cost', 
                              style: 'tableHeader',  
                          },
                          {
                            text:  'Measurement', 
                            style: 'tableHeader',  
                        },
                        {
                            text:  'Total Price', 
                            style: 'tableHeader',  
                        },
                      ]
        
                    ]                     
                    },
                    layout: {
                      defaultBorder:false,
                      fillColor: '#F1F1F1',
                      paddingTop: function(i, node) { return 2; }, 
                      paddingBottom: function(i, node) { return 2;},
                    }
                  },
                )

                content.push(

                  {
                    table: {
                      widths: [ '30%','25%','15%','15%','15%'],
                      body: this.getTableMaterials(data)                    
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

                )
                
                return content;

              }else{
                return;
              }
          }else{
            return;
          }

}

getTableMaterials(data){
    if(data){
        let materialHolder = [];
       
        data.forEach(productList => {
          let productDetails = this.listProducts.find((obj => obj.productArrayID == productList.productName));
          materialHolder.push([
          {text: productDetails?.productArrayName, style: 'fieldData'},
          {text: this.onGetSpecPrint(productList), style: 'fieldData'},
          {text: productList.cost, style: 'fieldData'},
          {text: productList.unit, style: 'fieldData'},
          {text: this.onComputeSpacePrint(productList), style: 'fieldData'},
          ]);
        });
        return materialHolder;
    }
}

    checkgetMaterials(){
        if( this.editForm.value.productFormArray.length > 0  && this.productFormArray().at(0).get('productName').value != '' ){
            return [
                  {
                      stack: [
                        {
                          image: this.pdfImage.bgSubAccThisWeek,
                          width: '265',
                          // margin: [ 0, 20, 0, 0 ]
                        },
                        {
                          text: 'MATERIALS/PLANT:',
                          style: 'testHeader',
                          margin: [ 5, -15, 0, 0 ]
                        },
                        this.getMaterials(),
                      ],
                      unbreakable: true,
                      margin: [ 0, 20, 0, 0 ],
                  }
            ];
        }else{  
            return ''
        }
    }

    getMaterials() {
      let data = this.productFormArray().getRawValue()
      if(data){
          let _productList = [];
          let columns = [];
          _productList.push({text:'',style: 'test',margin: [ 0, 10, 0, 0 ]});
          columns.push({text:'Product Name',width: '25%',style: 'test',margin: [ 0, 5, 0, 0 ]});
          columns.push({text:'Specifications',style: 'test',width: '25%',margin: [ 0, 5, 0, 0 ]});
          columns.push({text:'Unit Cost',style: 'test',width: '*',margin: [ 0, 5, 0, 0 ]});
          columns.push({text:'Measurement',style: 'test',width: '*',margin: [ 0, 5, 0, 0 ]});
          columns.push({text:'Total Price',style: 'test',width: '15%',margin: [ 0, 5, 0, 0 ]});
          _productList.push({columns})
          _productList.push({canvas: [{ type: 'line', x1: 0, y1: 5, x2: 520, y2: 5, lineWidth: 0.5, lineColor: '#BDBDBD' }]});

          data.forEach(productList => {
            if(productList.productName){
            let productDetails = this.listProducts.find((obj => obj.productArrayID == productList.productName));
              let columns = [];

              columns.push({text:productDetails?.productArrayName,width: '25%',style: 'test',margin: [ 0, 5, 0, 0 ]});
              columns.push({text:this.onGetSpecPrint(productList),width: '25%',style: 'test',margin: [ 0, 5, 0, 0 ]});
              columns.push({text:productList?.cost,width: '*',style: 'test',margin: [ 0, 5, 0, 0 ]});
              columns.push({text:productList?.unit,width: '*',style: 'test',margin: [ 0, 5, 0, 0 ]});
              columns.push({text:'$ '+this.onComputeSpacePrint(productList),width: '15%',style: 'test',margin: [ 0, 5, 0, 0 ]});
              // if(visitorList.reasonsOnSite){

              //     let selectedReason = this.listReasons.find(o => o.id === visitorList.reasonsOnSite);
              //     columns.push({text: selectedReason.reason,style: 'test',width: '*',margin: [ 0, 5, 0, 0 ]});
                  
              // }
              

              // columns.push({text:visitorList.duration,style: 'test',width: '15%',margin: [ 0, 5, 0, 0 ]});

              _productList.push({columns});
              _productList.push({canvas: [{ type: 'line', x1: 0, y1: 5, x2: 520, y2: 5, lineWidth: 0.5, lineColor: '#BDBDBD' }]});

            }
          });

          return _productList;
      }
    } 

    getOffHirePlant() {
      let accsList = this.editForm.value.offHirePlant

      if(accsList){

          return {
              ul: [
                    ...accsList.map(info => {
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

      }
    }

    getVariations() {
      let accsList = this.editForm.value.variations

      if(accsList){

          return {
              ul: [
                    ...accsList.map(info => {
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

      }
    }

    getDeliveries() {
      let accsList = this.editForm.value.deliveries

      if(accsList){

          return {
              ul: [
                    ...accsList.map(info => {
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

      }
    }

    getFridayWeather(){
      if(!this.editForm.value.weatherAllWeek){
        if(this.editForm.value.weatherFriday == 'weatherOthers'){
            return [
              {
                stack: [
                    {text: 'Friday', style: 'test2', margin: [ 0,5, 0, 10 ] },
                    {
                        text: this.getWeatherOthers('weatherOthersFriday'),
                        style: 'test',
                        width: '60',
                    },
                ],
                margin: [ 0, 10, 0, 0 ],
              },
            ]
        // }else if(this.editForm.value.weatherAllWeek == 'weatherOthers'){
        //     return [
        //       {
        //         stack: [
        //             {text: 'Friday', style: 'test2', margin: [ 0,5, 0, 10 ] },
        //             {
        //                 text: this.getWeatherOthers('weatherOthersAllWeek'),
        //                 style: 'test',
        //                 width: '60',
        //             },
        //         ],
        //         margin: [ 0, 10, 0, 0 ],
        //       },
        //     ]
        }else{
          return [
            {
              stack: [
                  {text: 'Friday', style: 'test2', margin: [ 0,5, 0, 10 ] },
                  {
                      image: this.pdfImage[this.getWeatherImage('weatherFriday')],
                      width: '60',
                  },
              ],
              margin: [ 0, 10, 0, 0 ],
            },
          ]
        }
      }
  }

  getWHSToolbox(){
        let pdfToolboxTalk;
        let pdfToolboxForm;
        let pdfToolboxRequired;

        if(this.editForm.value.toolboxTalk){
          pdfToolboxTalk = 'Yes'
        }else{
          pdfToolboxTalk = 'No'
        }

        if(this.editForm.value.toolboxForm){
          pdfToolboxForm = 'Yes'
        }else{
          pdfToolboxForm = 'No'
        }

        if(this.editForm.value.toolboxRequired){
          pdfToolboxRequired = 'Yes'
        }else{
          pdfToolboxRequired = 'No'
        }

        return [
          {
            stack: [
                {
                    text: 'Toolbox Talk: '+pdfToolboxTalk,
                    style: 'test',
                    width: '60',
                },
                {
                    text: 'Form Completed: '+pdfToolboxForm,
                    style: 'test',
                    width: '60',
                },
                {
                    text: 'Action Required: '+pdfToolboxRequired,
                    style: 'test',
                    width: '60',
                },
                this.getPdfToolboxInput(),
            ],
            margin: [ 0, 10, 0, 0 ],
          },
        ]
        
  }

  getPdfToolboxInput() {
      let pdfToolboxNotes = this.editForm.value.toolboxNotes;
      let pdfToolboxInput = this.editForm.value.toolboxInput;

      if(pdfToolboxNotes && pdfToolboxInput){
            return {
                stack: [
                      {
                          text: 'Notes: Yes',
                          style: 'test',
                          width: '60',
                      },
                      {
                        ul: [
                              ...pdfToolboxInput.map(info => {
                                return [ 
                                  {
                                    text: info,
                                    style: 'test',
                                  }
                                ]
                              })
                        ],
                      }
                  ]
            };
      }
  }

  getWHSSafety(){
    let pdfSafetyWalk;
    let pdfSafetyForm;
    let pdfSafetyRequired;

    if(this.editForm.value.safetyWalk){
      pdfSafetyWalk = 'Yes'
    }else{
      pdfSafetyWalk = 'No'
    }

    if(this.editForm.value.safetyForm){
      pdfSafetyForm = 'Yes'
    }else{
      pdfSafetyForm = 'No'
    }

    if(this.editForm.value.safetyRequired){
      pdfSafetyRequired = 'Yes'
    }else{
      pdfSafetyRequired = 'No'
    }

    return [
      {
        stack: [
            {
                text: 'Safety Walk: '+pdfSafetyWalk,
                style: 'test',
                width: '60',
            },
            {
                text: 'Form Completed: '+pdfSafetyForm,
                style: 'test',
                width: '60',
            },
            {
                text: 'Action Required: '+pdfSafetyRequired,
                style: 'test',
                width: '60',
            },
            this.getPdfSafetyInput(),
        ],
        margin: [ 0, 10, 0, 0 ],
      },
    ]
    
  }

  getPdfSafetyInput() {
    let pdfSafetyNotes = this.editForm.value.safetyNotes;
    let pdfSafetyInput = this.editForm.value.safetyInput;

    if(pdfSafetyNotes && pdfSafetyInput){
          return {
              stack: [
                    {
                        text: 'Notes: Yes',
                        style: 'test',
                        width: '60',
                    },
                    {
                      ul: [
                            ...pdfSafetyInput.map(info => {
                              return [ 
                                {
                                  text: info,
                                  style: 'test',
                                }
                              ]
                            })
                      ],
                    }
                ]
          };
    }
  }

  getWHSAccident(){
    let pdfAccidentReport;
    let pdfAccidentForm;
    let pdfAccidentRequired;

    if(this.editForm.value.accidentReport){
      pdfAccidentReport = 'Yes'
    }else{
      pdfAccidentReport = 'No'
    }

    if(this.editForm.value.accidentForm){
      pdfAccidentForm = 'Yes'
    }else{
      pdfAccidentForm = 'No'
    }

    if(this.editForm.value.accidentRequired){
      pdfAccidentRequired = 'Yes'
    }else{
      pdfAccidentRequired = 'No'
    }

    return [
      {
        stack: [
            {
                text: 'Accident Report: '+pdfAccidentReport,
                style: 'test',
                width: '60',
            },
            {
                text: 'Form Completed: '+pdfAccidentForm,
                style: 'test',
                width: '60',
            },
            {
                text: 'Action Required: '+pdfAccidentRequired,
                style: 'test',
                width: '60',
            },
            this.getPdfAccidentInput(),
        ],
        margin: [ 0, 10, 0, 0 ],
      },
    ]
    
  }

  getPdfAccidentInput() {
    let pdfAccidentNotes = this.editForm.value.accidentNotes;
    let pdfAccidentInput = this.editForm.value.accidentInput;

    if(pdfAccidentNotes && pdfAccidentInput){
          return {
              stack: [
                    {
                        text: 'Notes: Yes',
                        style: 'test',
                        width: '60',
                    },
                    {
                      ul: [
                            ...pdfAccidentInput.map(info => {
                              return [ 
                                {
                                  text: info,
                                  style: 'test',
                                }
                              ]
                            })
                      ],
                    }
                ]
          };
    }
  }

  getWHSPPE(){
    let pdfPPERequired;
    let pdfPPEForm;
    let pdfPPEActionRequired;

    if(this.editForm.value.ppeReport){
      pdfPPERequired = 'Yes'
    }else{
      pdfPPERequired = 'No'
    }

    if(this.editForm.value.ppeForm){
      pdfPPEForm = 'Yes'
    }else{
      pdfPPEForm = 'No'
    }

    if(this.editForm.value.ppeRequired){
      pdfPPEActionRequired = 'Yes'
    }else{
      pdfPPEActionRequired = 'No'
    }

    return [
      {
        stack: [
            {
                text: 'PPE Required: '+pdfPPERequired,
                style: 'test',
                width: '60',
            },
            {
                text: 'Form Completed: '+pdfPPEForm,
                style: 'test',
                width: '60',
            },
            {
                text: 'Action Required: '+pdfPPEActionRequired,
                style: 'test',
                width: '60',
            },
            this.getPdfPPEInput(),
        ],
        margin: [ 0, 10, 0, 0 ],
      },
    ]
    
  }

  getPdfPPEInput() {
    let pdfPPENotes = this.editForm.value.ppeNotes;
    let pdfPPEInput = this.editForm.value.ppeInput;

    if(pdfPPENotes && pdfPPEInput){
          return {
              stack: [
                    {
                        text: 'Notes: Yes',
                        style: 'test',
                        width: '60',
                    },
                    {
                      ul: [
                            ...pdfPPEInput.map(info => {
                              return [ 
                                {
                                  text: info,
                                  style: 'test',
                                }
                              ]
                            })
                      ],
                    }
                ]
          };
    }
  }



  getAllDay(){
    
        if(this.editForm.value.weatherAllDay){

              if(this.editForm.value.weatherAllDay == 'weatherOthers'){
                  return [
                    {
                      stack: [
                          {text: 'All Day', style: 'test', margin: [ 0,5, 0, 10 ] },
                          {
                              text: this.getWeatherOthers('weatherOthersAllDay'),
                              style: 'test',
                              width: '60',
                          },
                      ],
                      margin: [ 0, 10, 0, 0 ],
                    },
                  ]
              }else{
                return [
                  {
                    stack: [
                        {text: 'All Day', style: 'test', margin: [ 0,5, 0, 10 ] },
                        {
                            image: this.pdfImage[this.getWeatherImage('weatherAllDay')],
                            width: '60',
                        },
                    ],
                    margin: [ 0, 10, 0, 0 ],
                  },
                ]
              }
        }
  
  }

  getMorning(){

      if(this.editForm.value.weatherMorning){

          if(this.editForm.value.weatherMorning == 'weatherOthers'){
              return [
                {
                  stack: [
                      {text: 'Morning', style: 'test', margin: [ 0,5, 0, 10 ],width: 60,},
                      {
                          text: this.getWeatherOthers('weatherOthersMorning'),
                          style: 'test',
                          width: 60,
                      },
                  ],
                  width: 60,
                  margin: [ 0, 10, 0, 0 ],
                },
              ]
          }else{
            return [
              {
                stack: [
                    {text: 'Morning', style: 'test', margin: [ 0,5, 0, 10 ],width: 60,},
                    {
                        image: this.pdfImage[this.getWeatherImage('weatherMorning')],
                        width: 60,
                    },
                ],
                width: 60,
                margin: [ 0, 10, 0, 0 ],
              },
            ]
          }
        }

  }

  getMidDay(){

      if(this.editForm.value.weatherMidDay){

          if(this.editForm.value.weatherMidDay == 'weatherOthers'){
              return [
                {
                  stack: [
                      {text: 'Midday', style: 'test', margin: [ 0,5, 0, 10 ], width: 60,},
                      {
                          text: this.getWeatherOthers('weatherOthersMidDay'),
                          style: 'test',
                          width: 60,
                      },
                  ],
                  width: 60,
                  margin: [ 0, 10, 0, 0 ],
                },
              ]
          }else{
            return [
              {
                stack: [
                    {text: 'Midday', style: 'test', margin: [ 0,5, 0, 10 ]},
                    {
                        image: this.pdfImage[this.getWeatherImage('weatherMidDay')],
                        width: 60,
                    },
                ],
                width: 60,
                margin: [ 0, 10, 0, 0 ],
              },
            ]
          }
        }

  }

  getAfternoon(){

      if(this.editForm.value.weatherAfternoon){

          if(this.editForm.value.weatherAfternoon == 'weatherOthers'){
              return [
                {
                  stack: [
                      {text: 'Afternoon', style: 'test', margin: [ 0,5, 0, 10 ] },
                      {
                          text: this.getWeatherOthers('weatherOthersAfternoon'),
                          style: 'test',
                          width: '60',
                      },
                  ],
                  margin: [ 0, 10, 0, 0 ],
                },
              ]
          }else{
            return [
              {
                stack: [
                    {text: 'Afternoon', style: 'test', margin: [ 0,5, 0, 10 ] },
                    {
                        image: this.pdfImage[this.getWeatherImage('weatherAfternoon')],
                        width: '60',
                    },
                ],
                margin: [ 0, 10, 0, 0 ],
              },
            ]
          }

        }else{
          return [
            {
              stack: [
                  {text: 'Afternoon', style: 'test', margin: [ 0,5, 0, 10 ] },
                  {
                      text: '',
                      width: '60',
                  },
              ],
              margin: [ 0, 10, 0, 0 ],
            },
          ]
        }

  }

  getEvening(){

      if(this.editForm.value.weatherEvening){

          if(this.editForm.value.weatherEvening == 'weatherOthers'){
              return [
                {
                  stack: [
                      {text: 'Evening', style: 'test', margin: [ 0,5, 0, 10 ] },
                      {
                          text: this.getWeatherOthers('weatherOthersEvening'),
                          style: 'test',
                          width: '60',
                      },
                  ],
                  margin: [ 0, 10, 0, 0 ],
                },
              ]
          }else{
            return [
              {
                stack: [
                    {text: 'Evening', style: 'test', margin: [ 0,5, 0, 10 ] },
                    {
                        image: this.pdfImage[this.getWeatherImage('weatherEvening')],
                        width: '60',
                    },
                ],
                margin: [ 0, 10, 0, 0 ],
              },
            ]
          }

        }else{
          return [
            {
              stack: [
                  {text: 'Evening', style: 'test', margin: [ 0,5, 0, 10 ] },
                  {
                      text: '',
                      width: '60',
                  },
              ],
              margin: [ 0, 10, 0, 0 ],
            },
          ]
        }

  }

  getOnOff(){

      if(this.editForm.value.weatherOnOff){

          if(this.editForm.value.weatherOnOff == 'weatherOthers'){
              return [
                {
                  stack: [
                      {text: 'On and Off', style: 'test', margin: [ 0,5, 0, 10 ] },
                      {
                          text: this.getWeatherOthers('weatherOthersOnOff'),
                          style: 'test',
                          width: '60',
                      },
                  ],
                  margin: [ 0, 10, 0, 0 ],
                },
              ]
          }else{
            return [
              {
                stack: [
                    {text: 'On and Off', style: 'test', margin: [ 0,5, 0, 10 ] },
                    {
                        image: this.pdfImage[this.getWeatherImage('weatherOnOff')],
                        width: '60',
                    },
                ],
                margin: [ 0, 10, 0, 0 ],
              },
            ]
          }

        }else{
          return [
            {
              stack: [
                  {text: 'On and Off', style: 'test', margin: [ 0,5, 0, 10 ] },
                  {
                      text: '',
                      width: '60',
                  },
              ],
              margin: [ 0, 10, 0, 0 ],
            },
          ]
        }

  }

  getRestOfDay(){

      if(this.editForm.value.weatherRestOfDay){

          if(this.editForm.value.weatherRestOfDay == 'weatherOthers'){
              return [
                {
                  stack: [
                      {text: 'Rest of Day', style: 'test', margin: [ 0,5, 0, 10 ] },
                      {
                          text: this.getWeatherOthers('weatherOthersRestOfDay'),
                          style: 'test',
                          width: '60',
                      },
                  ],
                  margin: [ 0, 10, 0, 0 ],
                },
              ]
          }else{
            return [
              {
                stack: [
                    {text: 'Rest of Day', style: 'test', margin: [ 0,5, 0, 10 ] },
                    {
                        image: this.pdfImage[this.getWeatherImage('weatherRestOfDay')],
                        width: '60',
                    },
                ],
                margin: [ 0, 10, 0, 0 ],
              },
            ]
          }
        }else{
          return [
            {
              stack: [
                  {text: 'Rest of Day', style: 'test', margin: [ 0,5, 0, 10 ] },
                  {
                      text: '',
                      width: '60',
                  },
              ],
              margin: [ 0, 10, 0, 0 ],
            },
          ]
        }

  }

  getAllDay2(){
      
      if(this.editForm.value.weatherAllDay){

            if(this.editForm.value.weatherAllDay == 'weatherOthers'){
                return ':            All Day - '+this.getWeatherOthers('weatherOthersAllDay')
            }else{
              return ':            All Day - '+(this.editForm.value.weatherAllDay).replace("weather", "");
            }
      }else{
        return '';
      }

  }

  getMorning2(){
      
      if(this.editForm.value.weatherMorning){

            if(this.editForm.value.weatherMorning == 'weatherOthers'){
                return ':            Morning - '+this.getWeatherOthers('weatherOthersMorning')
            }else{
              return ':            Morning - '+(this.editForm.value.weatherMorning).replace("weather", "");
            }
      }else{
        return '';
      }

  }

  getMidDay2(){
      
      if(this.editForm.value.weatherMidDay){

            if(this.editForm.value.weatherMidDay == 'weatherOthers'){
                return ':            Midday - '+this.getWeatherOthers('weatherOthersMidDay')
            }else{
              return ':            Midday - '+(this.editForm.value.weatherMidDay).replace("weather", "");
            }
      }else{
        return '';
      }

  }

  getAfternoon2(){
      
      if(this.editForm.value.weatherAfternoon){

            if(this.editForm.value.weatherAfternoon == 'weatherOthers'){
                return ':            Midday - '+this.getWeatherOthers('weatherOthersAfternoon')
            }else{
              return ':            Midday - '+(this.editForm.value.weatherAfternoon).replace("weather", "");
            }
      }else{
        return '';
      }

  }

  getEvening2(){
        
      if(this.editForm.value.weatherEvening){

            if(this.editForm.value.weatherEvening == 'weatherOthers'){
                return ':            Evening - '+this.getWeatherOthers('weatherOthersEvening')
            }else{
              return ':            Evening - '+(this.editForm.value.weatherEvening).replace("weather", "");
            }
      }else{
        return '';
      }

  }

  getOnOff2(){
        
      if(this.editForm.value.weatherOnOff){

            if(this.editForm.value.weatherOnOff == 'weatherOthers'){
                return ':            Evening - '+this.getWeatherOthers('weatherOthersOnOff')
            }else{
              return ':            Evening - '+(this.editForm.value.weatherOnOff).replace("weather", "");
            }
      }else{
        return '';
      }

  }

  getRestOfDay2(){
        
      if(this.editForm.value.weatherRestOfDay){

            if(this.editForm.value.weatherRestOfDay == 'weatherOthers'){
                return ':            Evening - '+this.getWeatherOthers('weatherOthersRestOfDay')
            }else{
              return ':            Evening - '+(this.editForm.value.weatherRestOfDay).replace("weather", "");
            }
      }else{
        return '';
      }

  }

  getWeatherDetails(){
    
    let columns = [];
    let countWeather = 0;

        if(this.editForm.value.weatherAllDay){
          columns.push(this.getAllDay());
          countWeather = countWeather + 1;
        }
        if(this.editForm.value.weatherMorning){
          columns.push(this.getMorning()); 
          countWeather = countWeather + 1; 
        }
        if(this.editForm.value.weatherMidDay){
          columns.push(this.getMidDay()); 
          countWeather = countWeather + 1;
        }
        if(this.editForm.value.weatherAfternoon){
          columns.push(this.getAfternoon());
          countWeather = countWeather + 1;
        }
        if(this.editForm.value.weatherEvening){
          columns.push(this.getEvening());
          countWeather = countWeather + 1;
        }
        if(this.editForm.value.weatherOnOff){
          columns.push(this.getOnOff());
          countWeather = countWeather + 1;
        }
        if(this.editForm.value.weatherRestOfDay){
          columns.push(this.getRestOfDay());
          countWeather = countWeather + 1;
        }

        for (let i = 1; i < (7 - countWeather ); i++) {
          columns.push({}); 
        }

        if(countWeather == 1){
            return [
              {    
                stack: [
                  {
                  image: this.pdfImage.bgWeather,
                  width: '500',
                  // margin: [ 0, 20, 0, 0 ]
                  },
                  {
                  text: 'WEATHER'+ this.getWeatherDetails2(),
                  style: 'testHeader',
                  margin: [ 5, -15, 0, 0 ]
                  },
                ],
                margin: [ 0, 20, 0, 0 ],
              },
            ]
        }else if(countWeather > 1){
            return [
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
                  columns,
                  columnGap: 30
              },
            ]
        }
        
  }

  getWeatherDetails2(){
    
    let countWeather = 0;
    let onlyWeather = '';

        if(this.editForm.value.weatherAllDay){
          countWeather = countWeather + 1;
          onlyWeather = this.getAllDay2();
        }
        if(this.editForm.value.weatherMorning){
          countWeather = countWeather + 1; 
          onlyWeather = this.getMorning2();
        }
        if(this.editForm.value.weatherMidDay){
          countWeather = countWeather + 1;
          onlyWeather = this.getMidDay2();
        }
        if(this.editForm.value.weatherAfternoon){
          countWeather = countWeather + 1;
          onlyWeather = this.getAfternoon2();
        }
        if(this.editForm.value.weatherEvening){
          countWeather = countWeather + 1;
          onlyWeather = this.getEvening2();
        }
        if(this.editForm.value.weatherOnOff){
          countWeather = countWeather + 1;
          onlyWeather = this.getOnOff2();
        }
        if(this.editForm.value.weatherRestOfDay){
          countWeather = countWeather + 1;
          onlyWeather = this.getRestOfDay2();
        }

        if(countWeather == 1){
            return onlyWeather;
        }else{
            return '';
        }
        
  }

  getSaturdayWeather(){
      if(this.editForm.value.weatherAllWeek){
              if(this.editForm.value.weatherAllWeek == 'weatherOthers'){
                return [
                  {
                    stack: [
                        {text: 'All Week', style: 'test3', margin: [ 0,5, 0, 10 ] },
                        {
                            text: this.editForm.value.weatherOthersAllWeek,
                            style: 'test',
                            width: '60',
                        },
                    ],
                    margin: [ 0, 10, 0, 0 ],
                  },
                ]
            }else{
              return [
                {
                  stack: [
                      {text: 'All Week', style: 'test3', margin: [ 0,5, 0, 10 ] },
                      {
                          image: this.pdfImage[this.editForm.value.weatherAllWeek],
                          width: '60',
                      },
                  ],
                  margin: [ 0, 10, 0, 0 ],
                },
              ]
            }
      }else{
          if(this.editForm.value.weatherSaturday == 'weatherOthers'){
              return [
                {
                  stack: [
                      {text: 'Saturday', style: 'test2', margin: [ 0,5, 0, 10 ] },
                      {
                          text: this.getWeatherOthers('weatherOthersSaturday'),
                          style: 'test',
                          width: '60',
                      },
                  ],
                  margin: [ 0, 10, 0, 0 ],
                },
              ]
          // }else if(this.editForm.value.weatherAllWeek == 'weatherOthers'){
          //     return [
          //       {
          //         stack: [
          //             {text: 'Saturday', style: 'test2', margin: [ 0,5, 0, 10 ] },
          //             {
          //                 text: this.getWeatherOthers('weatherOthersAllWeek'),
          //                 style: 'test',
          //                 width: '60',
          //             },
          //         ],
          //         margin: [ 0, 10, 0, 0 ],
          //       },
          //     ]
          }else{
            return [
              {
                stack: [
                    {text: 'Saturday', style: 'test2', margin: [ 0,5, 0, 10 ] },
                    {
                        image: this.pdfImage[this.getWeatherImage('weatherSaturday')],
                        width: '60',
                    },
                ],
                margin: [ 0, 10, 0, 0 ],
              },
            ]
          }
      }
  }

  getSundayWeather(){
      if(!this.editForm.value.weatherAllWeek){
          if(this.editForm.value.weatherSunday == 'weatherOthers'){
              return [
                {
                  stack: [
                      {text: 'Sunday', style: 'test2', margin: [ 0,5, 0, 10 ] },
                      {
                          text: this.getWeatherOthers('weatherOthersSunday'),
                          style: 'test',
                          width: '60',
                      },
                  ],
                  margin: [ 0, 10, 0, 0 ],
                },
              ]
          // }else if(this.editForm.value.weatherAllWeek == 'weatherOthers'){
          //     return [
          //       {
          //         stack: [
          //             {text: 'Sunday', style: 'test2', margin: [ 0,5, 0, 10 ] },
          //             {
          //                 text: this.getWeatherOthers('weatherOthersAllWeek'),
          //                 style: 'test',
          //                 width: '60',
          //             },
          //         ],
          //         margin: [ 0, 10, 0, 0 ],
          //       },
          //     ]
          }else{
            return [
              {
                stack: [
                    {text: 'Sunday', style: 'test2', margin: [ 0,5, 0, 10 ] },
                    {
                        image: this.pdfImage[this.getWeatherImage('weatherSunday')],
                        width: '60',
                    },
                ],
                margin: [ 0, 10, 0, 0 ],
              },
            ]
          }
      }
  }

  getMondayWeather(){
      if(!this.editForm.value.weatherAllWeek){
          if(this.editForm.value.weatherMonday == 'weatherOthers'){
              return [
                {
                  stack: [
                      {text: 'Monday', style: 'test2', margin: [ 0,5, 0, 10 ] },
                      {
                          text: this.getWeatherOthers('weatherOthersMonday'),
                          style: 'test',
                          width: '60',
                      },
                  ],
                  margin: [ 0, 10, 0, 0 ],
                },
              ]
          // }else if(this.editForm.value.weatherAllWeek == 'weatherOthers'){
          //     return [
          //       {
          //         stack: [
          //             {text: 'Monday', style: 'test2', margin: [ 0,5, 0, 10 ] },
          //             {
          //                 text: this.getWeatherOthers('weatherOthersAllWeek'),
          //                 style: 'test',
          //                 width: '60',
          //             },
          //         ],
          //         margin: [ 0, 10, 0, 0 ],
          //       },
          //     ]
          }else{
            return [
              {
                stack: [
                    {text: 'Monday', style: 'test2', margin: [ 0,5, 0, 10 ] },
                    {
                        image: this.pdfImage[this.getWeatherImage('weatherMonday')],
                        width: '60',
                    },
                ],
                margin: [ 0, 10, 0, 0 ],
              },
            ]
          }
      }
  }

  getTuesdayWeather(){
      if(!this.editForm.value.weatherAllWeek){
          if(this.editForm.value.weatherTuesday == 'weatherOthers'){
              return [
                {
                  stack: [
                      {text: 'Tuesday', style: 'test2', margin: [ 0,5, 0, 10 ] },
                      {
                          text: this.getWeatherOthers('weatherOthersTuesday'),
                          style: 'test',
                          width: '60',
                      },
                  ],
                  margin: [ 0, 10, 0, 0 ],
                },
              ]
          // }else if(this.editForm.value.weatherAllWeek == 'weatherOthers'){
          //     return [
          //       {
          //         stack: [
          //             {text: 'Tuesday', style: 'test2', margin: [ 0,5, 0, 10 ] },
          //             {
          //                 text: this.getWeatherOthers('weatherOthersAllWeek'),
          //                 style: 'test',
          //                 width: '60',
          //             },
          //         ],
          //         margin: [ 0, 10, 0, 0 ],
          //       },
          //     ]
          }else{
            return [
              {
                stack: [
                    {text: 'Tuesday', style: 'test2', margin: [ 0,5, 0, 10 ] },
                    {
                        image: this.pdfImage[this.getWeatherImage('weatherTuesday')],
                        width: '60',
                    },
                ],
                margin: [ 0, 10, 0, 0 ],
              },
            ]
          }
    }
  }

  getWednesdayWeather(){
      if(!this.editForm.value.weatherAllWeek){
          if(this.editForm.value.weatherWednesday == 'weatherOthers'){
              return [
                {
                  stack: [
                      {text: 'Wednesday', style: 'test2', margin: [ 0,5, 0, 10 ] },
                      {
                          text: this.getWeatherOthers('weatherOthersWednesday'),
                          style: 'test',
                          width: '60',
                      },
                  ],
                  margin: [ 0, 10, 0, 0 ],
                },
              ]
          // }else if(this.editForm.value.weatherAllWeek == 'weatherOthers'){
          //     return [
          //       {
          //         stack: [
          //             {text: 'Wednesday', style: 'test2', margin: [ 0,5, 0, 10 ] },
          //             {
          //                 text: this.getWeatherOthers('weatherOthersAllWeek'),
          //                 style: 'test',
          //                 width: '60',
          //             },
          //         ],
          //         margin: [ 0, 10, 0, 0 ],
          //       },
          //     ]
          }else{
            return [
              {
                stack: [
                    {text: 'Wednesday', style: 'test2', margin: [ 0,5, 0, 10 ] },
                    {
                        image: this.pdfImage[this.getWeatherImage('weatherWednesday')],
                        width: '60',
                    },
                ],
                margin: [ 0, 10, 0, 0 ],
              },
            ]
          }
      }
  }

  getThursdayWeather(){
      if(!this.editForm.value.weatherAllWeek){
          if(this.editForm.value.weatherWednesday == 'weatherOthers'){
              return [
                {
                  stack: [
                      {text: 'Thursday', style: 'test2', margin: [ 0,5, 0, 10 ] },
                      {
                          text: this.getWeatherOthers('weatherOthersThursday'),
                          style: 'test',
                          width: '60',
                      },
                  ],
                  margin: [ 0, 10, 0, 0 ],
                },
              ]
          // }else if(this.editForm.value.weatherAllWeek == 'weatherOthers'){
          //     return [
          //       {
          //         stack: [
          //             {text: 'Thursday', style: 'test2', margin: [ 0,5, 0, 10 ] },
          //             {
          //                 text: this.getWeatherOthers('weatherOthersAllWeek'),
          //                 style: 'test',
          //                 width: '60',
          //             },
          //         ],
          //         margin: [ 0, 10, 0, 0 ],
          //       },
          //     ]
          }else{
            return [
              {
                stack: [
                    {text: 'Thursday', style: 'test2', margin: [ 0,5, 0, 10 ] },
                    {
                        image: this.pdfImage[this.getWeatherImage('weatherThursday')],
                        width: '60',
                    },
                ],
                margin: [ 0, 10, 0, 0 ],
              },
            ]
          }
        }
  }

  getResidualWeather(){
      if(this.editForm.value.weatherResidual == true){
            return [
                  {
                      stack: [
                        {
                        image: this.pdfImage.bgSubAccThisWeek,
                        width: '265',
                        // margin: [ 0, 20, 0, 0 ]
                        },
                        {
                        text: 'RESIDUAL WEATHER: '+(this.editForm.value.weatherResidual ? 'Yes' : 'No'),
                        style: 'testHeader',
                        margin: [ 5, -15, 0, 0 ]
                        },
                      ],
                      margin: [ 0, 20, 0, 0 ],
              }
            
            ]
      }else{
            return;
      }
  }

  getEOT(){
    if(this.editForm.value.eot == true){
          return [
                {
                    stack: [
                      {
                      image: this.pdfImage.bgWeather,
                      width: '500',
                      // margin: [ 0, 20, 0, 0 ]
                      },
                      {
                      text: 'EOT: '+(this.editForm.value.eot ? 'Yes' : 'No'),
                      style: 'testHeader',
                      margin: [ 5, -15, 0, 0 ]
                      },
                    ],
                    margin: [ 0, 20, 0, 0 ],
            }
          
          ]
    }else{
          return;
    }
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

    // getUploadedImages() {
    //   let accsList = this.editForm.value.imageUpload;
    //   let imageMasonry = [];
    //   //accsList[1].imageCaption;
    //   if(accsList.length == 1){
    //     imageMasonry.push([
    //       {
    //           columns: [ 
    //               { 
    //                     image: accsList[0].imageFile,
    //                     width: 250,
    //               },   
    //           ],

    //       },
    //       {
    //           columns: [ 
    //               { 
    //                     text: accsList[0].imageCaption, 
    //                     style: 'test',
    //               },
    //           ],
  
    //       },
    //     ])
    //   }
    //   else if(accsList.length == 2){
    //     imageMasonry.push([
    //       {
    //           columns: [ 
    //               { 
    //                     image: accsList[0].imageFile,
    //                     width: 250,
    //               },
    //               { 
    //                     image: accsList[1].imageFile,
    //                     width: 250,
    //               },    
    //           ],

    //       },
    //       {
    //           columns: [ 
    //               { 
    //                     text: accsList[0].imageCaption, 
    //                     style: 'test',
    //               },
    //               { 
    //                     text: accsList[1].imageCaption, 
    //                     style: 'test',
    //               },
    //           ],
  
    //       },
    //     ])
    //   }
    //   return imageMasonry;
    // }

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
          }
        ],
        columnGap: 10
      }

      let headerObj2 = {
          image: this.pdfLogo,
          width: 210,
          margin:[30,20],
      }

      let print_images = [...this.editForm.value.imageUpload,...this.dailyWorkerImages];

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
          content: [
            {
              columns: [
                {
                  text: 'Daily Progress Report',
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
                      text: 'Date:',
                      style: 'tableHeader',
                    },
                    {
                      text: 'Aimed Completion Date: ',
                      style: 'tableHeader',
                    }, 
                    {
                      text: 'Perfect Weather: ',
                      style: 'tableHeader',
                    }, 
                    {
                      text: 'Weather: ',
                      style: 'tableHeader',
                    }, 
                    {
                      text: ' ',
                      style: 'tableHeader',
                    }, 
                  ],
                  margin: [ 0, 0, 0, 20 ],
                  width: '20%',
                },
                {
                  stack: [
                    {
                      text: this.jobNumber ? this.jobNumber : ' ',
                      style: 'fieldData',
                    },
                    {
                      text: this.projectName ? this.projectName: ' ',
                      style: 'fieldData',
                    },
                    {
                      text: moment(this.todaysDateRaw).format('DD/MM/YYYY'),
                      style: 'fieldData',
                    },
                    {
                      text: this.aimedDate ? this.aimedDate:' ',
                      style: 'fieldData',
                    }, 
                    {
                      text: (this.editForm.value.weatherPerfect ? 'Yes' : 'No'),
                      style: 'fieldData',
                    },
                    {
                      text: this.editForm.value.weatherMaxTemp ? 'MAX TEMP: '+ this.editForm.value.weatherMaxTemp : ' ',
                      style: 'fieldData',
                    },
                    {
                      text: this.editForm.value.weatherMinTemp ? 'MIN TEMP: '+ this.editForm.value.weatherMinTemp : ' ',
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
                      text: this.pdfSupervisorName ?  this.pdfSupervisorName : ' ',
                      style: 'fieldData',
                    },
                    {
                      text: this.pdfSupervisorEmail ? this.pdfSupervisorEmail: ' ',
                      style: 'fieldData',
                    },
                    {
                      text: this.pdfSupervisorMobile ? this.pdfSupervisorMobile: ' ',
                      style: 'fieldData',
                    },
                    {
                      text: this.projectAddress ? this.projectAddress: ' ',
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
                  text: 'WHS',
                  style: 'fieldHeader',
                },
              ],
              margin: [ 5, 5, 0, 5 ],
            },
            {
              columns: [
                  this.getWHSToolbox(),
                  this.getWHSSafety(),
                  this.getWHSAccident(),
                  this.getWHSPPE(),
              ]
            },
            this.getEOT2(),
            this.getDetails(this.editForm.value.instructionsReceived,'Instructions Received'),
            this.getDetails(this.editForm.value.delays,'Delays'),
            this.getDetails(this.editForm.value.toolsUsed,'Tools Used'),
            this.getDetails(this.editForm.value.damageReport,'Damage Report'),
            this.getDetails(this.editForm.value.summary,'Summary'),
            this.getDetails(this.editForm.value.materialsRequested,'Materials Requested'),
            this.getDetails(this.editForm.value.tradesContact,'Trades to Contact'),
            this.getDetails(this.editForm.value.tradesSched,'Trades to Schedule'),
            this.getDetails(this.editForm.value.offHirePlant,'Off Hire Plant'),
            this.getDetails(this.editForm.value.variations,'Variations'),
            this.getDetails(this.editForm.value.deliveries,'Deliveries'),
            this.checkgetTradesOnSiteB(),
            this.checkgetStaffOnSiteB(),
            this.checkgetVisitorsOnSiteB(),
            this.checkgetMaterialsB(),
            this.previewImage.getUploadedImages(print_images),   
          ],
          // FOOTER SETTNGS
            footer: (currentPage, pageCount) => {
              return this.getFooter2(currentPage, pageCount)
          },
          
          pageSize: 'A4',
          info: {
            title: 'Daily Report',
          },
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
            test5: {
                color: '#050708',
                fontSize: 9,
                decoration: 'underline'
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
                color: '#050708',
                fontSize: 9,
                bold: true,
                // fontSize: 9,
                // bold: true,
                // fillColor: '#F0F1F0',
            },
            tableTotal: {
              fontSize: 8,
              bold: true,
              fillColor: '#F0F1F0',
            },
            tableFooter: {
                fontSize: 8,
                bold: true,
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
          }

        }
    }

    public getDocumentDefinition() {
     
      // HEADER SETTNGS
      let headerObj1 = {
          image: this.pdfHeaderImage1,
          width: '535',
          margin:[30,30]
      }
      let headerObj2 = {
          image: this.pdfHeaderImage2,
          width: '535',
          margin:[30,30]
      }

      let print_images = [...this.editForm.value.imageUpload,...this.dailyWorkerImages];

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
      //       width: '595'
      //   }
      // ],
      info: {
          title: 'Daily Report',
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
                    text: 'DAILY PROGRESS REPORT',
                    style: 'testHeader2',
                    width: '51%',
                    margin: [ 14,8, 0, 0 ] 
                  },
                  {
                    text: 'DATE: '+moment(this.todaysDateRaw).format('DD/MM/YYYY'),
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
                    text: 'PROJECT: '+ this.projectName,
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
                        text: 'SITE SUPERVISOR: '+this.pdfSupervisorName,
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
                        text: 'AIMED COMPLETION DATE: '+this.aimedDate,
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
                        text: 'JOB NUMBER: '+ this.jobNumber,
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
                        text: 'ADDRESS: '+this.projectAddress,
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
                        text: 'PERFECT WEATHER: '+(this.editForm.value.weatherPerfect ? 'Yes' : 'No'),
                        style: 'testHeader',
                        margin: [ 5, -15, 0, 0 ]
                      },
                    ],
                    margin: [ 0, 20, 0, 0 ],
                  },
                  this.getResidualWeather(),
                ],
                columnGap: 10
              },
                this.getWeatherDetails(),
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
                        text: 'MAXIMUM TEMPERATURE: '+this.editForm.value.weatherMaxTemp,
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
                        text: 'MINIMUM TEMPERATURE: '+this.editForm.value.weatherMinTemp,
                        style: 'testHeader',
                        margin: [ 5, -15, 0, 0 ]
                      },
                    ],
                    margin: [ 0, 20, 0, 0 ],
                  },
                ],
                columnGap: 10
              },
              this.getEOT(),
              {    
                stack: [
                  {
                    image: this.pdfImage.bgWeather,
                    width: '500',
                    // margin: [ 0, 20, 0, 0 ]
                  },
                  {
                    text: 'WHS',
                    style: 'testHeader',
                    margin: [ 5, -15, 0, 0 ]
                  },
                ],
                margin: [ 0, 20, 0, 0 ],
              },
              {
                columns: [
                    this.getWHSToolbox(),
                    this.getWHSSafety(),
                    this.getWHSAccident(),
                    this.getWHSPPE(),
                ]
              },
              this.getOptionalColumns(),
              this.checkgetTradesOnSite(),
              this.checkgetStaffOnSite(),
              this.checkgetVisitorsOnSite(),
              this.checkgetMaterials(),
              this.previewImage.getUploadedImages(print_images),              
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
        test5: {
            color: '#050708',
            fontSize: 9,
            decoration: 'underline'
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

    openAddMaterialDialog(empIndex): void {

      const dialogRef = this.dialog.open(DailyProjectAddMaterialsDialog, {
          width: '400px',
          // data: this.renderValue
      });

      dialogRef.afterClosed().subscribe(result => {

          if(result)
          {
              // this.getProducts();
              this.data_api.getProducts().subscribe((data) => {

                  this.listProducts = data;

                  this.productFormArray().at(empIndex).get('productName').patchValue(result.toString());
                  this.initializeFilterProducts(empIndex);
                  this.sizeTypeChanged(empIndex);
              });
  
          }
      });
  }

  // openAddStageDialog(): void {

  //     const dialogRef = this.dialog.open(DailyProjectAddStagesDialog, {
  //         width: '400px',
  //         // data: this.renderValue
  //     });

  //     dialogRef.afterClosed().subscribe(result => {

  //         let myuuid = uuidv4();
  //         let newStageData = [
  //           {
  //             id: myuuid,
  //             stageName: result.stageName,
  //           }
  //         ];

  //         this.data_api.updateProjectStages(this.passID.id,newStageData)
  //           .subscribe(
  //             (result) => {
  //               if(result){
  //                   this.getProject();
  //                   // swal({
  //                   //     title: "New Project Created!",
  //                   //     // text: "You clicked the button!",
  //                   //     buttonsStyling: false,
  //                   //     confirmButtonClass: "btn btn-success",
  //                   //     type: "success"
  //                   // }).catch(swal.noop)

  //                   // this.dialogRef.close('success');
      
  //               }else{
  //                 // swal({
  //                 //     title: "Error in Creating New Project",
  //                 //     // text: "You clicked the button!",
  //                 //     buttonsStyling: false,
  //                 //     confirmButtonClass: "btn btn-success",
  //                 //     type: "error"
  //                 // }).catch(swal.noop)
      
  //               }
  //           },
  //           (error) => {
  //               // swal({
  //               //     title: error.error.message,
  //               //     // text: "You clicked the button!",
  //               //     buttonsStyling: false,
  //               //     confirmButtonClass: "btn btn-success",
  //               //     type: "error"
  //               // }).catch(swal.noop)
                
  //           }
            
  //         );

        
  //         //this.materialSource = new LocalDataSource(this.materialsData);

  //         // if(result == 'success'){   
  //         //     setTimeout(function(){
  //         //       window.location.reload();
  //         //     }, 1000);  
  //         // }
  //     });
  // }

  openAddStaffDialog(empIndex): void {
      const dialogRef = this.dialog.open(StaffsAddDialog, {
          width: '400px',
          // data: this.renderValue
      });

      dialogRef.afterClosed().subscribe(result => {
          if(result){   
              this.listStaffs = [];
              this.data_api.getProjectSupervisors().subscribe((data) => {

                      if(data){
            
                              data.forEach(data2 =>{ 
                                    if(this.projSupervisor == data2.id){
                                      this.listStaffs.push({id: data2.user_email, staff_name: data2.name, type:'user'})  
                                    }
                              });

                                  this.data_api.getEmployees().subscribe((data) => {
                
                                    if(data){
                      
                                      data.forEach(data2 =>{ 
                          
                                          this.listStaffs.push({id: data2.id, staff_name: data2.staff_name, type:'global', default_hours: data2.default_hours})  
                          
                                      });
                      
                                      this.staffFormArray().at(empIndex).get('staffOnSite').patchValue(result.toString());
                                      this.initializeFilterEmployees(empIndex);
                                      this.selectEmployee(empIndex);
                                    }
                      
                              });
                      }      

              });

          }

          
      });
  }

  public selectTradeEmployee(empIndex,staffIndex){

      let selectedEmp = this.tradeStaffFormArray(empIndex).at(staffIndex).get('staffOnSite').value;
      
      let staffDetails = this.listTradeStaffs[empIndex].find((obj => obj.staffID == selectedEmp));

      // this.taskTradeFormArray(empIndex,staffIndex).clear();
      // this.tradeStaffFormArray(empIndex);

      if(staffDetails){
      
          this.taskTradeFormArray(empIndex, staffIndex).at(0).get('checkDetail').patchValue(true);
          this.taskTradeFormArray(empIndex, staffIndex).at(0).get('start').patchValue(staffDetails.start);
          this.taskTradeFormArray(empIndex, staffIndex).at(0).get('break').patchValue(staffDetails.break);
          this.taskTradeFormArray(empIndex, staffIndex).at(0).get('finish').patchValue(staffDetails.finish);
          this.computeTime(empIndex, staffIndex, 0)

      }else{

          this.taskTradeFormArray(empIndex, staffIndex).at(0).get('checkDetail').patchValue(false);

      }

  }

  openAddTradeStaffDialog(empIndex,staffIndex): void {

    let tradeID = this.tradeFormArray().at(empIndex).get('tradesOnSite').value;

    let selectedTrade = this.listTrades.find(o => o.id === tradeID);

    const dialogRef = this.dialog.open(TradeStaffAddDialog, {
        width: '400px',
        data: selectedTrade
    });

    dialogRef.afterClosed().subscribe(result => {

        if(result){ 
          // this.getTrades();
          // this.tradeStaffFormArray(empIndex).at(staffIndex).get('staffOnSite').patchValue(result.toString());
          this.data_api.getTrades().subscribe((data) => {

              this.listTrades[empIndex] = data;

              let _selectedTrade = this.listTrades[empIndex].find(o => o.id === tradeID);
              
              if(_selectedTrade.trade_staff){
                this.listTradeStaffs[empIndex] = JSON.parse(_selectedTrade.trade_staff);
              }

              this.tradeStaffFormArray(empIndex).at(staffIndex).get('staffOnSite').patchValue(result.toString())
              this.selectTradeEmployee(empIndex,staffIndex)
          });
          
        }
    });
  }

  // openAddTradeDialog(empIndex): void {

  //     const dialogRef = this.dialog.open(TradesAddDialog, {
  //         width: '400px',
  //         // data: this.renderValue
  //     });

  //     dialogRef.afterClosed().subscribe(result => {

  //         if(result){   
  //           this.getTrades();
  //           this.tradeFormArray().at(empIndex).get('tradesOnSite').patchValue(result.toString());
  //         }
  //     });
  // }
  
  openAddVisitorDialog(empIndex): void {
      const dialogRef = this.dialog.open(VisitorsAddDialog, {
          width: '400px',
          // data: this.renderValue
      });

      dialogRef.afterClosed().subscribe(result => {

          if(result){   
            // this.getVisitors();
              // this.data_api.getVisitors().subscribe((data) => {
              //   if(data){

              //       this.listVisitors = [];

              //       data.forEach(data2 =>{      
              //           this.listVisitors.push({id: data2.id,visitor_name: data2.visitor_name, type:'global'})  
              //       });
              setTimeout(() => {
                this.visitorFormArray().at(empIndex).get('visitorsOnSite').patchValue(result.toString());
                this.initializeFilterVisitors(empIndex);
              }, 1000);   
                    
              //       
              //   } 
              // });
          }
      });
      
  }

  openAddReasonDialog(empIndex): void {
      const dialogRef = this.dialog.open(ReasonsAddDialog, {
          width: '400px',
          // data: this.renderValue
      });

      dialogRef.afterClosed().subscribe(result => {
          if(result){   

                // this.data_api.getReasons().subscribe((data) => {

                  // if(data){
                  //   this.listReasons = data;

                    
                  //   this.visitorFormArray().at(empIndex).get('reasonsOnSite').patchValue(result.toString());
                  //   this.initializeFilterReasons(empIndex);
                  // } 

                // });   
                setTimeout(() => {
                  this.visitorFormArray().at(empIndex).get('reasonsOnSite').patchValue(result.toString());
                  this.initializeFilterReasons(empIndex);
                }, 1000); 
          }
      });
      
  }
  
  public changeTimeDialog(form, control,empIndex, staffIndex, skillIndex, data): void {
    const dialogRef = this.dialog.open(ChangeTimeDialog, {
        width: '320px',
        data: data
    });

    dialogRef.afterClosed().subscribe(result => {

        if(result){  
            if(form == 'trade'){
              this.taskTradeFormArray(empIndex, staffIndex).at(skillIndex).get(control).patchValue(result);
              this.computeTime(empIndex, staffIndex, skillIndex);
            }else if(form == 'staff'){
              this.taskStaffFormArray(empIndex).at(skillIndex).get(control).patchValue(result);
              this.computeTimeStaff(empIndex, skillIndex);
            }
        }
    });
  
  }

  openAddMultipleTradesDialog(): void {
      const dialogRef = this.dialog.open(MultipleTradesAddDialog, {
          width: '400px',
          data: this.listTrades
      });

      dialogRef.afterClosed().subscribe(result => {

          if(result){  
            let curLen = this.tradeFormArray().length;
            let i = 0 + curLen;
            result.forEach(trade => {

                this.addTradeForm();

                this.tradeFormArray().at(i).get('tradesOnSite').patchValue(trade.id);
                this.initializeFilterTrades(i);
                // this.getTradeStaffs(i,trade.id);

                i++;
                
            });
            
          }
      });
    
  }

  openAddMultipleEmployeesDialog(): void {
      const dialogRef = this.dialog.open(MultipleEmployeesAddDialog, {
          width: '400px',
          data: this.listStaffs
      });

      dialogRef.afterClosed().subscribe(result => {
  
          if(result){   
              let curLen = this.staffFormArray().length;
              let i = 0 + curLen;
              result.forEach(employee => {

                  this.addStaffForm();

              //     this.tradeFormArray().at(i).get('tradesOnSite').patchValue(trade.id);
              //     this.initializeFilterTrades(i);
              //     this.getTradeStaffs(i,trade.id);
                  this.staffFormArray().at(i).get('staffOnSite').patchValue(employee.id);
                  this.initializeFilterEmployees(i);
                  this.selectEmployee(i);
                  i++;
                  
              });
            
          }
      });
    
  }

  enlargeImage(event,timestamp){
    
    const imgElem = event.target;
    
    var target = event.target || event.srcElement || event.currentTarget;
    var srcAttr = target.attributes.src;
    this.imgSrc = srcAttr.nodeValue;
    this.imgStampString = timestamp.toDate();
    console.log('imagsrc', this.imgSrc);
    console.log('imgStampString', this.imgStampString)
  }

  openTableVisitorAddDialog(): void {
      const dialogRef = this.dialog.open(TableVisitorAddDialog, {
          width: '520px',
          data: {
            listVisitors: this.listVisitors,
            listReasons: this.listReasons,
            adminData: this.adminData
          }
      });

      dialogRef.afterClosed().subscribe(result => {
          if(result){   
                
            let curLen = this.visitorFormArray().length;
            
            this.addVisitorForm();
            this.visitorFormArray().at(curLen).get('visitorsOnSite').patchValue(result.visitorsOnSite);
            this.visitorFormArray().at(curLen).get('reasonsOnSite').patchValue(result.reasonsOnSite);
            this.visitorFormArray().at(curLen).get('duration').patchValue(result.duration);
            this.initializeFilterVisitors(curLen);
            this.initializeFilterReasons(curLen);
          }
      });
    
  }

  openTableVisitorEditDialog(empIndex,visitorsOnSite,reasonsOnSite,duration): void {
      const dialogRef = this.dialog.open(TableVisitorEditDialog, {
          width: '520px',
          data: {
            adminData: this.adminData,
            listVisitors: this.listVisitors,
            listReasons: this.listReasons,
            empIndex: empIndex,
            visitorsOnSite: visitorsOnSite,
            reasonsOnSite: reasonsOnSite,
            duration: duration
          }
      });

      dialogRef.afterClosed().subscribe(result => {
          if(result){   
              
            // let curLen = this.visitorFormArray().length;
            
            // this.addVisitorForm();

            this.visitorFormArray().at(result.empIndex).get('visitorsOnSite').patchValue(result.visitorsOnSite);
            this.visitorFormArray().at(result.empIndex).get('reasonsOnSite').patchValue(result.reasonsOnSite);
            this.visitorFormArray().at(result.empIndex).get('duration').patchValue(result.duration);

            // this.initializeFilterVisitors(curLen);
            // this.initializeFilterReasons(curLen);
          }
      });
    
  }

  openTableEmployeesAddDialog(): void {
      const dialogRef = this.dialog.open(TableEmployeesAddDialog, {
          width: '520px',
          data: {
            listStaffs: this.listStaffs,
            adminData: this.adminData
          }
      });
      
      dialogRef.afterClosed().subscribe(result => {
          if(result){   
                
            let curLen = this.staffFormArray().length;
              
            this.addStaffForm();

            this.staffFormArray().at(curLen).get('staffOnSite').patchValue(result.staffOnSite);
            this.initializeFilterEmployees(curLen);
            this.selectEmployee(curLen);
            
            this.taskStaffFormArray(curLen).at(0).get('taskDescription').patchValue(result.taskDescription);
            this.taskStaffFormArray(curLen).at(0).get('checkDetailStaff').patchValue(result.checkDetailStaff);
            this.taskStaffFormArray(curLen).at(0).get('hours').patchValue(result.hours);
            this.taskStaffFormArray(curLen).at(0).get('start').patchValue(result.start);
            this.taskStaffFormArray(curLen).at(0).get('break').patchValue(result.break);
            this.taskStaffFormArray(curLen).at(0).get('finish').patchValue(result.finish);
            this.taskStaffFormArray(curLen).at(0).get('tempHours').patchValue(result.tempHours);
            
            if(result.checkDetailStaff == true){
              this.computeTimeStaff(curLen, 0);
            }else{
              this.computeStaffTotalHours(curLen);
            }

          }
      });
    
  }

  openTableEmployeesTaskAddDialog(empIndex,staffName): void {
      const dialogRef = this.dialog.open(TableEmployeesTaskAddDialog, {
          width: '520px',
          data: {
            staffName: staffName,
            adminData: this.adminData
            // listStaffs: this.listStaffs
          }
      });
      
      dialogRef.afterClosed().subscribe(result => {
          if(result){   
                
            let curLen = this.taskStaffFormArray(empIndex).length;
              
            this.addTaskStaffForm(empIndex);

            this.taskStaffFormArray(empIndex).at(curLen).get('taskDescription').patchValue(result.taskDescription);
            this.taskStaffFormArray(empIndex).at(curLen).get('checkDetailStaff').patchValue(result.checkDetailStaff);
            this.taskStaffFormArray(empIndex).at(curLen).get('hours').patchValue(result.hours);
            this.taskStaffFormArray(empIndex).at(curLen).get('start').patchValue(result.start);
            this.taskStaffFormArray(empIndex).at(curLen).get('break').patchValue(result.break);
            this.taskStaffFormArray(empIndex).at(curLen).get('finish').patchValue(result.finish);
            this.taskStaffFormArray(empIndex).at(curLen).get('tempHours').patchValue(result.tempHours);
            
            if(result.checkDetailStaff == true){
              this.computeTimeStaff(empIndex, curLen);
            }else{
              this.computeStaffTotalHours(empIndex);
            }

          }
      });
    
  }

  openTableEmployeesTaskEditDialog(empIndex,skillIndex,staffName): void {
      const dialogRef = this.dialog.open(TableEmployeesTaskEditDialog, {
          width: '520px',
          data: {
            adminData: this.adminData,
            staffName: staffName,
            taskDescription: this.taskStaffFormArray(empIndex).at(skillIndex).get('taskDescription').value,
            checkDetailStaff: this.taskStaffFormArray(empIndex).at(skillIndex).get('checkDetailStaff').value,
            hours: this.taskStaffFormArray(empIndex).at(skillIndex).get('hours').value,
            start: this.taskStaffFormArray(empIndex).at(skillIndex).get('start').value,
            break: this.taskStaffFormArray(empIndex).at(skillIndex).get('break').value,
            finish: this.taskStaffFormArray(empIndex).at(skillIndex).get('finish').value,
            tempHours: this.taskStaffFormArray(empIndex).at(skillIndex).get('tempHours').value
            // listStaffs: this.listStaffs
          }
      });
      
      dialogRef.afterClosed().subscribe(result => {
          if(result){   
                
            // let curLen = this.taskStaffFormArray(empIndex).length;
              
            // this.addTaskStaffForm(empIndex);

            this.taskStaffFormArray(empIndex).at(skillIndex).get('taskDescription').patchValue(result.taskDescription);
            this.taskStaffFormArray(empIndex).at(skillIndex).get('checkDetailStaff').patchValue(result.checkDetailStaff);
            this.taskStaffFormArray(empIndex).at(skillIndex).get('hours').patchValue(result.hours);
            this.taskStaffFormArray(empIndex).at(skillIndex).get('start').patchValue(result.start);
            this.taskStaffFormArray(empIndex).at(skillIndex).get('break').patchValue(result.break);
            this.taskStaffFormArray(empIndex).at(skillIndex).get('finish').patchValue(result.finish);
            this.taskStaffFormArray(empIndex).at(skillIndex).get('tempHours').patchValue(result.tempHours);
            
            if(result.checkDetailStaff == true){
              this.computeTimeStaff(empIndex, skillIndex);
            }else{
              this.computeStaffTotalHours(empIndex);
            }

          }
      });
    
  }

  openTableTradesAddDialog(empIndex,tradeID): void {

      let selectedTrade = this.listTrades.find(o => o.id === tradeID);

      const dialogRef = this.dialog.open(TableTradesAddDialog, {
          width: '520px',
          data: {
            staffFormArray: selectedTrade.staffFormArray,
            adminData: this.adminData
          }
      });
      
      dialogRef.afterClosed().subscribe(result => {
          if(result){   
                
            this.tradeStaffFormArray(empIndex).push(this.createTradeStaffForm());

            let curLen = this.tradeStaffFormArray(empIndex).length - 1;

            this.tradeFormArray().at(empIndex).get('staffCount').patchValue(curLen + 1);

            this.taskTradeFormArray(empIndex, curLen).push(this.createTaskTradeForm());

            this.tradeStaffFormArray(empIndex).at(curLen).get('staffOnSite').patchValue(result.staffOnSite);

            this.taskTradeFormArray(empIndex, curLen).at(0).get('taskDescription').patchValue(result.taskDescription);
            this.taskTradeFormArray(empIndex, curLen).at(0).get('checkDetail').patchValue(result.checkDetail);
            this.taskTradeFormArray(empIndex, curLen).at(0).get('hours').patchValue(result.hours);
            this.taskTradeFormArray(empIndex, curLen).at(0).get('start').patchValue(result.start);
            this.taskTradeFormArray(empIndex, curLen).at(0).get('break').patchValue(result.break);
            this.taskTradeFormArray(empIndex, curLen).at(0).get('finish').patchValue(result.finish);
            this.taskTradeFormArray(empIndex, curLen).at(0).get('tempHours').patchValue(result.tempHours);
             
            if(result.checkDetail == true){
              this.computeTime(empIndex, curLen, 0);
            }else{
              this.computeTradeStaffTotalHours(empIndex, curLen);
            }
          }
      });
    
  }

  openTableTradesTaskAddDialog(empIndex,staffIndex,staffName): void {
      const dialogRef = this.dialog.open(TableTradesTaskAddDialog, {
          width: '520px',
          data: {
            staffName: staffName,
            adminData: this.adminData
            // listStaffs: this.listStaffs
          }
      });
      
      dialogRef.afterClosed().subscribe(result => {
          if(result){   
                
            let curLen = this.taskTradeFormArray(empIndex, staffIndex).length;
              
            this.taskTradeFormArray(empIndex, staffIndex).push(this.createTaskTradeForm());

            this.taskTradeFormArray(empIndex, staffIndex).at(curLen).get('taskDescription').patchValue(result.taskDescription);
            this.taskTradeFormArray(empIndex, staffIndex).at(curLen).get('checkDetail').patchValue(result.checkDetail);
            this.taskTradeFormArray(empIndex, staffIndex).at(curLen).get('hours').patchValue(result.hours);
            this.taskTradeFormArray(empIndex, staffIndex).at(curLen).get('start').patchValue(result.start);
            this.taskTradeFormArray(empIndex, staffIndex).at(curLen).get('break').patchValue(result.break);
            this.taskTradeFormArray(empIndex, staffIndex).at(curLen).get('finish').patchValue(result.finish);
            this.taskTradeFormArray(empIndex, staffIndex).at(curLen).get('tempHours').patchValue(result.tempHours);
            
            if(result.checkDetail == true){
               this.computeTime(empIndex, staffIndex, 0);
            }else{
              this.computeTradeStaffTotalHours(empIndex, staffIndex);
            }

          }
      });
    
  }

  openTableTradesTaskEditDialog(empIndex,staffIndex,skillIndex,staffName): void {
    const dialogRef = this.dialog.open(TableTradesTaskEditDialog, {
        width: '520px',
        data: {
          adminData: this.adminData,
          staffName: staffName,
          taskDescription: this.taskTradeFormArray(empIndex, staffIndex).at(skillIndex).get('taskDescription').value,
          checkDetail: this.taskTradeFormArray(empIndex, staffIndex).at(skillIndex).get('checkDetail').value,
          hours: this.taskTradeFormArray(empIndex, staffIndex).at(skillIndex).get('hours').value,
          start: this.taskTradeFormArray(empIndex, staffIndex).at(skillIndex).get('start').value,
          break: this.taskTradeFormArray(empIndex, staffIndex).at(skillIndex).get('break').value,
          finish: this.taskTradeFormArray(empIndex, staffIndex).at(skillIndex).get('finish').value,
          tempHours: this.taskTradeFormArray(empIndex, staffIndex).at(skillIndex).get('tempHours').value
          // listStaffs: this.listStaffs
        }
    });
    
    dialogRef.afterClosed().subscribe(result => {
        if(result){   
              
            this.taskTradeFormArray(empIndex, staffIndex).at(skillIndex).get('taskDescription').patchValue(result.taskDescription);
            this.taskTradeFormArray(empIndex, staffIndex).at(skillIndex).get('checkDetail').patchValue(result.checkDetail);
            this.taskTradeFormArray(empIndex, staffIndex).at(skillIndex).get('hours').patchValue(result.hours);
            this.taskTradeFormArray(empIndex, staffIndex).at(skillIndex).get('start').patchValue(result.start);
            this.taskTradeFormArray(empIndex, staffIndex).at(skillIndex).get('break').patchValue(result.break);
            this.taskTradeFormArray(empIndex, staffIndex).at(skillIndex).get('finish').patchValue(result.finish);
            this.taskTradeFormArray(empIndex, staffIndex).at(skillIndex).get('tempHours').patchValue(result.tempHours);
            
            if(result.checkDetail == true){
               this.computeTime(empIndex, staffIndex, 0);
            }else{
              this.computeTradeStaffTotalHours(empIndex, staffIndex);
            }

        }
    });
  
}

}


@Component({
  selector: 'dailyproject-add-materials-dialog',
  templateUrl: 'dailyproject-add-materials-dialog.html',
})

export class DailyProjectAddMaterialsDialog implements OnInit {

  addFestForm: FormGroup;
  public listSuppliers:any= [];
  public listCategories:any= [];
  public listStages:any= [];
  public listCostCentres:any= [];
  sizeTypeChoices= [
    {value: 'length', viewValue: 'Length'},
    {value: 'squared', viewValue: 'Squared'},
    {value: 'cubed', viewValue: 'Cubed'},
    {value: 'weight', viewValue: 'Weight'},
    {value: 'time', viewValue: 'Time'},
    {value: 'item', viewValue: 'Item'},
  ]
  unitMeasurements=[
    {value: 'M3', viewValue: 'M3', type: 'cubed'},
    {value: 'LM', viewValue: 'LM', type: 'length'},
    {value: 'M2', viewValue: 'M2', type: 'squared'},
    {value: 'Tons', viewValue: 'Tons', type: 'weight'},
    {value: 'Kg', viewValue: 'Kg', type: 'weight'},
    {value: 'Hrs', viewValue: 'Hrs', type: 'time'},
  ]

  public filter_list_suppliers: ReplaySubject<[]> = new ReplaySubject<[]>(1);
  public filter_list_categories: ReplaySubject<[]> = new ReplaySubject<[]>(1);
  public filter_list_costcentres: ReplaySubject<[]> = new ReplaySubject<[]>(1);
  public filter_list_stages: ReplaySubject<[]> = new ReplaySubject<[]>(1);

  public search_control_supplier: FormControl = new FormControl();
  public search_control_category: FormControl = new FormControl();
  public search_control_costcentre: FormControl = new FormControl();
  public search_control_stage: FormControl = new FormControl();

  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;

  protected _onDestroy = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<DailyProjectAddMaterialsDialog>,
    public dialog: MatDialog,
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
    this.addFestForm = this.formBuilder.group({
      productName: ['', Validators.required],
      // quantity: [''],
      // length: [''],
      // width: [''],
      // height: [''],
      unit: [''],
      // area: [{ value: '', disabled: true }],
      // volume: [{ value: '', disabled: true }],
      cost: [''],
      // total: [{ value: '', disabled: true }],
      sizeType: [''],
      brand: [''],
      sku: [''],
      supplier: [''],
      category: [''],
      costCentre: [''],
      stage: [''],
    }, {
    });
    this.getSuppliers();
    this.getCategories();
    this.getStages();
    this.getCostcentres();

  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  initializeFilterSuppliers() {

    this.filter_list_suppliers.next(this.listSuppliers.slice());

      this.search_control_supplier.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterListSuppliers();
      });

  }

  initializeFilterCategories() {

    this.filter_list_categories.next(this.listCategories.slice());

      this.search_control_category.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterListCategories();
      });

  }

  initializeFilterCostcentres() {

    this.filter_list_costcentres.next(this.listCostCentres.slice());

      this.search_control_costcentre.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterListCostcentres();
      });

  }

  initializeFilterStages() {

    this.filter_list_stages.next(this.listStages.slice());

      this.search_control_stage.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterListStages();
      });

  }

  protected filterListSuppliers() {
      if (!this.listSuppliers) {
        return;
      }
      // get the search keyword
      let search = this.search_control_supplier.value;
      if (!search) {
        this.filter_list_suppliers.next(this.listSuppliers.slice());
        return;
      } else {
        search = search.toLowerCase();
      }
      // filter the banks
      this.filter_list_suppliers.next(
        this.listSuppliers.filter(listSupplier => listSupplier.supplier_name.toLowerCase().indexOf(search) > -1)
      );
  }

  protected filterListCategories() {
      if (!this.listCategories) {
        return;
      }
      // get the search keyword
      let search = this.search_control_category.value;
      if (!search) {
        this.filter_list_categories.next(this.listCategories.slice());
        return;
      } else {
        search = search.toLowerCase();
      }
      // filter the banks
      this.filter_list_categories.next(
        this.listCategories.filter(listCategory => listCategory.category_name.toLowerCase().indexOf(search) > -1)
      );
  }

  protected filterListCostcentres() {
      if (!this.listCostCentres) {
        return;
      }
      // get the search keyword
      let search = this.search_control_costcentre.value;
      if (!search) {
        this.filter_list_costcentres.next(this.listCostCentres.slice());
        return;
      } else {
        search = search.toLowerCase();
      }
      // filter the banks
      this.filter_list_costcentres.next(
        this.listCostCentres.filter(listCostCentre => listCostCentre.costcentre_name.toLowerCase().indexOf(search) > -1)
      );
  }

  protected filterListStages() {
      if (!this.listStages) {
        return;
      }
      // get the search keyword
      let search = this.search_control_stage.value;
      if (!search) {
        this.filter_list_stages.next(this.listStages.slice());
        return;
      } else {
        search = search.toLowerCase();
      }
      // filter the banks
      this.filter_list_stages.next(
        this.listStages.filter(listStage => listStage.stage_name.toLowerCase().indexOf(search) > -1)
      );
  }

  public addNewProduct() {

   
      if (this.addFestForm.invalid) {
        alert('invalid');
        return;
      }
      
      this.spinnerService.show();

      // let agentData = {
      //     "name": this.addFestForm.value.firstName,
      // };

      this.data_api.addProduct(this.addFestForm.getRawValue())
      .subscribe(
        (result) => {
          if(result){

              swal.fire({
                  title: "New Product Created!",
                  // text: "You clicked the button!",
                  buttonsStyling: false,
                  customClass: {
                    confirmButton: 'btn btn-success',
                  },
                  icon: "success"
              })

              this.spinnerService.hide();

              this.dialogRef.close(result);
              
          }else{

            swal.fire({
                title: "Error in Creating New Product",
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

  public onComputeSpace(){
    let length = this.addFestForm.value.length;
    let width = this.addFestForm.value.width;
    let height = this.addFestForm.value.height;

    if(this.addFestForm.value.sizeType == 'squared'){

      this.addFestForm.patchValue({
        area: length * width
      });

    }else if(this.addFestForm.value.sizeType == 'cubed'){

      this.addFestForm.patchValue({
        volume: length * width * height
      });

    }

    this.onComputeTotal();
  }

  public onComputeTotal(){
    let quantity = this.addFestForm.value.quantity;
    let unitCost = this.addFestForm.value.cost;
    let area = this.addFestForm.getRawValue().area;
    let volume = this.addFestForm.getRawValue().volume;

    if(this.addFestForm.value.sizeType == 'squared'){
      this.addFestForm.patchValue({
        total: (area * unitCost) * quantity
      });
    }else if(this.addFestForm.value.sizeType == 'cubed'){
      this.addFestForm.patchValue({
        total: (volume * unitCost) * quantity
      });
    }else{
      this.addFestForm.patchValue({
        total: unitCost * quantity
      });
    }

  }

  public sizeTypeChanged(){
    this.addFestForm.patchValue({
        length: '',
        width: '',
        height: '',
        quantity: '',
        cost: '',
        total: '',
    });
    
  }

  public getSuppliers(){
    this.data_api.getSuppliers().subscribe((data) => {
        data.forEach(data =>{ 
            this.listSuppliers.push(data);
        })
        this.initializeFilterSuppliers();
    });
  }

  public getCategories(){
    this.data_api.getCategories().subscribe((data) => {
        data.forEach(data =>{ 
            this.listCategories.push(data)
        })
        this.initializeFilterCategories();
    });
  }

  public getStages(){
    this.data_api.getStages().subscribe((data) => {
        data.forEach(data =>{ 
            this.listStages.push(data)
        })
        this.initializeFilterStages();
    });
  }

  public getCostcentres(){
      this.data_api.getCostcentres().subscribe((data) => {
          data.forEach(data =>{ 
              this.listCostCentres.push(data)
          })
          this.initializeFilterCostcentres();
      });
    }
    openAddSuppliersDialog(): void {
      const dialogRef = this.dialog.open(SuppliersAddDialog, {
          width: '400px',
          // data: this.renderValue
      });

      dialogRef.afterClosed().subscribe(result => {
          if(result){   
              this.getSuppliers();
              this.addFestForm.patchValue({
                supplier: result.toString()
              });
          }
      });
  }

  openAddCategoriesDialog(): void {
      const dialogRef = this.dialog.open(CategoriesAddDialog, {
          width: '400px',
          // data: this.renderValue
      });

      dialogRef.afterClosed().subscribe(result => {
          if(result){   
              this.getCategories();
              this.addFestForm.patchValue({
                category: result.toString()
              });
          }
      });
  }

  openAddCostCentresDialog(): void {
      const dialogRef = this.dialog.open(CostcentresAddDialog, {
          width: '400px',
          // data: this.renderValue
      });

      dialogRef.afterClosed().subscribe(result => {
          if(result){   
              this.getCostcentres();
              this.addFestForm.patchValue({
                costCentre: result.toString()
              });
          }
      });
  }

  openAddStageDialog(): void {
    const dialogRef = this.dialog.open(StagesAddDialog, {
        width: '400px',
        // data: this.renderValue
    });

    dialogRef.afterClosed().subscribe(result => {
        if(result){   
            this.getStages();
            this.addFestForm.patchValue({
              stage: result.toString()
            });
        }
    });
  }

}

@Component({
  selector: 'dailyproject-add-stages-dialog',
  templateUrl: 'dailyproject-add-stages-dialog.html',
})

export class DailyProjectAddStagesDialog implements OnInit {

  addFestForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<DailyProjectAddStagesDialog>,
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
    this.addFestForm = this.formBuilder.group({
      stageName: ['', Validators.required],
    }, {
    });
    
  }
}


@Component({
  selector: 'staffs-adddialog',
  templateUrl: 'staffs-adddialog.html',
})

export class StaffsAddDialog implements OnInit {

  addFestForm: FormGroup;
  public listCostCentres:any = [];

  breaktimes=[
    {value: '00:00', viewValue: 'No Breaks'},
    {value: '00:15', viewValue: '15 minutes'},
    {value: '00:30', viewValue: '30 minutes'},
    {value: '00:45', viewValue: '45 minute'},
    {value: '01:00', viewValue: '1 hour'},
  ];


  public filter_list_costcentres: ReplaySubject<[]> = new ReplaySubject<[]>(1);

  public search_control_costcentre: FormControl = new FormControl();

  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;

  protected _onDestroy = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<StaffsAddDialog>,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.addFestForm.controls;
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  initializeFilterCostcentres() {

    this.filter_list_costcentres.next(this.listCostCentres.slice());

      this.search_control_costcentre.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterListCostcentres();
      });

  }

  protected filterListCostcentres() {
      if (!this.listCostCentres) {
        return;
      }
      // get the search keyword
      let search = this.search_control_costcentre.value;
      if (!search) {
        this.filter_list_costcentres.next(this.listCostCentres.slice());
        return;
      } else {
        search = search.toLowerCase();
      }
      // filter the banks
      this.filter_list_costcentres.next(
        this.listCostCentres.filter(listCostCentre => listCostCentre.costcentre_name.toLowerCase().indexOf(search) > -1)
      );
  }
  
  public changeTimeDialog(control, data): void {
    const dialogRef = this.dialog.open(ChangeTimeDialog, {
        width: '320px',
        data: data
    });

    dialogRef.afterClosed().subscribe(result => {

        if(result){  
            if(control == 'start'){

              this.addFestForm.patchValue({
                start: result,
            });
            }else if(control == 'finish'){

              this.addFestForm.patchValue({
                finish: result,
              });

            }
        }
    });
  
  }

  public addNewStaff() {

   
      if (this.addFestForm.invalid) {
        alert('invalid');
        return;
      }
      
      this.spinnerService.show();

      // let agentData = {
      //     "name": this.addFestForm.value.firstName,
      // };

      this.data_api.addEmployee(this.addFestForm.value)
      .subscribe(
        (result) => {
          if(result){

              swal.fire({
                  title: "New Employee Created!",
                  // text: "You clicked the button!",
                  buttonsStyling: false,
                  customClass: {
                    confirmButton: 'btn btn-success',
                  },
                  icon: "success"
              })

              this.spinnerService.hide();

              this.dialogRef.close(result);

          }else{

            swal.fire({
                title: "Error in Creating New Employee",
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

  ngOnInit() {
    this.addFestForm = this.formBuilder.group({
      employeeNo: [''],
      name: ['', Validators.required],
      email: [''],
      phone: [''],
      defaultHours: [''],
      defaultCostcode: [''],
      paidRate: [''],
      start: [''],
      break: [''],
      finish: [''],
      start2: [''],
    }, {
    });
    this.getCostcentres();
  }

  
  public getCostcentres(){
    this.data_api.getCostcentres().subscribe((data) => {
        data.forEach(data =>{ 
            this.listCostCentres.push(data)
        })
        this.initializeFilterCostcentres();
    });
  }

  openAddCostCentresDialog(): void {
    const dialogRef = this.dialog.open(CostcentresAddDialog, {
        width: '400px',
        // data: this.renderValue
    });

    dialogRef.afterClosed().subscribe(result => {
        if(result){   
            this.getCostcentres();
            this.addFestForm.patchValue({
              defaultCostcode: result.toString()
            });
        }
    });
}

}

@Component({
  selector: 'trades-adddialog',
  templateUrl: 'trades-adddialog.html',
})

export class TradesAddDialog implements OnInit {

  addFestForm: FormGroup;
  public listCostCentres= [];
  
  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<TradesAddDialog>,
    public dialog: MatDialog,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.addFestForm.controls;
  }
  
  public addNewTrade() {

   
      if (this.addFestForm.invalid) {
        alert('invalid');
        return;
      }
      
      this.spinnerService.show();

      // let agentData = {
      //     "name": this.addFestForm.value.firstName,
      // };

      this.data_api.addTrade(this.addFestForm.value)
      .subscribe(
        (result) => {
          if(result){

              swal.fire({
                  title: "New Trade Created!",
                  // text: "You clicked the button!",
                  buttonsStyling: false,
                  customClass: {
                    confirmButton: 'btn btn-success',
                  },
                  icon: "success"
              })

              this.spinnerService.hide();

              this.dialogRef.close(result);

          }else{

            swal.fire({
                title: "Error in Creating New Trade",
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

  ngOnInit() {
    this.addFestForm = this.formBuilder.group({
      companyName: ['', Validators.required],
      trade: [''],
      name: [''],
      email: [''],
      phone: [''],
      defaultHours: [''],
      defaultCostcode: [''],
    }, {
    });
    this.getCostcentres();
  }
  
  public getCostcentres(){
    this.data_api.getCostcentres().subscribe((data) => {
        data.forEach(data =>{ 
            this.listCostCentres.push(data)
        })
    });
  }

  openAddCostCentresDialog(): void {
      const dialogRef = this.dialog.open(CostcentresAddDialog, {
          width: '400px',
          // data: this.renderValue
      });

      dialogRef.afterClosed().subscribe(result => {
          if(result){   
              this.getCostcentres();
              this.addFestForm.patchValue({
                defaultCostcode: result.toString()
              });
          }
      });
  }

}

@Component({
  selector: 'visitors-adddialog',
  templateUrl: 'visitors-adddialog.html',
})

export class VisitorsAddDialog implements OnInit {

  addFestForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<VisitorsAddDialog>,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.addFestForm.controls;
  }
  
  public addNewVisitor() {

      
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

      this.data_api.createFBVisitorDaily(this.addFestForm.value.visitorName).then((result) => {
        
        this.spinnerService.hide();
        //this.addLog(result);
        this.dialogRef.close(result);
        $.notify({
          icon: 'notifications',
          message: 'New Visitor Created'
        }, {
            type: 'success',
            timer: 1000,
            placement: {
                from: 'top',
                align: 'center'
            },
            template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0} alert-with-icon" role="alert">' +
              '<button  mat-button type="button" aria-hidden="true" class="close" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
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
      // let agentData = {
      //     "name": this.addFestForm.value.firstName,
      // };

      // this.data_api.addVisitor(this.addFestForm.value)
      // .subscribe(
      //   (result) => {
      //     if(result){

      //         swal.fire({
      //             title: "New Visitor Created!",
      //             // text: "You clicked the button!",
      //             buttonsStyling: false,
      //             customClass: {
      //               confirmButton: 'btn btn-success',
      //             },
      //             icon: "success"
      //         })

      //         this.spinnerService.hide();

      //         this.dialogRef.close(result);

      //     }else{

      //       swal.fire({
      //           title: "Error in Creating New Visitor",
      //           // text: "You clicked the button!",
      //           buttonsStyling: false,
      //           customClass: {
      //             confirmButton: 'btn btn-success',
      //           },
      //           icon: "error"
      //       })

      //       this.spinnerService.hide();

      //     }
      // },
      // (error) => {
      //     swal.fire({
      //         title: error.error.message,
      //         // text: "You clicked the button!",
      //         buttonsStyling: false,
      //         customClass: {
      //           confirmButton: 'btn btn-success',
      //         },
      //         icon: "error"
      //     })
          
      // }
      
    //);  
  }

  ngOnInit() {
    this.addFestForm = this.formBuilder.group({
      visitorName: ['', Validators.required],
    }, {
    });
    
  }
}

@Component({
  selector: 'tradestaff-adddialog',
  templateUrl: 'tradestaff-adddialog.html',
})

export class TradeStaffAddDialog implements OnInit {

  addFestForm: FormGroup;
  public listCategories= [];

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<TradeStaffAddDialog>,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.addFestForm.controls;
  }
  
  breaktimes=[
    {value: '00:00', viewValue: 'No Breaks'},
    {value: '00:15', viewValue: '15 minutes'},
    {value: '00:30', viewValue: '30 minutes'},
    {value: '00:45', viewValue: '45 minute'},
    {value: '01:00', viewValue: '1 hour'},
  ]

  public addNewTradeStaff() {

    // this.data.push(this.addFestForm.value);
    let _tradeStaffData = JSON.parse(this.data.trade_staff)
    _tradeStaffData.push(this.addFestForm.value);

   
      if (this.addFestForm.invalid) {
        alert('invalid');
        return;
      }
      
      this.spinnerService.show();

      // let agentData = {
      //     "name": this.addFestForm.value.firstName,
      // };

      this.data_api.addTradeStaff(_tradeStaffData,this.data.id)
      .subscribe(
        (result) => {

          if(result){

              swal.fire({
                  title: "New Trade Staff Created!",
                  // text: "You clicked the button!",
                  buttonsStyling: false,
                  customClass: {
                    confirmButton: 'btn btn-success',
                  },
                  icon: "success"
              })

              this.spinnerService.hide();

              this.dialogRef.close(this.addFestForm.value.staffID);

          }else{

            swal.fire({
                title: "Error in Creating New Trade Staff",
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

  public changeTimeDialog(control, data): void {
      const dialogRef = this.dialog.open(ChangeTimeDialog, {
          width: '320px',
          data: data
      });

      dialogRef.afterClosed().subscribe(result => {

          if(result){  
              if(control == 'start'){

                this.addFestForm.patchValue({
                  start: result,
              });
              }else if(control == 'finish'){

                this.addFestForm.patchValue({
                  finish: result,
                });

              }
          }
      });
    
    }

  ngOnInit() {
    this.addFestForm = this.formBuilder.group({
        staffID: Math.random().toString(36).substr(2, 9),
        staffName: '',
        start: '',
        break: '',
        finish: '',
      }, {
    });
    this.getTradeCategories();
  }

  public getTradeCategories(){
    this.spinnerService.show();
    this.data_api.getTradeCategories().subscribe((data) => {
        data.forEach(data =>{ 
          
            this.listCategories.push(data)
        })
        this.spinnerService.hide();
    });
  }

  openAddTradeCategoryDialog(): void {
      const dialogRef = this.dialog.open(TradeCategoriesAddDialog, {
          width: '400px',
          // data: this.renderValue
      });

      dialogRef.afterClosed().subscribe(result => {

          if(result){   
            this.getTradeCategories();
            this.addFestForm.patchValue({
              tradecategory: result.toString()
            });
          }
      });
  }

}

@Component({
  selector: 'tradecategories-adddialog',
  templateUrl: 'tradecategories-adddialog.html',
})

export class TradeCategoriesAddDialog implements OnInit {

  addFestForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<TradeCategoriesAddDialog>,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.addFestForm.controls;
  }
  
  public addNewTradeCategory() {

   
      if (this.addFestForm.invalid) {
        alert('invalid');
        return;
      }
      
      this.spinnerService.show();

      // let agentData = {
      //     "name": this.addFestForm.value.firstName,
      // };

      this.data_api.addTradeCategory(this.addFestForm.value)
      .subscribe(
        (result) => {
          if(result){

              swal.fire({
                  title: "New Trade Category Created!",
                  // text: "You clicked the button!",
                  buttonsStyling: false,
                  customClass: {
                    confirmButton: 'btn btn-success',
                  },
                  icon: "success"
              })

              this.spinnerService.hide();

              this.dialogRef.close(result);

          }else{

            swal.fire({
                title: "Error in Creating New Trade Category",
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

  ngOnInit() {
    this.addFestForm = this.formBuilder.group({
      tradecategory: ['', Validators.required],
    }, {
    });
    
  }
}



@Component({
  selector: 'costcentres-adddialog',
  templateUrl: 'costcentres-adddialog.html',
})

export class CostcentresAddDialog implements OnInit {

  addFestForm: FormGroup;

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

              this.spinnerService.hide();

              this.dialogRef.close(result);

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

  ngOnInit() {
    this.addFestForm = this.formBuilder.group({
      name: ['', Validators.required],
    }, {
    });
    
  }
}


@Component({
  selector: 'suppliers-adddialog',
  templateUrl: 'suppliers-adddialog.html',
})

export class SuppliersAddDialog implements OnInit {

  addFestForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<SuppliersAddDialog>,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.addFestForm.controls;
  }
  
  public addNewSupplier() {

   
      if (this.addFestForm.invalid) {
        alert('invalid');
        return;
      }
      
      this.spinnerService.show();

      // let agentData = {
      //     "name": this.addFestForm.value.firstName,
      // };

      this.data_api.addSupplier(this.addFestForm.value)
      .subscribe(
        (result) => {
          if(result){

              swal.fire({
                  title: "New Supplier Created!",
                  // text: "You clicked the button!",
                  buttonsStyling: false,
                  customClass: {
                    confirmButton: 'btn btn-success',
                  },
                  icon: "success"
              })

              this.spinnerService.hide();

              this.dialogRef.close(result);

          }else{

            swal.fire({
                title: "Error in Creating New Supplier",
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

  ngOnInit() {
    this.addFestForm = this.formBuilder.group({
      name: ['', Validators.required],
    }, {
    });
    
  }
}


@Component({
  selector: 'categories-adddialog',
  templateUrl: 'categories-adddialog.html',
})

export class CategoriesAddDialog implements OnInit {

  addFestForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<CategoriesAddDialog>,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.addFestForm.controls;
  }
  
  public addNewCategory() {

   
      if (this.addFestForm.invalid) {
        alert('invalid');
        return;
      }
      
      this.spinnerService.show();

      // let agentData = {
      //     "name": this.addFestForm.value.firstName,
      // };

      this.data_api.addCategory(this.addFestForm.value)
      .subscribe(
        (result) => {
          if(result){

              swal.fire({
                  title: "New Category Created!",
                  // text: "You clicked the button!",
                  buttonsStyling: false,
                  customClass: {
                    confirmButton: 'btn btn-success',
                  },
                  icon: "success"
              })

              this.spinnerService.hide();

              this.dialogRef.close(result);

          }else{

            swal.fire({
                title: "Error in Creating New Category",
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

  ngOnInit() {
    this.addFestForm = this.formBuilder.group({
      name: ['', Validators.required],
    }, {
    });
    
  }
}


@Component({
  selector: 'stages-adddialog',
  templateUrl: 'stages-adddialog.html',
})

export class StagesAddDialog implements OnInit {

  addFestForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<StagesAddDialog>,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.addFestForm.controls;
  }
  
  public addNewStage() {

   
      if (this.addFestForm.invalid) {
        alert('invalid');
        return;
      }

      this.spinnerService.show();

      // let agentData = {
      //     "name": this.addFestForm.value.firstName,
      // };

      this.data_api.addStage(this.addFestForm.value)
      .subscribe(
        (result) => {
          if(result){

              swal.fire({
                  title: "New Stage Created!",
                  // text: "You clicked the button!",
                  buttonsStyling: false,
                  customClass: {
                    confirmButton: 'btn btn-success',
                  },
                  icon: "success"
              })

              this.spinnerService.hide();

              this.dialogRef.close(result);

          }else{

            swal.fire({
                title: "Error in Creating New Stage",
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

  ngOnInit() {
    this.addFestForm = this.formBuilder.group({
      name: ['', Validators.required],
    }, {
    });
    
  }
}


@Component({
  selector: 'reasons-adddialog',
  templateUrl: 'reasons-adddialog.html',
})

export class ReasonsAddDialog implements OnInit {

  addFestForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<ReasonsAddDialog>,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.addFestForm.controls;
  }
  
  public addNewReason() {

   
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

      this.data_api.createFBReasonDaily(this.addFestForm.value.reason).then((result) => {

        this.dialogRef.close('success');
        this.spinnerService.hide();
        this.dialogRef.close(result);

        $.notify({
          icon: 'notifications',
          message: 'New Reason Created'
        }, {
            type: 'success',
            timer: 1000,
            placement: {
                from: 'top',
                align: 'center'
            },
            template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0} alert-with-icon" role="alert">' +
              '<button  mat-button type="button" aria-hidden="true" class="close" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
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

      // let agentData = {
      //     "name": this.addFestForm.value.firstName,
      // };

      // this.data_api.addReason(this.addFestForm.value)
      // .subscribe(
      //   (result) => {
      //     if(result){

      //         swal.fire({
      //             title: "New Reason Created!",
      //             // text: "You clicked the button!",
      //             buttonsStyling: false,
      //             customClass: {
      //               confirmButton: 'btn btn-success',
      //             },
      //             icon: "success"
      //         })

      //         this.spinnerService.hide();

      //         this.dialogRef.close(result);

      //     }else{

      //       swal.fire({
      //           title: "Error in Creating New Reason",
      //           // text: "You clicked the button!",
      //           buttonsStyling: false,
      //           customClass: {
      //             confirmButton: 'btn btn-success',
      //           },
      //           icon: "error"
      //       })

      //       this.spinnerService.hide();

      //     }
      // },
      // (error) => {
  
      //     swal.fire({
      //         title: error.error.message,
      //         // text: "You clicked the button!",
      //         buttonsStyling: false,
      //         customClass: {
      //           confirmButton: 'btn btn-success',
      //         },
      //         icon: "error"
      //     })
          
      // });  
      
    
  }

  ngOnInit() {
    this.addFestForm = this.formBuilder.group({
      reason: ['', Validators.required],
    }, {
    });
    
  }
}


@Component({
  selector: 'multipletrades-adddialog',
  templateUrl: 'multipletrades-adddialog.html',
})

export class MultipleTradesAddDialog implements OnInit {

  addFestForm: FormGroup;

  public projectTrades:any = [];

  projectTradeControl = new FormControl([]);

  public filter_list_trades: ReplaySubject<[]> = new ReplaySubject<[]>(1);

  public search_control_trade: FormControl = new FormControl();
  
  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<MultipleTradesAddDialog>,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.addFestForm.controls;
  }
  
  public addMultipleTrades() {
    this.dialogRef.close(this.projectTradeControl.value);
  }

  ngOnInit() {

    this.addFestForm = this.formBuilder.group({
      projectTrades:  [''],
    }, {
    });
    
    this.projectTrades = [];
    this.projectTrades = this.data;
    this.initializeFilterTrades();
  }
  
  protected _onDestroy = new Subject<void>();

  onToppingRemoved2(index: number){
    const newToppings = this.projectTradeControl.value.filter((_, i) => i !== index);
    this.projectTradeControl.patchValue(newToppings);
  }

  initializeFilterTrades() {

    this.filter_list_trades.next(this.projectTrades.slice());

      this.search_control_trade.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterListTrades();
      });

  }

  protected filterListTrades() {
      if (!this.projectTrades) {
        return;
      }
      // get the search keyword
      let search = this.search_control_trade.value;
      if (!search) {
        this.filter_list_trades.next(this.projectTrades.slice());
        return;
      } else {
        search = search.toLowerCase();
      }
      // filter the banks
      this.filter_list_trades.next(
        this.projectTrades.filter(projectTrade => projectTrade.company_name.toLowerCase().indexOf(search) > -1)
      );
  }

}

@Component({
  selector: 'multipleemployees-adddialog',
  templateUrl: 'multipleemployees-adddialog.html',
})

export class MultipleEmployeesAddDialog implements OnInit {

  addFestForm: FormGroup;

  public projectEmployees:any = [];

  projectEmployeeControl = new FormControl([]);

  public filter_list_employees: ReplaySubject<[]> = new ReplaySubject<[]>(1);

  public search_control_employee: FormControl = new FormControl();
  
  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<MultipleEmployeesAddDialog>,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.addFestForm.controls;
  }
  
  public addMultipleEmployees() {
    this.dialogRef.close(this.projectEmployeeControl.value);
  }

  ngOnInit() {

    this.addFestForm = this.formBuilder.group({
      projectTrades:  [''],
    }, {
    });
    
    this.projectEmployees = [];
    this.projectEmployees = this.data;
    this.initializeFilterTrades();
  }
  
  protected _onDestroy = new Subject<void>();

  onToppingRemoved2(index: number){
    const newToppings = this.projectEmployeeControl.value.filter((_, i) => i !== index);
    this.projectEmployeeControl.patchValue(newToppings);
  }

  initializeFilterTrades() {

    this.filter_list_employees.next(this.projectEmployees.slice());

      this.search_control_employee.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterListTrades();
      });

  }


  

  protected filterListTrades() {
      if (!this.projectEmployees) {
        return;
      }
      // get the search keyword
      let search = this.search_control_employee.value;
      if (!search) {
        this.filter_list_employees.next(this.projectEmployees.slice());
        return;
      } else {
        search = search.toLowerCase();
      }
      // filter the banks
      this.filter_list_employees.next(
        this.projectEmployees.filter(projectEmployee => projectEmployee.staff_name.toLowerCase().indexOf(search) > -1)
      );
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
        this.dialogRef.close(moment(this.mytime).format('hh:mm A'));
    }
  
    ngOnInit() {
      this.getAdminSettings();
      let t = this.data; 
      let cdt = moment(t, 'hh:mm A');
      this.mytime = cdt.format('YYYY-MM-DD HH:mm');
    }
    
    getAdminSettings(){
        this.data_api.getFBAdminSettings().subscribe((data) => {
            this.adminData = data;
            this.colorBtnDefault = data.colourEnabledButton ? data.colourEnabledButton : '';
            // this.colorHlightDefault = data.colourHighlight ? data.colourHighlight : '';
        }); 
    }

    onButtonEnter(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
    }

    onButtonOut(hoverName: HTMLElement) {
        hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
    }
}


@Component({
  selector: 'tablevisitor-adddialog',
  templateUrl: 'tablevisitor-adddialog.html',
})

export class TableVisitorAddDialog implements OnInit {

  addFestForm: FormGroup;
  public listVisitors:any = [];
  public listReasons:any = [];

  public filter_list_visitors: ReplaySubject<[]> = new ReplaySubject<[]>(1);
  public filter_list_reasons: ReplaySubject<[]> = new ReplaySubject<[]>(1);
  public search_control_visitor:FormControl = new FormControl();
  public search_control_reason: FormControl = new FormControl();

  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;
  @ViewChild('multiSelect', { static: true }) multiSelect: MatSelect;

  protected _onDestroy = new Subject<void>();

  adminData;

  colorBtnDefault;
    
  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<TableVisitorAddDialog>,
    public dialog: MatDialog,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.addFestForm.controls;
  }

  
  public addNewVisitor() {

   
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
    this.dialogRef.close(this.addFestForm.value);

  }

  ngOnInit() {

    this.adminData = this.data.adminData;
    this.colorBtnDefault = this.data.adminData.colourEnabledButton ? this.data.adminData.colourEnabledButton : '';

    this.addFestForm = this.formBuilder.group({
      visitorsOnSite: ['', Validators.required],
      reasonsOnSite: '', //['', Validators.required],
      duration: ['', Validators.required],
      // search_control_visitor: [null],
      // search_control_reason: [null],
    }, {
    });

    this.listVisitors = this.data.listVisitors;
    this.listReasons = this.data.listReasons;

    this.initializeFilterVisitors();
    this.initializeFilterReasons();
  }

  onButtonEnter(hoverName: HTMLElement) {
    hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
  }

  onButtonOut(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
  }

  initializeFilterVisitors() {

    this.filter_list_visitors.next(this.listVisitors.slice());

      this.search_control_visitor.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterListVisitors();
      });

  }


  protected filterListVisitors() {
      if (!this.listVisitors) {
        return;
      }
      // get the search keyword
      let search = this.search_control_visitor.value;
      if (!search) {
        this.filter_list_visitors.next(this.listVisitors.slice());
        return;
      } else {
        search = search.toLowerCase();
      }
      // filter the banks
      this.filter_list_visitors.next(
        this.listVisitors.filter(visitors => visitors.visitor_name.toLowerCase().indexOf(search) > -1)
      );
  }

  initializeFilterReasons() {

    this.filter_list_reasons.next(this.listReasons.slice());

      this.search_control_reason.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterListReasons();
      });

  }


  protected filterListReasons() {
      if (!this.listVisitors) {
        return;
      }
      // get the search keyword
      let search = this.search_control_reason.value;
      if (!search) {
        this.filter_list_reasons.next(this.listReasons.slice());
        return;
      } else {
        search = search.toLowerCase();
      }
      // filter the banks
      this.filter_list_reasons.next(
        this.listReasons.filter(listReason => listReason.reason.toLowerCase().indexOf(search) > -1)
      );
  }

  public getFBReasons(): void {
    this.data_api.getFBReasons().subscribe(data => {
        if(data){
          if(data.reasonArray){

            data.reasonArray.sort(function(a, b) {
                var textA = a.reason.toUpperCase();
                var textB = b.reason.toUpperCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });

            this.listReasons = data.reasonArray;
          }
        }
    });
  }

  openAddReasonDialog(): void {
      const dialogRef = this.dialog.open(ReasonsAddDialog, {
          width: '400px',
          // data: this.renderValue
      });

      dialogRef.afterClosed().subscribe(result => {
          if(result){   

                this.data_api.getFBReasons().subscribe(data => {
                    if(data){
                      if(data.reasonArray){
            
                        data.reasonArray.sort(function(a, b) {
                            var textA = a.reason.toUpperCase();
                            var textB = b.reason.toUpperCase();
                            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                        });
            
                        this.listReasons = data.reasonArray;
                        this.addFestForm.get("reasonsOnSite").patchValue(result.toString());
                        this.initializeFilterReasons();
                      }
                    }
                });

          }
      });
      
  }

  openAddVisitorDialog(): void {
    const dialogRef = this.dialog.open(VisitorsAddDialog, {
        width: '400px',
        // data: this.renderValue
    });

    dialogRef.afterClosed().subscribe(result => {
        
        if(result){   

            this.data_api.getFBVisitors().subscribe(data => {
                if(data){
                  if(data.visitorArray){
      
                    data.visitorArray.sort(function(a, b) {
                        var textA = a.visitorName.toUpperCase();
                        var textB = b.visitorName.toUpperCase();
                        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                    });
      
      
                    this.listVisitors = [];
                    data.visitorArray.forEach(data2 =>{  
                        if(data2){
                          this.listVisitors.push({id: data2.visitorName, visitor_name: data2.visitorName, type:'global'})   
                        } 
                    });

                    this.addFestForm.get("visitorsOnSite").patchValue(result.toString());
                    this.initializeFilterVisitors();

      
                  }
                }
            });

            // this.listVisitors

            // this.listReasons = data.reasonArray;
            // this.addFestForm.get("visitorsOnSite").patchValue(result.toString());
            // this.initializeFilterVisitors();

            // setTimeout(() => {
            //   this.visitorFormArray().at(empIndex).get('visitorsOnSite').patchValue(result.toString());
            //   this.initializeFilterVisitors(empIndex);
            // }, 1000);   
                  

        }
    });
    
}

}


@Component({
  selector: 'tablevisitor-editdialog',
  templateUrl: 'tablevisitor-editdialog.html',
})

export class TableVisitorEditDialog implements OnInit {

  editForm: FormGroup;
  public listVisitors:any = [];
  public listReasons:any = [];

  public filter_list_visitors: ReplaySubject<[]> = new ReplaySubject<[]>(1);
  public filter_list_reasons: ReplaySubject<[]> = new ReplaySubject<[]>(1);
  public search_control_visitor:FormControl = new FormControl();
  public search_control_reason: FormControl = new FormControl();

  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;
  @ViewChild('multiSelect', { static: true }) multiSelect: MatSelect;

  protected _onDestroy = new Subject<void>();

  adminData;

  colorBtnDefault;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<TableVisitorEditDialog>,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.editForm.controls;
  }

  
  public updateVisitor() {

   
      if (this.editForm.invalid) {

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
    this.dialogRef.close(this.editForm.value);

  }

  ngOnInit() {

    this.adminData =  this.data.adminData;
    this.colorBtnDefault =  this.data.adminData.colourEnabledButton ?  this.data.adminData.colourEnabledButton : '';

    this.editForm = this.formBuilder.group({
      visitorsOnSite: ['', Validators.required],
      reasonsOnSite: ['', Validators.required],
      duration: ['', Validators.required],
      empIndex: ['', Validators.required],
      // search_control_visitor: [null],
      // search_control_reason: [null],
    }, {
    });

    this.listVisitors = this.data.listVisitors;
    this.listReasons = this.data.listReasons;
    this.editForm.patchValue({
      visitorsOnSite: this.data.visitorsOnSite,
      reasonsOnSite:  this.data.reasonsOnSite,
      duration: this.data.duration,
      empIndex: this.data.empIndex
    });
    this.initializeFilterVisitors();
    this.initializeFilterReasons();
  }

  onButtonEnter(hoverName: HTMLElement) {
    hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
  }

  onButtonOut(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
  }

  initializeFilterVisitors() {

    this.filter_list_visitors.next(this.listVisitors.slice());

      this.search_control_visitor.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterListVisitors();
      });

  }


  protected filterListVisitors() {
      if (!this.listVisitors) {
        return;
      }
      // get the search keyword
      let search = this.search_control_visitor.value;
      if (!search) {
        this.filter_list_visitors.next(this.listVisitors.slice());
        return;
      } else {
        search = search.toLowerCase();
      }
      // filter the banks
      this.filter_list_visitors.next(
        this.listVisitors.filter(visitors => visitors.visitor_name.toLowerCase().indexOf(search) > -1)
      );
  }

  initializeFilterReasons() {

    this.filter_list_reasons.next(this.listReasons.slice());

      this.search_control_reason.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterListReasons();
      });

  }


  protected filterListReasons() {
      if (!this.listVisitors) {
        return;
      }
      // get the search keyword
      let search = this.search_control_reason.value;
      if (!search) {
        this.filter_list_reasons.next(this.listReasons.slice());
        return;
      } else {
        search = search.toLowerCase();
      }
      // filter the banks
      this.filter_list_reasons.next(
        this.listReasons.filter(listReason => listReason.reason.toLowerCase().indexOf(search) > -1)
      );
  }

}


@Component({
  selector: 'tableemployees-adddialog',
  templateUrl: 'tableemployees-adddialog.html',
})

export class TableEmployeesAddDialog implements OnInit {

  addFestForm: FormGroup;
  public listStaffs:any = [];

  public filter_list_employees: ReplaySubject<[]> = new ReplaySubject<[]>(1);
  public search_control_employee:FormControl = new FormControl();

  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;
  @ViewChild('multiSelect', { static: true }) multiSelect: MatSelect;

  breaktimes=[
    {value: '00:00', viewValue: 'No Breaks'},
    {value: '00:15', viewValue: '15 minutes'},
    {value: '00:30', viewValue: '30 minutes'},
    {value: '00:45', viewValue: '45 minutes'},
    {value: '01:00', viewValue: '1 hour'},
  ]

  protected _onDestroy = new Subject<void>();

  adminData;

  colorBtnDefault;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<TableEmployeesAddDialog>,
    public dialog: MatDialog,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.addFestForm.controls;
  }

  
  public addNewEmployee() {

   
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
    this.dialogRef.close(this.addFestForm.value);

  }

  ngOnInit() {

    this.adminData = this.data.adminData;
    this.colorBtnDefault = this.data.adminData.colourEnabledButton ? this.data.adminData.colourEnabledButton : '';

    this.addFestForm = this.formBuilder.group({
      staffOnSite: ['', Validators.required],
      taskDescription: '',
      checkDetailStaff: '',
      start: '',
      break: '',
      finish: '',
      hours: '',
      tempHours: '',
    }, {
    });

    this.listStaffs = this.data.listStaffs;
    this.initializeFilterEmployees();
  }

  onButtonEnter(hoverName: HTMLElement) {
    hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
  }

  onButtonOut(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
  }

  initializeFilterEmployees() {

    this.filter_list_employees.next(this.listStaffs.slice());

      this.search_control_employee.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterListEmployees();
      });

  }


  protected filterListEmployees() {
      if (!this.listStaffs) {
        return;
      }
      // get the search keyword
      let search = this.search_control_employee.value;
      if (!search) {
        this.filter_list_employees.next(this.listStaffs.slice());
        return;
      } else {
        search = search.toLowerCase();
      }
      // filter the banks
      this.filter_list_employees.next(
        this.listStaffs.filter(employees => employees.staff_name.toLowerCase().indexOf(search) > -1)
      );
  }

  public computeTimeStaff(){ 

        let timeFinish = moment(this.addFestForm.value.finish, 'hh:mm A').format('HH mm');
        let timeStart = moment(this.addFestForm.value.start, 'hh:mm A').format('HH mm');
        let timeBreak = moment.duration(this.addFestForm.value.break);

        let diff = (moment(timeFinish, 'HH:mm').subtract(timeBreak)).diff(moment(timeStart, 'HH:mm'))
        let diffDuration = moment.duration(diff);
        let hours =  Math.floor(diffDuration.asHours());
        let minutes = moment.utc(diff).format("mm");
        
        let convertHours = hours + ":" + minutes;

        this.addFestForm.get('tempHours').patchValue( (moment.duration(convertHours).asHours()).toFixed(2) );
        this.addFestForm.get('hours').patchValue( (moment.duration(convertHours).asHours()).toFixed(2) );        
  }

  public changeTimeDialog(control,data): void {
    const dialogRef = this.dialog.open(ChangeTimeDialog, {
        width: '320px',
        data: data
    });

    dialogRef.afterClosed().subscribe(result => {

        if(result){  

        this.addFestForm.get(control).patchValue(result);
        this.computeTimeStaff();
         }
    });
  
  }
  
}


@Component({
  selector: 'tableemployeestask-adddialog',
  templateUrl: 'tableemployeestask-adddialog.html',
})

export class TableEmployeesTaskAddDialog implements OnInit {

  addFestForm: FormGroup;
  public listStaffs:any = [];

  public filter_list_employees: ReplaySubject<[]> = new ReplaySubject<[]>(1);
  public search_control_employee:FormControl = new FormControl();

  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;
  @ViewChild('multiSelect', { static: true }) multiSelect: MatSelect;

  breaktimes=[
    {value: '00:00', viewValue: 'No Breaks'},
    {value: '00:15', viewValue: '15 minutes'},
    {value: '00:30', viewValue: '30 minutes'},
    {value: '00:45', viewValue: '45 minutes'},
    {value: '01:00', viewValue: '1 hour'},
  ]

  protected _onDestroy = new Subject<void>();

  adminData;

  colorBtnDefault;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<TableEmployeesTaskAddDialog>,
    public dialog: MatDialog,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.addFestForm.controls;
  }

  
  public addNewEmployee() {

   
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
    this.dialogRef.close(this.addFestForm.value);

  }

  ngOnInit() {

    this.adminData = this.data.adminData;
    this.colorBtnDefault = this.data.adminData.colourEnabledButton ? this.data.adminData.colourEnabledButton : '';

    this.addFestForm = this.formBuilder.group({
      taskDescription: '',
      checkDetailStaff: '',
      start: '',
      break: '',
      finish: '',
      hours: '',
      tempHours: '',
    }, {
    });

  }

  onButtonEnter(hoverName: HTMLElement) {
    hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
  }

  onButtonOut(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
  }

  public computeTimeStaff(){ 

        let timeFinish = moment(this.addFestForm.value.finish, 'hh:mm A').format('HH mm');
        let timeStart = moment(this.addFestForm.value.start, 'hh:mm A').format('HH mm');
        let timeBreak = moment.duration(this.addFestForm.value.break);

        let diff = (moment(timeFinish, 'HH:mm').subtract(timeBreak)).diff(moment(timeStart, 'HH:mm'))
        let diffDuration = moment.duration(diff);
        let hours =  Math.floor(diffDuration.asHours());
        let minutes = moment.utc(diff).format("mm");
        
        let convertHours = hours + ":" + minutes;

        this.addFestForm.get('tempHours').patchValue( (moment.duration(convertHours).asHours()).toFixed(2) );
        this.addFestForm.get('hours').patchValue( (moment.duration(convertHours).asHours()).toFixed(2) );        
  }

  public changeTimeDialog(control,data): void {
    const dialogRef = this.dialog.open(ChangeTimeDialog, {
        width: '320px',
        data: data
    });

    dialogRef.afterClosed().subscribe(result => {

        if(result){  

        this.addFestForm.get(control).patchValue(result);
        this.computeTimeStaff();
         }
    });
  
  }
  
}



@Component({
  selector: 'tableemployeestask-editdialog',
  templateUrl: 'tableemployeestask-editdialog.html',
})

export class TableEmployeesTaskEditDialog implements OnInit {

  editForm: FormGroup;
  public listStaffs:any = [];

  public filter_list_employees: ReplaySubject<[]> = new ReplaySubject<[]>(1);
  public search_control_employee:FormControl = new FormControl();

  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;
  @ViewChild('multiSelect', { static: true }) multiSelect: MatSelect;

  breaktimes=[
    {value: '00:00', viewValue: 'No Breaks'},
    {value: '00:15', viewValue: '15 minutes'},
    {value: '00:30', viewValue: '30 minutes'},
    {value: '00:45', viewValue: '45 minutes'},
    {value: '01:00', viewValue: '1 hour'},
  ]

  protected _onDestroy = new Subject<void>();

  adminData;

  colorBtnDefault;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<TableEmployeesTaskEditDialog>,
    public dialog: MatDialog,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.editForm.controls;
  }

  
  public updateEmployee() {

   
      if (this.editForm.invalid) {

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
    this.dialogRef.close(this.editForm.value);

  }

  ngOnInit() {

      this.adminData = this.data.adminData;
      this.colorBtnDefault = this.data.adminData.colourEnabledButton ? this.data.adminData.colourEnabledButton : '';

      this.editForm = this.formBuilder.group({
        taskDescription: '',
        checkDetailStaff: '',
        start: '',
        break: '',
        finish: '',
        hours: '',
        tempHours: '',
      }, {
      });


      this.editForm.patchValue({
        taskDescription: this.data.taskDescription,
        checkDetailStaff: this.data.checkDetailStaff,
        start: this.data.start,
        break: this.data.break,
        finish: this.data.finish,
        hours: this.data.hours,
        tempHours: this.data.tempHours
      });

  }

  onButtonEnter(hoverName: HTMLElement) {
    hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
  }

  onButtonOut(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
  }

  ngOnDestroy() {
      this._onDestroy.next();
      this._onDestroy.complete();
  }

  public computeTimeStaff(){ 

        let timeFinish = moment(this.editForm.value.finish, 'hh:mm A').format('HH mm');
        let timeStart = moment(this.editForm.value.start, 'hh:mm A').format('HH mm');
        let timeBreak = moment.duration(this.editForm.value.break);

        let diff = (moment(timeFinish, 'HH:mm').subtract(timeBreak)).diff(moment(timeStart, 'HH:mm'))
        let diffDuration = moment.duration(diff);
        let hours =  Math.floor(diffDuration.asHours());
        let minutes = moment.utc(diff).format("mm");
        
        let convertHours = hours + ":" + minutes;

        this.editForm.get('tempHours').patchValue( (moment.duration(convertHours).asHours()).toFixed(2) );
        this.editForm.get('hours').patchValue( (moment.duration(convertHours).asHours()).toFixed(2) );        
  }

  public changeTimeDialog(control,data): void {
    const dialogRef = this.dialog.open(ChangeTimeDialog, {
        width: '320px',
        data: data
    });

    dialogRef.afterClosed().subscribe(result => {

        if(result){  

        this.editForm.get(control).patchValue(result);
        this.computeTimeStaff();
         }
    });
  
  }
  
}

@Component({
  selector: 'tabletrades-adddialog',
  templateUrl: 'tabletrades-adddialog.html',
})

export class TableTradesAddDialog implements OnInit {

  addFestForm: FormGroup;
  public listStaffs:any = [];

  public filter_list_employees: ReplaySubject<[]> = new ReplaySubject<[]>(1);
  public search_control_employee:FormControl = new FormControl();

  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;
  @ViewChild('multiSelect', { static: true }) multiSelect: MatSelect;

  breaktimes=[
    {value: '00:00', viewValue: 'No Breaks'},
    {value: '00:15', viewValue: '15 minutes'},
    {value: '00:30', viewValue: '30 minutes'},
    {value: '00:45', viewValue: '45 minutes'},
    {value: '01:00', viewValue: '1 hour'},
  ]

  protected _onDestroy = new Subject<void>();

  adminData;

  colorBtnDefault;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<TableTradesAddDialog>,
    public dialog: MatDialog,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.addFestForm.controls;
  }

  
  public addNewEmployee() {

   
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
    this.dialogRef.close(this.addFestForm.value);

  }

  ngOnInit() {

    this.adminData = this.data.adminData;
    this.colorBtnDefault = this.data.adminData.colourEnabledButton ? this.data.adminData.colourEnabledButton : '';

    this.addFestForm = this.formBuilder.group({
      staffOnSite: ['', Validators.required],
      taskDescription: '',
      checkDetail: '',
      start: '',
      break: '',
      finish: '',
      hours: '',
      tempHours: '',
    }, {
    });

    this.listStaffs = this.data.staffFormArray;
    this.initializeFilterEmployees();
  }

  onButtonEnter(hoverName: HTMLElement) {
    hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
  }

  onButtonOut(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
  }

  initializeFilterEmployees() {

    this.filter_list_employees.next(this.listStaffs.slice());

      this.search_control_employee.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterListEmployees();
      });

  }


  protected filterListEmployees() {
      if (!this.listStaffs) {
        return;
      }
      // get the search keyword
      let search = this.search_control_employee.value;
      if (!search) {
        this.filter_list_employees.next(this.listStaffs.slice());
        return;
      } else {
        search = search.toLowerCase();
      }
      // filter the banks
      this.filter_list_employees.next(
        this.listStaffs.filter(employees => employees.staffName.toLowerCase().indexOf(search) > -1)
      );
  }

  public computeTimeStaff(){ 

        let timeFinish = moment(this.addFestForm.value.finish, 'hh:mm A').format('HH mm');
        let timeStart = moment(this.addFestForm.value.start, 'hh:mm A').format('HH mm');
        let timeBreak = moment.duration(this.addFestForm.value.break);

        let diff = (moment(timeFinish, 'HH:mm').subtract(timeBreak)).diff(moment(timeStart, 'HH:mm'))
        let diffDuration = moment.duration(diff);
        let hours =  Math.floor(diffDuration.asHours());
        let minutes = moment.utc(diff).format("mm");
        
        let convertHours = hours + ":" + minutes;

        this.addFestForm.get('tempHours').patchValue( (moment.duration(convertHours).asHours()).toFixed(2) );
        this.addFestForm.get('hours').patchValue( (moment.duration(convertHours).asHours()).toFixed(2) );        
  }

  public changeTimeDialog(control,data): void {
    const dialogRef = this.dialog.open(ChangeTimeDialog, {
        width: '320px',
        data: data
    });

    dialogRef.afterClosed().subscribe(result => {

        if(result){  

        this.addFestForm.get(control).patchValue(result);
        this.computeTimeStaff();
         }
    });
  
  }
  
}

@Component({
  selector: 'tabletradestask-adddialog',
  templateUrl: 'tabletradestask-adddialog.html',
})

export class TableTradesTaskAddDialog implements OnInit {

  addFestForm: FormGroup;
  public listStaffs:any = [];

  public filter_list_employees: ReplaySubject<[]> = new ReplaySubject<[]>(1);
  public search_control_employee:FormControl = new FormControl();

  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;
  @ViewChild('multiSelect', { static: true }) multiSelect: MatSelect;

  breaktimes=[
    {value: '00:00', viewValue: 'No Breaks'},
    {value: '00:15', viewValue: '15 minutes'},
    {value: '00:30', viewValue: '30 minutes'},
    {value: '00:45', viewValue: '45 minutes'},
    {value: '01:00', viewValue: '1 hour'},
  ]

  protected _onDestroy = new Subject<void>();

  adminData;

  colorBtnDefault;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<TableTradesTaskAddDialog>,
    public dialog: MatDialog,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.addFestForm.controls;
  }

  
  public addNewEmployee() {

   
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
    this.dialogRef.close(this.addFestForm.value);

  }

  ngOnInit() {

    this.adminData = this.data.adminData;
    this.colorBtnDefault = this.data.adminData.colourEnabledButton ? this.data.adminData.colourEnabledButton : '';

    this.addFestForm = this.formBuilder.group({
      taskDescription: '',
      checkDetail: '',
      start: '',
      break: '',
      finish: '',
      hours: '',
      tempHours: '',
    }, {
    });

  }

  onButtonEnter(hoverName: HTMLElement) {
    hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
  }

  onButtonOut(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
  }

  public computeTimeStaff(){ 

        let timeFinish = moment(this.addFestForm.value.finish, 'hh:mm A').format('HH mm');
        let timeStart = moment(this.addFestForm.value.start, 'hh:mm A').format('HH mm');
        let timeBreak = moment.duration(this.addFestForm.value.break);

        let diff = (moment(timeFinish, 'HH:mm').subtract(timeBreak)).diff(moment(timeStart, 'HH:mm'))
        let diffDuration = moment.duration(diff);
        let hours =  Math.floor(diffDuration.asHours());
        let minutes = moment.utc(diff).format("mm");
        
        let convertHours = hours + ":" + minutes;

        this.addFestForm.get('tempHours').patchValue( (moment.duration(convertHours).asHours()).toFixed(2) );
        this.addFestForm.get('hours').patchValue( (moment.duration(convertHours).asHours()).toFixed(2) );        
  }

  public changeTimeDialog(control,data): void {
    const dialogRef = this.dialog.open(ChangeTimeDialog, {
        width: '320px',
        data: data
    });

    dialogRef.afterClosed().subscribe(result => {

        if(result){  

        this.addFestForm.get(control).patchValue(result);
        this.computeTimeStaff();
         }
    });
  
  }
  
}


@Component({
  selector: 'tabletradestask-editdialog',
  templateUrl: 'tabletradestask-editdialog.html',
})

export class TableTradesTaskEditDialog implements OnInit {

  editForm: FormGroup;
  public listStaffs:any = [];

  public filter_list_employees: ReplaySubject<[]> = new ReplaySubject<[]>(1);
  public search_control_employee:FormControl = new FormControl();

  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;
  @ViewChild('multiSelect', { static: true }) multiSelect: MatSelect;

  breaktimes=[
    {value: '00:00', viewValue: 'No Breaks'},
    {value: '00:15', viewValue: '15 minutes'},
    {value: '00:30', viewValue: '30 minutes'},
    {value: '00:45', viewValue: '45 minutes'},
    {value: '01:00', viewValue: '1 hour'},
  ]

  protected _onDestroy = new Subject<void>();

  adminData;

  colorBtnDefault;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<TableTradesTaskEditDialog>,
    public dialog: MatDialog,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.editForm.controls;
  }

  
  public updateEmployee() {

   
      if (this.editForm.invalid) {

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
    this.dialogRef.close(this.editForm.value);

  }

  ngOnInit() {

      this.adminData = this.data.adminData;
      this.colorBtnDefault = this.data.adminData.colourEnabledButton ? this.data.adminData.colourEnabledButton : '';

      this.editForm = this.formBuilder.group({
        taskDescription: '',
        checkDetail: '',
        start: '',
        break: '',
        finish: '',
        hours: '',
        tempHours: '',
      }, {
      });


      this.editForm.patchValue({
        taskDescription: this.data.taskDescription,
        checkDetail: this.data.checkDetail,
        start: this.data.start,
        break: this.data.break,
        finish: this.data.finish,
        hours: this.data.hours,
        tempHours: this.data.tempHours
      });

  }

  onButtonEnter(hoverName: HTMLElement) {
    hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
  }

  onButtonOut(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
  }

  public computeTimeStaff(){ 

        let timeFinish = moment(this.editForm.value.finish, 'hh:mm A').format('HH mm');
        let timeStart = moment(this.editForm.value.start, 'hh:mm A').format('HH mm');
        let timeBreak = moment.duration(this.editForm.value.break);

        let diff = (moment(timeFinish, 'HH:mm').subtract(timeBreak)).diff(moment(timeStart, 'HH:mm'))
        let diffDuration = moment.duration(diff);
        let hours =  Math.floor(diffDuration.asHours());
        let minutes = moment.utc(diff).format("mm");
        
        let convertHours = hours + ":" + minutes;

        this.editForm.get('tempHours').patchValue( (moment.duration(convertHours).asHours()).toFixed(2) );
        this.editForm.get('hours').patchValue( (moment.duration(convertHours).asHours()).toFixed(2) );        
  }

  public changeTimeDialog(control,data): void {
    const dialogRef = this.dialog.open(ChangeTimeDialog, {
        width: '320px',
        data: data
    });

    dialogRef.afterClosed().subscribe(result => {

        if(result){  

        this.editForm.get(control).patchValue(result);
        this.computeTimeStaff();
         }
    });
  
  }
  
}