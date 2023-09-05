using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace kishan_bot.Models
{
    public class AjaxActionResponse
    {
        public string Message { get; set; }
        public bool Success { get; set; }
        public object Data { get; set; }
    }

    public class PopularQuestion
    {
        public string PopularQuestionKey { get; set; }
        public string PopularQuestionValue { get; set; }
    }

    public class CommonKeyValue
    {
        public string Key { get; set; }
        public string Value { get; set; }
    }
}