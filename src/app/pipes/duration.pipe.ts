import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'duration'
})
export class DurationPipe implements PipeTransform {

  transform(millis: number, format: string): string {
  	let secondsTotal = Math.floor(millis/1000);
  	let minutesTotal = Math.floor(secondsTotal/60);
  	let hoursTotal = Math.floor(minutesTotal/60);
  	let daysTotal = Math.floor(hoursTotal/24);
  	return format
  	.replace(/DD/, ""+daysTotal)
  	.replace(/HH/, ""+hoursTotal)
  	.replace(/MM/, ""+minutesTotal)
  	.replace(/SS/, ""+secondsTotal)
  	.replace(/hh/, ""+hoursTotal%24)
  	.replace(/mm/, ""+minutesTotal%60)
  	.replace(/ss/, ""+secondsTotal%60);
  }
  
}
