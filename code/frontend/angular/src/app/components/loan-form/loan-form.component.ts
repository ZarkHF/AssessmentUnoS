import { Component, inject, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book.model';

@Component({
  selector: 'app-loan-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './loan-form.component.html',
  styleUrls: ['./loan-form.component.css']
})
export class LoanFormComponent implements OnInit {
  @Input() book?: Book;
  @Output() close = new EventEmitter<void>();
  
  private fb = inject(FormBuilder);
  private bookService = inject(BookService);
  isSubmitting = false;
  isEditMode = false;
  private isReturnedSubscription: any;

  private loanDateValidator() {
    return (control: any) => {
      if (!control.value) return null;
      
      // Skip validation if book is marked as returned
      if (this.loanForm?.get('isReturned')?.value === true) {
        return null;
      }

      const inputDate = new Date(control.value);
      const today = new Date();
      
      // Set both dates to start of day for comparison and use UTC to avoid timezone issues
      const inputStartOfDay = Date.UTC(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());
      const todayStartOfDay = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
      
      // For loan date, allow today or future dates (using <= instead of <)
      if (inputStartOfDay < todayStartOfDay) {
        return { pastDate: true };
      }
      return null;
    };
  }

  private returnDateValidator() {
    return (control: any) => {
      if (!control.value) return null;
      
      // Skip validation if book is marked as returned
      if (this.loanForm?.get('isReturned')?.value === true) {
        return null;
      }

      const returnDate = new Date(control.value);
      const loanDateValue = this.loanForm?.get('loanDate')?.value;
      if (!loanDateValue) return null;
      
      const loanDate = new Date(loanDateValue);
      
      // For return date, it must be at least next day from loan date, using UTC for consistency
      const returnStartOfDay = Date.UTC(returnDate.getFullYear(), returnDate.getMonth(), returnDate.getDate());
      const loanStartOfDay = Date.UTC(loanDate.getFullYear(), loanDate.getMonth(), loanDate.getDate());
      
      // Compare with loan date + 1 day
      if (returnStartOfDay <= loanStartOfDay) {
        return { pastDate: true };
      }
      return null;
    };
  }

  loanForm = this.fb.group({
    bookTitle: ['', [Validators.required]],
    borrower: ['', [Validators.required]],
    loanDate: ['', [Validators.required, this.loanDateValidator()]],
    returnDate: ['', [Validators.required, this.returnDateValidator()]],
    isReturned: [false]
  });

  ngOnInit(): void {
    if (this.book) {
      this.isEditMode = true;
      this.loanForm.patchValue({
        bookTitle: this.book.bookTitle,
        borrower: this.book.borrower,
        loanDate: this.formatDateForInput(this.book.loanDate),
        returnDate: this.formatDateForInput(this.book.returnDate, true),
        isReturned: this.book.isReturned
      });
      this.loanForm.get('bookTitle')?.disable();

      // Set up listener for isReturned changes
      this.setupIsReturnedListener();

      // If book is already returned, disable fields immediately
      if (this.book.isReturned) {
        this.disableFieldsForReturnedBook();
      }
    }
  }

  ngOnDestroy(): void {
    if (this.isReturnedSubscription) {
      this.isReturnedSubscription.unsubscribe();
    }
  }

  private setupIsReturnedListener(): void {
    this.isReturnedSubscription = this.loanForm.get('isReturned')?.valueChanges.subscribe(isReturned => {
      if (isReturned) {
        this.disableFieldsForReturnedBook();
      } else {
        this.enableFieldsForActiveBook();
      }
    });
  }

  private disableFieldsForReturnedBook(): void {
    if (!this.book) return;

    // Restore original values first
    this.loanForm.patchValue({
      borrower: this.book.borrower,
      loanDate: this.formatDateForInput(this.book.loanDate),
      returnDate: this.formatDateForInput(this.book.returnDate, true)
    });

    ['borrower', 'loanDate', 'returnDate'].forEach(field => {
      const control = this.loanForm.get(field);
      if (control) {
        control.clearValidators();
        control.disable();
        control.updateValueAndValidity();
      }
    });
  }

  private enableFieldsForActiveBook(): void {
    ['borrower', 'loanDate', 'returnDate'].forEach(field => {
      const control = this.loanForm.get(field);
      if (control) {
        control.enable();
        if (field === 'loanDate') {
          control.setValidators([Validators.required, this.loanDateValidator()]);
        } else if (field === 'returnDate') {
          control.setValidators([Validators.required, this.returnDateValidator()]);
        } else {
          control.setValidators([Validators.required]);
        }
        control.updateValueAndValidity();
      }
    });
  }

  private formatDateForInput(dateString: string, includeTime: boolean = false): string {
    const date = new Date(dateString);
    if (includeTime) {
      return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
    }
    return date.toISOString().slice(0, 10); // Format: YYYY-MM-DD
  }

  onSubmit() {
    const isReturned = this.loanForm.get('isReturned')?.value;
    if (isReturned || this.loanForm.valid) {
      this.isSubmitting = true;
      const formValue = this.loanForm.getRawValue(); // Gets both enabled and disabled values
      
      // If the book is marked as returned, use the original book values except for isReturned
      const loan = {
        id: this.book?.id || 0,
        bookTitle: this.isEditMode ? this.book!.bookTitle : (formValue.bookTitle || ''),
        borrower: isReturned ? this.book!.borrower : formValue.borrower || '',
        loanDate: isReturned ? this.book!.loanDate : formValue.loanDate || '',
        returnDate: isReturned ? this.book!.returnDate : formValue.returnDate || '',
        isReturned: this.isEditMode ? formValue.isReturned || false : false
      };

      const request = this.isEditMode 
        ? this.bookService.updateBook(this.book!.id, loan)
        : this.bookService.addBook(loan);

      request.subscribe({
        next: () => {
          this.onClose();
          window.location.reload(); // Temporary solution - better to use a service to refresh the list
        },
        error: (error: any) => {
          console.error(this.isEditMode ? 'Error updating loan:' : 'Error adding loan:', error);
          this.isSubmitting = false;
        }
      });
    }
  }

  onClose() {
    this.close.emit();
  }
}