import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {  Router, RouterModule } from '@angular/router';
import { LangService } from '../../_services/lang.service';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  availableLangs = this.langService.localeList;
  constructor (private langService : LangService, private router: Router){};


  changeLocale(code : string) : string{
    const href = `${environment.WEBSITE_BASE_URL}/${code}`
    return href;
  }

  getCurrentLocaleID() : string{
    return this.langService.currentLocaleID;
  }

}
