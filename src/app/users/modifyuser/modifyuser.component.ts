import { Component, ElementRef, AfterViewInit, ViewChild, Input, OnInit, Inject } from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import { DatasourceService} from '../../services/datasource.service';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../services/format-datepicker';
import {FormBuilder, FormGroup, Validators, FormArray, FormControl} from "@angular/forms";
import { Observable, throwError } from 'rxjs';
import { map, reduce } from 'rxjs/operators';
import { NgxSpinnerService } from "ngx-spinner";
import swal from 'sweetalert2';
// import {MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

declare var $: any;

@Component({
  selector: 'app-modifyuser',
  templateUrl: './modifyuser.component.html',
  styleUrls: ['./modifyuser.component.css'],
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
  ],
  encapsulation: ViewEncapsulation.None
})

export class ModifyUserComponent implements OnInit {
    
    public passID: any;
    public userData;
    editForm: FormGroup;
    
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private data_api: DatasourceService,
        private formBuilder: FormBuilder,
        private spinnerService: NgxSpinnerService,
        public dialog: MatDialog,
        ) {
      }

    public getUser(){
        this.spinnerService.show();
        this.data_api.getUser(this.passID.id).subscribe((data) => {
                console.log(data);
                // console.log(data[1]);
                this.userData = data[1];
                console.log(this.userData.first_name[0]);
                this.spinnerService.hide();

                this.editForm.patchValue({
                  firstName: this.userData.first_name[0],
                });
          }
        );
      }

    ngOnInit() {

        this.passID = {
            id: this.route.snapshot.params['id'],
        };
        this.route.params

        .subscribe(
            (params: Params) => {
                this.passID.id = params['id'];
            }
        );


      this.editForm = this.formBuilder.group({
          firstName: [''],
      });


        this.getUser();

    }
}