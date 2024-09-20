using System.Web;
using System.Web.Mvc;

namespace KisanEMitra
{
    public class SecureCookiesAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuted(ActionExecutedContext filterContext)
        {
            var cookies = new[] { "_ga", "_ga_RCEZR4J24G", "culture" };

            foreach (var cookieName in cookies)
            {

                var cookie = filterContext.HttpContext.Request.Cookies[cookieName];

                if (cookie != null && !cookie.Secure)
                {
                    cookie.HttpOnly = true;
                    cookie.Secure = true;

                    filterContext.HttpContext.Response.Cookies.Add(cookie);
                }
            }
            base.OnActionExecuted(filterContext);
        }
    }

}
