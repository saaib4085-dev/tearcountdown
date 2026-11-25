# Tearcountdown

Build a customizable mobile-first digital tear-off countdown calendar app with a home-screen widget view and interactive digital tear-off (swipe/tap to tear off the current day slip with tear physics/animation, undo/history log, and date/progress controls) designed to support multiple independent countdown events (create, switch, duplicate, edit, and archive any start date and target date/event).

Configurable Countdown Rules (Per Event):

Support custom start dates, target dates, event titles, and active/archived event switching so multiple countdowns can run side by side.

Allow toggling the remaining-days format (plain number like 1072 down to 0 with no prefix, or custom prefix/suffix if desired).

Allow toggling elapsed progress (0.0% to 100%) and remaining progress (100% to 0%), as well as configurable special rules such as monthly milestone days (e.g., 1st of each month), custom countdown windows (e.g., final N days), and color/style rules tied to how much time is left.

Maximum Front-End Customizability (Live Style Studio Drawer):
Include a real-time Front-End Customizer panel that updates the active slip, tear-off stack, and widget preview immediately and saves presets per event or globally (localStorage + JSON export/import):

Typography per element: Independent font family, font size, font weight, letter spacing, line height, and uppercase/italic toggles for Days Remaining, Progress %, Date, Day of Week, Event Name, Sequence #, Monthly Milestone mode, and Final Window mode.

Colors & Surface FX: Custom background color/gradient, text color, border color, accent color, shadow depth/blur, glass/blur intensity, grain/noise overlay opacity, and custom color stops/tiers based on how much time remains.

Layout & Tear-Off Mechanics: Slip aspect ratio/padding, corner radius, border style (solid, dashed, double, none), tear-off edge style (perforated/jagged/straight), tear direction & animation speed, stack depth underneath, and element visibility toggles + drag/order arrangement on the front face.

Widget Presets: Live previews for Small, Medium, and Large phone widget sizes reflecting the active front-end styling, plus a JSON config exporter so settings can be mirrored into a native widget wrapper. Add a final option to set if you want to see it as a second or minute countdown only do this for seconds minutes hours days months years weeks ect. Make it for a Mobile and add offer Maximum Custiomizability for the user

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://tearcountdown.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/739d507b-564d-4c6f-9a7d-33781ab4ef4a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
