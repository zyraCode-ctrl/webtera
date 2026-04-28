export const EVENTS = {
  igEntry: "ig_entry",
  goPageView: "go_page_view",
  goClickFullVideo: "go_click_full_video",
  goClickHd: "go_click_hd",
  outLoaderStarted: "out_loader_started",
  outLoaderCompleted: "out_loader_completed",
  helpPageView: "help_page_view",
  helpRevealShown: "help_reveal_shown",
  helpClickDownload: "help_click_download",
  helpClickLink: "help_click_link",
  helpClickRate: "help_click_rate",
  requestToolPageView: "request_tool_page_view",
  requestToolSubmitted: "request_tool_submitted",
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];
