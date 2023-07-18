using kishan_bot.Services.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Reflection;
using System.Security.Policy;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using static Antlr.Runtime.Tree.TreeWizard;
using System.Web.UI.WebControls;

namespace kishan_bot.Services
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