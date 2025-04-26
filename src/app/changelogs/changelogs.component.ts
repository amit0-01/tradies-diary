import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Inject, HostListener} from '@angular/core';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../services/format-datepicker';
import { DatasourceService } from '../services/datasource.service';
import { PdfImage } from '../services/pdf-image';
import { PreviewImage } from '../services/preview-image';
import { Observable, Observer } from 'rxjs';
import swal from 'sweetalert2';
// import * as Chartist from 'chartist';
import { Input } from '@angular/core';
// //import * as $$ from 'jQuery';
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

declare const $: any;

@Component({
  selector: 'app-changelogs',
  templateUrl: './changelogs.component.html',
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS},
    DatePipe
  ]
})
export class ChangelogsComponent implements OnInit {
  
  
  tasks = [
    {
      id: 1,
      label: 'task 1',
      description: 'description for task 1',
      start: '09:00',
      end: '14:30',
      statusList: [
        {
          start: '09:30',
          color: '#18BFED'
        },
        {
          start: '10:30',
          color: '#b3c71e'
        }
      ]
    },
    {
      id: 2,
      label: 'task 2',
      description: 'description for task 2',
      start: '10:00',
      end: '11:00',
      isParent: true, // makes this row clickable & expandable
      statusList: [
        {
          start: '09:30',
          color: '#18BFED'
        },
        {
          start: '09:45',
          color: '#ff7300'
        },
        {
          start: '10:30',
          color: '#b3c71e'
        }
      ]
    },
    {
      id: 3, // Unique ID
      parentID: 2, // states this is a subtask
      isHidden: true, // hidden by default
      label: 'task 2a', // is shown inside the bars on timeline
      description: 'description for task 2a',
      tooltip: 'tooltip for task', // is shown when task is hovered
      start: '10:00', // start time of the task
      end: '14:25', // end time of the task
      statusList: [
        {
          start: '11:30', // start time of first status
          color: '#18BFED' // background color of the status
        },
        {
          start: '12:30', // start time of second status = end time of first status
          color: '#b3c71e',
          tooltip: 'tooltip for status', // is shown when status is hovered
        }
      ]
    }
  ];

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
    private myService: MyService,
    private route: ActivatedRoute,
    private afStorage: AngularFireStorage,
    private progressOverlay: NgxProgressOverlayService,
    private afs: AngularFirestore,
    private deviceService: DeviceDetectorService
    ) { }
    
    public ngOnInit() {

    }
}