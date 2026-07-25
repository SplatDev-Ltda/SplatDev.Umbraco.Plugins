namespace SplatDev.Messaging.SendGrid.Controllers
{
    using global::SendGrid;
    using global::SendGrid.Helpers.Mail;

    using Microsoft.Win32.SafeHandles;

    using SplatDev.Messaging.Interfaces;

    using System;
    using System.Collections.Generic;
    using System.Runtime.InteropServices;
    using System.Threading.Tasks;

    public class SendGridController : IMessagingController<SendGridMessage, Response>, IDisposable
    {
        private readonly ISendGridClient client;

        public SendGridController(string apiKey = "", ISendGridClient? sendGridClient = null)
        {
            client = sendGridClient ?? new SendGridClient(apiKey);
        }


        /// <summary>
        /// Sends the message asynchronous.
        /// </summary>
        /// <param name="message">The message.</param>
        /// <returns></returns>
        public async Task<Response> SendMessageAsync(SendGridMessage message)
        {
            Response response = await client.SendEmailAsync(message);
            return response;
        }

        /// <summary>
        /// Sends the message asynchronous.
        /// </summary>
        /// <param name="subject">The subject of the message.</param>
        /// <param name="from">From name.</param>
        /// <param name="fromAddress">From address.</param>
        /// <param name="to">To name.</param>
        /// <param name="toAddress">To address.</param>
        /// <param name="message">The message in html.</param>
        /// <param name="plainMessage">The plain message (text only).</param>
        /// <param name="bcc">The bcc addresses</param>
        /// <param name="cc">The cc addresses</param>
        /// <returns>SendGrid Response with status</returns>
        public async Task<Response> SendMessageAsync(string subject, string from, string fromAddress, string to, string toAddress, string message, string plainMessage = "", IEnumerable<IAddress> bcc = null, IEnumerable<IAddress> cc = null)
        {
            var fromEmail = new EmailAddress(fromAddress, from);
            var toEmail = new EmailAddress(toAddress, to);
            var plainTextContent = plainMessage;
            var htmlContent = message;
            var msg = MailHelper.CreateSingleEmail(fromEmail, toEmail, subject, plainTextContent, htmlContent);

            if (cc != null)
            {
                foreach (var p in cc)
                    msg.AddCc(p.Address, p.Name);
            }

            if (bcc != null)
            {
                foreach (var p in bcc)
                    msg.AddBcc(p.Address, p.Name);
            }
            return await SendMessageAsync(msg);
        }

        /// <summary>
        /// Sends the message.
        /// </summary>
        /// <param name="message">The message.</param>
        /// <returns></returns>
        public Response SendMessage(SendGridMessage message)
        {
            return SendMessageAsync(message).GetAwaiter().GetResult();
        }

        /// <summary>
        /// Sends the message.
        /// </summary>
        /// <param name="subject">The subject of the message.</param>
        /// <param name="from">From name.</param>
        /// <param name="fromAddress">From address.</param>
        /// <param name="to">To name.</param>
        /// <param name="toAddress">To address.</param>
        /// <param name="message">The message in html.</param>
        /// <param name="plainMessage">The plain message (text only).</param>
        /// <param name="bcc">The bcc addresses</param>
        /// <param name="cc">The cc addresses</param>
        /// <returns>SendGrid Response with status</returns>
        public Response SendMessage(string subject, string from, string fromAddress, string to, string toAddress, string message, string plainMessage = "", IEnumerable<IAddress> bcc = null, IEnumerable<IAddress> cc = null)
        {
            return SendMessageAsync(subject, from, fromAddress, to, toAddress, message, plainMessage, bcc, cc).GetAwaiter().GetResult();
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
            if (_disposed)
            {
                return;
            }

            if (disposing)
            {
                _safeHandle?.Dispose();
            }

            _disposed = true;
        }

        ~SendGridController() => Dispose(false);
        #endregion
    }
}
