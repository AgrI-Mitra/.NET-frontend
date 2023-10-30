using KisanEMitra.Services.Contracts;
using kishan_bot.Models;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
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
                ServiceId = "ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4", LanguageCode = "mr"
            },
            new BhashiniApiServiceId
            {
                ServiceId = "ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4", LanguageCode = "or"
            },
            new BhashiniApiServiceId
            {
                ServiceId = "ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4", LanguageCode = "gu"
            },
            new BhashiniApiServiceId
            {
                ServiceId = "ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4", LanguageCode = "pa"
            },
            new BhashiniApiServiceId
            {
                ServiceId = "ai4bharat/indic-tts-coqui-dravidian-gpu--t4", LanguageCode = "ml"
            },
            new BhashiniApiServiceId
            {
                ServiceId = "ai4bharat/indic-tts-coqui-dravidian-gpu--t4", LanguageCode = "kn"
            }

        };

        public static class APIPaths
        {
            public static string TextToSpeechService = "services/inference/pipeline";
        }

        public BhashiniService(HttpClient httpClient, IAgrimitraService _agrimitraService)
        {
            this.httpClient = httpClient;
            httpClient.BaseAddress = new Uri(baseURL);
            AgrimitraService = _agrimitraService;
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
                gender = "male",
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
                _ = AgrimitraService.AddMatricsCount("bhashiniCount");

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