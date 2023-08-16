using KisanEMitra.Services.Contracts;
using kishan_bot.Models;
using System;
using System.Collections.Generic;
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
        private readonly string bhashiniApiBaseUrl = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline";
        private readonly List<BhashiniApiServiceId> bhashiniApiServiceIds = new List<BhashiniApiServiceId>() {
            new BhashiniApiServiceId {
                ServiceId = "ai4bharat/indic-tts-coqui-misc-gpu--t4", LanguageCode = "en"
            },
            new BhashiniApiServiceId
            {
                ServiceId = "ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4", LanguageCode = "hi"
            },
            new BhashiniApiServiceId
            {
                ServiceId = "ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4", LanguageCode = "bn"
            },
            new BhashiniApiServiceId
            {
                ServiceId = "ai4bharat/indic-tts-coqui-dravidian-gpu--t4", LanguageCode = "ta"
            },
            new BhashiniApiServiceId
            {
                ServiceId = "ai4bharat/indic-tts-coqui-dravidian-gpu--t4", LanguageCode = "te"
            },
            new BhashiniApiServiceId
            {
                ServiceId = "ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4", LanguageCode = "gu"
            },
        };

        public static class APIPaths
        {
            public static string User = "user/generateUserId";
            public static string Prompt = "prompt/3";
            public static string TemoUserId = "benAudio-serI-4enA-dioU-erIdbenAudio"; //For Local Testing
        }

        public AgrimitraService(HttpClient httpClient)
        {
            this.httpClient = httpClient;
            httpClient.BaseAddress = new Uri(baseURL);
        }

        public async Task<BhashiniApiResponseBody> GetTextToSpeech(string currentLanguage, List<BhashiniApiRequestBodyInput> bhashiniApiInput)
        {
            var siteUserBody = new BhashiniApiResponseBody();

            var bhashiniApiRequestBodyPipelineTaskConfigLanguage = new BhashiniApiRequestBodyPipelineTaskConfigLanguage
            {
                sourceLanguage = currentLanguage
            };

            // Find service id based on current language
            var serviceId = bhashiniApiServiceIds.Find(f => f.LanguageCode == currentLanguage).ServiceId;

            var bhashiniApiRequestBodyPipelineTaskConfig = new BhashiniApiRequestBodyPipelineTaskConfig
            {
                language = bhashiniApiRequestBodyPipelineTaskConfigLanguage,
                serviceId = serviceId,
                gender = "female",
                samplingRate = 8000
            };

            // Remove unnecessary chahracters like <br> to remove it from speech conversion
            foreach (var item in bhashiniApiInput)
            {
                item.source = item.source.Replace("<br>", " ");
            }

            var bhashiniInputData = new BhashiniRequestBodyInputData
            {
                input = bhashiniApiInput
            };

            var bhashiniApiRequestBody = new BhashiniApiRequestBody
            {
                pipelineTasks = new List<BhashiniApiRequestBodyPipelineTask>
                {
                    new BhashiniApiRequestBodyPipelineTask
                    {
                        taskType = "tts",
                        config = bhashiniApiRequestBodyPipelineTaskConfig
                    }
                },
                inputData = bhashiniInputData
            };

            var audioList = new List<BhashiniApiResponseAudioInfo>();

            try
            {
                httpClient.DefaultRequestHeaders.Add("Authorization", "5UMLSGg_KyJTjoTG4nmJP3mXstSXLJHs27a-uG0F1qWUNx9hJeQlEA7QQtFCnnXa");
                //httpClient.DefaultRequestHeaders.Add("Content-Type", "application/json");
                var response = await httpClient.PostAsJsonAsync($"{bhashiniApiBaseUrl}", bhashiniApiRequestBody);
                if (response.StatusCode == System.Net.HttpStatusCode.OK)
                {
                    siteUserBody = response.Content.ReadFromJsonAsync<BhashiniApiResponseBody>().Result;

                    foreach (var item in siteUserBody.pipelineResponse)
                    {
                        foreach (var audioItem in item.audio)
                        {
                            audioList.Add(audioItem);
                        }
                    }
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

            siteUserBody.audio = audioList;
            return siteUserBody;
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