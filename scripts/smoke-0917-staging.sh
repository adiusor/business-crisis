#!/usr/bin/env bash
# Isolated 09:17 challenge staging only. Never touch existing Business Crisis rooms.
set -euo pipefail
BASE="${1:?Provide 09:17 staging URL}"
if [[ ! "$BASE" =~ ^https://the-0917-challenge-staging\.[a-zA-Z0-9-]+\.workers\.dev$ ]]; then
  echo "::error::Refusing non-09:17 challenge staging origin"
  exit 1
fi
if [[ ${#STAGING_CREATION_KEY} -lt 32 ]]; then
  echo "::error::Missing isolated staging-only creation key"
  exit 1
fi
# A 200 page alone cannot prove that the intended game was deployed:
# explicitly verify the current live Worker serves THIS workflow's Git SHA.
[[ "${GITHUB_SHA:-}" =~ ^[a-f0-9]{40}$ ]] || { echo "::error::Missing exact workflow commit SHA";exit 1; }
health="$(curl --silent --show-error --fail --max-time 20 "$BASE/healthz")"
jq -e --arg sha "$GITHUB_SHA" '.ok == true and .service == "the-0917-challenge" and .game == "Project Spark" and .deployedGame == true and .buildSha == $sha and .buildLabel == $sha[0:12]' <<<"$health" >/dev/null ||
  { echo "::error::Live Worker build differs from the approved release commit";exit 1; }
echo "LIVE RELEASE VERIFIED: ${GITHUB_SHA:0:12} (exact Git SHA)"
echo "Checking all public pages remain available and noindex on staging..."
for route in / /corporate-team-building-game /virtual-team-building /leadership-team-building /for-facilitators /about /ro /play /join; do
  page="$(mktemp)"
  status="$(curl --silent --show-error --location --max-time 20 -o "$page" -w '%{http_code}' "$BASE$route")"
  if [[ "$status" != "200" ]]; then
    echo "::error::$route returned $status";exit 1
  fi
  if [[ "$route" != "/play" && "$route" != "/join" ]]; then
    grep -q "STAGING BUILD ${GITHUB_SHA:0:12}" "$page" || { echo "::error::$route is not the approved build";exit 1; }
    grep -q 'noindex,nofollow,noarchive' "$page" || { echo "::error::$route is not noindex";exit 1; }
    grep -q 'THE 09:17 CHALLENGE' "$page" || { echo "::error::$route has stale branding";exit 1; }
  else
    grep -q "BUILD ${GITHUB_SHA:0:12}" "$page" || { echo "::error::$route is not the approved build";exit 1; }
    grep -q 'id="join-team"' "$page" || { echo "::error::Team selector missing on $route";exit 1; }
    grep -q 'id="join-form"' "$page" || { echo "::error::Player join missing on $route";exit 1; }
  fi
  echo "HTTP 200 $route"
  rm "$page"
done
for link in /healthz /site-style.css /room-style.css /room-script.js /room-pdf.js; do
  status="$(curl --silent --show-error --max-time 20 -o /dev/null -w '%{http_code}' "$BASE$link")"
  [[ "$status" = "200" ]] || { echo "::error::$link returned $status";exit 1; }
done
status="$(curl --silent --show-error --max-time 10 -o /dev/null -w '%{http_code}' -H 'content-type: application/json' -X POST --data '{"teamCount":2}' "$BASE/api/rooms")"
[[ "$status" = "401" ]] || { echo "::error::Room creation without authorization returned $status";exit 1; }
response="$(curl --silent --show-error --fail --max-time 20 -H 'content-type: application/json' -H "authorization: Bearer $STAGING_CREATION_KEY" --data '{"teamCount":2}' "$BASE/api/rooms")"
code="$(jq -r '.roomCode // empty' <<<"$response")"
host="$(jq -r '.hostToken // empty' <<<"$response")"
[[ "$code" =~ ^[2-9A-HJ-NP-Z]{4}$ && "$host" =~ ^[a-f0-9]{64}$ ]] || { echo "::error::Invalid new room";exit 1; }
state="$(curl --silent --show-error --fail -H "authorization: Bearer $host" "$BASE/api/rooms/$code/state")"
jq -e '.state.viewer.role == "host" and .state.phase == "lobby" and (.state.teams|length)==2' <<<"$state" >/dev/null
join="$(curl --silent --show-error --fail "$BASE/api/rooms/$code/lobby")"
jq -e '.teams|length==2' <<<"$join" >/dev/null
qr="$(curl --silent --show-error --fail "$BASE/api/rooms/$code/qr")"
[[ "$qr" == *"<svg"* ]] || { echo "::error::Room QR failed";exit 1; }
unset response host state join qr
echo "PASS: Full four-page site, host/join, API, 2 team lobby and QR on isolated 09:17 Worker."
