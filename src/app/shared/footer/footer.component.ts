import { Component } from '@angular/core';
import { DatasourceService } from 'src/app/services/datasource.service';

@Component({
    selector: 'app-footer-cmp',
    templateUrl: 'footer.component.html'
})

export class FooterComponent {
    test: Date = new Date();
}
