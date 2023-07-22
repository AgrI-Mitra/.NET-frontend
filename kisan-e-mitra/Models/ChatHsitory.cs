using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace KisanEMitra.Models
{
    public class ChatHistoryViewModel
    {
        public List<ChatHistory> ChatHistories { get; set; }
        public LanguageModel LanguageModel { get; set; }
    }
    public class ChatHistory
    {
        public string Alignment { get; set; }
        public string Message { get; set; }
    }
}