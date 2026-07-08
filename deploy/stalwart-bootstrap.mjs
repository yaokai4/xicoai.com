/*
 * One-shot Stalwart provisioning. Runs from any container on the internal
 * docker network (we invoke it from xicoai-app). With Stalwart in first-run
 * bootstrap mode, x:Bootstrap/set configures the store, the internal
 * directory, the authentication subsystem, TLS (Let's Encrypt HTTP-01 via the
 * Caddy /.well-known passthrough), DKIM, and the first admin mailbox — all
 * atomically. Idempotent-ish: re-running once bootstrapped returns a forbidden
 * we treat as "already done".
 *
 *   env: SEC=<STALWART_ADMIN_SECRET>  ADMIN_USER=hi@xicoai.com  ADMIN_PASS=...
 */
const SEC = process.env.SEC;
const ADMIN_USER = process.env.ADMIN_USER || "hi@xicoai.com";
const ADMIN_PASS = process.env.ADMIN_PASS;
const HOST = process.env.MAIL_HOST || "mail.xicoai.com";
const DOMAIN = process.env.MAIL_DOMAIN || "xicoai.com";
const auth = "Basic " + Buffer.from("admin:" + SEC).toString("base64");
const USING = ["urn:ietf:params:jmap:core", "urn:stalwart:jmap", "urn:ietf:params:jmap:principals"];

async function jmap(method, args) {
  const r = await fetch("http://stalwart:8080/jmap/", {
    method: "POST",
    headers: { authorization: auth, "content-type": "application/json" },
    body: JSON.stringify({ using: USING, methodCalls: [[method, args, "0"]] }),
  });
  const t = await r.text();
  let j; try { j = JSON.parse(t); } catch { throw new Error(`${method} ${r.status}: ${t.slice(0,200)}`); }
  return j.methodResponses?.[0]?.[1];
}

const primary = "d333333"; // fallback-admin's account id in bootstrap mode

const payload = {
  serverHostname: HOST,
  defaultDomain: DOMAIN,
  username: ADMIN_USER,
  secret: ADMIN_PASS,
  requestTlsCertificate: true,
  generateDkimKeys: true,
  dataStore: { "@type": "RocksDb", path: "/opt/stalwart/data" },
  blobStore: { "@type": "Default" },
  searchStore: { "@type": "Default" },
  inMemoryStore: { "@type": "Default" },
  directory: { "@type": "Internal" },
  tracer: { "@type": "Stdout", enable: true, level: "info", ansi: false },
  dnsServer: { "@type": "Manual" },
};

const res = await jmap("x:Bootstrap/set", { accountId: primary, update: { singleton: payload } });
if (res?.updated && "singleton" in res.updated) {
  console.log("BOOTSTRAP_OK", JSON.stringify(res.updated.singleton ?? {}).slice(0, 400));
} else if (res?.notUpdated?.singleton?.type === "forbidden") {
  console.log("BOOTSTRAP_ALREADY_DONE");
} else {
  console.log("BOOTSTRAP_FAILED", JSON.stringify(res).slice(0, 400));
  process.exit(1);
}
