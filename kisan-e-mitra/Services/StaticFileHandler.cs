using System.IO;
using System.Web;

namespace KisanEMitra.Services
{
    public class StaticFileHandler : IHttpHandler
    {
        public void ProcessRequest(HttpContext context)
        {
            string filePath = context.Request.PhysicalPath;
            string fileExtension = Path.GetExtension(filePath).ToLower();

            string mimeType = GetMimeType(fileExtension);
            if (!string.IsNullOrEmpty(mimeType))
            {
                context.Response.ContentType = mimeType;
                context.Response.TransmitFile(filePath);
            }
            else
            {
                context.Response.StatusCode = 404;
            }
        }

        private string GetMimeType(string fileExtension)
        {
            switch (fileExtension)
            {
                case ".js": return "application/javascript";
                case ".css": return "text/css";
                case ".json": return "application/json";
                case ".png": return "image/png";
                case ".jpg": return "image/jpeg";
                case ".jpeg": return "image/jpeg";
                case ".gif": return "image/gif";
                case ".bmp": return "image/bmp";
                case ".svg": return "image/svg+xml";
                case ".webp": return "image/webp";
                case ".ico": return "image/x-icon";
                case ".html": return "text/html";
                case ".txt": return "text/plain";
                case ".pdf": return "application/pdf";
                case ".ttf": return "font/ttf";
                default: return null;
            }
        }

        public bool IsReusable => false;
    }
}