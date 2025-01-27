using KisanEMitra.Services.Contracts;
using kishan_bot.Models;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Diagnostics;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Security.Policy;
using System.Threading.Tasks;

namespace KisanEMitra.Services
{
    public class BhashiniService : IBhashiniService
    {
        private readonly HttpClient httpClient;
        private IAgrimitraService AgrimitraService { get; set; }
        private readonly string baseURL = "https://dhruva-api.bhashini.gov.in/";
        private readonly string bhashiniApiAuthorizationHeaderKey = "5UMLSGg_KyJTjoTG4nmJP3mXstSXLJHs27a-uG0F1qWUNx9hJeQlEA7QQtFCnnXa";
        private readonly List<BhashiniApiServiceId> bhashiniApiServiceIds = new List<BhashiniApiServiceId>() {
            new BhashiniApiServiceId {
                ServiceId = "ai4bharat/indic-tts-coqui-misc-gpu--t4", LanguageCode = new string[] { "en" }
            },
            new BhashiniApiServiceId
            {
                ServiceId = "ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4", LanguageCode = new string[] { "hi", "bn", "mr", "or", "gu", "pa" }
            },
            new BhashiniApiServiceId
            {
                ServiceId = "ai4bharat/indic-tts-coqui-dravidian-gpu--t4", LanguageCode = new string[] { "ta", "ml", "kn", "te" }
            }
        };
        private readonly string bhashiniALDServiceId = "bhashini/iitmandi/audio-lang-detection/gpu";
        private readonly int requestTimeoutInMinutes = int.Parse(ConfigurationManager.AppSettings["requestTimeoutInMinutes"]);

        public static class APIPaths
        {
            public static string TextToSpeechService = "services/inference/pipeline";
            public static string AudioLanguageDetectionService = "services/inference/audiolangdetection";
        }

        public BhashiniService(HttpClient httpClient, IAgrimitraService _agrimitraService)
        {
            this.httpClient = httpClient;
            httpClient.BaseAddress = new Uri(baseURL);
            AgrimitraService = _agrimitraService;
        }

        public async Task<LanguageDetectionResponse> DetectAudioLanguage(string audioContent)
        {
            var bhashiniApiRequestBody = new LanguageDetectionRequestBody
            {
                config = new LanguageDetectionRequestConfig
                {
                    serviceId = bhashiniALDServiceId
                },
                audio = new List<BhashiniAudioInfo>
        {
            new BhashiniAudioInfo
            {
                audioContent = audioContent
            }
        }
            };

            var languageDetectionResponse = new LanguageDetectionResponse();

            try
            {
                // Remove previous authorization header if added
                httpClient.DefaultRequestHeaders.Remove("Authorization");
                httpClient.DefaultRequestHeaders.Add("Authorization", bhashiniApiAuthorizationHeaderKey);
                httpClient.Timeout = requestTimeoutInMinutes > 0 ? TimeSpan.FromMinutes(requestTimeoutInMinutes) : TimeSpan.FromMinutes(10);

                // Log request details
                Trace.TraceInformation($"Starting HTTP request to {APIPaths.AudioLanguageDetectionService}");
                Trace.TraceInformation($"Request Body: {System.Text.Json.JsonSerializer.Serialize(bhashiniApiRequestBody)}");

                var response = await httpClient.PostAsJsonAsync($"{APIPaths.AudioLanguageDetectionService}", bhashiniApiRequestBody);

                // Log response status
                Trace.TraceInformation($"Completed HTTP request to {APIPaths.AudioLanguageDetectionService} with status code {response.StatusCode}");

                if (response.StatusCode == System.Net.HttpStatusCode.OK)
                {
                    // Log successful response content
                    var responseContent = await response.Content.ReadAsStringAsync();
                    Trace.TraceInformation($"Response Content: {responseContent}");

                    // Convert response to LanguageDetectionResponse
                    languageDetectionResponse = System.Text.Json.JsonSerializer.Deserialize<LanguageDetectionResponse>(responseContent);
                }
                else
                {
                    // Log error details
                    Trace.TraceError($"Error Response: {response.ReasonPhrase}, Status Code: {response.StatusCode}");
                    languageDetectionResponse.errorText = response.ReasonPhrase;
                    languageDetectionResponse.errorCode = response.StatusCode.ToString();
                }
            }
            catch (Exception ex)
            {
                // Log exception details
                Trace.TraceError($"HTTP request to {APIPaths.AudioLanguageDetectionService} failed: {ex.Message}");
                Trace.TraceError($"Exception StackTrace: {ex.StackTrace}");

                languageDetectionResponse.errorMessage = ex.Message;
                languageDetectionResponse.errorText = ex.StackTrace.ToString();
            }

            return languageDetectionResponse;
        }

        public async Task<BhashiniApiResponseBody> GetTextToSpeech(string currentLanguage, string gender, List<BhashiniApiRequestBodyInput> bhashiniApiInput)
        {
            var siteUserBody = new BhashiniApiResponseBody();

            var bhashiniApiRequestBodyPipelineTaskConfigLanguage = new BhashiniApiRequestBodyPipelineTaskConfigLanguage
            {
                sourceLanguage = currentLanguage
            };

            // Find service id based on current language
            var serviceId = bhashiniApiServiceIds.Find(f => f.LanguageCode.Contains(currentLanguage)).ServiceId;

            var bhashiniApiRequestBodyPipelineTaskConfig = new BhashiniApiRequestBodyPipelineTaskConfig
            {
                language = bhashiniApiRequestBodyPipelineTaskConfigLanguage,
                serviceId = serviceId,
                gender = gender,
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

            var audioList = new List<BhashiniAudioInfo>();

            try
            {
                _ = AgrimitraService.AddMatricsCount("bhashiniCount");

                // Remove previous authorization header if added
                httpClient.DefaultRequestHeaders.Remove("Authorization");
                httpClient.DefaultRequestHeaders.Add("Authorization", bhashiniApiAuthorizationHeaderKey);

                var response = await httpClient.PostAsJsonAsync($"{APIPaths.TextToSpeechService}", bhashiniApiRequestBody);
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

                    _ = AgrimitraService.AddMatricsCount("bhashiniSuccessCount");
                }
                else
                {
                    siteUserBody.Text = response.ReasonPhrase;
                    siteUserBody.Error = response.StatusCode.ToString();
                    _ = AgrimitraService.AddMatricsCount("bhashiniFailureCount");
                }
            }
            catch (Exception ex)
            {
                siteUserBody.Text = "Rest API call issue.";
                siteUserBody.Error = ex.Message;
                _ = AgrimitraService.AddMatricsCount("internalServerError");
            }

            siteUserBody.audio = audioList;
            return siteUserBody;
        }
    }
}