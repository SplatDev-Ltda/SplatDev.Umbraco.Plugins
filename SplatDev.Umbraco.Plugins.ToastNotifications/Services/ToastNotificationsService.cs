using Microsoft.EntityFrameworkCore;
using SplatDev.Umbraco.Plugins.ToastNotifications.Data;
using SplatDev.Umbraco.Plugins.ToastNotifications.Models;

namespace SplatDev.Umbraco.Plugins.ToastNotifications.Services;

public class ToastNotificationsService : IToastNotificationsService
{
    private readonly ToastNotificationsDbContext _db;

    public ToastNotificationsService(ToastNotificationsDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<ToastMessage>> GetActiveToastsAsync()
    {
        var now = DateTime.UtcNow;
        return await _db.ToastMessages
            .Where(t => t.IsActive
                && (t.StartDate == null || t.StartDate <= now)
                && (t.EndDate == null || t.EndDate >= now))
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<ToastMessage>> GetAllToastsAsync()
        => await _db.ToastMessages
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

    public async Task<ToastMessage?> GetByIdAsync(int id)
        => await _db.ToastMessages.FindAsync(id);

    public async Task<ToastMessage> CreateToastAsync(ToastMessage toast)
    {
        toast.CreatedAt = DateTime.UtcNow;
        _db.ToastMessages.Add(toast);
        await _db.SaveChangesAsync();
        return toast;
    }

    public async Task<ToastMessage?> UpdateToastAsync(int id, ToastMessage toast)
    {
        var existing = await _db.ToastMessages.FindAsync(id);
        if (existing is null) return null;

        existing.Title = toast.Title;
        existing.Body = toast.Body;
        existing.Type = toast.Type;
        existing.IsActive = toast.IsActive;
        existing.StartDate = toast.StartDate;
        existing.EndDate = toast.EndDate;

        await _db.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteToastAsync(int id)
    {
        var existing = await _db.ToastMessages.FindAsync(id);
        if (existing is null) return false;

        _db.ToastMessages.Remove(existing);
        await _db.SaveChangesAsync();
        return true;
    }
}
