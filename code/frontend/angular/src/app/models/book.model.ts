export interface Book {
  id: number;
  borrower: string;
  bookTitle: string;
  loanDate: string;
  returnDate: string;
  isReturned: boolean;
  coverImageUrl?: string;
}

