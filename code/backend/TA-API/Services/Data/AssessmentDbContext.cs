using Microsoft.EntityFrameworkCore;
using TA_API.Models;

namespace TA_API.Services.Data
{
    public class AssessmentDbContext : DbContext
    {
        public AssessmentDbContext(DbContextOptions options) : base(options)
        {
        }

        public DbSet<Book> Books { get; set; }
        public DbSet<User> Users { get; set; }
    }
}
