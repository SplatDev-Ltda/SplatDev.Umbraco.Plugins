namespace SplatDev.Messaging.SocketLabs.Controllers
{
    using global::SocketLabs.InjectionApi;
    using global::SocketLabs.InjectionApi.Message;

    using Microsoft.Win32.SafeHandles;

    using SplatDev.Messaging.Interfaces;

    using System;
    using System.Collections.Generic;
    using System.Runtime.InteropServices;
    using System.Threading.Tasks;

    public class SocketLabsBulkController : IBulkMessagingController<BulkMessage, SendResponse>
    {
        private readonly ISocketLabsClient client;

        public SocketLabsBulkController(int serverId, string injectionApiKey, ISocketLabsClient? socketLabsClient = null)
        {
            client = socketLabsClient ?? new SocketLabsClient(serverId, injectionApiKey);
        }

        /// <summary>
        /// Bulks the send message.
        /// </summary>
        /// <param name="to">Enumerable list of To addresses with Merge Data.</param>
        /// <param name="from">From Address.</param>
        /// <param name="subject">The message subject.</param>
        /// <param name="message">The message in html.</param>
        /// <param name="plainMessage">The plain message (text only).</param>
        /// <returns>SocketLabs Response with status</returns>
        /// <remarks>placeholders surrounded by %% ex. %%Name%%</remarks>
        public SendResponse BulkSendMessage(IEnumerable<IBulkAddress> to, string from, string subject, string message, string plainMessage)
        {
            var msg = new BulkMessage
            {
                PlainTextBody = plainMessage,
                HtmlBody = message,
                Subject = subject
            };
            msg.From.Email = from;

            foreach (var p in to)
            {
                var recipient = msg.To.Add(p.Address);
                foreach (var d in p.Data)
                    recipient.MergeData.Add(d.Placeholder, d.Value);
            }

            return BulkSendMessage(msg);
        }

        /// <summary>
        /// Bulks the send message.
        /// </summary>
        /// <param name="message">The bulk message.</param>
        /// <param name="to">Enumerable list of To addresses with Merge Data. (optional)</param>
        /// <returns>SocketLabs Response with status</returns>
        /// <remarks>placeholders surrounded by %% ex. %%Name%%</remarks>
        public SendResponse BulkSendMessage(BulkMessage message, IEnumerable<IBulkAddress> to = null)
        {
            if (to != null)
            {
                foreach (var p in to)
                {
                    var recipient = message.To.Add(p.Address);
                    foreach (var d in p.Data)
                        recipient.MergeData.Add(d.Placeholder, d.Value);
                }
            }

            var response = client.Send(message);
            return response;
        }

        /// <summary>
        /// Bulks the send message asynchronous.
        /// </summary>
        /// </summary>
        /// <param name="message">The bulk message.</param>
        /// <param name="to">Enumerable list of To addresses with Merge Data. (optional)</param>
        /// <returns>SocketLabs Response with status</returns>
        /// <remarks>placeholders surrounded by %% ex. %%Name%%</remarks>
        public async Task<SendResponse> BulkSendMessageAsync(BulkMessage message, IEnumerable<IBulkAddress> to = null)
        {
            await Task.FromResult(0);
            return BulkSendMessage(message, to);
        }

        /// <summary>
        /// Bulks the send message asynchronous.
        /// </summary>
        /// <param name="to">Enumerable list of To addresses with Merge Data.</param>
        /// <param name="from">From Address.</param>
        /// <param name="subject">The message subject.</param>
        /// <param name="message">The message in html.</param>
        /// <param name="plainMessage">The plain message (text only).</param>
        /// <returns>SocketLabs Response with status</returns>
        /// <remarks>placeholders surrounded by %% ex. %%Name%%</remarks>
        public async Task<SendResponse> BulkSendMessageAsync(IEnumerable<IBulkAddress> to, string from, string subject, string message, string plainMessage)
        {
            await Task.FromResult(0);
            return BulkSendMessage(to, from, subject, message, plainMessage);
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

        ~SocketLabsBulkController() => Dispose(false);
        #endregion
    }
}
