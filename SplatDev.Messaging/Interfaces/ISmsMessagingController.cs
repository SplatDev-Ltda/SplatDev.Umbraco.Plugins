namespace SplatDev.Messaging.Interfaces
{
    using System;
    using System.Threading.Tasks;

    public interface ISmsMessagingController<TMessage, TResult> : IDisposable
        where TMessage : class where TResult : class
    {
        TResult SendMessage(TMessage message);
        TResult SendMessage(string from, string to, string body);

        Task<TResult> SendMessageAsync(TMessage message);
        Task<TResult> SendMessageAsync(string from, string to, string body);
    }
}
