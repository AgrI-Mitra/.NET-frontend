using KisanEMitra.Services.Contracts;
using kishan_bot.Models;
using Newtonsoft.Json;
using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

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
            public static string MatricsIncrement = "custom/metrics/increment";
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
                _ = AddMatricsCount("internalServerError");
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
                _ = AddMatricsCount("internalServerError");
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
                    var apiResponseString = response.Content.ReadAsStringAsync().Result;

                    var apiResponseObject = JsonConvert.DeserializeObject<dynamic>(apiResponseString);
                    siteUserBody.textInEnglish = apiResponseObject.textInEnglish;
                    siteUserBody.Text = apiResponseObject.text;
                    siteUserBody.Error = apiResponseObject.error;

                    if(apiResponseObject.audio != null)
                    {
                        siteUserBody.audio = new SiteResponseAudioBody
                    {
                        text = apiResponseObject.audio?.text,
                        error = apiResponseObject.audio?.error
                    };
                    }

                    siteUserBody.messageId = apiResponseObject.messageId;
                    siteUserBody.messageType = apiResponseObject.messageType;
                    siteUserBody.placeholder = apiResponseObject.placeholder;
                }
                else
                {
                    if(response.StatusCode == System.Net.HttpStatusCode.BadGateway) {
                        _ = AddMatricsCount("badGateway");
                    } else if(response.StatusCode == System.Net.HttpStatusCode.InternalServerError)
                    {
                        _ = AddMatricsCount("internalServerError");
                    }

                    siteUserBody.Text = response.ReasonPhrase;
                    siteUserBody.Error = response.StatusCode.ToString();
                }
            }
            catch (Exception ex)
            {
                _ = AddMatricsCount("internalServerError");
                siteUserBody.Text = "Rest API call issue.";
                siteUserBody.Error = ex.Message;
            }

            return siteUserBody;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="matricsType">
        ///bhashiniCount
        ///bhashiniSuccessCount
        ///bhashiniFailureCount
        ///micUsedCount
        ///directMessageTypedCount
        ///internalServerError
        ///badGateway
        ///sampleQueryUsedCount
        /// </param>
        /// <returns></returns>
        public async Task AddMatricsCount(string matricsType)
        {
            try
            {
                var response = await httpClient.PostAsJsonAsync($"{APIPaths.MatricsIncrement}", matricsType);

                if (response.StatusCode == System.Net.HttpStatusCode.Created)
                {
                    var siteUserBody = response.Content.ReadAsStringAsync().Result;
                }
                else
                {

                }
            }
            catch (Exception)
            {

            }
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
                _ = AddMatricsCount("internalServerError");
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
                _ = AddMatricsCount("internalServerError");
                siteUserBody.IsSuccess = false;
            }

            return siteUserBody;
        }
    }
}