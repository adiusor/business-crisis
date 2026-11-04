// Server-owned room state. Pure transitions; no credentials or hidden choices in public views.
export const MAX_PLAYERS = 30; // Input cap only: no verified 30-player capacity.
export const ROOM_TTL_MS = 24 * 60 * 60 * 1000;
export const ROUND_MS = 180_000;
export const GRACE_MS = 60_000;
export const GRACE_PENALTY = 5;
export const NO_ANSWER_PENALTY = 12;
export const TEAM_NAME_POOL = Object.freeze([
  "THE NIGHT SHIFT", "BOARDROOM BANDITS", "CRISIS CONTROL", "THE FIXERS",
  "PANIC DEPARTMENT", "THE DAMAGE LIMITERS", "PLAN B", "DEADLINE DIVISION",
  "THE RESCUE CREW", "RED FLAG UNIT", "OPERATION TOMORROW", "THE LAST RESORT",
  "THE AUDIT SQUAD", "THE COMEBACK TEAM", "THE FIREBREAK", "THE CONTINGENCY"
]);
const BAD = (status, message) => Object.assign(new Error(message), {status});
const requireState = (condition, status, message) => { if (!condition) throw BAD(status, message); };
const clone = x => JSON.parse(JSON.stringify(x));
const casefold = x => x.toLocaleLowerCase("en");
const validNow = now => Number.isSafeInteger(now) && now >= 0;
function randomNames(count, seed) {
  requireState(Number.isSafeInteger(seed) && seed >= 0, 400, "Invalid name seed");
  const list = TEAM_NAME_POOL.slice();
  let value = seed >>> 0;
  for (let i = list.length - 1; i > 0; i--) {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    const j = value % (i + 1);
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list.slice(0, count);
}
export function createRoom({code, hostHash, teamNames, teamCount = 2, nameSeed = 0, createdAtMs = Date.now()}) {
  requireState(validNow(createdAtMs), 400, "Invalid room creation time");
  requireState(typeof code === "string" && /^[A-F0-9]{12}$/.test(code), 400, "Invalid room code");
  requireState(typeof hostHash === "string" && /^[a-f0-9]{64}$/.test(hostHash), 400, "Invalid host credential");
  if (teamNames === undefined) {
    requireState(Number.isInteger(teamCount) && teamCount >= 2 && teamCount <= 4, 400, "Use 2–4 teams");
    teamNames = randomNames(teamCount, nameSeed);
  }
  requireState(Array.isArray(teamNames) && teamNames.length >= 2 && teamNames.length <= 4, 400, "Use 2–4 teams");
  const names = teamNames.map(x => typeof x === "string" ? x.trim() : "");
  requireState(names.every(x => x.length >= 1 && x.length <= 32) && new Set(names.map(casefold)).size === names.length, 400, "Teams require unique names (1–32 characters)");
  return {version: 2, code, hostHash, phase: "lobby", round: 0, revision: 0,
    createdAtMs, expiresAtMs: createdAtMs + ROOM_TTL_MS,
    startedAtMs: null,
    teams: names.map(name => ({name, captainId: null, advisers: [], locked: false,
      timedOut: false, roundPenalty: 0, penaltyPoints: 0, roundResults: []})),
    players: []};
}
export function authorize(room, credentialHash) {
  requireState(room && room.version === 2 && typeof credentialHash === "string" && /^[a-f0-9]{64}$/.test(credentialHash), 401, "Unauthorized");
  if (credentialHash === room.hostHash) return {role: "host"};
  const p = room.players.find(x => x.credentialHash === credentialHash);
  requireState(!!p, 401, "Unauthorized");
  return {role: "player", playerId: p.id};
}
export function joinRoom(room, {nickname, teamIndex, credentialHash, playerId}) {
  requireState(room.phase === "lobby", 409, "Room already started; late joining is not enabled");
  requireState(room.players.length < MAX_PLAYERS, 409, "Room join limit reached");
  requireState(Number.isInteger(teamIndex) && teamIndex >= 0 && teamIndex < room.teams.length, 400, "Invalid team");
  const nick = typeof nickname === "string" ? nickname.trim() : "";
  requireState(nick.length >= 1 && nick.length <= 24, 400, "Nickname must contain 1–24 characters");
  requireState(!room.players.some(p => casefold(p.nickname) === casefold(nick)), 409, "Nickname already taken");
  requireState(typeof credentialHash === "string" && /^[a-f0-9]{64}$/.test(credentialHash) && credentialHash !== room.hostHash &&
    !room.players.some(p => p.credentialHash === credentialHash), 400, "Invalid participant credential");
  requireState(typeof playerId === "string" && /^[\w-]{8,64}$/.test(playerId) &&
    !room.players.some(p => p.id === playerId), 400, "Invalid participant ID");
  const next = clone(room);
  next.players.push({id: playerId, nickname: nick, teamIndex, credentialHash});
  if (!next.teams[teamIndex].captainId) next.teams[teamIndex].captainId = playerId;
  next.revision++;
  return next;
}
export function clockFor(room, nowMs = Date.now()) {
  if (room.phase !== "advisers" || !validNow(room.startedAtMs)) return null;
  const normalEndsAt = room.startedAtMs + ROUND_MS;
  const closesAt = normalEndsAt + GRACE_MS;
  return {normalEndsAt, closesAt, serverNowMs: nowMs,
    stage: nowMs < normalEndsAt ? "normal" : nowMs < closesAt ? "grace" : "closed"};
}
export function expireRoom(room, nowMs = Date.now()) {
  const clock = clockFor(room, nowMs);
  if (!clock || clock.stage !== "closed" || room.teams.every(t => t.locked)) return room;
  const next = clone(room);
  for (const team of next.teams) {
    if (team.locked) continue;
    team.locked = true;
    team.timedOut = true;
    team.advisers = []; // Incomplete selections cannot count as a response.
    team.roundPenalty = NO_ANSWER_PENALTY;
    team.penaltyPoints += NO_ANSWER_PENALTY;
  }
  next.revision++;
  return next;
}
export function applyRoomAction(room, actor, command, nowMs = Date.now()) {
  requireState(validNow(nowMs), 400, "Invalid server clock");
  requireState(command && typeof command === "object" && !Array.isArray(command), 400, "Invalid command");
  requireState(Number.isInteger(command.expectedRevision) && command.expectedRevision === room.revision, 409, "Room changed; refresh state and retry");
  const next = clone(room);
  const isHost = actor && actor.role === "host";
  const player = !isHost && actor && actor.role === "player" && next.players.find(p => p.id === actor.playerId);
  const type = command.type;
  if (type === "rename_team") {
    requireState(!!player && next.phase === "lobby", 403, "Only a lobby participant can rename their team");
    const team = next.teams[player.teamIndex];
    requireState(team.captainId === player.id, 403, "Only the team captain can rename");
    requireState(typeof command.name === "string" && TEAM_NAME_POOL.includes(command.name), 400, "Choose a name from the list");
    requireState(!next.teams.some((t, i) => i !== player.teamIndex && casefold(t.name) === casefold(command.name)), 409, "Team name already taken");
    team.name = command.name;
  } else if (type === "start") {
    requireState(isHost, 403, "Only the host can start");
    requireState(next.phase === "lobby", 409, "Room already started");
    requireState(next.teams.every(t => t.captainId), 409, "Each team needs a participant");
    next.phase = "advisers";
    next.startedAtMs = nowMs;
  } else if (type === "select_advisers" || type === "lock_advisers") {
    requireState(!!player, 403, "Only a participant can select advisers");
    requireState(next.phase === "advisers", 409, "Adviser selection is closed");
    const clock = clockFor(next, nowMs);
    requireState(clock.stage !== "closed", 409, "The four-minute window has ended");
    const team = next.teams[player.teamIndex];
    requireState(team.captainId === player.id, 403, "Only your team's captain can confirm selections");
    requireState(!team.locked, 409, "This team's advisers are locked");
    if (type === "select_advisers") {
      const picks = command.advisers;
      requireState(Array.isArray(picks) && picks.length === 2 && picks.every(x => Number.isInteger(x) && x >= 0 && x < 6)
        && new Set(picks).size === 2, 400, "Choose exactly two different advisers");
      team.advisers = picks.slice();
    } else {
      requireState(team.advisers.length === 2, 409, "Choose two advisers first");
      team.locked = true;
      if (clock.stage === "grace") {
        team.roundPenalty = GRACE_PENALTY;
        team.penaltyPoints += GRACE_PENALTY;
      }
    }
  } else if (type === "advance") {
    requireState(isHost, 403, "Only the host can advance");
    requireState(next.phase === "advisers", 409, "Room is not awaiting choices");
    requireState(next.teams.every(t => t.locked), 409, "Not every team has locked its advisers");
    next.teams.forEach(t => t.roundResults.push({round: next.round + 1,
      answered: !t.timedOut, penalty: t.roundPenalty, timedOut: t.timedOut,
      advisers: t.timedOut ? [] : t.advisers.slice()}));
    if (next.round === 5) {
      next.phase = "complete";
      next.startedAtMs = null;
    } else {
      next.round++;
      next.startedAtMs = nowMs;
      next.teams.forEach(t => { t.advisers = []; t.locked = false; t.timedOut = false; t.roundPenalty = 0; });
    }
  } else {
    throw BAD(400, "Unknown command");
  }
  next.revision++;
  return next;
}
export function viewLobby(room) {
  return {code: room.code, phase: room.phase, revision: room.revision, teamNameOptions: TEAM_NAME_POOL.slice(),
    teams: room.teams.map((t, i) => ({name: t.name, joined: room.players.filter(p => p.teamIndex === i).length}))};
}
export function viewFor(room, actor, nowMs = Date.now()) {
  requireState(actor && (actor.role === "host" || actor.role === "player"), 401, "Unauthorized");
  const player = actor.role === "player" ? room.players.find(x => x.id === actor.playerId) : null;
  requireState(actor.role === "host" || !!player, 401, "Unauthorized");
  const shared = {
    code: room.code, phase: room.phase, round: room.round, revision: room.revision,
    expiresAtMs: room.expiresAtMs,
    clock: clockFor(room, nowMs), teamNameOptions: TEAM_NAME_POOL.slice(),
    players: room.players.map(p => ({nickname: p.nickname, teamIndex: p.teamIndex})),
    teams: room.teams.map((t, i) => ({name: t.name, joined: room.players.filter(p => p.teamIndex === i).length,
      ready: !!t.captainId, locked: t.locked, timedOut: t.timedOut, penaltyPoints: t.penaltyPoints,
      roundPenalty: t.roundPenalty}))
  };
  if (!player) return {...shared, viewer: {role: "host"}};
  const team = room.teams[player.teamIndex];
  return {...shared, viewer: {role: "player", teamIndex: player.teamIndex,
    captain: team.captainId === player.id, nickname: player.nickname},
    privateTeam: {advisers: team.advisers.slice(), roundResults: team.roundResults.map(r => ({...r, advisers: r.advisers.slice()}))}};
}
