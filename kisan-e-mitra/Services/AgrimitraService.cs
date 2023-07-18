using KisanEMitra.Services.Contracts;
using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace KisanEMitra.Services
{
    public class AgrimitraService : IAgrimitraService
    {
        private readonly HttpClient httpClient;
        private readonly string baseURL = "https://bff.agrimitra.samagra.io/";

        public static class APIPaths
        {
            public static string User = "user/generateUserId/";
        }

        public AgrimitraService(HttpClient httpClient) {
            this.httpClient = httpClient;
            httpClient.BaseAddress = new Uri(baseURL);
        }

        public async Task<string> GetUserSessionIDAsync(string fingerPrint)
        {
            try
            {
                var response = await this.httpClient.PostAsJsonAsync<string>($"{APIPaths.User}{fingerPrint}", null);
                if (response.StatusCode == System.Net.HttpStatusCode.Created)
                {
                    string userSessionID = response.Content.ReadAsStringAsync().Result;
                    return userSessionID;
                }

               throw new Exception("API Network issue.");
            }
            catch (Exception ex)
            {
                var errorMessage = "Rest API call issue.";
                throw new Exception(errorMessage, ex);
            }
        }

    }
}