import { LandingPage } from "./public/landingpage";
import { SessionRedirect } from "./SessionRedirect";

export default function Home() {
  return (
    <SessionRedirect>
      <LandingPage />
    </SessionRedirect>
  );
}
