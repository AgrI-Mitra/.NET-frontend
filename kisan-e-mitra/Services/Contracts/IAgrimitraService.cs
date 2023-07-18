using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace kishan_bot.Services.Contracts
{
    public interface IAgrimitraService
    {
        Task<string> GetUserSessionIDAsync(string visitorID);
    }
}
