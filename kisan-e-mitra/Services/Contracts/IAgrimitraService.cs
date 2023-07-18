using System.Threading.Tasks;

namespace KisanEMitra.Services.Contracts
{
    public interface IAgrimitraService
    {
        Task<string> GetUserSessionIDAsync(string visitorID);
    }
}
