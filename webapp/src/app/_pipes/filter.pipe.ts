import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  pure: false,
  standalone: true,
})
export class FilterPipe implements PipeTransform {
  transform(objs: any[], id: number): any {
    if (!objs || !id) {
      return objs;
    }
    // filter items array, items which match and return true will be
    // kept, false will be filtered out
    return objs.filter((obj) => obj.id === id);
  }
}
