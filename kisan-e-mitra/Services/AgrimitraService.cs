using KisanEMitra.Services.Contracts;
using kishan_bot.Models;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using System.Web.Services.Description;

namespace KisanEMitra.Services
{
    public class AgrimitraService : IAgrimitraService
    {
        private readonly HttpClient httpClient;
        private readonly string baseURL = "https://apichatbot.pmkisan.gov.in/";
        private readonly string userApiBaseEndPoint = "user/";

        public static class APIPaths
        {
            public static string User = "user/generateUserId";
            public static string Prompt = "prompt";
            public static string ChatHistory = "history";
            public static string ApiVersion = "/3";
            public static string Message = "user/message/";
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
                httpClient.DefaultRequestHeaders.Add("User-id", UserID);

                var response = await httpClient.PostAsJsonAsync<UserQueryBody>($"{APIPaths.Prompt}{APIPaths.ApiVersion}", UserQuery);


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

        public async Task<SiteResponseBody> GetChatHistory(string UserID)
        {
            var siteUserBody = new SiteResponseBody();
            try
            {
                // Set end point from actionType
                this.httpClient.DefaultRequestHeaders.Add("User-id", UserID);

                var response = await httpClient.GetAsync($"{userApiBaseEndPoint + APIPaths.ChatHistory + APIPaths.ApiVersion}");


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

        public async Task<GenericApiResponse> LikeDislikeUnlikeMessage(string UserID, string messageId, string actionType)
        {
            var siteUserBody = new GenericApiResponse();
            try
            {
                // Set end point from actionType
                this.httpClient.DefaultRequestHeaders.Add("User-id", UserID);

                var response = await httpClient.GetAsync($"/{APIPaths.Message}{actionType}/{messageId}");


                if (response.StatusCode == System.Net.HttpStatusCode.OK)
                {
                    siteUserBody.IsSuccess = true;
                }
                else
                {
                    siteUserBody.IsSuccess = false;
                }
            }
            catch (Exception ex)
            {
                siteUserBody.IsSuccess = false;
            }

            return siteUserBody;
        }
    }
}