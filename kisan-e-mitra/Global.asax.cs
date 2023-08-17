using KisanEMitra.Services;
using KisanEMitra.Services.Contracts;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using Unity;
using Unity.AspNet.Mvc;

namespace KisanEMitra
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
            RegisterComponents();
        }

        public static void RegisterComponents()
        {
            var container = new UnityContainer();
            container.RegisterType<IAgrimitraService, AgrimitraService>();
            container.RegisterType<IBhashiniService, BhashiniService>();
            DependencyResolver.SetResolver(new UnityDependencyResolver(container));
        }
    }
}
