using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace kishan_bot.Models
{
    public class SiteResponseBody
    {
        public string textInEnglish { get; set; }
        public string Text { get; set; }
        public string Error { get; set; }
        public SiteResponseAudioBody audio { get; set; }

        public string messageId { get; set; }
        public string messageType { get; set; }
    }

    public class GenericApiResponse
    {
        public bool IsSuccess { get; set; }
    }

    public class SiteResponseAudioBody
    {
        public string text { get; set; }
        public string error { get; set; }
    }

    public class BhashiniApiResponseBody
    {
        public List<BhashiniApiResponseAudioInfo> audio { get; set; }
        public List<BhashiniApiResponseInfo> pipelineResponse { get; set; }
        public string Error { get; set; }
        public string Text { get; set; }
    }

    public class BhashiniApiResponseInfo
    {
        public string taskType { get; set; }
        public BhashiniApiReponseConfig config { get; set; }
        public string output { get; set; }
        public List<BhashiniApiResponseAudioInfo> audio { get; set; }
    }

    public class BhashiniApiReponseConfig
    {
        public string audioFormat { get; set; }
        public BhashiniApiReponseConfigLanguage language { get; set; }
        public string encoding { get; set; }
        public int samplingRate { get; set; }
    }

    public class BhashiniApiReponseConfigLanguage
    {
        public string sourceLanguage { get; set; }
        public string sourceScriptCode { get; set; }
    }

    public class BhashiniApiResponseAudioInfo
    {
        public string audioContent { get; set; }
        public string audioUri { get; set; }
    }

    public class BhashiniApiRequestBody
    {
        public List<BhashiniApiRequestBodyPipelineTask> pipelineTasks { get; set; }
        public BhashiniRequestBodyInputData inputData { get; set; }
    }

    public class BhashiniApiRequestBodyPipelineTask
    {
        public string taskType { get; set; }
        public BhashiniApiRequestBodyPipelineTaskConfig config { get; set; }
    }

    public class BhashiniApiRequestBodyPipelineTaskConfig
    {
        public BhashiniApiRequestBodyPipelineTaskConfigLanguage language { get; set; }
        public string serviceId { get; set; }
        public string gender { get; set; }
        public int samplingRate { get; set; }
    }

    public class BhashiniApiRequestBodyPipelineTaskConfigLanguage
    {
        public string sourceLanguage { get; set; }
    }

    public class BhashiniRequestBodyInputData
    {
        public List<BhashiniApiRequestBodyInput> input { get; set; }
    }

    public class BhashiniApiRequestBodyInput
    {
        public string source { get; set; }
    }

    public class BhashiniApiServiceId
    {
        public string LanguageCode { get; set; }
        public string ServiceId { get; set; }
    }
}