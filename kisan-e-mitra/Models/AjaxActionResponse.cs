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
}