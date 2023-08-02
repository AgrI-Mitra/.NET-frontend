using KisanEMitra.Services.Contracts;
using kishan_bot.Models;
using System;
using System.Net.Http;
using System.Net.Http.Headers;
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
            public static string User = "user/generateUserId";
            public static string Prompt = "prompt/2";
            public static string TemoUserId = "benAudio-serI-4enA-dioU-erIdbenAudio"; //For Local Testing
        }

        public AgrimitraService(HttpClient httpClient)
        {
            this.httpClient = httpClient;
            httpClient.BaseAddress = new Uri(baseURL);
        }

        public async Task<string> GetUserSessionIDAsync(string VisitorID)
        {
            try
            {
                var response = await this.httpClient.PostAsJsonAsync<string>($"{APIPaths.User}/{VisitorID}", null);
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

        public async Task<SiteResponseBody> IdentifyUser(string UserID, UserQueryBody UserQuery)
        {
            var siteUserBody = new SiteResponseBody();
            try
            {
                this.httpClient.DefaultRequestHeaders.Add("User-id", UserID);
                var response = await this.httpClient.PostAsJsonAsync<UserQueryBody>($"{APIPaths.Prompt}", UserQuery);
                if (response.StatusCode == System.Net.HttpStatusCode.Created)
                {
                    siteUserBody = response.Content.ReadFromJsonAsync<SiteResponseBody>().Result;
                }
                else
                {
                    siteUserBody.Text = response.ReasonPhrase;
                    siteUserBody.Error = response.StatusCode.ToString();
                }
            }
            catch (Exception ex)
            {
                siteUserBody.Text = "Rest API call issue.";
                siteUserBody.Error = ex.Message;
            }

            return siteUserBody;
        }

        public async Task<SiteResponseBody> AskQuestionAsync(string UserID, UserQueryBody UserQuery)
        {
            var siteUserBody = new SiteResponseBody();
            try
            {
                this.httpClient.DefaultRequestHeaders.Add("User-id", UserID);

                var response = await this.httpClient.PostAsJsonAsync<UserQueryBody>($"{APIPaths.Prompt}", UserQuery);


                if (response.StatusCode == System.Net.HttpStatusCode.Created)
                {
                    siteUserBody = response.Content.ReadFromJsonAsync<SiteResponseBody>().Result;
                }
                else
                {
                    siteUserBody.Text = response.ReasonPhrase;
                    siteUserBody.Error = response.StatusCode.ToString();
                }
            }
            catch (Exception ex)
            {
                siteUserBody.Text = "Rest API call issue.";
                siteUserBody.Error = ex.Message;
            }

            return siteUserBody;
        }
    }
}