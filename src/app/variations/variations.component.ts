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
import { ProjectDataService } from '../services/project-selector.service';

declare const $: any;

@Component({
  selector: 'app-variations',
  templateUrl: './variations.component.html',
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS},
    DatePipe
  ]
})
export class VariationsComponent implements OnInit {

    public projectNames:any = [];
    editForm: FormGroup;

    public filter_list_projects: ReplaySubject<[]> = new ReplaySubject<[]>(1);
    public search_control_project: FormControl = new FormControl();

    protected _onDestroy = new Subject<void>();

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
        private deviceService: DeviceDetectorService,
        public projectDataService: ProjectDataService,
        ) { }
    
        ngOnInit(): void {
          this.editForm = this.formBuilder.group({
            projectId: ['', Validators.required],
          });
        
          const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
          this.projectDataService.getProjects(currentUser);
        
          // search logic
          this.search_control_project.valueChanges
            .pipe(takeUntil(this.projectDataService._onDestroy))
            .subscribe(search => {
              this.projectDataService.applyProjectFilter(search);
            });
        }
      public projectSelect(){
      
        this.router.navigate(['/variations/project/'+this.editForm.value.projectId]);
      }

      
}