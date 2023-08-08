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
    }

    public class SiteResponseAudioBody
    {
        public string text { get; set; }
        public string error { get; set; }
    }
}