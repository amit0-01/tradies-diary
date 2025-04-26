import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree, CanActivateChild, CanDeactivate, CanLoad, Route, UrlSegment } from '@angular/router';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/shared/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate, CanActivateChild  {

  userRoleSubject;

  constructor(private authService: AuthenticationService, private router: Router){
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean | UrlTree {
    let url: string = state.url;
    return this.checkUserLogin(next, url);
        // if(this.authService.isLoggedIn){
            // return false;
        //   }
        //   else{
            
        // }
  }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.canActivate(next, state);
  }
  
  checkUserLogin(route: ActivatedRouteSnapshot, url: any): boolean {


          if (localStorage.getItem('currentUser')) {
            let userDetails = JSON.parse(localStorage.getItem('currentUser'));
            let userRole = userDetails.userRole;
            let userValid = userDetails.validAccount;

            if(userValid == true){
                if (route.data.role && route.data.role.indexOf(userRole) === -1) {
                  if(userRole == 'app_admin'){
                    this.router.navigate(['/dashboard']);
                  }else if(userRole == 'project_owner'){
                    this.router.navigate(['/dashboard-client']);
                  }else if(userRole == 'project_worker'){
                    this.router.navigate(['/dashboard-worker']);
                  }else if(userRole == 'project_supervisor'){
                    this.router.navigate(['/dashboard-supervisor']);
                  }else{
                    this.router.navigate(['/pages/login']);
                  }
                  
                  return false;
                }
                  
                  return true;
            }else{
              // this.router.navigate(['/pages/login']);
              this.router.navigate(['/pages/login'], { queryParams: { returnUrl: url }});
                return false;
            }

          }else{
                // this.router.navigate(['/pages/login']);
                this.router.navigate(['/pages/login'], { queryParams: { returnUrl: url }});
                return false;
          }

  }
 

  // canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
  //     let token = localStorage.getItem('currentUser');
  //     // let token2 = localStorage.getItem('currentCompany');
  //           if(token == undefined){
  //             // let userDetails = JSON.parse(localStorage.getItem('currentUser'));
  //             // this.myName = userDetails.first_name + " " + userDetails.last_name;
  //             // this.snotifyService.success('Welcome Back '+  this.myName  +'', {
  //             //   timeout: 2000,
  //             //   showProgressBar: false,
  //             //   closeOnClick: true,
  //             //   pauseOnHover: false,
  //             //   backdrop: -1,
  //             //   position: SnotifyPosition.rightTop,
  //             // });
  //             // logged in so return true
              
  //             this.router.navigate(['/pages/login']);

  //             return true;
  //         }else{
  //           return true;
  //         }
  //     // not logged in so redirect to login page with the return url
  //     // this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
  // }
}