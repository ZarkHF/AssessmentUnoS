using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TA_API.Migrations
{
    /// <inheritdoc />
    public partial class AddIsReturnedField : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "isReturned",
                table: "Books",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "isReturned",
                table: "Books");
        }
    }
}
