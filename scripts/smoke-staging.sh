#!/usr/bin/env bash
# Live staging-only smoke test. Creates ONE ephemeral empty lobby, no players or emails.
set -euo pipefail

BASE="${1:?Pass the isolated staging URL}"
if [[ ! "$BASE" =~ ^https://business-crisis-rooms-staging\.[a-zA-Z0-9-]+\.workers\.dev$ ]]; then
  echo "::error::Refusing to run smoke tests against a non-staging origin."
  exit 1
fi
if [[ ${#STAGING_CREATION_KEY} -lt 32 ]]; then
  echo "::error::Missing staging room creation key."
  exit 1
fi

echo "Checking staging HTTPS health and Worker readiness..."
health_ok=0
for attempt in $(seq 1 12); do
  if curl --silent --show-error --fail --max-time 10 "$BASE/healthz" |
    jq -e '.ok == true and .service == "room-prototype" and .deployedGame == false' >/dev/null; then
    health_ok=1
    break
  fi
  sleep 3
done
if [[ "$health_ok" -ne 1 ]]; then
  echo "::error::The staging Worker did not become healthy."
  exit 1
fi

echo "Checking unauthenticated room creation is rejected..."
status="$(curl --silent --show-error --max-time 10 --output /dev/null --write-out '%{http_code}' \
  -H 'content-type: application/json' -X POST --data '{"teamCount":2}' \
  "$BASE/api/rooms")"
if [[ "$status" != "401" ]]; then
  echo "::error::Unauthenticated creation returned HTTP $status instead of 401."
  exit 1
fi

response="$(curl --silent --show-error --fail --max-time 20 \
  -H 'content-type: application/json' \
  -H "authorization: Bearer $STAGING_CREATION_KEY" \
  --data '{"teamCount":2}' "$BASE/api/rooms")"
code="$(jq -r '.roomCode // empty' <<<"$response")"
host_token="$(jq -r '.hostToken // empty' <<<"$response")"
if [[ ! "$code" =~ ^[2-9A-HJ-NP-Z]{4}$ ]] || [[ ! "$host_token" =~ ^[a-f0-9]{64}$ ]]; then
  echo "::error::Staging room creation response was invalid."
  exit 1
fi
unset response

echo "Verifying a new staging room has Durable Object storage and private host access..."
state="$(curl --silent --show-error --fail --max-time 20 \
  -H "authorization: Bearer $host_token" "$BASE/api/rooms/$code/state")"
if ! jq -e '.state.phase == "lobby" and .state.viewer.role == "host" and (.state.teams | length == 2)' <<<"$state" >/dev/null; then
  echo "::error::Staging Durable Object state check failed."
  exit 1
fi
unset state host_token

qr_svg="$(curl --silent --show-error --fail --max-time 15 "$BASE/api/rooms/$code/qr")"
if [[ "$qr_svg" != *"<svg"* ]]; then
  echo "::error::QR SVG endpoint failed."
  exit 1
fi
unset qr_svg

echo "Staging HTTPS + Durable Object + QR + unauthorized-access smoke checks passed."
echo "No production routes used; the empty staging lobby expires automatically."
