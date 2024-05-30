import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LangService } from '../../_services/lang.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  availableLangs = this.langService.localeList;
  constructor (private langService : LangService){};


  changeLocale(code : string) : void{
    this.langService.currentLocaleID = code;

  }

  getCurrentLocaleID() : string{
    return this.langService.currentLocaleID;
  }

}
