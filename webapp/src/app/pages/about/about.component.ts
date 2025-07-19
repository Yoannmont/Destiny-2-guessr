import { Component } from '@angular/core';
import { UtilsService } from '../../_services/utils.service';

@Component({
    selector: 'app-about',
    imports: [],
    templateUrl: './about.component.html',
    styleUrl: './about.component.scss'
})
export class AboutComponent {
  constructor(public utilsService: UtilsService) {
    this.utilsService.sidebarLayout.next(false);
  }
}
