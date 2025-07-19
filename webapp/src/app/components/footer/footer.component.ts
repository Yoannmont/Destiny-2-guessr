import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LangService } from '../../_services/lang.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-footer',
  imports: [RouterModule, CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  availableLangs = this.langService.localeList;
  constructor(private langService: LangService) {}

  changeLocale(code: string): string {
    const href = `${environment.WEBSITE_BASE_URL}/${code}`;
    return href;
  }

  switchLang(newLang: string) {
    if (!this.langService.codeList.includes(newLang)) {
      return;
    }

    const currentUrl = window.location.href;
    if (currentUrl.includes(`/${newLang}/`)) {
      return;
    }

    const langPattern = this.langService.codeList.join('|');
    const regex = new RegExp(`/(${langPattern})/`);
    const updatedUrl = currentUrl.replace(regex, `/${newLang}/`);

    window.location.href = updatedUrl;
  }

  getCurrentLocaleID(): string {
    return this.langService.currentLocaleID;
  }

  getFlagCode(langCode: string): string {
    return this.langService.getFlagCode(langCode);
  }
}
