import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filter',
    pure: false,
    standalone : true
})
export class FilterPipe implements PipeTransform {
    transform(items : any[], id : number): any {
        if (!items || !id) {
            return items;
        }
        // filter items array, items which match and return true will be
        // kept, false will be filtered out
        return items.filter(item => item.id === id);
    }
}