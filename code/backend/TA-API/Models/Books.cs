namespace TA_API.Models {	
    public class Book {
        public int Id { get; set; }
        public string Borrower { get; set; }
        public string BookTitle { get; set; }
        public DateOnly loanDate { get; set; }
        public DateTime returnDate { get; set; }
        public bool isReturned { get; set; } = false;
    }

    public class BookDTO : Book {
        public string? CoverImageUrl { get; set; }
    }
} 