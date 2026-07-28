using Microsoft.Extensions.DependencyInjection;

using Umbraco.Cms.Core.Composing;

namespace SplatDev.Umbraco.DataTypes.USStates
{
#if NET10_0_OR_GREATER
    public class USStatesDataTypeComponent(IServiceScopeFactory scopeFactory) : IAsyncComponent
    {
        private readonly IServiceScopeFactory _scopeFactory = scopeFactory;

        public Task InitializeAsync(bool isInitial, CancellationToken cancellationToken)
        {
            new USStatesDataType(_scopeFactory).Install();
            return Task.CompletedTask;
        }

        public Task TerminateAsync(bool isInitial, CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }
#else
    public class USStatesDataTypeComponent(IServiceScopeFactory scopeFactory) : IComponent
    {
        private readonly IServiceScopeFactory _scopeFactory = scopeFactory;

        public void Initialize()
        {
            new USStatesDataType(_scopeFactory).Install();
        }

        public void Terminate()
        {
        }
    }
#endif

    public class USStatesDataTypeComposer : ComponentComposer<USStatesDataTypeComponent> { }
}
