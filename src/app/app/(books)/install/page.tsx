import os from "os";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

function phoneAddress(host: string) {
  const port = host.split(":")[1] || "3000";
  const addresses = Object.values(os.networkInterfaces())
    .flat()
    .filter((item) => item && item.family === "IPv4" && !item.internal)
    .map((item) => `http://${item?.address}:${port}`);
  return addresses[0] || `http://${host}`;
}

export default async function InstallPage() {
  const host = (await headers()).get("host") || "localhost:3000";
  const address = phoneAddress(host);

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl text-navy">Install the app</h1>
      <p className="text-sm leading-6 text-ink/70">
        This stays connected to the office books, so the phone and this computer need to be on the
        same Wi-Fi, and the ledger has to be running here.
      </p>
      <p className="break-all rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-navy">
        {address}
      </p>
      <section className="rounded-2xl border border-line bg-card p-4">
        <h2 className="font-display text-xl text-navy">Android</h2>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-6 text-ink/80">
          <li>Open the address above in Chrome.</li>
          <li>Tap Install app, or the Chrome menu, then Install app or Add to Home screen.</li>
          <li>Open Sree Murugan Financials from the home screen. It runs full screen.</li>
        </ol>
      </section>

      <section className="rounded-2xl border border-line bg-card p-4">
        <h2 className="font-display text-xl text-navy">iPhone</h2>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-6 text-ink/80">
          <li>Open the address above in Safari. Chrome on iPhone cannot add the home-screen app.</li>
          <li>Tap the Share button.</li>
          <li>Tap Add to Home Screen, then Add.</li>
          <li>Open SMF from the home screen.</li>
        </ol>
      </section>
    </div>
  );
}
