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
// import {MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import swal from 'sweetalert2';
import { RoleChecker } from '../services/role-checker.service';
import { ConfirmedValidator  } from '../services/confirm-password.validator';
import { Router } from '@angular/router';

declare const $: any;

@Component({
  selector: 'app-updatepassword',
  templateUrl: './updatepassword.component.html'
})
export class UpdatePasswordComponent implements OnInit {

    public userData;
    form: FormGroup = new FormGroup({});
    submitted = false;
    public curUserID;

    constructor(
      private data_api: DatasourceService,
      private spinnerService: NgxSpinnerService,
      private formBuilder: FormBuilder,
      private router: Router
      ) {}
  
    ngOnInit() {

        let currentUser = JSON.parse((localStorage.getItem('currentUser')));
        this.curUserID = currentUser.user_id;

        this.form  = this.formBuilder.group({
            password: ['', [Validators.required]],
            confirm_password: ['', [Validators.required]]
        }, {
          validator: ConfirmedValidator('password', 'confirm_password')
        });
    }
  
    get f(){
      return this.form.controls;
    }
  
    public updatePassword() {
        if (this.form.invalid) {
          alert('invalid');
          return;
        }
  
        this.spinnerService.show();
  
        let userData = {
            // "username": this.editForm.value.userName,
            "password": this.form.value.password,
        };
  
        this.data_api.updatePassword(this.curUserID, userData)
          .subscribe(
            (result) => {
              if(result){

                this.spinnerService.hide();

                  // swal({
                  //     title: "User Password Updated",
                  //     // text: "You clicked the button!",
                  //     buttonsStyling: false,
                  //     confirmButtonClass: "btn btn-success",
                  //     type: "success"
                  // }).catch(swal.noop)
  
                  

                  this.router.navigate(['/dashboard-client']);
              }else{

                this.spinnerService.hide();

                // swal({
                //     title: "Error in Updating Password",
                //     // text: "You clicked the button!",
                //     buttonsStyling: false,
                //     confirmButtonClass: "btn btn-success",
                //     type: "error"
                // }).catch(swal.noop)
  
              }
          },
          (error) => {

               this.spinnerService.hide();

              console.log(error)
              // swal({
              //     title: error.error.message,
              //     // text: "You clicked the button!",
              //     buttonsStyling: false,
              //     confirmButtonClass: "btn btn-success",
              //     type: "error"
              // }).catch(swal.noop)
              
          }
          
        );  
  
    }
}