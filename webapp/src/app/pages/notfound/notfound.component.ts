import { Component, OnInit } from '@angular/core';
import { UtilsService } from '../../_services/utils.service';

@Component({
    selector: 'app-notfound',
    imports: [],
    templateUrl: './notfound.component.html',
    styleUrl: './notfound.component.scss'
})
export class NotfoundComponent implements OnInit{
constructor(public utilsService : UtilsService){
  this.utilsService.sidebarLayout.next(false);
}

ngOnInit(): void {
}
}
