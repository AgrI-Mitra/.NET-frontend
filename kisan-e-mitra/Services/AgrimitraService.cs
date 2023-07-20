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
        }

        public AgrimitraService(HttpClient httpClient) {
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
            try
            {
                this.httpClient.DefaultRequestHeaders.Add("User-id", UserID);
                //this.httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "Your Oauth token");
                var response = await this.httpClient.PostAsJsonAsync<UserQueryBody>($"{APIPaths.Prompt}", UserQuery);
                if (response.StatusCode == System.Net.HttpStatusCode.Created)
                {
                    var siteUserBody = response.Content.ReadFromJsonAsync<SiteResponseBody>().Result;
                    return siteUserBody;
                }
                else
                {
                    var siteUserBody = response.Content.ReadFromJsonAsync<SiteResponseBody>().Result;
                    throw new Exception($"Error:{siteUserBody.Error}");
                }

                throw new Exception("API Network issue.");
            }
            catch (Exception ex)
            {
                var errorMessage = "Rest API call issue.";
                throw new Exception(errorMessage, ex);
            }
        }

        public async Task<SiteResponseBody> VerifyOTP(string UserID, UserQueryBody UserQuery)
        {
            try
            {
                this.httpClient.DefaultRequestHeaders.Add("User-id", UserID);
                //this.httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "Your Oauth token");
                var response = await this.httpClient.PostAsJsonAsync<UserQueryBody>($"{APIPaths.Prompt}", UserQuery);
                if (response.StatusCode == System.Net.HttpStatusCode.Created)
                {
                    var siteUserBody = response.Content.ReadFromJsonAsync<SiteResponseBody>().Result;
                    return siteUserBody;
                }
                else
                {
                    var siteUserBody = response.Content.ReadFromJsonAsync<SiteResponseBody>().Result;
                    throw new Exception($"Error:{siteUserBody.Error}");
                }

                throw new Exception("API Network issue.");
            }
            catch (Exception ex)
            {
                var errorMessage = "Rest API call issue.";
                throw new Exception(errorMessage, ex);
            }
        }

        public async Task<SiteResponseBody> AskQuestionAsync(string UserID, UserQueryBody UserQuery)
        {
            try
            {
                this.httpClient.DefaultRequestHeaders.Add("User-id", UserID);
                //this.httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "Your Oauth token");
                var response = await this.httpClient.PostAsJsonAsync<UserQueryBody>($"{APIPaths.Prompt}", UserQuery);
                if (response.StatusCode == System.Net.HttpStatusCode.Created)
                {
                    var siteUserBody = response.Content.ReadFromJsonAsync<SiteResponseBody>().Result;
                    return siteUserBody;
                }
                else
                {
                    var siteUserBody = response.Content.ReadFromJsonAsync<SiteResponseBody>().Result;
                    throw new Exception($"Error:{siteUserBody.Error}");
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