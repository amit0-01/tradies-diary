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
import { gantt } from 'dhtmlx-gantt';
import { TaskService } from '../services/task.service';
import { LinkService } from '../services/link.service';

declare const $: any;

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS},
    DatePipe
  ]
})
export class ScheduleComponent implements OnInit {

 @ViewChild('gantt_here', { static: true }) ganttContainer!: ElementRef;

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
    private taskService: TaskService,
    private linkService: LinkService
    ) { }

    zoomIn(){
		gantt.ext.zoom.zoomIn();
        gantt.init(this.ganttContainer.nativeElement);
	}

    zoomOut(){
		gantt.ext.zoom.zoomOut()
        gantt.init(this.ganttContainer.nativeElement);
	}

    ngOnInit(): void {
        gantt.config.date_format = '%Y-%m-%d %H:%i';

        gantt.message({
            text:[
                "Assign resources to the tasks.",
                "Public API allows displaying resources in gantt, as well as resource coloring.",
                "Double click a task to change the assigned user."
            ].join("<br><br>"),
            expire: -1
        });
    
        gantt.serverList("staff", [
            {key: 1, label: "John", backgroundColor:"#03A9F4", textColor:"#FFF"},
            {key: 2, label: "Mike", backgroundColor:"#f57730", textColor:"#FFF"},
            {key: 3, label: "Anna", backgroundColor:"#e157de", textColor:"#FFF"},
            {key: 4, label: "Bill", backgroundColor:"#78909C", textColor:"#FFF"},
            {key: 7, label: "Floe", backgroundColor:"#8D6E63", textColor:"#FFF"}
        ]);
    
        gantt.serverList("priority", [
            {key: 1, label: "High"},
            {key: 2, label: "Normal"},
            {key: 3, label: "Low"}
        ]);
    
        // end test data
        gantt.config.grid_width = 420;
        gantt.config.grid_resize = true;
        gantt.config.open_tree_initially = true;
    
        var labels = gantt.locale.labels;
        labels.column_priority = labels.section_priority = "Priority";
        labels.column_owner = labels.section_owner = "Owner";
    
        function byId(list, id) {
            for (var i = 0; i < list.length; i++) {
                if (list[i].key == id)
                    return list[i].label || "";
            }
            return "";
        }
    
        gantt.config.columns = [
            {name: "owner", width: 80, align: "center", template: function (item) {
                    return byId(gantt.serverList('staff'), item.owner_id)}},
            {name: "text", label: "Task name", tree: true, width: '*'},
            {name: "priority", width: 80, align: "center", template: function (item) {
                    return byId(gantt.serverList('priority'), item.priority)}},
            {name: "add", width: 40}
        ];
    
        gantt.config.lightbox.sections = [
            {name: "description", height: 38, map_to: "text", type: "textarea", focus: true},
            {name: "priority", height: 22, map_to: "priority", type: "select", options: gantt.serverList("priority")},
            {name: "owner", height: 22, map_to: "owner_id", type: "select", options: gantt.serverList("staff")},
            {name: "time", type: "duration", map_to: "auto"}
        ];
    
        gantt.templates.rightside_text = function(start, end, task){
            return byId(gantt.serverList('staff'), task.owner_id);
        };
    
        gantt.templates.grid_row_class =
            gantt.templates.task_row_class =
                gantt.templates.task_class = function (start, end, task) {
            var css = [];
            if (task.$virtual || task.type == gantt.config.types.project)
                css.push("summary-bar");
    
            if(task.owner_id){
                css.push("gantt_resource_task gantt_resource_" + task.owner_id);
            }
    
            return css.join(" ");
        };
    
        gantt.attachEvent("onParse", function(){
            var styleId = "dynamicGanttStyles";
            var element = document.getElementById(styleId);
            if(!element){
                element = document.createElement("style");
                element.id = styleId;
                document.querySelector("head").appendChild(element);
            }
            var html = [];
            var resources = gantt.serverList("staff");
    
            resources.forEach(function(r){
                html.push(".gantt_task_line.gantt_resource_" + r.key + "{" +
                    "background-color:"+r.backgroundColor+"; " +
                    "color:"+r.textColor+";" +
                "}");
                html.push(".gantt_row.gantt_resource_" + r.key + " .gantt_cell:nth-child(1) .gantt_tree_content{" +
                    "background-color:"+r.backgroundColor+"; " +
                    "color:"+r.textColor+";" +
                    "}");
            });
            element.innerHTML = html.join("");
        });

        
        gantt.init(this.ganttContainer.nativeElement);


        Promise.all([this.taskService.get(), this.linkService.get()])
            .then(([data, links]) => {
                gantt.parse({ data, links });
            });
      
    }

}