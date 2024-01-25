using System.Web;
using System.Web.Optimization;

namespace KisanEMitra
{
    public class BundleConfig
    {
        // For more information on bundling, visit https://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/jquery-{version}.js"));

            //bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
            //            "~/Scripts/jquery.validate*"));

            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at https://modernizr.com to pick only the tests you need.
            //bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
            //            "~/Scripts/modernizr-*"));

            bundles.Add(new Bundle("~/bundles/bootstrap").Include(
                      "~/Scripts/bootstrap.bundle.min.js"));

            bundles.Add(new StyleBundle("~/Content/css").Include(
                      "~/Content/bootstrap.min.css",
                      "~/Content/style.css",
                      "~/Content/responsive.css",
                      "~/Content/chatbot.css",
                      "~/Content/shepherd.css"));

            bundles.Add(new StyleBundle("~/Content/staging/css").Include(
                      "~/Content/bootstrap.min.css",
                      "~/Content/style-staging.css",
                      "~/Content/responsive-staging.css",
                      "~/Content/shepherd.css",
                      "~/Content/chatbot-staging.css"));
        }
    }
}
