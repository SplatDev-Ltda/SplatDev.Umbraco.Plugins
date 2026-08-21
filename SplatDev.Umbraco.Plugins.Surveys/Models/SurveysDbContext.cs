using Microsoft.EntityFrameworkCore;

namespace SplatDev.Umbraco.Plugins.Surveys.Models;

public class SurveysDbContext : DbContext
{
    public SurveysDbContext(DbContextOptions<SurveysDbContext> options) : base(options) { }

    public DbSet<Survey> Surveys => Set<Survey>();
    public DbSet<SurveyQuestion> SurveyQuestions => Set<SurveyQuestion>();
    public DbSet<SurveyOption> SurveyOptions => Set<SurveyOption>();
    public DbSet<SurveyResponse> SurveyResponses => Set<SurveyResponse>();
    public DbSet<SurveyAnswer> SurveyAnswers => Set<SurveyAnswer>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // SQLite has no schemas. Asking for one there makes EF fold it into the
        // table name, so the generated DDL and the queries disagree about what the
        // table is called and every read fails against an object never created.
        if (!Database.IsSqlite())
            modelBuilder.HasDefaultSchema("surveys");

        modelBuilder.Entity<Survey>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<SurveyQuestion>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.QuestionText).IsRequired().HasMaxLength(500);
            entity.Property(e => e.QuestionType).HasConversion<string>();
            entity.HasOne(e => e.Survey)
                  .WithMany(s => s.Questions)
                  .HasForeignKey(e => e.SurveyId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SurveyOption>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OptionText).IsRequired().HasMaxLength(300);
            entity.HasOne(e => e.Question)
                  .WithMany(q => q.Options)
                  .HasForeignKey(e => e.QuestionId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SurveyResponse>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.RespondentEmail).HasMaxLength(200);
            entity.Property(e => e.SubmittedAt).HasDefaultValueSql("GETUTCDATE()");
            entity.HasOne(e => e.Survey)
                  .WithMany(s => s.Responses)
                  .HasForeignKey(e => e.SurveyId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SurveyAnswer>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Response)
                  .WithMany(r => r.Answers)
                  .HasForeignKey(e => e.ResponseId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Question)
                  .WithMany(q => q.Answers)
                  .HasForeignKey(e => e.QuestionId)
                  .OnDelete(DeleteBehavior.NoAction);
            entity.HasOne(e => e.SelectedOption)
                  .WithMany()
                  .HasForeignKey(e => e.SelectedOptionId)
                  .OnDelete(DeleteBehavior.NoAction)
                  .IsRequired(false);
        });

        base.OnModelCreating(modelBuilder);
    }
}
