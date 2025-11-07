namespace TA_API.Controllers {

    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using TA_API.Models;
    using TA_API.Services.Data;
    using TA_API.Attributes;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using System.Text.Json.Serialization;
    using System.Text.Json;
    using System.Net.Http;
    using System;
using System.Linq;


    [ApiController]
    [Route("api/books")]
    public class BooksController : ControllerBase {
        private readonly AssessmentDbContext _context;
        private readonly HttpClient _httpClient;

        public BooksController(AssessmentDbContext context, IHttpClientFactory httpClientFactory) {
            _httpClient = httpClientFactory.CreateClient();
            _context = context;
        }

        [HttpGet]
        [ApiKey]
        public async Task<ActionResult<IEnumerable<BookDTO>>> GetBooks() {
            var books = await _context.Books.ToListAsync();
            var bookDTOs = new List<BookDTO>();
            
            foreach (var book in books) {
                var bookDTO = new BookDTO {
                    Id = book.Id,
                    BookTitle = book.BookTitle,
                    Borrower = book.Borrower,
                    loanDate = book.loanDate,
                    returnDate = book.returnDate,
                    isReturned = book.isReturned
                };
                bookDTOs.Add(bookDTO);
            }

            return bookDTOs;
        }

        [HttpPost]
        [ApiKey]
        public async Task<ActionResult<Book>> PostBook([FromBody] Book book) {
            //Validate Fields
            if (string.IsNullOrEmpty(book.Borrower)) {
                return BadRequest(new { error = "Borrower is required." });
            }
            if (string.IsNullOrEmpty(book.BookTitle)) {
                return BadRequest(new { error = "Book title is required." });
            }
            if (book.loanDate == DateOnly.MinValue || book.loanDate == DateOnly.MaxValue) {
                return BadRequest(new { error = "Loan date is required." });
            }
            if (book.returnDate == DateTime.MinValue || book.returnDate == DateTime.MaxValue) {
                return BadRequest(new { error = "Return date is required." });
            }

            // Validate book title on Open Library
            var encodedTitle = Uri.EscapeDataString(book.BookTitle);
            var apiUrl = $"https://openlibrary.org/search.json?title={encodedTitle}";
            try {
                var response = await _httpClient.GetAsync(apiUrl);
                response.EnsureSuccessStatusCode();
                
                var jsonString = await response.Content.ReadAsStringAsync();
                var searchResult = JsonSerializer.Deserialize<OpenLibrarySearchResult>(jsonString, new JsonSerializerOptions 
                { 
                    PropertyNameCaseInsensitive = true 
                });
                
                // Check if any results were found
                if (searchResult == null || searchResult.NumFound == 0 || searchResult.Docs == null || searchResult.Docs.Count == 0) {
                    return BadRequest(new { error = $"Book '{book.BookTitle}' not found in Open Library." });
                }
            } catch (Exception ex) {
                return BadRequest(new { error = $"Error searching for book '{book.BookTitle}': {ex.Message}" });
            }

            

            // Valid book title - ensure Id is not set (will be auto-generated)
            book.Id = 0;
            _context.Books.Add(book);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetBooks), new { id = book.Id }, book);
        }

        [HttpPut("{id}")]
        [ApiKey]
        public async Task<IActionResult> UpdateBook(int id, [FromBody] Book book)
        {
            if (id != book.Id)
            {
                return BadRequest(new { error = "ID mismatch" });
            }

            //Validate Fields
            if (string.IsNullOrEmpty(book.Borrower))
            {
                return BadRequest(new { error = "Borrower is required." });
            }
            if (string.IsNullOrEmpty(book.BookTitle))
            {
                return BadRequest(new { error = "Book title is required." });
            }
            if (book.loanDate == DateOnly.MinValue || book.loanDate == DateOnly.MaxValue)
            {
                return BadRequest(new { error = "Loan date is required." });
            }
            if (book.returnDate == DateTime.MinValue || book.returnDate == DateTime.MaxValue)
            {
                return BadRequest(new { error = "Return date is required." });
            }

            // Check if book exists
            var existingBook = await _context.Books.FindAsync(id);
            if (existingBook == null)
            {
                return NotFound();
            }

            // Only validate against Open Library if the title has changed
            if (existingBook.BookTitle != book.BookTitle)
            {
                var encodedTitle = Uri.EscapeDataString(book.BookTitle);
                var apiUrl = $"https://openlibrary.org/search.json?title={encodedTitle}";
                try
                {
                    var response = await _httpClient.GetAsync(apiUrl);
                    response.EnsureSuccessStatusCode();
                    
                    var jsonString = await response.Content.ReadAsStringAsync();
                    var searchResult = JsonSerializer.Deserialize<OpenLibrarySearchResult>(jsonString, new JsonSerializerOptions 
                    { 
                        PropertyNameCaseInsensitive = true 
                    });
                    
                    if (searchResult == null || searchResult.NumFound == 0 || searchResult.Docs == null || searchResult.Docs.Count == 0)
                    {
                        return BadRequest(new { error = $"Book '{book.BookTitle}' not found in Open Library." });
                    }
                }
                catch (Exception ex)
                {
                    return BadRequest(new { error = $"Error searching for book '{book.BookTitle}': {ex.Message}" });
                }
            }

            _context.Entry(existingBook).CurrentValues.SetValues(book);
            await _context.SaveChangesAsync();

            return Ok(book);
        }

        [HttpDelete("{id}")]
        [ApiKey]
        public async Task<ActionResult<Book>> DeleteBook(int id) {
            var book = await _context.Books.FindAsync(id);
            if (book == null) {
                return NotFound();
            }
            _context.Books.Remove(book);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

    public class OpenLibrarySearchResult {
        [JsonPropertyName("numFound")]
        public int NumFound { get; set; }
        
        [JsonPropertyName("docs")]
        public List<OpenLibraryDoc> Docs { get; set; }
    }

    public class OpenLibraryDoc {
        [JsonPropertyName("title")]
        public string Title { get; set; }

        [JsonPropertyName("cover_i")]
        public int CoverId { get; set; }

        [JsonPropertyName("author_name")]
        public List<string> AuthorNames { get; set; }

        [JsonPropertyName("first_publish_year")]
        public int? FirstPublishYear { get; set; }

        [JsonPropertyName("subtitle")]
        public string Subtitle { get; set; }

        [JsonPropertyName("edition_key")]
        public List<string> EditionKeys { get; set; }
    }
}
