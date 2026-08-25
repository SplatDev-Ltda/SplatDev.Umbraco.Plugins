namespace SplatDev.Messaging.Smtp.Controllers
{
    using Microsoft.AspNetCore.Http;
    using Microsoft.Win32.SafeHandles;

    using SplatDev.Messaging.Interfaces;
    using SplatDev.Messaging.Smtp.Models;

    using System;
    using System.Collections.Generic;
    using System.Net;
    using System.Net.Mail;
    using System.Runtime.InteropServices;
    using System.Threading.Tasks;

    public class SmtpController : IMessagingController<MailMessage, SmtpResult>, IDisposable
    {
        private readonly SmtpClient client;
        private readonly SmtpOptions options;

        public delegate void MailerSent(object sender, SmtpResultEventArgs args);
        public event MailerSent? OnMailerSent;

        public SmtpController(SmtpOptions options)
        {
            this.options = options;
            client = new SmtpClient(options.Host, options.Port)
            {
                EnableSsl = options.EnableSsl,
                DeliveryMethod = SmtpDeliveryMethod.Network,
            };
            if (!string.IsNullOrEmpty(options.User))
                client.Credentials = new NetworkCredential(options.User, options.Password);
        }

        public SmtpResult SendMessage(MailMessage message)
            => SendMessageAsync(message).GetAwaiter().GetResult();

        public SmtpResult SendMessage(string subject, string from, string fromAddress, string to, string toAddress, string message, string plainMessage = "", IEnumerable<IAddress>? bcc = null, IEnumerable<IAddress>? cc = null)
            => SendMessageAsync(subject, from, fromAddress, to, toAddress, message, plainMessage, bcc, cc).GetAwaiter().GetResult();

        public async Task<SmtpResult> SendMessageAsync(MailMessage message)
        {
            try
            {
                await client.SendMailAsync(message).ConfigureAwait(false);
                var ok = new SmtpResult { Success = true, Message = "Send Successful" };
                OnMailerSent?.Invoke(this, new SmtpResultEventArgs { Success = true, Message = "Send Successful" });
                return ok;
            }
            catch (Exception ex)
            {
                var fail = new SmtpResult { Success = false, Message = "Send failure", Exception = ex };
                OnMailerSent?.Invoke(this, new SmtpResultEventArgs { Success = false, Message = "Send failure", Exception = ex });
                return fail;
            }
        }

        public Task<SmtpResult> SendMessageAsync(string subject, string from, string fromAddress, string to, string toAddress, string message, string plainMessage = "", IEnumerable<IAddress>? bcc = null, IEnumerable<IAddress>? cc = null)
        {
            var effectiveFrom = string.IsNullOrEmpty(fromAddress) ? options?.DefaultFromAddress ?? fromAddress : fromAddress;
            var effectiveFromName = string.IsNullOrEmpty(from) ? options?.DefaultFromName ?? from : from;

            var msg = new MailMessage(new MailAddress(effectiveFrom, effectiveFromName), new MailAddress(toAddress, to))
            {
                Body = message,
                IsBodyHtml = true,
                Subject = subject,
            };

            if (cc != null)
                foreach (var mail in cc) msg.CC.Add(new MailAddress(mail.Address, mail.Name));
            if (bcc != null)
                foreach (var mail in bcc) msg.Bcc.Add(new MailAddress(mail.Address, mail.Name));

            return SendMessageAsync(msg);
        }

        public void SendException(Exception exc, HttpContext? context, string from, string to, string applicationName)
        {
            if (string.IsNullOrEmpty(to)) throw new MissingFieldException("Missing send to field");

            var requestUrl = context?.Request.Path.Value ?? "unknown";
            var body = new System.Text.StringBuilder("<table>");
            body.Append("<tr><th>").Append($"An error occurred on {applicationName}").Append("</th></tr>");
            body.Append("<tr><td>");
            body.Append($"<h1>Url {requestUrl}</h1>");
            body.Append($"<h4>The error is {exc.Message}</h4><br/>");
            body.Append($"<h5>The Inner Exception is {exc.InnerException}</h5><br/>");
            body.Append("<h6>The StackTrace is </h6>");
            body.Append($"<pre>{exc.StackTrace}</pre>");
            body.Append("</td></tr></table>");
            var subject = $"Error in {applicationName} for url: {requestUrl}";
            SendMessage(subject, from, from, to, to, body.ToString());
        }

        #region Dispose
        private bool _disposed = false;
        private readonly SafeHandle _safeHandle = new SafeFileHandle(IntPtr.Zero, true);
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (_disposed) return;
            if (disposing)
            {
                _safeHandle?.Dispose();
                client.Dispose();
            }
            _disposed = true;
        }

        ~SmtpController() => Dispose(false);
        #endregion
    }
}
