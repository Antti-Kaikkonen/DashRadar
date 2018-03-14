import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'relativeTime'
})
export class RelativeTimePipe implements PipeTransform {

  transform(value: number, args?: any): number {
  	var currentTime = new Date().getTime();
    return currentTime-value;
  }

}
