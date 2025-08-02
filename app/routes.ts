import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/map", "routes/map.tsx"),
  route("/ai-guide", "routes/ai-guide.tsx"),
  route("/chat", "routes/chat.tsx"),
  route("/settings", "routes/settings.tsx"),
] satisfies RouteConfig;