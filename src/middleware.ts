import { getActionContext } from "astro:actions";
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.isPrerendered) return next();
  // context.session?.set("oauth", "hey") // figure this out

  const { action, setActionResult, serializeActionResult } = getActionContext(context);
  const latestAction = await context.session?.get("latest-action");
  if (latestAction) {
    setActionResult(latestAction.name, latestAction.result);
    context.session?.delete("latest-action");
    return next();
  }
  
  if (action?.calledFrom === "form") {
    const result = await action.handler();
    context.session?.set("latest-action", {
      name: action.name,
      result: serializeActionResult(result),
    });

    console.log("headers " + JSON.stringify(context.request.headers));

    if (result.error) {
      const referer = context.request.headers.get("Referer");
      console.log(referer);
      if (referer) return context.redirect(referer);
      else return next();
    }

    return context.redirect(context.originPathname);
  }

  return next();
});