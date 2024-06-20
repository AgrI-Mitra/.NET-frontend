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

            bundles.Add(new Bundle("~/bundles/bootstrap").Include(
                      "~/Scripts/bootstrap.bundle.min.js"));

            bundles.Add(new StyleBundle("~/Content/css").Include(
                      "~/Content/bundle-prod-css.min.css"
                      ));

            bundles.Add(new StyleBundle("~/Content/staging/css").Include(
                      "~/Content/bundle-staging.min.css"
                      ));

            bundles.Add(new Bundle("~/bundles/pre-init-js").Include(
                "~/Content/js/bundle-pre-body.min.js"
                ));

            bundles.Add(new Bundle("~/bundles/post-init-js").Include(
                "~/Content/js/bundle-post-body.min.js"
                ));

            bundles.Add(new Bundle("~/bundles/chatbot-js").Include(
                "~/Content/js/chatbot.min.js"));

            BundleTable.EnableOptimizations = true;
        }
    }
}
