import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { AuthenticationService } from 'src/app/shared/authentication.service';
import { DatasourceService} from '../../services/datasource.service';
import {FormBuilder, FormGroup, Validators, FormArray, FormControl} from "@angular/forms";
import {ActivatedRoute, Params, Router, ParamMap} from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import swal from 'sweetalert2';
import { AngularFireAuth } from '@angular/fire/compat/auth';

declare var $: any;

@Component({
    selector: 'app-forgotpassword-cmp',
    templateUrl: './forgotpassword.component.html'
})

export class ForgotPasswordComponent implements OnInit, OnDestroy {
    test: Date = new Date();
    private toggleButton: any;
    private sidebarVisible: boolean;
    private nativeElement: Node;
    public logoURL;
    forgotForm: FormGroup;

    constructor(
        private element: ElementRef, 
        public authService: AuthenticationService,
        private data_api: DatasourceService,
        private formBuilder: FormBuilder,
        private spinnerService: NgxSpinnerService,
        private router: Router,
        private afAuth: AngularFireAuth
        ) {
        this.nativeElement = element.nativeElement;
        this.sidebarVisible = false;
    }

    ngOnInit() {
        this.getLogo();
        var navbar : HTMLElement = this.element.nativeElement;
        this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];
        const body = document.getElementsByTagName('body')[0];
        body.classList.add('login-page');
        body.classList.add('off-canvas-sidebar');
        const card = document.getElementsByClassName('card')[0];
        setTimeout(function() {
            // after 1000 ms we add the class animated to the login/register card
            card.classList.remove('card-hidden');
        }, 700);

        this.forgotForm = this.formBuilder.group({
            email:  ['', [Validators.required, Validators.email]],
        }, {
        });

    }
    get f(){
        return this.forgotForm.controls;
      }
    
    getLogo(){
        this.data_api.getFBAdminSettings().subscribe((data) => {
            console.log(data);
            this.logoURL = data.logo;
        }); 
    }
    sidebarToggle() {
        var toggleButton = this.toggleButton;
        var body = document.getElementsByTagName('body')[0];
        var sidebar = document.getElementsByClassName('navbar-collapse')[0];
        if (this.sidebarVisible == false) {
            setTimeout(function() {
                toggleButton.classList.add('toggled');
            }, 500);
            body.classList.add('nav-open');
            this.sidebarVisible = true;
        } else {
            this.toggleButton.classList.remove('toggled');
            this.sidebarVisible = false;
            body.classList.remove('nav-open');
        }
    }
    submit(){

        if (this.forgotForm.invalid) {

            swal.fire({
                title: 'The form is invalid.',
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

        this.afAuth.sendPasswordResetEmail(this.forgotForm.value.email).then(
            () => {
                this.spinnerService.hide();
                    $.notify({
                        icon: 'notifications',
                        message: 'We have e-mailed your password reset link.'
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
                this.router.navigate(
                                ['/pages/login']
                              );
              // success, show some message
            },
            err => {
                this.spinnerService.hide();
              // handle errors
            }
          );
        // this.data_api.forgotPassword(this.forgotForm.value)
        // .subscribe(
        //   (result) => {
        //     console.log(result)
        //     if(result){
        //         this.spinnerService.hide();
        //         this.router.navigate(
        //             ['/pages/validate-code'],
        //             { queryParams: { email: this.forgotForm.value.email } }
        //           );
        //     }
        // },
        // (error) => {
        //     console.log(error)
        //     swal.fire({
        //         title: error.error.message,
        //         // text: "You clicked the button!",
        //         buttonsStyling: false,
        //         customClass: {
        //           confirmButton: 'btn btn-success',
        //         },
        //         icon: "error"
        //     })
        //     this.spinnerService.hide();
        // }
        
    //   );
      
    }
    ngOnDestroy(){
      const body = document.getElementsByTagName('body')[0];
      body.classList.remove('login-page');
      body.classList.remove('off-canvas-sidebar');
    }
}
