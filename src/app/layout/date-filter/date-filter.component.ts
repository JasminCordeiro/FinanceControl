import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { format } from 'date-fns';

@Component({
  selector: 'app-date-filter',
  imports: [FormsModule],
  templateUrl: './date-filter.component.html',
  styleUrl: './date-filter.component.scss'
})
export class DateFilterComponent {

  @Output() dateFilterChanged = new EventEmitter<{ startDate: string, endDate: string }>();

  selectedDateRange = { startDate: '', endDate: '' };

  constructor() {
    this.setDateRange(7); 
  }

  setDateRange(days: number) {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - days);

    this.selectedDateRange.startDate = format(startDate, 'yyyy-MM-dd');
    this.selectedDateRange.endDate = format(today, 'yyyy-MM-dd');

    this.emitDateChange();
  }

  updateDateRange() {
    this.emitDateChange();
  }

  emitDateChange() {
    console.log("Data selecionada:", this.selectedDateRange);
    this.dateFilterChanged.emit(this.selectedDateRange);
  }
  

}
