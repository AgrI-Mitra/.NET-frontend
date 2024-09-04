using kishan_bot.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace KisanEMitra.Services.Contracts
{
    public interface IBhashiniService
    {
        Task<BhashiniApiResponseBody> GetTextToSpeech(string currentLanguage, string gender, List<BhashiniApiRequestBodyInput> bhashiniApiInput);
        Task<LanguageDetectionResponse> DetectAudioLanguage(string audioContent);
    }
}
